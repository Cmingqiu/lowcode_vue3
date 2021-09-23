import { computed, defineComponent, inject, onMounted, ref } from 'vue';
export default defineComponent({
  props: {
    block: Object, //{  "top": 100, "left": 100, "zIndex": 1, "key": "text",width,height }
    formData: Object
  },
  setup(props) {
    const config = inject('config');
    const blockRef = ref(null);
    const blockStyle = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: props.block.zIndex
    }));

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

    return () => {
      const component = config.componentMap[props.block.key];

      // {default:'username',start:'',end:''}
      const renderComponent = component.render({
        props: props.block.props,
        model: Object.keys(component.model || {}).reduce((prev, modelName) => {
          prev[modelName] = {
            modelValue: props.formData[props.block.model[modelName]],
            'onUpdate:modelValue': v =>
              (props.formData[props.block.model[modelName]] = v)
          };
          return prev;
        }, {})
      });

      return (
        <div class='editor-block' ref={blockRef} style={blockStyle.value}>
          {renderComponent}
        </div>
      );
    };
  }
});
