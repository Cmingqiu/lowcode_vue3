import { computed, defineComponent, inject, onMounted, ref } from 'vue';
export default defineComponent({
  props: { block: Object }, //{  "top": 100, "left": 100, "zIndex": 1, "key": "text",width,height }
  setup(props) {
    const config = inject('config');
    const blockRef = ref(null);
    const blockStyle = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: props.block.zIndex
    }));

    const component = config.componentMap[props.block.key];
    const renderComponent = component.render();

    onMounted(() => {
      //居中渲染拖入的组件
      const { offsetWidth, offsetHeight } = blockRef.value;
      if (props.block.alignCenter) {
        props.block.left -= offsetWidth / 2;
        props.block.top -= offsetHeight / 2;
        props.block.alignCenter = false;
      }
      //加上width 和height
      props.block.width = offsetWidth;
      props.block.height = offsetHeight;
    });

    return () => (
      <div class='editor-block' ref={blockRef} style={blockStyle.value}>
        {renderComponent}
      </div>
    );
  }
});
