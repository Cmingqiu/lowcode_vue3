import { computed, defineComponent, inject, ref } from 'vue';
import deepcopy from 'deepcopy';
import EditorBlock from './editor-block';
import useDrag from '../utils/drag';
import useFocus from '../utils/useFocus';
import useBlockDrag from '../utils/useBlockDrag';

export default defineComponent({
  props: { modelValue: Object },
  emits: ['update:modelValue'],
  components: { EditorBlock },
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
    const contentStyle = computed(() => {
      return {
        width: data.value.container.width + 'px',
        height: data.value.container.height + 'px'
      };
    });

    //1.物料拖拽
    const { dragstart, dragend } = useDrag(containerRef, data);
    //2.组件获取焦点
    const {
      blockMouseDown,
      clearBlockFocus,
      focusData,
      lastSelectBlock
    } = useFocus(data, e => {
      blockDrag(e);
    });
    //3.组件拖拽
    const { blockDrag, markLine } = useBlockDrag(focusData, lastSelectBlock);

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
              onmousedown={e => clearBlockFocus()}
            >
              {data.value.blocks.map((block, index) => (
                <EditorBlock
                  class={[block.focus ? 'editor-block-focus' : '']}
                  block={block}
                  onmousedown={e => blockMouseDown(e, block, index)}
                />
              ))}

              {markLine.x !== null && (
                <div class='mark-line-x' style={{ left: markLine.x + 'px' }} />
              )}
              {markLine.y !== null && (
                <div class='mark-line-y' style={{ top: markLine.y + 'px' }} />
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }
});
