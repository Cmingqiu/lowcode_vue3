import { reactive } from 'vue';
import events from './event';

export default function useBlockDrag(focusData, lastSelectBlock, data) {
  let dragState = {
    startX: 0,
    startY: 0,
    dragging: false //默认不是正在拖拽
  };
  let markLine = reactive({ x: null, y: null });

  //按下组件
  const blockDrag = e => {
    const {
      width: BWidth,
      height: BHeight,
      left: startLeft,
      top: startTop
    } = lastSelectBlock.value;

    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      dragging: false,
      //startPos记录开始位置
      startPos: focusData.value.focused.map(({ left, top }) => ({ left, top })),
      startLeft, //拖拽前当前组件的left
      startTop, //拖拽前当前组件的top
      lines: (() => {
        //将每个未获取焦点的组件的5根辅助线列出来
        let lines = { x: [], y: [] }; //x是垂直方向的辅助线，y是水平方向的辅助线
        const { unfocused } = focusData.value;
        [
          ...unfocused,
          {
            top: 0,
            left: 0,
            zIndex: 1,
            width: data.value.container.width,
            height: data.value.container.height
          }
        ].forEach(block => {
          const {
            left: ALeft,
            top: ATop,
            width: AWidth,
            height: AHeight
          } = block;

          lines.y.push({ showTop: ATop, top: ATop - BHeight }); //顶对底
          lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight }); //底对顶
          lines.y.push({ showTop: ATop, top: ATop }); //顶对顶
          lines.y.push({
            showTop: ATop + AHeight / 2,
            top: ATop + AHeight / 2 - BHeight / 2
          }); //中对中
          lines.y.push({
            showTop: ATop + AHeight,
            top: ATop + AHeight - BHeight
          }); //底对底

          lines.x.push({ showLeft: ALeft, left: ALeft - BWidth }); //顶对底
          lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth }); //底对顶
          lines.x.push({ showLeft: ALeft, left: ALeft }); //顶对顶
          lines.x.push({
            showLeft: ALeft + AWidth / 2,
            left: ALeft + AWidth / 2 - BWidth / 2
          }); //中对中
          lines.x.push({
            showLeft: ALeft + AWidth,
            left: ALeft + AWidth - BWidth
          }); //底对底
        });

        return lines;
      })()
    };

    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
  };

  const mousemove = e => {
    let { clientX, clientY } = e;
    if (!dragState.dragging) {
      dragState.dragging = true;
      events.emit('start');
    }
    //获取最新left top,在辅助线中找，找到显示线
    // 鼠标移动后 - 鼠标移动前 + left
    let left = clientX - dragState.startX + dragState.startLeft;
    let top = clientY - dragState.startY + dragState.startTop;
    let y = null,
      x = null;

    //水平方向的辅助线 距离3px就显示辅助线
    for (let i = 0; i < dragState.lines.y.length; i++) {
      const { showTop: s, top: t } = dragState.lines.y[i];
      //移动时比较当前移动组件和预计显示辅助线高度top
      if (Math.abs(t - top) < 3) {
        y = s;
        //贴边  让 clientY变为0
        clientY = dragState.startY - dragState.startTop + t;
        break;
      }
    }
    //垂直方向的辅助线 距离5px就显示辅助线
    for (let i = 0; i < dragState.lines.x.length; i++) {
      const { showLeft: s, left: l } = dragState.lines.x[i];
      if (Math.abs(l - left) < 3) {
        x = s;
        //贴边 让 clientX变为0
        clientX = dragState.startX - dragState.startLeft + l;
        break;
      }
    }

    markLine.x = x;
    markLine.y = y;

    let durX = clientX - dragState.startX,
      durY = clientY - dragState.startY;

    focusData.value.focused.forEach((block, idx) => {
      block.left = dragState.startPos[idx].left + durX;
      block.top = dragState.startPos[idx].top + durY;
    });
  };

  const mouseup = () => {
    document.removeEventListener('mousemove', mousemove);
    document.removeEventListener('mouseup', mouseup);
    markLine.x = null;
    markLine.y = null;
    if (dragState.dragging) {
      //只是点击不会触发
      dragState.dragging = false;
      events.emit('end');
    }
  };

  return {
    blockDrag,
    markLine
  };
}
