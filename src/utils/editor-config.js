import { ElButton, ElInput } from 'element-plus';

function createEditorConfig() {
  let componentList = [];
  let componentMap = {};
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

registerConfig.register({
  key: 'text',
  label: '文本',
  preview: () => '预览文本',
  render: () => '渲染文本'
});

registerConfig.register({
  key: 'button',
  label: '按钮',
  preview: () => <ElButton>按钮</ElButton>,
  render: () => <ElButton>按钮</ElButton>
});

registerConfig.register({
  key: 'input',
  label: '输入框',
  preview: () => <ElInput placeholder='请输入' />,
  render: () => <ElInput placeholder='请输入' />
});

export default registerConfig;
