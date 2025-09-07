# Developer Notes for Haro Mobile

This document is a technical reference for developers working on the Haro Mobile frontend. It explains the architecture, purpose of each directory, and the reasoning behind design decisions to ensure clarity, maintainability, and scalability.

### Project Structure Overview

```
haro-mobile/backend
│
├── config/
│   └── db.js                     # MongoDB connection setup
│
├── controllers/
│   ├── auditController.js        # Handles fetching audit logs (admin-only)
│   ├── authController.js         # Login, logout, password update
│   ├── customerController.js     # Customer CRUD operations
│   ├── exportController.js       # PDF and Excel exports
│   ├── glazeController.js        # CRUD for glazes with audit logging
│   ├── orderController.js        # Create, update, cancel orders
│   └── userController.js         # User CRUD, soft delete, role updates
│
├── middleware/
│   ├── auth.js                   # JWT verification, attaches user to req
│   ├── checkRole.js              # Restricts access by role (admin/employee)
│   ├── errorHandler.js           # Centralized error handler for Express
│   └── verifyOwnershipOrAdmin.j  # Protects resources by ownership or admin
│
├── models/
│   ├── AuditLog.js               # Logs critical system events (with TTL index)
│   ├── Counter.js                # For auto-increment order IDs (ORD-000X)
│   ├── Customer.js               # Customer schema (linked to orders)
│   ├── Glaze.js                  # Glaze data, soft deletable
│   ├── Order.js                  # Main order schema with nested products
│   └── User.js                   # User schema with hashed password + roles
│
├── routes/
│   ├── auditRoutes.js            # /api/logs → Audit logs (admin only)
│   ├── authRoutes.js             # /api/auth → Login, logout, password
│   ├── customerRoutes.js         # /api/customers → Customer endpoints
│   ├── glazeRoutes.js            # /api/glazes → CRUD for glazes
│   ├── orderRoutes.js            # /api/orders → Order endpoints
│   └── userRoutes.js             # /api/users → User management
│
├── utils/
│   ├── ApiError.js               # Standardized error object for consistent error handling
│   ├── audit.js                  # logEvent helper for consistent logging
│   └── validators.js             # Express-validator middleware sets for input validation
│
├── .env                          # Environment variables (gitignored)
├── .gitignore                    # Ignore node_modules, env files, etc.
├── app.js                        # Main Express app config and routes
├── package.json                  # Project metadata and dependencies
└── README.md                     # Project overview and setup instructions


```

