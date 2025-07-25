// src/routes/privateRoutes.jsx
import Home from '../pages/Home'
import Orders from '../pages/Orders'
import NewOrder from '../pages/NewOrder'
import EditOrder from '../pages/EditOrder'
import AddProduct from '../pages/AddProduct'
import OrderConfirmation from '../pages/OrderConfirmation'
import OrderDetails from '../pages/OrderDetails'
import AddUser from '../pages/AddUser'

export const privateRoutes = [
  { path: '/home', element: <Home /> },
  { path: '/orders', element: <Orders /> },
  { path: '/orders/new', element: <NewOrder /> },
  { path: '/orders/:id/edit', element: <EditOrder /> },
  { path: '/orders/:id/products/add', element: <AddProduct /> },
  { path: '/orders/:id/confirmation', element: <OrderConfirmation /> },
  { path: '/orders/:id/details', element: <OrderDetails /> },
  { path: '/users/add', element: <AddUser /> },
]
