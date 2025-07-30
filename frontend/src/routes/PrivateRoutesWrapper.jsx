import { Route } from 'react-router-dom'
import { privateRoutes } from './privateRoutes'
import PrivateRoute from './PrivateRoute'
import DashboardLayout from '../layouts/DashboardLayout'

export default function PrivateRoutes() {
  return [
    <Route
      key="layout"
      element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }
    >
      {privateRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
    </Route>,
  ]
}
