# API REST

Repositorio: https://github.com/Rorre12/ecommerce-practica

- **Base URL:** `http://localhost:4000/api`
- **Formato:** JSON (`Content-Type: application/json`)
- **Autenticación:** `Authorization: Bearer <token>` — el token se obtiene en `/auth/login` o `/auth/register` y expira según `JWT_EXPIRES_IN` (8 h por defecto).

## Resumen de endpoints

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/health` | — | Estado de la API |
| POST | `/api/auth/register` | — | Registrar cliente |
| POST | `/api/auth/login` | — | Iniciar sesión |
| GET | `/api/auth/me` | Bearer | Usuario autenticado |
| GET | `/api/products` | — | Listar productos |
| GET | `/api/products/:id` | — | Obtener producto |
| POST | `/api/products` | ADMIN | Crear producto |
| PUT | `/api/products/:id` | ADMIN | Editar producto |
| DELETE | `/api/products/:id` | ADMIN | Eliminar producto |
| POST | `/api/orders` | Bearer | Crear pedido |
| GET | `/api/orders` | Bearer | Listar pedidos (admin: todos; cliente: propios) |
| GET | `/api/orders/:id` | Bearer | Obtener pedido |

## Errores

Todas las respuestas de error usan el mismo formato:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Email inválido", "details": ["Email inválido"] } }
```

| `code` | HTTP | Cuándo ocurre |
|--------|------|---------------|
| `VALIDATION_ERROR` | 400 | Datos inválidos (email, contraseña, precio, stock, cantidad, id) |
| `INVALID_JSON` | 400 | Cuerpo no es JSON válido |
| `UNAUTHORIZED` | 401 | Falta el token, token inválido/expirado o credenciales incorrectas |
| `FORBIDDEN` | 403 | El rol no tiene permiso (p. ej. cliente creando productos) |
| `NOT_FOUND` | 404 | Recurso o ruta inexistente; pedido de otro usuario |
| `CONFLICT` | 409 | Email ya registrado; eliminar producto con pedidos |
| `INSUFFICIENT_STOCK` | 409 | La cantidad pedida supera el stock |
| `INTERNAL_ERROR` | 500 | Error inesperado del servidor |

---

## Auth

### `POST /api/auth/register`

Crea siempre un usuario con rol `CUSTOMER`.

```json
// Request
{ "email": "cliente@correo.com", "password": "secreto123" }

// 201 Created
{
  "user": { "id": 2, "email": "cliente@correo.com", "role": "CUSTOMER", "createdAt": "2026-09-23T15:00:00.000Z" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Errores: `400` datos inválidos · `409` email ya registrado.

### `POST /api/auth/login`

```json
// Request
{ "email": "admin@tienda.com", "password": "Admin123!" }

// 200 OK
{ "user": { "id": 1, "email": "admin@tienda.com", "role": "ADMIN", "createdAt": "..." }, "token": "..." }
```

Errores: `401` credenciales inválidas.

### `GET /api/auth/me`

```json
// 200 OK
{ "id": 1, "email": "admin@tienda.com", "role": "ADMIN", "createdAt": "..." }
```

---

## Productos

Modelo:

```json
{ "id": 1, "name": "Teclado mecánico", "price": 59.9, "stock": 25 }
```

Validaciones: `name` obligatorio (máx. 120 caracteres) · `price` número ≥ 0 (se redondea a 2 decimales) · `stock` entero ≥ 0.

### `GET /api/products` → `200 Product[]`

### `GET /api/products/:id` → `200 Product` · `404`

### `POST /api/products` (ADMIN)

```json
// Request
{ "name": "Webcam HD", "price": 35.5, "stock": 12 }
// 201 Created
{ "id": 5, "name": "Webcam HD", "price": 35.5, "stock": 12 }
```

### `PUT /api/products/:id` (ADMIN)

Actualización parcial: envía solo los campos a cambiar.

```json
// Request
{ "price": 32.0 }
// 200 OK
{ "id": 5, "name": "Webcam HD", "price": 32, "stock": 12 }
```

### `DELETE /api/products/:id` (ADMIN)

`204 No Content` · `404` si no existe · `409` si el producto ya forma parte de algún pedido.

---

## Pedidos

### `POST /api/orders`

Si un mismo `productId` aparece varias veces, se suman las cantidades. El stock se descuenta dentro de una transacción.

```json
// Request
{ "items": [ { "productId": 1, "quantity": 2 }, { "productId": 2, "quantity": 1 } ] }

// 201 Created
{
  "id": 1,
  "userId": 2,
  "userEmail": "cliente@correo.com",
  "total": 139.3,
  "createdAt": "2026-09-23T15:00:00.000Z",
  "items": [
    { "id": 1, "productId": 1, "productName": "Teclado mecánico", "quantity": 2, "price": 59.9 },
    { "id": 2, "productId": 2, "productName": "Mouse inalámbrico", "quantity": 1, "price": 19.5 }
  ]
}
```

Errores: `400` lista vacía o cantidad inválida · `404` producto inexistente · `409 INSUFFICIENT_STOCK`.

### `GET /api/orders` → `200 Order[]`

Ordenados del más reciente al más antiguo. `ADMIN` recibe todos; `CUSTOMER` solo los suyos.

### `GET /api/orders/:id` → `200 Order`

Devuelve `404` si el pedido no existe o pertenece a otro usuario (y quien consulta no es admin).

---

## Ejemplos con curl

```bash
# Login y guardar token (Git Bash)
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@tienda.com","password":"Admin123!"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')

# Crear producto
curl -X POST http://localhost:4000/api/products -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" -d '{"name":"Webcam HD","price":35.5,"stock":12}'

# Crear pedido
curl -X POST http://localhost:4000/api/orders -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" -d '{"items":[{"productId":1,"quantity":2}]}'

# Historial
curl http://localhost:4000/api/orders -H "Authorization: Bearer $TOKEN"
```
