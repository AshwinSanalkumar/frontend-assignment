import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import store from './store';
import Toast from 'vue-toastification';
// Import the CSS or use your own!
import 'vue-toastification/dist/index.css';

const app = createApp(App);

app.use(router);
app.use(store);
app.use(Toast, {
    position: "bottom-right",
    timeout: 2500,
    closeOnClick: true,
    pauseOnFocusLoss: false,
    pauseOnHover: true,
    draggable: false,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: false,
    icon: true,
    rtl: false,
    transition: "Vue-Toastification__fade",
    maxToasts: 3,
    newestOnTop: true
});

app.mount('#app');
