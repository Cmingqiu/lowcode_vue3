import { ElInput } from 'element-plus';
import { defineComponent, computed } from 'vue';

export default defineComponent({
  props: {
    start: String | Number,
    end: String | Number
  },
  emits: ['update:start', 'update:end'],
  setup(props, ctx) {
    const start = computed({
      get() {
        return props.start;
      },
      set(val) {
        ctx.emit('update:start', val);
      }
    });
    const end = computed({
      get() {
        return props.end;
      },
      set(val) {
        ctx.emit('update:end', val);
      }
    });

    return () => (
      <div class='my-range'>
        <ElInput type='text' v-model={start.value} /> -{' '}
        <ElInput type='text' v-model={end.value} />
      </div>
    );
  }
});
