<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">VividCalc</h2>
      <p class="auth-subtitle">Precision computing, elegantly delivered.</p>
      
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input type="username" id="username" v-model="form.username" required placeholder="name@vividcalc.io" />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-wrapper">
            <input :type="showPassword ? 'text' : 'password'" id="password" v-model="form.password" required placeholder="••••••••" />
            <button type="button" class="password-toggle" @click="showPassword = !showPassword" aria-label="Toggle password visibility">
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17.94 17.94A10.07 10.07 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Login</span>
        </button>
      </form>
      
      <p class="auth-footer">
        Don't have an account? <router-link to="/register">Register here</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

export default {
  name: 'Login',
  setup() {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();
    
    const form = reactive({
      username: '',
      password: ''
    });
    
    const loading = ref(false);
    const showPassword = ref(false);

    const handleLogin = async () => {
      if (!form.username || !form.password) {
        toast.error("Username and password are required");
        return;
      }

      loading.value = true;
      try {
        await store.dispatch('login', form);
        toast.success("Welcome back!");
        router.push('/');
      } catch (error) {
        toast.error(error.response?.data?.detail || "Invalid credentials. Please try again.");
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      loading,
      showPassword,
      handleLogin
    };
  }
};
</script>
