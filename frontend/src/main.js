import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { router } from './router/router.js';
import { createPinia } from 'pinia';
import { useAuthStore } from './stores/auth.store.js';

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);

const authStore = useAuthStore();
await authStore.initializeAuth();

app.mount('#app');
