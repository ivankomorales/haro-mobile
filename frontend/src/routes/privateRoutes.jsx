// src/routes/privateRoutes.jsx
import Home from '../pages/Home'
import Orders from '../pages/orders/Orders'
import NewOrder from '../pages/orders/NewOrder'
import EditOrder from '../pages/orders/EditOrder'
import AddProduct from '../pages/orders/AddProduct'
import OrderConfirmation from '../pages/orders/OrderConfirmation'
import OrderDetails from '../pages/orders/OrderDetails'
import AddUser from '../pages/users/AddUser'

export const privateRoutes = [
  { path: '/home', element: <Home /> },
  { path: '/orders', element: <Orders /> },
  { path: '/orders/new', element: <NewOrder /> },
  { path: '/orders/:id/edit', element: <EditOrder /> },
  { path: '/orders/new/products', element: <AddProduct /> },
  { path: '/orders/confirmation', element: <OrderConfirmation /> },
  { path: '/orders/:id/details', element: <OrderDetails /> },
  { path: '/users/add', element: <AddUser /> },
]
