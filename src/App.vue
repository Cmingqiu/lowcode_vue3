<template>
  <Editor v-model="source" />
</template>

<script>
import { provide, ref } from 'vue';
import data from './json/data';
import Editor from './packages/editor';
import { default as config } from './utils/editor-config';

export default {
  name: 'App',
  components: { Editor },
  setup() {
    const source = ref(data);

    provide('config', config);

    return {
      source
    };
  }
};
</script>
