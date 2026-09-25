# Frontend

Repositorio: https://github.com/Rorre12/ecommerce-practica

SPA en **React 18 + Vite 5** ubicada en `client/`. Se comunica con la API mediante `fetch`. El sistema visual (tokens de color OKLCH, tipografía, iconos, modo oscuro) está descrito en [auditoria-diseno.md](auditoria-diseno.md).

## Estructura

```
client/
├── index.html                      # Fuentes (Big Shoulders Display + IBM Plex Sans) y favicon
├── public/favicon.svg              # Logotipo de la marca
└── src/
    ├── main.jsx                    # Punto de entrada
    ├── App.jsx                     # Sesión, navegación lateral según permisos, cierre de sesión
    ├── api.js                      # Cliente HTTP (fetch) y endpoints
    ├── format.js                   # Moneda, fechas y etiquetas de estados/permisos
    ├── styles.css                  # Tokens de diseño + estilos (claro y oscuro)
    ├── components/ui.jsx           # BrandMark, PageHeader, Alert, Loading, Empty, StatusPill, CategoryIcon
    └── modules/
        ├── auth/AuthView.jsx       # Iniciar sesión / crear cuenta
        ├── store/StoreView.jsx     # Catálogo con filtros + carrito
        ├── orders/OrdersView.jsx   # "Mis pedidos" y gestión de todos los pedidos
        ├── products/ProductsView.jsx  # CRUD del catálogo
        └── users/UsersView.jsx     # Permisos y acceso de cada usuario (admin)
```

## Pantallas y quién las ve

`App.jsx` define la lista `VIEWS` con una función `visible(user)` por pantalla. La navegación muestra solo las que devuelven `true`:

| Pantalla | Visible para | Módulo |
|----------|--------------|--------|
| Tienda | Todos | `StoreView` |
| Mis pedidos | Clientes (no admin) | `OrdersView` |
| Productos | `permissions` incluye `PRODUCTS` | `ProductsView` |
| Pedidos | `permissions` incluye `ORDERS` | `OrdersView manage` |
| Usuarios | `role === 'ADMIN'` | `UsersView` |

Al cargar, la app llama a `GET /api/auth/me` y guarda el usuario actualizado, así las pestañas reflejan los permisos vigentes aunque el admin los haya cambiado. Esto es solo la capa visual: el backend valida cada permiso de forma independiente.

## Módulos

### Acceso (`AuthView`)
Pantalla dividida: a la izquierda la marca y un mensaje; a la derecha un formulario que alterna entre **Iniciar sesión** y **Crear cuenta**. Crear cuenta abre sesión de inmediato como comprador. La sesión `{ user, token }` se guarda en `localStorage` (clave `ecommerce.session`).

### Tienda (`StoreView`)
- Buscador con etiqueta visible y filtros por categoría (con icono).
- Tarjeta por material: categoría, nombre, precio por unidad de venta, stock y selector de cantidad (− / +).
- Carrito lateral con subtotales, total y botón **Confirmar pedido**. La validación de stock en el cliente es una ayuda; la verificación definitiva la hace el servidor.

### Pedidos (`OrdersView`)
- Sin `manage`: historial propio (Mis pedidos).
- Con `manage`: todos los pedidos, columna **Cliente** y botones solo para las transiciones válidas que devuelve la API en `nextStatuses` (Confirmar, Enviar, Entregar, Cancelar). Cancelar pide confirmación porque es irreversible.
- Filtro por estado y píldoras de estado con icono + texto.

### Productos (`ProductsView`)
Formulario de alta y edición (nombre, precio, stock, unidad de venta, categoría, con sugerencias de valores existentes) y tabla con **Editar** / **Eliminar**.

### Usuarios (`UsersView`)
- Tabla de usuarios registrados con estado (**Activo** / **Sin acceso**) y casillas **Productos** y **Pedidos**. Marcar o desmarcar guarda al instante con actualización optimista: si el servidor rechaza el cambio, la casilla vuelve a su valor anterior.
- **Revocar acceso** / **Reactivar** por usuario. La cuenta del admin muestra "Acceso total" y no se puede modificar.
- La sección *Solicitudes pendientes* solo aparece si quedan cuentas del flujo anterior de aprobación previa.

## Cliente HTTP (`api.js`)

- Construye las URLs como `${VITE_API_URL}/api/...`.
- Añade `Authorization: Bearer <token>` cuando hay sesión.
- Convierte las respuestas de error de la API en `Error(message)` para mostrarlas en pantalla.
- Si la API responde `401` a una petición autenticada, ejecuta el manejador registrado con `onUnauthorized` (la app cierra la sesión).

| Función | Endpoint |
|---------|----------|
| `register`, `login`, `me` | `/auth/*` |
| `listProducts`, `createProduct`, `updateProduct`, `deleteProduct` | `/products` |
| `listMyOrders`, `listAllOrders`, `createOrder`, `changeOrderStatus` | `/orders` |
| `listUsers`, `reviewUser` | `/users` |

## Accesibilidad y responsive

- Contraste de texto ≥ 4.5:1 en modo claro y oscuro (medido); bordes de controles ≥ 3:1.
- Foco visible con teclado en todos los controles; iconos decorativos con `aria-hidden`; mensajes con `role="alert"` / `role="status"`.
- Áreas táctiles de 44 px en pantallas táctiles; sin scroll horizontal de 375 a 2560 px.
- Respeta `prefers-reduced-motion` y `prefers-color-scheme`.

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
