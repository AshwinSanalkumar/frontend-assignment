import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux' // 1. Add this
import store from './store'           // 2. Add this
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}> 
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </StrictMode>,
)