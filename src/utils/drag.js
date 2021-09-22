import events from './event';

export default function useDrag(containerRef, data) {
  let currentComponent = null;

  const dragstart = (e, component) => {
    currentComponent = component;
    containerRef.value.addEventListener('dragenter', dragenter);
    containerRef.value.addEventListener('dragover', dragover);
    containerRef.value.addEventListener('drop', drop);
    containerRef.value.addEventListener('dragleave', dragleave);
    events.emit('start');
  };

  // 拖动进入目标元素的时候
  const dragenter = e => {
    e.dataTransfer.dropEffect = 'move';
  };

  //经过目标元素的时候，阻止默认事件，不然ondrop事件不触发
  const dragover = e => {
    e.preventDefault();
  };

  //拖拽元素松开时候 根据拖拽元素添加一个组件
  const drop = e => {
    let { blocks } = data.value;
    data.value = {
      ...data.value,
      blocks: [
        ...blocks,
        {
          left: e.offsetX,
          top: e.offsetY,
          zIndex: 1,
          key: currentComponent.key,
          alignCenter: true, // 希望松手的时候你可以居中
          props: {}
        }
      ]
    };
    currentComponent = null;
  };

  //离开目标元素 增加禁用标识
  const dragleave = (e, target) => {
    e.dataTransfer.dropEffect = 'none';
  };

  // 取消目标元素的事件绑定
  const dragend = e => {
    containerRef.value.removeEventListener('dragenter', dragenter);
    containerRef.value.removeEventListener('dragover', dragover);
    containerRef.value.removeEventListener('drop', drop);
    containerRef.value.removeEventListener('dragleave', dragleave);
    events.emit('end');
  };

  return {
    dragstart,
    dragend
  };
}
