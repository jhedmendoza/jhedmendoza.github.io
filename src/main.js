import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Remove legacy preloader overlay if present (some static copies include a #preloader div)
const preloader = document.getElementById('preloader')
if (preloader) {
  preloader.style.display = 'none'
  // also remove from DOM
  try { preloader.parentNode && preloader.parentNode.removeChild(preloader) } catch(e){}
}

createApp(App).use(router).mount('#app')
