export function dragstart(e, component, target) {
  target.value.addEventListener('dragenter', dragenter);
  target.value.addEventListener('dragover', dragover);
  target.value.addEventListener('drop', drop.bind(null, component));
  target.value.addEventListener('dragleave', dragleave);
}

// 拖动进入目标元素的时候
export function dragenter(e) {
  e.dataTransfer.dropEffect = 'move';
}

//经过目标元素的时候，阻止默认事件，不然ondrop事件不触发
export function dragover(e) {
  e.preventDefault();
}

//拖拽元素松开时候 根据拖拽元素添加一个组件
export function drop(component) {
  console.log('drop', component);
}

//离开目标元素 增加禁用标识
export function dragleave(e, target) {
  e.dataTransfer.dropEffect = 'none';
}

// 取消目标元素的事件绑定
export function dragend(e, target) {
  target.value.removeEventListener('dragenter', dragenter);
  target.value.removeEventListener('dragover', dragover);
  target.value.removeEventListener('drop', drop);
  target.value.removeEventListener('dragleave', dragleave);
}
