# Documentación — E-commerce Práctica

**Repositorio:** https://github.com/Rorre12/ecommerce-practica

```bash
git clone https://github.com/Rorre12/ecommerce-practica.git
```

Tienda de materiales de construcción con backend en arquitectura hexagonal (Node.js + Express + Prisma + PostgreSQL) y una SPA en React + Vite.

## Índice

| Documento | Contenido |
|-----------|-----------|
| [Arquitectura](arquitectura.md) | Capas hexagonales, puertos, adaptadores, flujo de una petición |
| [API REST](api.md) | Endpoints, cuerpos, respuestas, errores y ejemplos |
| [Base de datos](base-de-datos.md) | Modelo Prisma, relaciones, diagrama ER, migraciones y seed |
| [Frontend](frontend.md) | Módulos de la SPA, cliente HTTP, manejo de sesión |
| [Instalación y despliegue](instalacion.md) | Requisitos, variables de entorno, ejecución local y producción |
| [Auditoría de diseño](auditoria-diseno.md) | Sistema visual, auditoría con UI UX Pro Max y Hallmark (antes/después) y capturas |

## Resumen rápido

- **Stack backend:** Node.js 18+, Express 4, Prisma 5, PostgreSQL, bcryptjs, JWT.
- **Stack frontend:** React 18, Vite 5, CSS con tokens OKLCH e iconos Lucide.
- **Acceso:** al registrarse, cada persona es **comprador** (Tienda + Mis pedidos). El `ADMIN` habilita los permisos `PRODUCTS` (gestionar el catálogo) y `ORDERS` (gestionar todos los pedidos), y puede revocar cuentas desde **Usuarios**.
- **Credenciales de demo (seed):** `admin@tienda.com` / `Admin123!`
- **Puertos por defecto:** API `http://localhost:4000` · Cliente `http://localhost:5173`
