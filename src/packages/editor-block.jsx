import { computed, defineComponent } from 'vue';
import editorConfig from '../utils/editor-config';

export default defineComponent({
  props: { block: Object }, //{  "top": 100, "left": 100, "zIndex": 1, "key": "text" }
  setup(props) {
    const blockStyle = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: props.block.zIndex
    }));

    const component = editorConfig.componentMap[props.block.key];
    const previewComponent = component.preview();
    return () => (
      <div class='editor-block' style={blockStyle.value}>
        <span>{component.label}</span>
        {previewComponent}
      </div>
    );
  }
});
