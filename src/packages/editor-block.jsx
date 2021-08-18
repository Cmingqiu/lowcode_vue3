import { computed, defineComponent, inject, onMounted, ref } from 'vue';
export default defineComponent({
  props: { block: Object }, //{  "top": 100, "left": 100, "zIndex": 1, "key": "text" }
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
      if (props.block.alignCenter) {
        const { offsetWidth, offsetHeight } = blockRef.value;
        props.block.left -= offsetWidth / 2;
        props.block.top -= offsetHeight / 2;
        props.block.alignCenter = false;
      }
    });

    return () => (
      <div
        class='editor-block shade-mask'
        ref={blockRef}
        style={blockStyle.value}
      >
        {renderComponent}
      </div>
    );
  }
});
