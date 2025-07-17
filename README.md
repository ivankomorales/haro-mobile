# **Haro Mobile – API RESTful**

Sistema de gestión de pedidos personalizados de cerámica, desarrollado como parte del curso Backend III y basado en una necesidad real de negocio.  
Esta API permite crear, consultar, actualizar y eliminar pedidos con productos, adornos, fotos e información detallada del cliente.

### **Tecnologías utilizadas**

Node.js + Express.js – Framework backend y servidor API

MongoDB + Mongoose – Base de datos NoSQL flexible y escalable

dotenv – Manejo de variables de entorno

helmet, cors, morgan – Seguridad y logging

Postman – Pruebas de API

### **Instrucciones para correr el proyecto**

Clonar el repositorio o abrir la carpeta haro-mobile

Instalar dependencias:

npm install

Crear archivo .env en la raíz:

PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/haroPedidos
JWT_SECRET=supersecreto123

Iniciar el servidor:

npm run dev

Deberías ver en consola:

Servidor corriendo en puerto 5000
MongoDB conectado

## **Estructura de carpetas**

```
haro-mobile/
|-- config/ # Conexión a DB
|-- controllers/ # Lógica de negocio
|-- middleware/ # (futuro uso: auth, roles)
|-- models/ # Esquemas Mongoose
|-- routes/ # Endpoints de la API
|-- .env # Variables de entorno
|-- app.js # Archivo principal
|-- package.json
```

## **Modelo de datos**

### **Pedido**

```
{
orderID: String, // Generado automáticamente como ORD-0001
nombre: String,
telefono: String,
correo: String,
instagram: String,
fechaEntrega: Date,
estado: "Pendiente" | "En Proceso" | "Completado" | "Cancelado",
anticipo: Number,
envio: {
requerido: Boolean,
direccion: String,
ciudad: String,
cp: String,
telefono: String
},
notas: String,
productos: [
{
tipo: String,
figuras: Number,
precio: Number,
descripcion: String,
esmaltes: {
interior: String,
exterior: String
},
adornos: {
llevaOro: Boolean,
llevaNombre: Boolean,
descripcionAdorno: String
},
imagenes: [String]
}]}
```

### **Counter**

```
{
_id: "pedido",
seq: 1
}
```

Usado para generar orderID secuencial tipo ORD-0001, ORD-0002, etc.

## **Endpoints disponibles**

Base: http://localhost:5000/api/pedidos

| Método | Ruta   | Descripción                 |
| ------ | ------ | --------------------------- |
| GET    | `/`    | Obtener todos los pedidos   |
| GET    | `/:id` | Obtener un pedido por ID    |
| POST   | `/`    | Crear nuevo pedido          |
| PUT    | `/:id` | Actualizar pedido existente |
| DELETE | `/:id` | Eliminar pedido             |

## **Seguridad y buenas prácticas**

- Uso de .env para ocultar datos sensibles

- Uso de middlewares como Helmet y CORS para proteger la API

- Validaciones a nivel de modelo (required, enum)

- orderID se genera de forma atómica para evitar duplicados

## **Pruebas realizadas**

Con Postman se realizaron las siguientes pruebas exitosas:

- Crear 2 pedidos con diferentes datos y productos

- Consultar todos los pedidos (GET)

- Consultar uno por ID (GET /:id)

- Actualizar estado de un pedido (PUT)

- Eliminar un pedido (DELETE)

Todos los resultados fueron correctos, con status esperados (201, 200, 404).

## **Estado actual**

La API está lista para ser integrada con un frontend (React PWA) que permita crear y administrar pedidos de forma móvil.  
El backend está preparado para futuras mejoras como:

- Autenticación con JWT

- Roles (pintor, escultor, administrador)

- Exportación a PDF/Excel

- Subida de imágenes reales

## **Notes**

- Customer is created automatically when order is created.
- Shipping address is per order, not part of customer profile.
- OrderID is auto-incremented using Counter collection.
- Only verified users (via JWT) can access protected routes.

# Haro Orders API

## Project Overview

API RESTful for managing personalized ceramic orders.

## Auth & Security

- Uses JWT for authentication.
- Routes are protected with middleware.
- `admin` role required to delete orders.

## Order Flow

- When creating an order, the system:
  - Accepts a customer object
  - Looks for existing customer by email
  - Creates new customer if not found
  - Associates customer ID to order
  - Generates `orderID` using a Counter

## Data Models

- Orders reference `Customer` via ObjectId.
- Orders include an array of `products` with glazes, decorations, etc.
- Shipping data is stored per order, not in customer.
- Field `status` uses enum: "Pending", "In Progress", "Completed", "Cancelled".

## Security

- All routes require a valid JWT.
- Certain actions (e.g. delete) are admin-only.

## Security & Access Control

- All protected routes require a valid JWT token.
- Middleware `verifyToken` validates the token and attaches the user to the request.
- Middleware `requireAdmin` checks if the authenticated user has role `admin`.
- Example: DELETE /orders/:id is restricted to admin users only.

## Glazes

Each glaze has:

- `name`: Unique string identifier
- `hex`: HEX color code (e.g., "#4CAF50")
- `image`: Optional URL or filename of glaze image

API Endpoints:

- `GET /api/glazes` – List all glazes (auth required)
- `GET /api/glazes/:id` – Get one glaze by ID (auth required)
- `POST /api/glazes` – Create glaze (admin only)
- `PUT /api/glazes/:id` – Update glaze (admin only)
- `DELETE /api/glazes/:id` – Delete glaze (admin only)
