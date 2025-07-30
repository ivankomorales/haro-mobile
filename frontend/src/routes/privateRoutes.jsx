// src/routes/privateRoutes.jsx
import Home from '../pages/Home'
import Orders from '../pages/orders/Orders'
import NewOrder from '../pages/orders/NewOrder'
import EditOrder from '../pages/orders/EditOrder'
import AddProduct from '../pages/orders/AddProduct'
import OrderConfirmation from '../pages/orders/OrderConfirmation'
import OrderDetails from '../pages/orders/OrderDetails'
import AddUser from '../pages/users/AddUser'
import AddGlaze from '../pages/glazes/AddGlaze'
import Dashboard from '../pages/Dashboard'
import UserProfile from '../pages/UserProfile'

export const privateRoutes = [
  { path: '/home', element: <Home /> },
  // Orders
  { path: '/orders', element: <Orders /> },
  { path: '/orders/new', element: <NewOrder /> },
  { path: '/orders/new/products', element: <AddProduct /> },
  { path: '/orders/confirmation', element: <OrderConfirmation /> },
  { path: '/orders/:id/details', element: <OrderDetails /> },
  { path: '/orders/:id/edit', element: <EditOrder /> },
  // Users
  { path: '/users/add', element: <AddUser /> },
  { path: '/profile', element: <UserProfile /> },
  // Glazes
  { path: '/glazes/add', element: <AddGlaze /> },
  // Dashboard and Reports
  { path: '/dashboard', element: <Dashboard /> },
]
