import { computed, defineComponent, inject, ref } from 'vue';
import deepcopy from 'deepcopy';
import EditorBlock from './editor-block';
import useDrag from '../utils/drag';
import useFocus from '../utils/useFocus';
import useBlockDrag from '../utils/useBlockDrag';
import useCommand from '../utils/useCommand';
import $dialog from '../components/Dialog';

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
    } = useFocus(data, e => blockDrag(e));
    //3.组件拖拽
    const { blockDrag, markLine } = useBlockDrag(
      focusData,
      lastSelectBlock,
      data
    );
    //4.撤销还原
    const { commands } = useCommand(data);

    const buttons = [
      {
        label: '撤销',
        class: 'icon-back',
        handle: commands.undo
      },
      {
        label: '还原',
        class: 'icon-back restore',
        handle: commands.redo
      },
      {
        label: '导入',
        class: 'icon-import',
        handle: () => {
          $dialog({
            title: '导入json使用',
            content: '',
            footer: true,
            confirm(text) {
              //data.value = text  //没有撤销还原操作
              commands.updateContainer(JSON.parse(text));
            }
          });
        }
      },
      {
        label: '导出',
        class: 'icon-export',
        handle: () => {
          $dialog({
            title: '导出json使用',
            content: JSON.stringify(data.value)
          });
        }
      }
    ];

    return () => (
      <div class='editor'>
        <header>
          {buttons.map(btn => (
            <div class='editor-btns' onclick={btn.handle}>
              {btn.label}
              <i title={btn.label} class={[btn.class]} />
            </div>
          ))}
        </header>
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
        <section>属性控制区</section>
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
