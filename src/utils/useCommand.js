import deepcopy from 'deepcopy';
import { onUnmounted } from 'vue';
import events from './event';

//带有历史记录的功能常用这种注册模式

export default function useCommand(data, focusData) {
  const state = {
    current: -1, //当前指针 前进后退的索引
    queue: [], //所有的操作命令
    commands: {}, //命令和执行函数的映射表 undo:()=>{} redo:()=>{} drag:()=>{}...
    commandsArray: [], //存放所有命令
    destroyArray: [] //销毁队列
  };

  const register = command => {
    //命令name对应执行函数
    state.commands[command.name] = (...args) => {
      const { redo, undo } = command.execute(...args);
      redo(); //走下一步
      if (!command.pushQueue) return;

      let { queue, current } = state;
      if (queue.length) {
        queue = queue.slice(0, current + 1);
        state.queue = queue;
      }
      queue.push({ redo, undo });
      state.current = current + 1;
    };
    state.commandsArray.push(command);
  };

  //撤销(上一步)
  register({
    name: 'undo',
    keyboard: 'ctrl+z',
    execute() {
      return {
        redo() {
          if (state.current === -1) return;
          const item = state.queue[state.current]; //这里没有操作queue
          if (item) {
            item.undo && item.undo();
            state.current--;
          }
        }
      };
    }
  });
  //还原(下一步)
  register({
    name: 'redo',
    keyboard: 'ctrl+y',
    execute() {
      return {
        redo() {
          const item = state.queue[state.current + 1];
          if (item) {
            item.redo && item.redo();
            state.current++;
          }
        }
      };
    }
  });
  //拖拽
  register({
    name: 'drag',
    pushQueue: true, //标识可以放进state.queue中
    init() {
      //初始化操作
      this.before = null;
      //拖拽开始记录初始状态
      const start = () => (this.before = deepcopy(data.value.blocks));
      //拖拽结束记录当前状态
      const end = () => state.commands.drag();

      events.on('start', start);
      events.on('end', end);
      //返回销毁函数
      return () => {
        events.off('start');
        events.off('end');
      };
    },
    execute() {
      //state.commands.drag()
      const before = this.before;
      const after = data.value.blocks;
      return {
        undo() {
          data.value = { ...data.value, blocks: before }; //后退
        },
        redo() {
          data.value = { ...data.value, blocks: after }; //前进
        }
      };
    }
  });
  //导入更新
  register({
    name: 'updateContainer',
    pushQueue: true,
    execute(newVal) {
      const before = data.value;
      const after = newVal;
      return {
        //上一步
        undo() {
          data.value = before;
        },
        //下一步
        redo() {
          data.value = after;
        }
      };
    }
  });
  //置顶:找出未获得焦点的block中zIndex最大的值
  register({
    name: 'placeTop',
    pushQueue: true,
    execute() {
      let { focused, unfocused } = focusData.value;
      const before = deepcopy(data.value.blocks);
      const after = (() => {
        let maxZIndex = unfocused.reduce((prev, block) => {
          return Math.max(prev, block.zIndex);
        }, -Infinity);
        focused.forEach(block => (block.zIndex = maxZIndex + 1));

        return data.value.blocks;
      })();

      return {
        undo() {
          data.value = { ...data.value, blocks: before };
        },
        redo() {
          data.value = { ...data.value, blocks: after };
        }
      };
    }
  });
  //置底:找出未获得焦点的block中zIndex最小的值；如果minZIndex小于0，将未获得焦点的blocks的index提高
  register({
    name: 'placeBottom',
    pushQueue: true,
    execute() {
      let { focused, unfocused } = focusData.value;
      const before = deepcopy(data.value.blocks);
      const after = (() => {
        let minZIndex =
          unfocused.reduce((prev, block) => {
            return Math.min(prev, block.zIndex);
          }, Infinity) - 1;

        if (minZIndex < 0) {
          const dur = Math.abs(minZIndex);
          minZIndex = 0;
          unfocused.forEach(block => (block.zIndex += dur));
        }
        focused.forEach(block => (block.zIndex = minZIndex));

        return data.value.blocks;
      })();

      return {
        undo() {
          data.value = { ...data.value, blocks: before };
        },
        redo() {
          data.value = { ...data.value, blocks: after };
        }
      };
    }
  });
  //删除
  register({
    name: 'delete',
    pushQueue: true,
    execute() {
      const before = deepcopy(data.value.blocks);
      const after = focusData.value.unfocused;
      return {
        undo() {
          data.value = { ...data.value, blocks: before };
        },
        redo() {
          data.value = { ...data.value, blocks: after };
        }
      };
    }
  });

  const keyboardEvent = (() => {
    const keyCodes = {
      89: 'y',
      90: 'z'
    };
    const onkeydown = e => {
      const { keyCode, ctrlKey } = e;
      let keyString = [];
      if (ctrlKey) keyString.push('ctrl');
      keyString.push(keyCodes[keyCode]);
      keyString = keyString.join('+'); //ctrl+z   ctrl+yc

      state.commandsArray.forEach(({ keyboard, name }) => {
        if (!keyboard) return; //无键盘事件
        if (keyboard === keyString) {
          state.commands[name]();
          e.preventDefault();
        }
      });
    };
    const init = () => {
      window.addEventListener('keydown', onkeydown);
      //销毁函数
      return () => {
        window.removeEventListener('keydown', onkeydown);
      };
    };
    return init;
  })();

  (() => {
    //监听键盘事件

    state.destroyArray.push(keyboardEvent());
    state.commandsArray.forEach(command => {
      command.init && state.destroyArray.push(command.init());
    });

    //清理绑定的事件
    onUnmounted(() => {
      state.destroyArray.forEach(fn => fn && fn());
    });
  })();
  return state;
}
