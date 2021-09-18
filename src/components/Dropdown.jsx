import {
  defineComponent,
  createVNode,
  render,
  ref,
  reactive,
  computed,
  onMounted,
  onBeforeUnmount
} from 'vue';

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
          dropdown
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
