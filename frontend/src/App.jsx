import { Routes } from 'react-router-dom'
import PublicRoutes from './routes/PublicRoutesWrapper'
import PrivateRoutes from './routes/PrivateRoutesWrapper'

export default function App() {
  return <Routes>{[...PublicRoutes(), ...PrivateRoutes()]}</Routes>
}
