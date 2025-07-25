# Developer Notes for Haro Mobile Frontend

This document is a technical reference for developers working on the Haro Mobile frontend. It explains the architecture, purpose of each directory, and the reasoning behind design decisions to ensure clarity, maintainability, and scalability.

### Project Structure Overview
```
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

**/api/*.js**

These are API abstraction files. Think of them as a mini SDK for your backend.

Keep logic clean: no navigation, no UI.

Example: createUser(data) → returns promise from backend.

**/components/*.jsx**

Pure UI components. No data fetching. Reusable across views.

FloatingInput: input with label animation and optional password toggle.

BottomNav: dynamic bottom navigation with center action.

**/context/AuthContext.jsx**

Handles user session state via React Context.

Exposes: token, user, setToken(), etc.

Used by PrivateRoute and auth-sensitive areas.

**/hooks/*.js**

Encapsulate logic separate from UI.

Example: useCreateUser() abstracts form submission, validation and error handling.

Future: one hook per logical action (useLogin, useDeleteUser, etc).

**/pages/*.jsx**

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

- Used across all api/*.js files.

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