// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { LayoutProvider } from './context/LayoutContext'
import { BrowserRouter } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LayoutProvider>
          <ScrollToTop behavior="instant" />
          <App />
        </LayoutProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
