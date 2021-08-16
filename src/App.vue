<template>
  <Editor id="root" />
</template>

<script>
import { ref } from 'vue';
import data from './json/data';
import Editor from './packages/editor';

export default {
  name: 'App',
  components: { Editor },
  setup() {
    const source = ref(data);
    return {
      source
    };
  }
};
</script>
