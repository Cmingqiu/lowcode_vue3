import { defineComponent, inject } from 'vue';
import { dragstart, dragend } from '../utils/drag';

export default defineComponent({
  props: ['containerRef'],
  setup(props) {
    const config = inject('config');

    return () =>
      config.componentList.map((component) => (
        <div
          class='editor-item shade-mask'
          draggable
          ondragstart={(e) => {
            dragstart(e, component, props.containerRef);
          }}
          ondragend={(e) => dragend(e, props.containerRef)}
        >
          <span class='editor-item-label '>{component.label}</span>
          {component.preview()}
        </div>
      ));
  }
});
