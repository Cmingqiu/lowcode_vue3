import { createVNode, defineComponent, render, reactive } from 'vue';
import { ElButton, ElDialog, ElInput } from 'element-plus';

const DialogComponent = defineComponent({
  props: {
    option: Object
  },
  setup(props, ctx) {
    const state = reactive({
      isShow: false,
      option: props.option //用户传入的属性
    });

    ctx.expose({
      showDialog(option) {
        state.isShow = true;
        state.option = option;
      }
    });

    const onCancel = () => {
      state.isShow = false;
    };
    const onConfirm = () => {
      state.isShow = false;
      state.option.confirm && state.option.confirm(state.option.content);
    };

    return () => {
      /* vue3中的插槽都是函数 */
      return (
        <ElDialog v-model={state.isShow} title={state.option.title}>
          {{
            default: () => (
              <ElInput
                type='textarea'
                rows={10}
                v-model={state.option.content}
              />
            ),
            footer: () =>
              state.option.footer && (
                <div>
                  <ElButton type='primary' onclick={onConfirm}>
                    确定
                  </ElButton>
                  <ElButton onclick={onCancel}>取消</ElButton>
                </div>
              )
          }}
        </ElDialog>
      );
    };
  }
});

let vm;
export function $dialog(option) {
  if (!vm) {
    let el = document.createElement('div');
    vm = createVNode(DialogComponent, { option }); //创建组件的虚拟节点
    document.body.appendChild((render(vm, el), el)); //render将虚拟节点渲染成真实节点 ，手动挂载组件到元素el上
  }
  let { showDialog } = vm.component.exposed;
  showDialog(option);
}

export default $dialog;
