import { ElButton, ElInput } from 'element-plus';

function createEditorConfig() {
  let componentList = []; //用来渲染左侧预览图
  let componentMap = {}; //key 和 component映射，根据key渲染component
  return {
    componentList,
    componentMap,
    register(component) {
      if (!componentMap[component.key]) {
        componentMap[component.key] = component;
        componentList.push(component);
      }
    }
  };
}

let registerConfig = createEditorConfig();

const createInputProp = label => {
  return { type: 'input', label };
};
const createColorProp = label => {
  return { type: 'color', label };
};
const createSelectProp = (label, options) => {
  return { type: 'select', label, options };
};

registerConfig.register({
  key: 'text',
  label: '文本',
  preview: () => '预览文本',
  render: () => '渲染文本',
  props: {
    text: createInputProp('文本内容'),
    color: createColorProp('字体颜色'),
    size: createSelectProp('字体大小', [
      { value: '14px', label: '14px' },
      { value: '16px', label: '16px' },
      { value: '20px', label: '20px' }
    ])
  }
});

registerConfig.register({
  key: 'button',
  label: '按钮',
  preview: () => <ElButton>按钮</ElButton>,
  render: () => <ElButton>按钮</ElButton>,
  props: {
    text: createInputProp('文本内容'),
    type: createSelectProp('按钮类型', [
      { value: 'primary', label: '基础' },
      { value: 'success', label: '成功' },
      { value: 'warning', label: '警告' },
      { value: 'danger', label: '危险' },
      { value: 'text', label: '文本' }
    ]),
    size: createSelectProp('按钮尺寸', [
      { value: 'medium', label: '中等' },
      { value: 'small', label: '小' },
      { value: 'mini', label: '极小' }
    ])
  }
});

registerConfig.register({
  key: 'input',
  label: '输入框',
  preview: () => <ElInput placeholder='请输入' />,
  render: () => <ElInput placeholder='请输入' />
});

export default registerConfig;
