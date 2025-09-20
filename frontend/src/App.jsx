//src/App.jsx 
import { Toaster } from 'react-hot-toast'
import { Routes } from 'react-router-dom'

import { ConfirmProvider } from './context/ConfirmContext'
import PrivateRoutes from './routes/PrivateRoutesWrapper'
import PublicRoutes from './routes/PublicRoutesWrapper'

export default function App() {
  return (
    <ConfirmProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>{[...PublicRoutes(), ...PrivateRoutes()]}</Routes>
    </ConfirmProvider>
  )
}
