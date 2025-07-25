// src/routes/PrivateRoutesWrapper.jsx
import { Route } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import { privateRoutes } from './privateRoutes'

export default function PrivateRoutes() {
  return privateRoutes.map(({ path, element }) => (
    <Route
      key={path}
      path={path}
      element={<PrivateRoute>{element}</PrivateRoute>}
    />
  ))
}
