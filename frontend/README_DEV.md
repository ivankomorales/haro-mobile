# Developer Notes for Haro Mobile

This document is a technical reference for developers working on the Haro Mobile frontend. It explains the architecture, purpose of each directory, and the reasoning behind design decisions to ensure clarity, maintainability, and scalability.

### Project Structure Overview

```
haro-mobile/backend
│
├── config/
│   └── db.js                    # MongoDB connection setup
│
├── controllers/
│   ├── auditController.js       # Handles fetching audit logs (admin-only)
│   ├── authController.js        # Login, logout, password update
│   ├── glazeController.js       # CRUD for glazes with audit logging
│   ├── orderController.js       # Create, update, cancel orders
│   └── userController.js        # User CRUD, soft delete, role updates
│
├── middleware/
│   ├── auth.js                  # JWT verification, attaches user to req
│   ├── checkRole.js             # Restricts access by role (admin/employee)
│   └── verifyOwnershipOrAdmin.js # Protects resources by ownership or admin
│
├── models/
│   ├── AuditLog.js              # Logs critical system events (with TTL index)
│   ├── Counter.js               # For auto-increment order IDs (ORD-000X)
│   ├── Customer.js              # Customer schema (linked to orders)
│   ├── Glaze.js                 # Glaze data, soft deletable
│   ├── Order.js                 # Main order schema with nested products
│   └── User.js                  # User schema with hashed password + roles
│
├── routes/
│   ├── auditRoutes.js           # /api/logs → Audit logs (admin only)
│   ├── authRoutes.js            # /api/auth → Login, logout, password
│   ├── glazeRoutes.js           # /api/glazes → CRUD for glazes
│   ├── orderRoutes.js           # /api/orders → Order endpoints
│   └── userRoutes.js            # /api/users → User management
│
├── utils/
│   └── audit.js                 # logEvent helper for consistent logging
│
├── .env                         # Environment variables (gitignored)
├── .gitignore                   # Ignore node_modules, env files, etc.
├── app.js                       # Main Express app config and routes
├── package.json                 # Project metadata and dependencies
└── README.md                    # Project overview and setup instructions

```

```
haro-mobile/frontend
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
│   ├── OrderConfirmation.jsx
│   ├── OrderDetails.jsx
│   └── Orders.jsx
├── routes/           # Route guards and wrappers
│   ├── privateRoutes.js
│   ├── PrivateRoutes.jsx
│   ├── publicroutes.js
│   └── PublicRoute.jsx
├── services/         # Reserved for potential logic abstraction (currently unused)
├── utils/            # Low-level utilities
│   └── fetchWithAuth.js
├── App.css           # Empty (can be deleted)
├── App.jsx           # Main app layout and routes
├── index.css         # Tailwind/global styles
├── main.jsx          # React root and context setup
```

### File & Module Responsibilities

**/api/\*.js**

These are API abstraction files. Think of them as a mini SDK for your backend.

Keep logic clean: no navigation, no UI.

Example: createUser(data) → returns promise from backend.

**/components/\*.jsx**

Pure UI components. No data fetching. Reusable across views.

FloatingInput: input with label animation and optional password toggle.

BottomNav: dynamic bottom navigation with center action.

**/context/AuthContext.jsx**

Handles user session state via React Context.

Exposes: token, user, setToken(), etc.

Used by PrivateRoute and auth-sensitive areas.

**/hooks/\*.js**

Encapsulate logic separate from UI.

Example: useCreateUser() abstracts form submission, validation and error handling.

Future: one hook per logical action (useLogin, useDeleteUser, etc).

**/pages/\*.jsx**

Screens for user interaction.

Owns local state, form inputs, navigation.

Delegates logic to hooks and API layer.

Examples: AddUser.jsx, Orders.jsx, Login.jsx.

**/routes/PrivateRoute.jsx**

Protects routes from unauthenticated access.

```
if (token) return children;
else return <Navigate to="/" />;
```

**/routes/PublicRoutes.jsx and /routes/PrivateRoutes.jsx**

We split route declarations into two arrays: publicRoutes and privateRoutes.
This helps us map them separately and wrap private ones with PrivateRoute.

Example of mapped route:

```
<Route key={path} path={path} element={<PrivateRoute>{element}</PrivateRoute>} />
```

Why both key={path} and path={path}?

- key={path} is for React, to uniquely identify each Route in the list.

- path={path} is for React Router, to match the current URL.

They both use path but serve completely different purposes.

**/services/**

Reserved for shared business logic (e.g. PDF generation, email helpers). Can be removed if not used.

**/utils/fetchWithAuth.js**

