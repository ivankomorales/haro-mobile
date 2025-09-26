### **Haro Mobile - Restful API**

## Folder structure

```
frontend/
src/
├── api/              # SDK-like wrappers around backend API endpoints
│   ├── auth.js
│   ├── glazes.js
│   └── users.js
├── components/       # Reusable UI components
│   ├── BottomNav.jsx
│   └── FloatingInput.jsx
├── context/          # React context for global state (AuthContext)
│   └── AuthContext.jsx
├── hooks/            # Custom logic hooks
│   ├── useCreateUser.js
│   └── useDarkMode.js (not implemented yet)
├── pages/            # Full-screen views or routes
│   ├── AddProduct.jsx
│   ├── AddUser.jsx
│   ├── EditOrder.jsx
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── NewOrder.jsx
│   ├── OrderDetails.jsx
│   └── Orders.jsx
├── routes/           # Route guards and wrappers
│   └── PrivateRoute.jsx
├── services/         # Reserved for potential logic abstraction (currently unused)
├── utils/            # Low-level utilities
│   └── fetchWithAuth.js
├── App.css           # Empty (can be deleted)
├── App.jsx           # Main app layout and routes
├── index.css         # Tailwind/global styles
├── main.jsx          # React root and context setup
```
