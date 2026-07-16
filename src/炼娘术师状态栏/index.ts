import { waitUntil } from 'async-wait-until';
import { createPinia } from 'pinia';
import { createApp } from 'vue';
import App from './App.vue';
import './styles/_variables.scss';
import './styles/_animations.scss';

function loadFont(fontURL: string): HTMLLinkElement {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = fontURL;
  document.head.appendChild(link);
  return link;
}

$(async () => {
  loadFont('https://fontsapi.zeoseven.com/623/main/result.css');
  await waitGlobalInitialized('Mvu');
  await waitUntil(() => _.has(getVariables({ type: 'message' }), 'stat_data'));

  const app = createApp(App).use(createPinia());
  app.mount('#app');
  $(window).on('pagehide', () => app.unmount());
});
