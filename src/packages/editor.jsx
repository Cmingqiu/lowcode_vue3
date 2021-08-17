import { computed, defineComponent, ref } from 'vue';
import { ondragenter } from '../utils/drag';
import EditorBlock from './editor-block';
import EditorItem from './editor-item';

export default defineComponent({
  props: { modelValue: Object },
  emits: ['update:modelValue'],
  components: { EditorBlock, EditorItem },
  setup(props, { emit }) {
    const containerRef = ref(null);
    let data = computed({
      get() {
        return props.modelValue;
      },
      set(val) {
        emit('update:modelValue', val);
      }
    });

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
          <EditorItem containerRef={containerRef} />
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
              {data.value.blocks.map((block) => (
                <EditorBlock block={block} />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }
});
