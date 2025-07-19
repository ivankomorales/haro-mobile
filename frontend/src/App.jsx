import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Orders from './pages/Orders'
import NewOrder from './pages/NewOrder'
import EditOrder from './pages/EditOrder'
import AddProduct from './pages/AddProduct'
import OrderConfirmation from './pages/OrderConfirmation'
import OrderDetails from './pages/OrderDetails'
import PrivateRoute from './routes/PrivateRoute'
import AddUser from './pages/AddUser'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/home"
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <Orders />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/new"
        element={
          <PrivateRoute>
            <NewOrder />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/:id/edit"
        element={
          <PrivateRoute>
            <EditOrder />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/:id/products/add"
        element={
          <PrivateRoute>
            <AddProduct />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/:id/confirmation"
        element={
          <PrivateRoute>
            <OrderConfirmation />
          </PrivateRoute>
        }
      />
      <Route
        path="/orders/:id/details"
        element={
          <PrivateRoute>
            <OrderDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/users/add"
        element={
          <PrivateRoute>
            <AddUser />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

export default App
