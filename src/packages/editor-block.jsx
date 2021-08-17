import { computed, defineComponent, inject } from 'vue';
export default defineComponent({
  props: { block: Object }, //{  "top": 100, "left": 100, "zIndex": 1, "key": "text" }
  setup(props) {
    const blockStyle = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: props.block.zIndex
    }));

    const config = inject('config');

    const component = config.componentMap[props.block.key];
    const renderComponent = component.render();
    return () => (
      <div class='editor-block shade-mask' style={blockStyle.value}>
        {renderComponent}
      </div>
    );
  }
});
