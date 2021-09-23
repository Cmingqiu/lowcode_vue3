import { computed, defineComponent, inject, ref } from 'vue';
import deepcopy from 'deepcopy';
import EditorBlock from './editor-block';
import useDrag from '../utils/drag';
import useFocus from '../utils/useFocus';
import useBlockDrag from '../utils/useBlockDrag';
import useCommand from '../utils/useCommand';
import $dialog from '../components/Dialog';
import $dropdown, { DropdownItem } from '../components/Dropdown';
import { ElButton } from 'element-plus';
import EditorOperator from './editor-operator';

export default defineComponent({
  props: {
    modelValue: Object,
    formData: Object
  },
  emits: ['update:modelValue'],
  components: { EditorBlock },
  setup(props, { emit }) {
    const containerRef = ref(null);
    const isPreview = ref(false); // 是否预览模式true  默认false
    const editorRef = ref(true); // 编辑模式
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
    } = useFocus(data, isPreview, e => blockDrag(e));
    //3.组件拖拽
    const { blockDrag, markLine } = useBlockDrag(
      focusData,
      lastSelectBlock,
      data
    );
    //4.撤销还原
    const { commands } = useCommand(data, focusData);

    const onContextMenuBlock = (e, block) => {
      e.preventDefault();
      $dropdown({
        e,
        el: e.target,
        content: () => {
          return (
            <>
              <DropdownItem
                icon='icon-control-top'
                label='置顶'
                onclick={() => {
                  commands.placeTop();
                }}
              />
              <DropdownItem
                label='置底'
                icon='icon-control-bottom'
                onclick={() => {
                  commands.placeBottom();
                }}
              />
              <DropdownItem
                icon='icon-yulan'
                label='查看'
                onclick={() => {
                  $dialog({
                    title: '查看节点数据',
                    content: JSON.stringify(block)
                  });
                }}
              />
              <DropdownItem
                icon='icon-export'
                label='导入'
                onclick={() => {
                  $dialog({
                    title: '导入节点',
                    content: '',
                    footer: true,
                    confirm(text) {
                      commands.updateBlock(JSON.parse(text), block);
                    }
                  });
                }}
              />
              <DropdownItem
                label='删除'
                icon='icon-cangpeitubiao_shanchu'
                onclick={() => {
                  commands.delete();
                }}
              />
            </>
          );
        }
      });
    };

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
              //data.value = text  //没有撤销还原操作,无法保留历史记录
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
      },
      {
        label: '置顶',
        class: 'icon-control-top',
        handle: commands.placeTop
      },
      {
        label: '置底',
        class: 'icon-control-bottom',
        handle: commands.placeBottom
      },
      {
        label: '删除',
        class: 'icon-cangpeitubiao_shanchu',
        handle: commands.delete
      },
      {
        label: () => (isPreview.value ? '编辑' : '预览'),
        class: () => (isPreview.value ? 'icon-yulan' : 'icon-bianji'),
        handle: () => {
          isPreview.value = !isPreview.value;
          clearBlockFocus();
        }
      },
      {
        label: '关闭',
        class: 'icon-guanbi',
        handle: () => {
          editorRef.value = false;
          clearBlockFocus();
        }
      }
    ];

    return () =>
      !editorRef.value ? (
        <div class='editor'>
          <ElButton
            type='primary'
            style='position:absolute;left:10px;top:30px;'
            onclick={() => {
              editorRef.value = true;
            }}
          >
            返回编辑
          </ElButton>
          {JSON.stringify(props.formData)}
          <main>
            {/* 产生滚动条 */}
            <div class='editor-canvas'>
              <div class='editor-canvas__content' style={contentStyle.value}>
                {data.value.blocks.map(block => (
                  <EditorBlock block={block} formData={props.formData} />
                ))}
              </div>
            </div>
          </main>
        </div>
      ) : (
        <div class='editor'>
          <header>
            {buttons.map(btn => {
              const label =
                typeof btn.label === 'function' ? btn.label() : btn.label;
              const className =
                typeof btn.class === 'function' ? btn.class() : btn.class;
              return (
                <div class='editor-btns' onclick={btn.handle}>
                  {label}
                  <i title={label} class={[className]} />
                </div>
              );
            })}
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
                <span class='editor-item-label'>{component.label}</span>
                {component.preview()}
              </div>
            ))}
          </aside>
          <section>
            <EditorOperator
              block={lastSelectBlock.value}
              data={data.value}
              updateContainer={commands.updateContainer}
              updateBlock={commands.updateBlock}
            />
          </section>
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
                    class={[
                      block.focus ? 'editor-block-focus' : '',
                      !isPreview.value ? 'shade-mask' : ''
                    ]}
                    block={block}
                    onmousedown={e => blockMouseDown(e, block, index)}
                    oncontextmenu={e => {
                      onContextMenuBlock(e, block);
                    }}
                    formData={props.formData}
                  />
                ))}

                {markLine.x !== null && (
                  <div
                    class='mark-line-x'
                    style={{ left: markLine.x + 'px' }}
                  />
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
