import deepcopy from 'deepcopy';
import {
  ElButton,
  ElSelect,
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
    data: Object
  },
  setup(props, ctx) {
    const config = inject('config');
    const state = reactive({ editData: {} });
    watch(
      props.block,
      () => {
        if (!props.block) {
          state.editData = deepcopy(props.data.container);
        } else {
          state.editData = deepcopy(props.block);
        }
      },
      { immediate: true }
    );

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
        const configProps = config.componentMap[props.block.key].props; // { text:{type,..},type,color,size}
        console.log(state.editData);
        Object.entries(configProps).map(([propName, propConfig]) => {
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

      return (
        <ElForm label-position='top' style='padding:30px'>
          {content}
          <ElFormItem>
            <ElButton type='primary'>应用</ElButton>
            <ElButton>重置</ElButton>
          </ElFormItem>
        </ElForm>
      );
    };
  }
});
