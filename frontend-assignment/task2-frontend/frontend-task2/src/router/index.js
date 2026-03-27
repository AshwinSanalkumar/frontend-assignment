import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';

// Lazy loading views
const Login = () => import('../views/Login.vue');
const Register = () => import('../views/Register.vue');
const Calculator = () => import('../views/Calculator.vue');

const routes = [
  {
    path: '/',
    name: 'Calculator',
    component: Calculator,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { guestOnly: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.isAuthenticated;
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.meta.guestOnly && isAuthenticated) {
    next({ name: 'Calculator' });
  } else {
    next();
  }
});

export default router;
