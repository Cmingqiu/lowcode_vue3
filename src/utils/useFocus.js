import { computed, ref } from 'vue';

export default function useFocus(data, isPreview, cb) {
  let selectIndex = ref(-1); //没有被选中
  //最后选中的组件
  const lastSelectBlock = computed(() => data.value.blocks[selectIndex.value]);

  const focusData = computed(() => {
    let focused = [],
      unfocused = [];
    data.value.blocks.forEach(block =>
      (block.focus ? focused : unfocused).push(block)
    );
    return { focused, unfocused };
  });

  //按下block组件
  const blockMouseDown = (e, block, index) => {
    if (isPreview.value) return;
    e.preventDefault();
    e.stopPropagation();

    if (!block.focus) {
      if (!e.ctrlKey) clearBlockFocus(); //如果按了ctrl键就不清除
      block.focus = true;
    } else {
      // block.focus = false;
    }
    selectIndex.value = index;
    cb && cb(e);
  };

  //清空选中
  const clearBlockFocus = () => {
    selectIndex.value = -1;
    data.value.blocks.forEach(block => (block.focus = false));
  };

  return {
    focusData,
    blockMouseDown,
    clearBlockFocus,
    lastSelectBlock
  };
}
