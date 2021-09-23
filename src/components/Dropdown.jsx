import {
  defineComponent,
  createVNode,
  render,
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount,
  provide,
  inject
} from 'vue';

/* 下拉项组件 */
export const DropdownItem = defineComponent({
  props: {
    label: {
      type: String,
      required: true
    },
    icon: String,
    handler: {
      type: Function
    }
  },
  //props无需响应式
  setup({ icon, label }) {
    const hide = inject('hideDropdown');
    return () => {
      return (
        <div class='dropdown-item' onClick={hide}>
          <i class={icon} style='margin-right:5px;' />
          {label}
        </div>
      );
    };
  }
});

/* 下拉组件 */
const DropdownComponent = defineComponent({
  props: {
    option: { type: Object }
  },
  setup(props, ctx) {
    const dropdownRef = ref(null);
    const state = reactive({
      show: false,
      option: props.option,
      top: 0,
      left: 0
    });

    const style = computed(() => ({
      left: state.left,
      top: state.top
    }));

    ctx.expose({
      showDropdown(option) {
        state.option = option;
        state.show = true;
        const { clientX, clientY } = state.option.e;
        state.left = clientX + 10 + 'px';
        state.top = clientY + 10 + 'px';
      }
    });

    provide('hideDropdown', () => {
      state.show = false;
    });

    const onMouseDown = e => {
      if (!dropdownRef.value.contains(e.target)) state.show = false;
    };

    onMounted(() => {
      document.addEventListener('mousedown', onMouseDown, true); //捕获
    });
    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', onMouseDown, true);
    });

    return () => {
      return (
        <div
          class='dropdown'
          style={style.value}
          v-show={state.show}
          ref={dropdownRef}
        >
          {props.option.content()}
        </div>
      );
    };
  }
});

let vm;
const $dropdown = option => {
  if (!vm) {
    const el = document.createElement('div');
    vm = createVNode(DropdownComponent, { option });
    document.body.appendChild((render(vm, el), el));
  }
  const { showDropdown } = vm.component.exposed;
  showDropdown(option);
};

export default $dropdown;
