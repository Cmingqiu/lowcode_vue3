import { computed, defineComponent, inject, ref } from 'vue';
import deepcopy from 'deepcopy';
import EditorItem from './editor-item';
import EditorBlock from './editor-block';
import useDrag from '../utils/drag';

export default defineComponent({
  props: { modelValue: Object },
  emits: ['update:modelValue'],
  components: { EditorBlock, EditorItem },
  setup(props, { emit }) {
    const containerRef = ref(null);
    const config = inject('config');
    const data = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit('update:modelValue', deepcopy(val));
      }
    });

    const { dragstart, dragend } = useDrag(containerRef, data);
    const contentStyle = computed(() => {
      return {
        width: data.value.container.width + 'px',
        height: data.value.container.height + 'px'
      };
    });

    return () => (
      <div class='editor'>
        <header>菜单编辑区</header>
        <aside>
          {config.componentList.map(component => (
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
          ))}
        </aside>
        <section>属性控制栏</section>
        <main>
          {/* 产生滚动条 */}
          <div class='editor-canvas'>
            <div
              class='editor-canvas__content'
              style={contentStyle.value}
              ref={containerRef}
            >
              {data.value.blocks.map(block => (
                <EditorBlock block={block} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }
});
