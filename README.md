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
|-- models/ # Esquemas Mongoose
|-- routes/ # Endpoints de la API
|-- middleware/ # (futuro uso: auth, roles)
|-- app.js # Archivo principal
|-- .env # Variables de entorno
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

## **Conclusiones**

Este proyecto me permitió conectar eficazmente una API con una base de datos MongoDB, implementando las operaciones CRUD completas con seguridad básica.  
Las pruebas en Postman confirmaron que la estructura es funcional, escalable y lista para usarse en un entorno real.  
Además de cumplir con los requerimientos académicos, sirve como base para una aplicación real de negocio artesanal.

Autor: Eduardo Iván Morales Flores  
Materia: Backend III
