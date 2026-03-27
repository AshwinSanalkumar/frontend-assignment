<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2 class="auth-title">VividCalc</h2>
      <p class="auth-subtitle">Welcome to the new standard of mathematics.</p>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Given Name</label>
            <input type="text" id="firstName" v-model="form.first_name" required placeholder="John" />
          </div>
          <div class="form-group">
            <label for="lastName">Family Name</label>
            <input type="text" id="lastName" v-model="form.last_name" required placeholder="Doe" />
          </div>
        </div>

        <div class="form-group">
          <label for="username">Unified ID</label>
          <input type="text" id="username" v-model="form.username" required placeholder="johndoe7" />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="form.email" required placeholder="john@example.com" />
        </div>

        <div class="form-row">
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
          <div class="form-group">
            <label for="passwordConfirm">Confirm Password</label>
            <div class="password-wrapper">
              <input :type="showConfirmPassword ? 'text' : 'password'" id="passwordConfirm" v-model="form.password_confirm" required placeholder="••••••••" />
              <button type="button" class="password-toggle" @click="showConfirmPassword = !showConfirmPassword" aria-label="Toggle password visibility">
                <svg v-if="showConfirmPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17.94 17.94A10.07 10.07 0 0112 19c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Register</span>
        </button>
      </form>
      
      <p class="auth-footer">
        Already have an account? <router-link to="/login">Log in here</router-link>
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
  name: 'Register',
  setup() {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();
    
    const form = reactive({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      password_confirm: ''
    });
    
    const loading = ref(false);
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);

    const validateForm = () => {
      if (form.password !== form.password_confirm) {
        toast.error("Passwords do not match");
        return false;
      }
      if (form.password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return false;
      }
      return true;
    };

    const handleRegister = async () => {
      if (!validateForm()) return;

      loading.value = true;
      try {
        await store.dispatch('register', form);
        toast.success("Registration successful! Please login.");
        router.push('/login');
      } catch (error) {
        const errorData = error.response?.data;
        if (errorData) {
          // Flatten nested validation errors from backend
          const msgs = Object.values(errorData).flat();
          toast.error(msgs[0] || 'Registration failed');
        } else {
          toast.error("An error occurred during registration");
        }
      } finally {
        loading.value = false;
      }
    };

    return {
      form,
      loading,
      showPassword,
      showConfirmPassword,
      handleRegister
    };
  }
};
</script>
