import { createApp } from 'vue';
import App from './App.vue';
import 'element-plus/lib/theme-chalk/index.css';
import ElementPlus from 'element-plus';
import './style/index.scss';

createApp(App)
  .use(ElementPlus)
  .mount('#app');
