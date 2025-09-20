import { Route, Navigate } from 'react-router-dom'

import PrivateRoute from './PrivateRoute'
import { privateRoutes } from './privateRoutes'
import DashboardLayout from '../layouts/DashboardLayout'

export default function PrivateRoutes() {
  return [
    <Route
      key="layout"
      path="/"
      element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }
    >
      {privateRoutes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Route>,
  ]
}
