// src/routes/PublicRoutesWrapper.jsx
import { Route } from 'react-router-dom'

import { publicRoutes } from './publicRoutes.jsx'

export default function PublicRoutes() {
  return publicRoutes.map(({ path, element }) => <Route key={path} path={path} element={element} />)
}
