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
├── config/         # DB connection setup
├── controllers/    # Business logic
├── middleware/     # JWT auth, role protection
├── models/         # Mongoose schemas
├── routes/         # API endpoints
├── .env            # Env vars (excluded by .gitignore)
├── app.js          # Main server entry point
├── package.json
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
  status: "Pending" | "In Progress" | "Completed" | "Cancelled",
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
