import deepcopy from 'deepcopy';
import {
  ElButton,
  ElSelect,
  ElOption,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElColorPicker
} from 'element-plus';
import { defineComponent, inject, reactive, watch } from 'vue';

export default defineComponent({
  props: {
    block: Object, //最后选中的元素block
    data: Object,
    updateContainer: Function,
    updateBlock: Function
  },
  setup(props) {
    const config = inject('config');
    const state = reactive({ editData: {} });
    const reset = () => {
      if (!props.block) {
        state.editData = deepcopy(props.data.container);
      } else {
        state.editData = deepcopy(props.block);
      }
    };
    const apply = () => {
      if (!props.block) {
        //更改容器
        props.updateContainer({ ...props.data, container: state.editData });
      } else {
        //更改block
        props.updateBlock(state.editData, props.block);
      }
    };

    watch(() => props.block, reset, { immediate: true });

    return () => {
      let content = [];
      if (!props.block) {
        content.push(
          <>
            <ElFormItem label='容器宽度'>
              <ElInputNumber v-model={state.editData.width} />
            </ElFormItem>
            <ElFormItem label='容器高度'>
              <ElInputNumber v-model={state.editData.height} />
            </ElFormItem>
          </>
        );
      } else {
        const component = config.componentMap[props.block.key]; // { text:{type,..},type,color,size}
        if (component && component.props) {
          Object.entries(component.props).map(([propName, propConfig]) => {
            content.push(
              <ElFormItem label={propConfig.label}>
                {{
                  input: () => (
                    <ElInput v-model={state.editData.props[propName]} />
                  ),
                  color: () => (
                    <ElColorPicker v-model={state.editData.props[propName]} />
                  ),
                  select: () => (
                    <ElSelect v-model={state.editData.props[propName]}>
                      {propConfig.options.map(({ value, label }) => (
                        <ElOption value={value} label={label} />
                      ))}
                    </ElSelect>
                  )
                }[propConfig.type]()}
              </ElFormItem>
            );
          });
        }

        if (component && component.model) {
          //  { default:'label',start:'',end:'' }
          Object.entries(component.model).map(([modelName, label]) => {
            content.push(
              <ElFormItem label={label}>
                <ElInput v-model={state.editData.model[modelName]} />
              </ElFormItem>
            );
          });
        }
      }

      return (
        <ElForm label-position='top' style='padding:30px'>
          {content}
          <ElFormItem>
            <ElButton type='primary' onclick={apply}>
              应用
            </ElButton>
            <ElButton onclick={reset}>重置</ElButton>
          </ElFormItem>
        </ElForm>
      );
    };
  }
});
