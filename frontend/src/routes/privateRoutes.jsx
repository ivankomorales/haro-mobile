// src/routes/privateRoutes.jsx
import Dashboard from '../pages/Dashboard'
import AddGlaze from '../pages/glazes/AddGlaze'
import EditGlaze from '../pages/glazes/EditGlaze'
import GlazeListPage from '../pages/glazes/GlazeListPage'
import Home from '../pages/Home'
import AddProduct from '../pages/orders/AddProduct'
import EditOrder from '../pages/orders/EditOrder'
import NewOrder from '../pages/orders/NewOrder'
import OrderConfirmation from '../pages/orders/OrderConfirmation'
import OrderDetails from '../pages/orders/OrderDetails'
import Orders from '../pages/orders/Orders'
import AddUser from '../pages/users/AddUser'
import UserProfile from '../pages/users/UserProfile'

export const privateRoutes = [
  { path: '/home', element: <Home /> },
  // Orders
  { path: 'orders', element: <Orders /> },
  { path: 'orders/new', element: <NewOrder /> },
  { path: 'orders/new/products', element: <AddProduct /> },
  { path: 'orders/confirmation', element: <OrderConfirmation /> },
  { path: 'orders/:id/details', element: <OrderDetails /> },
  { path: 'orders/:id/edit', element: <EditOrder /> },
  // Users
  { path: 'users/add', element: <AddUser /> },
  { path: 'profile', element: <UserProfile /> },
  // Glazes
  { path: 'products/glazes', element: <GlazeListPage /> },
  { path: 'glazes/add', element: <AddGlaze /> },
  { path: 'glazes/:id/edit', element: <EditGlaze /> },
  // Dashboard and Reports
  { path: 'dashboard', element: <Dashboard /> },
]
