# Frontend

Repositorio: https://github.com/Rorre12/ecommerce-practica

SPA en **React 18 + Vite 5** con CSS plano, ubicada en `client/`. Se comunica con la API usando `fetch`.

## Estructura

```
client/src/
├── main.jsx                        # Punto de entrada
├── App.jsx                         # Sesión, navegación por pestañas y cierre de sesión
├── api.js                          # Cliente HTTP (fetch) y endpoints
├── format.js                       # Formato de moneda y fechas
├── styles.css
└── modules/
    ├── auth/AuthView.jsx           # Login y registro
    ├── products/ProductsView.jsx   # Tabla CRUD de productos
    └── orders/OrdersView.jsx       # Crear pedido + historial
```

## Módulos

### Auth (`AuthView`)
Formulario único que alterna entre **Iniciar sesión** y **Crear cuenta**. Al autenticarse guarda `{ user, token }` en `localStorage` (clave `ecommerce.session`).

### Productos (`ProductsView`)
- Todos los usuarios ven la tabla (ID, nombre, precio, stock). Stock en 0 se resalta en rojo.
- El **ADMIN** ve además el formulario para crear/editar y los botones **Editar** y **Eliminar** (con confirmación).

### Pedidos (`OrdersView`)
- Selector de producto + cantidad que agrega líneas a un carrito local (valida stock disponible en el cliente).
- **Confirmar pedido** envía `POST /api/orders`; después recarga productos (stock actualizado) e historial.
- Historial en tabla: número, fecha, productos, total. El ADMIN ve además la columna **Cliente**.

## Cliente HTTP (`api.js`)

- Construye las URLs como `${VITE_API_URL}/api/...`.
- Añade `Authorization: Bearer <token>` cuando hay sesión.
- Convierte las respuestas de error de la API en `Error(message)` para mostrarlas en pantalla.
- Si la API responde `401` a una petición autenticada, ejecuta el manejador registrado con `onUnauthorized` (la app cierra la sesión).

## Configuración

| Variable | Uso |
|----------|-----|
| `VITE_API_URL` | Vacía en desarrollo (Vite hace proxy de `/api` a `http://localhost:4000`). En producción, la URL pública de la API. |

## Scripts

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173` |
| `npm run build` | Build de producción en `client/dist` |
| `npm run preview` | Sirve el build localmente |
