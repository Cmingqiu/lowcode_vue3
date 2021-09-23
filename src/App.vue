<template>
  <Editor v-model="source" :formData="formData" />
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
    //双向绑定数据源
    const formData = ref({
      username: 'username',
      start: 0,
      end: 100
    });
    /*data:  {
      container: {
        width: 800,
        height: 800,
      },
      blocks: [
        {top: 100,left: 100,zIndex: 1,key: "text","props":{
          "text":"文字","color":"#333","size":"16px"
        }},
        {top: 200,left: 200,zIndex: 1,key: "button","props":{
          "text":"文字","type":"primary","size":"medium"
        }},
        {top: 300,left: 300,zIndex: 1,key: "input","props":{},"model":{}},
      ],
    }  */

    provide('config', config);

    return {
      source,
      formData
    };
  }
};
</script>