```
haro-mobile/frontend
src/
├── api/                          # Wrapper functions around backend API endpoints
│   ├── auth.js
│   ├── glazes.js
│   ├── orders.js
│   └── users.js
│
├── assets/
|
├── components/                   # Reusable UI components

│   ├── AddressInput.jsx          # Grouped address input fields
│   ├── AppBar.jsx                # Form footer with Cancel and Submit buttons
│   ├── BottomNavBar.jsx          #
│   ├── ConfirmModal.jsx          # Generic confirmation modal (uses Headless UI)
│   ├── DropWrap.jsx              #
│   ├── ExcelModal.jsx            #
│   ├── FormActions.jsx           # Form action buttons with cancel confirmation
│   ├── FormAddress.jsx           # Dynamic list of shipping address sections
│   ├── FormInput.jsx             # Reusable input supporting multiple types (prev FloatingInput)
│   ├── GlazeSelect.jsx           # Searchable glaze selector (autocomplete)
│   ├── ImageUploader.jsx         # Upload with preview and delete options
│   ├── OrderActionsBar.jsx       #
│   ├── OrderCard.jsx             #
│   ├── OrderDetailsCard.jsx      # Displays full order and customer details
│   ├── OrderDetailsModal.jsx     #
│   ├── OrderFilters.jsx          #
│   ├── ScrollToTop.jsx           #
│   ├── Sidebar.jsx               #
│   ├── SplitActionButton.jsx     # Button with optional dropdown for extra actions
│   └── StatusModal.jsx           #
|
├── context/                      # Global app state using React Context
│   ├── AuthContext.jsx
│   ├── ConfirmContext.jsx        # Global confirmation modal handler
│   └── LayoutContext.jsx         # Shared layout state (e.g., hiding navs)
|
├── hooks/                        # Custom React hooks
│   ├── useAuth.js
│   ├── useCreateGlaze.js         # POST request helper for new glazes
│   ├── useCreateUser.js
│   ├── useDarkMode.js            # (not implemented yet)
│   ├── useHideBars.js            # Hides nav bars based on route or screen size
│   └── useKeyboardOpen.js        # Hides bottom bar when keyboard opens on mobile devices
|
├── layouts/                      # App layout components
│   └── DashboardLayout.jsx       # Main layout with sidebar and app bar
|
├── locales/
│   ├── es.js
│   └── en.js
|
├── pages/                        # Top-level pages grouped by domain
│   ├── glazes/
│   |   ├── AddGlaze.jsx          # Form to create a new glaze
│   |   ├── EditGlaze.js
│   │   └── GlazeListPage.jsx          # Form to create a new glaze
│
│   ├── orders/
│   │   ├── AddProduct.jsx        # Add a product to an order
│   │   ├── EditOrder.jsx         # Edit an existing order
│   │   ├── NewOrder.jsx          # Create a new order
│   │   ├── OrderConfirmation.jsx # Confirmation screen after placing an order
│   │   ├── OrderDetails.jsx      # View order summary/details
│   │   └── Orders.jsx            # List of all orders
│
│   ├── users/
│   │   ├── AddUser.jsx           # Add a new user
│   │   └── UserProfile.jsx       # User profile page
│
│   ├── Home.jsx                  # Dashboard/home screen
│   └── Login.jsx                 # Authentication/login screen
|
├── routes/                       # Route guards and wrappers
│   ├── PrivateRoute.jsx          # Wrapper component to protect private routes
│   ├── privateRoutes.jsx         # Path list for routes that require authentication
│   ├── PrivateRoutes.jsx         # Component that protects private routes (e.g., dashboard, orders)
│   ├── publicroutes.jsx          # Path list for routes accessible without authentication
│   └── PublicRoute.jsx           # Wrapper for routes like login, signup, etc.
│
├── services/                     # Reserved for future service abstractions (e.g., API clients)
│
├── utils/                        # Reusable utilities and helpers
│   ├── constants.js              # Paths where header/sidebar should be hidden (e.g., login pages)
│   ├── date.js
│   ├── exportUtils.js
│   ├── fetchWithAuth.js          # Wrapper for fetch that adds authorization headers
│   ├── getMessage.js             # Access nested error messages safely using dot notation
│   ├── jwt.js                    # Decode JWT from localStorage to extract user info
│   ├── navigationUtils.js
│   ├── orderBuilder.js           # Helpers to create or update order objects
│   ├── orderStatusUtils.js       # Logic to manage and display order statuses
│   ├── productBuilder.js         # Create product payloads for submission
│   ├── smartNavigate.js          # Navigation helper to prevent users leaving critical flows
│   ├── toastUtils.js             # Consistent toast notifications using react-hot-toast
│   ├── transformProducts.js      # Format product items to standardized format
│   ├── uploadToCloudinary.js     # Upload images to Cloudinary from forms
│   └── useRequireState.js        # Custom hook to block routes missing required `location.state`
│
├── App.jsx                       # Main layout, route rendering, and global components
├── index.css                     # TailwindCSS and base global styles
├── main.jsx                      # React root file, renders <App/> and sets up context/providers
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

- Access UseAuth() from context

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

## Roles & permissions

- Everyone can place new Orders
- Only admin can add new users and glazes
- We get the role from JWT using getUserFromToken() on utils

## Component SplitActionButton

- Shows button +Nuevo
- If admin → despliega Pedido, Usuario, Esmalte
- If not admin → only Pedido

### 2025-07-29 → 2025-08-02

## 🎨 Glaze Selection Logic

Visual color selection now available for Glazes.

Behavior depends on product type:

Cups: Selectable interior and exterior glazes.

Plates: Only exterior glaze.

Figures: No glaze fields shown.

Glaze data is now saved as full object ({ name, image }) instead of just ObjectId.

## 🧾 AddProduct.jsx Refactor

Full component refactor:

Required validations (type, quantity, price).

Cloudinary upload occurs after confirmation, not during selection.

Image previews via URL.createObjectURL.

Sticky “Add” button and smooth scroll to last product.

Supports multiple product entries per order.

## ☁️ Cloudinary Integration

Centralized folder structure:

haromobile/glazes

haromobile/products

Added utility: uploadToCloudinary(file, folder), used in multiple forms.

## 📦 ImageUploader Component

Reusable component with:

Image previews.

Size/type validation.

Delete functionality.

Used in both AddProduct and AddGlaze.

## 🔥 Toast Notifications

Installed react-hot-toast.

Added toastUtils.js with wrappers:

notifySuccess(message)

notifyError(message)

Integrated with getMessage() and locales/en.js for future i18n support.

## 🧱 Icons Refactor

Replaced @heroicons/react with lucide-react.

Added plan for a centralized wrapper (IconBase) for size, stroke width, etc.

## 📋 OrderDetailsCard Component

Displays grouped product types (e.g. Cup 1, Cup 2).

Shows glaze names + images.

Subtotal, deposit, total.

Horizontal scroll gallery for images.

Now used in OrderConfirmation.

## 🧩 Main Layout Enhancements

Outlet is now scrollable.

AppBar and Sidebar remain fixed.

Full mobile/desktop support with conditional BottomNavBar.

## 📅 Order Model Updates

Added orderDate and deliverDate to schema.

Updated NewOrder form accordingly.

## 🧠 Logical Enhancements

productBuilder() utility to normalize DB vs in-memory products.

Scroll-to-top logic (window.scroll(0,0)) for smooth UX navigation.

Added ScrollToTop component.

## 🔁 New Contexts and Hooks

ConfirmContext for managing confirm modals.

useSmartNavigate() for preserving previous location paths.

LayoutContext for layout-level logic (e.g. hiding/showing bars).

## 🧾 FormInput Refactor

FloatingInput.jsx is now FormInput.jsx.

Highly flexible input component:

Handles types: text, email, password, number, date, tel.

Supports select rendering.

Optional prefix (e.g. $, %).

Floating label or classic.

Error messages with errorFormatter.

## 📑 FormActions Component

Reusable set of Cancel + Submit buttons.

Now included in major forms.

Supports optional cancelState.

## 📦 Toast + i18n Integration

Created locales/en.js for translatable toast messages.

toastUtils.js calls getMessage(key) for dynamic text.

## 📌 Other Enhancements

Separated EditOrder.jsx and NewOrder.jsx.

Added new route: updateOrderStatus in orderRoutes.

## ✅ Key Todos (In Progress)

Final integration of notifySuccess, notifyError, etc.

Add IconBase wrapper if needed.

Complete validation for shipping.required field.

Ensure full dark mode support across all components.

### 2025/08/04 - 2025/09/06

Backend / API

Glaze model & controllers: Glaze { name, hex, code, image, isActive } with CRUD-ish endpoints (create/get/list/update/deactivate) and audit logging.

Excel export:

Populated product glaze relations and extracted glaze names/hex robustly.

Added background swatches in Excel cells for interior/exterior glazes with automatic light/dark text for contrast.

Introduced flexible column set, auto-fit, filters, and safer XML output.

(Note) Name+code concatenation for Excel is pending server-side; UI formatter exists.

Frontend — Networking & Auth

fetchWithAuth overhaul:

Relative /api/... + Vite proxy for mobile LAN; API_BASE empty in dev.

Safer headers, body auto-JSON, robust JSON/text fallbacks, normalized errors.

Standardized 401/403 handling with optional { navigate, logout } hook to redirect to /login.

Added quick NET logging and guidance to avoid localhost on phones.

Login flow:

Switched to fetchWithAuth for /api/auth/login (consistent headers/body).

Fixed missing import (fetchWithAuth) bug that blocked login.

Clarified where not to use fetchWithAuth as a form helper vs. API module.

Frontend — Routing & Layout

Private routes under a layout: Nested under DashboardLayout so /products/glazes and other pages render inside the app chrome (AppBar/Sidebar/BottomNav).

Resolved “No routes matched” for /products/glazes by ensuring nesting and consistent paths.

Return navigation: Adopted state: { originPath, from, returnTo } and getOriginPath() so Cancel/Back returns to Glazes list (fallbacks to /products/glazes).

Frontend — i18n

Locales: Added full Spanish dictionary; fixed import/export shapes (named vs default) to eliminate en is not defined.

getMessage utility: DICTS, setLocale, getLocale, fallback to EN, “humanize” fallback; prevented crashes when keys are missing.

ConfirmContext updated to use t() lookups rather than hard-wiring EN messages.

Frontend — Glazes feature

AddGlaze:

Drag-and-drop via DropWrap + ImageUploader.

Cloudinary upload on submit; sends { name, colorHex, code, image }.

Glaze list (page):

List view (not grid) with image preview instead of hex chip.

Item actions to Edit / Deactivate (inactive hidden by default).

EditGlaze:

Loads current glaze; shows current image above the drop zone (no forced removal).

Toasts integrated: showLoading('glaze.updating'), showSuccess('success.glaze.updated'), showError('glaze.updateFailed').

Dirty check (isDirty) across name/hex/code + new image; Update button disabled if unchanged or invalid.

FormActions updated to support submitDisabled and optional submitLoading; all existing usages remain backward-compatible.

Frontend — Orders / Export UX

Glaze labels in UI: Helper to format glaze display as Name (CODE) for on-screen product labels (used when opening an order and lazy-loading glazes).

Excel export UI keeps name columns while color-coding cells; concatenating code into Excel labels is a small remaining server-side tweak if you want it.

Mobile / PWA / UX polish

Mobile network fixes: Left API_BASE empty in dev + Vite proxy to avoid CORS/localhost traps on phone.

iOS input zoom prevention: Forced font-size: 16px on inputs to stop Safari auto-zoom (the main cause of BottomNav “jumping”).

Viewport stability:

Switched page shells to min-h: 100svh (or 100dvh where appropriate) and ensured single scroll container (<main>), so BottomNav doesn’t drift.

BottomNav uses env(safe-area-inset-bottom) and fixed positioning; optional “hide on keyboard open” class provided.

PWA setup:

Added vite-plugin-pwa config, manifest with maskable icons.

Registered service worker.

index.html meta for viewport-fit=cover, iOS standalone, theme colors.

Delivered a set of placeholder icons and wiring instructions.

Clarified install expectations: HTTPS (or localhost) required for Android install prompts; iOS installs via “Add to Home Screen”.

Dev workflow / Debuggability

Mobile console guidance (Chrome Inspect / Safari Web Inspector).

Explained secure: false in Vite proxy (only relevant for HTTPS self-signed targets).

HMR/socket pitfalls called out; removed fragile HMR host overrides.
