import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';

function loadFont(fontURL: string): HTMLLinkElement {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = fontURL;
  document.head.appendChild(link);
  return link;
}

$(() => {
  loadFont('https://fontsapi.zeoseven.com/623/main/result.css');
  const app = createApp(App).use(createPinia());
  app.mount('#app');
  $(window).on('pagehide', () => app.unmount());
});
