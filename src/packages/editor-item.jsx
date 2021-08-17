import { defineComponent, inject } from 'vue';
import useDrag from '../utils/drag';

export default defineComponent({
  props: ['containerRef', 'data'],
  setup(props) {
    const config = inject('config');
    const { dragstart, dragend } = useDrag(props.containerRef, props.data);

    return () =>
      config.componentList.map(component => (
        <div
          class='editor-item shade-mask'
          draggable
          ondragstart={e => {
            dragstart(e, component);
          }}
          ondragend={dragend}
        >
          <span class='editor-item-label '>{component.label}</span>
          {component.preview()}
        </div>
      ));
  }
});
