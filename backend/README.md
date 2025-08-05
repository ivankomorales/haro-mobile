# **Haro Mobile – RESTful API**

A custom ceramic order management system, developed for a real business need and as part of the Backend III course.
This API allows for creating, retrieving, updating, and deleting customer orders, including detailed information such as products, glazes, decorations, customer data, and shipping options.

### **Tech Stack**

- Node.js + Express – Backend framework and API server

- MongoDB + Mongoose – Flexible, scalable NoSQL database

- dotenv – Environment variable management

- helmet, cors, morgan – Security and logging middlewares

- Postman – API testing

### **Setup Instructions**

1.  Clone the repository or open the haro-mobile project folder

2.  Install dependencies:

```
    npm install
```

3.  Create a .env file in the root directory:

```
    PORT=5000 <br />
    MONGO_URI=mongodb://127.0.0.1:27017/haroPedidos <br />
    JWT_SECRET=supercalifragilisticoexpialidoso123 <br />
```

4.  Start the development server:

```
    npm run dev
```

5.  You should see:

```
    Server running on port 5000
    MongoDB connected
```

---

### **Project Structure**

```
haro-mobile/
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

---

### **Authentication & Security**

- JWT-based authentication

- All protected routes require a valid token

- Role-based access control (admin required for user and glaze management)

- Security via helmet, CORS enabled

- Sensitive data hidden via .env

---

### **Data Models**

#### **Order**

```
{
  orderID: "ORD-0001",
  customer: ObjectId, // References Customer model
  status: "New" | "Pending" | "In Progress" | "Completed" | "Cancelled",
  deposit: Number,
  shipping: {
    isRequired: Boolean,
    addresses: [
      {
        address: String,
        city: String,
        zip: String,
        phone: String
      }
    ]
  },
  notes: String,
  products: [
    {
      type: String,
      quantity: Number,
      price: Number,
      description: String,
      glazes: {
        interior: ObjectId, // References Glaze
        exterior: ObjectId  // References Glaze
      },
      decorations: {
        hasGold: Boolean,
        hasName: Boolean,
        decorationDescription: String
      },
      images: [String],
      workflowStage: "exported" | "sculptedPainted" | "urgent" | "painting" | "delivered",
      assignedShippingIndex: Number
    }
  ]
}
```

#### **Customer**

Created automatically when a new order is placed.

```
{
  name: String,
  email: String,
  phone: String,
  instagram: String
}
```

#### **Glaze**

```
{
  name: String,        // Unique name
  hex: String,         // HEX color code
  image: String        // Optional image URL or filename
}
```

#### **Counter**

Used to generate sequential order IDs.

```
{
  _id: "order",
  seq: 4
}
```

### **Available Endpoints**

### Authentication

| Method | Route           | Description          |
| ------ | --------------- | -------------------- |
| POST   | /api/auth/login | Login and obtain JWT |

### Orders

All routes require JWT.

| Method | Route           | Description        |
| ------ | --------------- | ------------------ |
| GET    | /api/orders     | List all orders    |
| GET    | /api/orders/:id | Get order by ID    |
| POST   | /api/orders     | Create a new order |
| PUT    | /api/orders/:id | Update an order    |
| DELETE | /api/orders/:id | Delete an order    |

### Users (admin only)

| Method | Route      | Description     |
| ------ | ---------- | --------------- |
| POST   | /api/users | Create new user |

### Glazes

| Method | Route           | Description      | Access        |
| ------ | --------------- | ---------------- | ------------- |
| GET    | /api/glazes     | List all glazes  | Auth required |
| GET    | /api/glazes/:id | Get glaze by ID  | Auth required |
| POST   | /api/glazes     | Create new glaze | Admin only    |
| PUT    | /api/glazes/:id | Update glaze     | Admin only    |
| DELETE | /api/glazes/:id | Delete glaze     | Admin only    |

### Business Logic Notes

- When placing an order:

  - The API looks up the customer by email

  - If not found, creates the customer

  - Generates a unique sequential orderID

  - Associates customer ID with the order

- Each product can be assigned to a specific shipping address (by index)

- Each product has a workflowStage for visual status tracking

- Glazes are separate documents, referenced by product

### Order Workflow Colors

| Stage           | Color  | Description                                       |
| --------------- | ------ | ------------------------------------------------- |
| exported        | Blue   | Order exported, ready for sculptor                |
| sculptedPainted | Yellow | Sculpted and painted                              |
| urgent          | Red    | Marked as urgent or with a specific delivery date |
| painting        | Pink   | In painting process                               |
| delivered       | Green  | Completed and delivered                           |

## Next Steps

- Implement frontend with React (PWA)

- Add export to PDF or Excel

- Enable file upload for images

- Assign orders to roles (e.g., sculptor, painter)