Wrapper over fetch() to:

- Automatically attach Bearer token.

- Parse JSON and throw consistent errors.

- Used across all api/\*.js files.

**main.jsx explained**

Responsible for setting up the app root, router and context provider.

```
<StrictMode>
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
</StrictMode>
```

This allows the entire app to:

- Use useNavigate() from React Router

- Access useAuth() from context

- Be wrapped in development warnings from React

**Best Practices Summary**

- Use context for auth, not global variables.

- Use fetchWithAuth() for all protected requests.

- One responsibility per file: no fetches inside pages/components.

- Use hooks to encapsulate logic like useCreateUser().

- Keep this doc updated as structure evolves.

**Next Steps**

Implement more hooks: useDeleteUser, useLogin, etc.

Move route protection into App.jsx with PrivateRoute

Consider deleting /services/ if unused

This file should remain as README_DEV.md and be excluded from production builds via .gitignore or similar.

Stay sane. Comment with intention. Name things clearly. You're building a professional system.

### 2025-07-19

- Added verifyOwnershipOrAdmin middleware to protect order access.
- Modified Order model: added `userId` field (ObjectId ref to User).
- Updated createOrder controller to include req.user.id as userId.
- Updated orderRoutes to use verifyOwnershipOrAdmin on GET/PUT routes.

### 2025-07-27

🔒 Security and validation

- JWT middleware (verifyToken) now checks if the user still exists before authorizing.

- Soft delete logic (isActive: false) implemented in User and Glaze models.

- Password updates are now done through a single secure endpoint (updatePassword), with contextual logic: regular users can only change their own password, while admins can reset anyone’s.

- express-validator integrated in createUser for robust field validation.

🧾 Audit system (AuditLog)

- New AuditLog model tracks critical actions in the system:
  - Successful and failed logins.

  - Password updates and resets.

  - Logouts.

  - Creation, update, and soft deletion of Users, Orders, and Glazes.

- Each log includes:
  - event, objectId, performedBy, ipAddress, description, and timestamp.

🛡️ Controller Updates

- authController
  - login: logs both success and failure.

  - logout: logs event.

  - updatePassword: added secure logic and full logging.

- userController
  - createUser: restricted to admins, hashes password, logs event.

  - deleteUser: soft delete with audit trail.

  - updateUser: tracks and logs changes to name, email, and role.

  - getUsers / getUserById: basic reads.

- orderController
  - getOrders: supports filtering by status.

  - createOrder, updateOrder, cancelOrder: updated and audited.

- glazeController
  - Added deactivateGlaze (soft delete).

  - Audited createGlaze, updateGlaze.

📌 Next Steps

- ✅ Implement centralized error handler (errorHandler.js)

- 🔜 Create UI pages to:
  - Create and edit Orders, Glazes, Users

  - Reactivate or view inactive records

- 🔜 Improve MongoDB auth and role-based protections (basic done)

- 🔜 Improve express-validator usage across forms

- 🔜 Encrypt other sensitive data (email/phone if needed)

- 🔜 Prepare deployment: backend (Render/Railway), frontend (Vercel)

- 🧾 Document system and finalize school delivery

### 28/7/2025

Progress Summary (Last 2 Days)
🧾 Order Creation Flow Finalized

- Completed the multi-step process:
  - NewOrder.jsx → AddProduct.jsx → OrderConfirmation.jsx

- Products can now be added dynamically with support for:
  - Glazes (interior/exterior, pulled from DB)

  - Decorations (gold, names, drawings)

  - Image upload with previews

- Final confirmation sends the full order to the backend with validations.

📊 Home Dashboard Setup

- Created Home.jsx screen to display:
  - Total count of pending orders (including New, Pending, In Progress)

  - List of 10 most recent orders

  - Responsive layout with floating “New Order” button for desktop only

🔗 Connected to Backend API

- Integrated getRecentOrders() and getPendingCount() from api/orders.js

- Verified proper usage of fetchWithAuth with JWT headers

- Debugged broken responses due to double .json() parsing — fixed

🧠 Logical Enhancements

- Defined pending = ["New", "Pending", "In Progress"] as backend logic

- Added support for countOnly=true param in GET /orders for fast DB counting

- Implemented sorting + limit in /orders endpoint for recent fetch

🎨 Tailwind Code Refactor

- Cleaned up repeated classNames for better readability

- Improved layout consistency across dark/light mode

- Adjusted structure to support responsive rendering and grid alignment

📱 UI/UX Enhancements

- Fixed route-based hiding of AppBar/BottomNav with useHideBars()

- Added placeholder logic for dynamic “last updated” timestamp on Home
