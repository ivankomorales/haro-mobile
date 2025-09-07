import { Routes } from 'react-router-dom'
import PublicRoutes from './routes/PublicRoutesWrapper'
import PrivateRoutes from './routes/PrivateRoutesWrapper'
import { Toaster } from 'react-hot-toast'
import { ConfirmProvider } from './context/ConfirmContext'

export default function App() {
  return (
    <ConfirmProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>{[...PublicRoutes(), ...PrivateRoutes()]}</Routes>
    </ConfirmProvider>
  )
}
