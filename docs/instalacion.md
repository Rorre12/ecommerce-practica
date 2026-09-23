# Instalación y despliegue

Repositorio: https://github.com/Rorre12/ecommerce-practica

## Requisitos

- Node.js 18 o superior
- PostgreSQL 14+ (o Docker para usar `docker-compose.yml`)
- Git

## 1. Clonar

```powershell
git clone https://github.com/Rorre12/ecommerce-practica.git
cd ecommerce-practica
```

## 2. Base de datos

Con Docker:

```powershell
docker compose up -d
```

Crea PostgreSQL 16 en `localhost:5432` con usuario `postgres`, contraseña `postgres` y base `ecommerce`. Si usas un PostgreSQL propio, crea la base y ajusta `DATABASE_URL`.

## 3. Backend

```powershell
cd server
copy .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

La API queda en `http://localhost:4000` (comprueba con `http://localhost:4000/api/health`).

### Variables de entorno (`server/.env`)

| Variable | Ejemplo | Descripción |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/ecommerce?schema=public` | Conexión a PostgreSQL |
| `PORT` | `4000` | Puerto HTTP |
| `CORS_ORIGIN` | `http://localhost:5173` | Orígenes permitidos (separados por coma, o `*`) |
| `JWT_SECRET` | cadena larga aleatoria | **Obligatoria**; firma los tokens |
| `JWT_EXPIRES_IN` | `8h` | Duración del token |
| `ADMIN_EMAIL` | `admin@tienda.com` | Admin creado por el seed |
| `ADMIN_PASSWORD` | `Admin123!` | Contraseña del admin del seed |

## 4. Frontend

En otra terminal:

```powershell
cd client
npm install
npm run dev
```

Abre `http://localhost:5173` e inicia sesión con `admin@tienda.com` / `Admin123!`, o registra un cliente nuevo.

## 5. Producción

Backend:

```powershell
cd server
npm ci
npm run prisma:deploy
npm start
```

- Usa un `JWT_SECRET` fuerte y único.
- Configura `CORS_ORIGIN` con el dominio real del frontend.
- Cambia la contraseña del admin del seed.

Frontend:

```powershell
cd client
$env:VITE_API_URL = "https://tu-api.com"
npm ci
npm run build
```

Publica la carpeta `client/dist` en cualquier hosting estático (Vercel, Netlify, GitHub Pages, Nginx).

## Problemas frecuentes

| Síntoma | Solución |
|---------|----------|
| `JWT_SECRET es obligatorio` al arrancar | Falta `server/.env` o la variable está vacía |
| `P1001: Can't reach database server` | PostgreSQL no está corriendo o `DATABASE_URL` es incorrecta |
| El frontend muestra "No se pudo conectar con el servidor" | La API no está levantada en el puerto 4000 |
| Error CORS en el navegador | Añade el origen del frontend a `CORS_ORIGIN` |
| `@prisma/client did not initialize yet` | Ejecuta `npx prisma generate` |
