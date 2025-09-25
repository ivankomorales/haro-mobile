// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import './index.css'
import ScrollManager from './components/ScrollManager'
import { AuthProvider } from './context/AuthContext'
import { I18nProvider } from './context/I18nContext'
import { LayoutProvider } from './context/LayoutContext'

import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'

import { SCROLL_CONTAINER_SELECTOR } from './utils/constants'

registerSW({ immediate: true })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <LayoutProvider>
            <ScrollManager
              selector={SCROLL_CONTAINER_SELECTOR}
              behavior="auto"
              respectBackForward
            />
            <App />
          </LayoutProvider>
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>
)
