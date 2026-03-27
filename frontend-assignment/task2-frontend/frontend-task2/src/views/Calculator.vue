<template>
  <div class="dashboard">
    <header class="app-header">
      <div class="logo">VividCalc</div>
      <div class="header-actions">
        <span class="user-badge" v-if="username">Hi, {{ username }}</span>
        <button @click="handleLogout" class="btn-logout">Sign Out</button>
      </div>
    </header>

    <main class="calculator-container">
      <div class="calculator-card">
        <div class="calc-header">
           <h2 class="calc-title">Calculate</h2>
           <button @click="clearAll" class="btn-clear-text">RESET</button>
        </div>
        
        <div class="calc-display">
          <div class="calc-history" :class="{ 'fade-in': history }">{{ history || 'READY' }}</div>
          <div class="calc-result" :class="{ 'error-text': isError, 'loading-text': loading }">
             {{ displayValue }}
          </div>
        </div>

        <div class="calc-inputs">
          <div class="form-group">
            <input type="number" v-model="num1" placeholder="Enter first number" />
          </div>
          <div class="form-group mt-4">
            <input type="number" v-model="num2" placeholder="Enter second number" />
          </div>
        </div>

        <div class="calc-grid mt-6">
          <button @click="calculate('sum', '+')" class="btn-op" :disabled="loading">
            <span class="op-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg></span>
            <span class="op-label">ADDITION</span>
          </button>
          <button @click="calculate('difference', '-')" class="btn-op" :disabled="loading">
            <span class="op-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg></span>
            <span class="op-label">SUBTRACT</span>
          </button>
          <button @click="calculate('multiply', '×')" class="btn-op" :disabled="loading">
            <span class="op-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></span>
            <span class="op-label">MULTIPLY</span>
          </button>
          <button @click="calculate('divide', '÷')" class="btn-op" :disabled="loading">
             <span class="op-icon"><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="6" r="1.5"/><path d="M5 12h14"/><circle cx="12" cy="18" r="1.5"/></svg></span>
             <span class="op-label">DIVIDE</span>
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import api from '../services/api';
import { useToast } from 'vue-toastification';

export default {
  name: 'Calculator',
  setup() {
    const store = useStore();
    const router = useRouter();
    const toast = useToast();

    const num1 = ref('');
    const num2 = ref('');
    const displayValue = ref('0');
    const history = ref('');
    const loading = ref(false);
    const isError = ref(false);

    const username = computed(() => store.state.username);

    const clearAll = () => {
        num1.value = '';
        num2.value = '';
        displayValue.value = '0';
        history.value = '';
        isError.value = false;
        toast.info("Dashboard Reset");
    };

    const handleLogout = async () => {
      await store.dispatch('logout');
      toast.info("Logged out successfully");
      router.push('/login');
    };

    const calculate = async (operation, symbol) => {
      if (num1.value === '' || num2.value === '') {
        toast.warning("Please specify input numbers");
        return;
      }

      if (operation === 'divide' && parseFloat(num2.value) === 0) {
        toast.error("Division by zero exception");
        displayValue.value = "NAN";
        isError.value = true;
        return;
      }

      isError.value = false;
      loading.value = true;
      history.value = `${num1.value} ${symbol} ${num2.value}`;
      displayValue.value = '...';

      try {
        const cleanN1 = encodeURIComponent(num1.value);
        const cleanN2 = encodeURIComponent(num2.value);
        const response = await api.get(`calculate/${operation}/${cleanN1}/${cleanN2}/`);
        
        const data = response.data;
        let result = null;
        if (data.result !== undefined) result = data.result;
        else if (data.answer !== undefined) result = data.answer;
        else {
          result = Object.values(data).find(v => typeof v === 'number' || (!isNaN(v) && v !== ''));
        }

        displayValue.value = result !== undefined ? String(result) : '0';
        
      } catch (error) {
        isError.value = true;
        displayValue.value = "ERR";
        toast.error(error.response?.data?.error || "API Handshake Failed");
      } finally {
        loading.value = false;
      }
    };

    return {
      num1, num2, displayValue, history, loading, isError,
      username, handleLogout, calculate, clearAll
    };
  }
};
</script>
