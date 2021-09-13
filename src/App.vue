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
    /*data:  {
      container: {
        width: 800,
        height: 800,
      },
      blocks: [
        {top: 100,left: 100,zIndex: 1,key: "text",},
        {top: 200,left: 200,zIndex: 1,key: "button",},
        {top: 300,left: 300,zIndex: 1,key: "input",},
      ],
    }  */

    provide('config', config);

    return {
      source
    };
  }
};
</script>
