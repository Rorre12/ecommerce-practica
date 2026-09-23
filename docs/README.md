# Documentación — E-commerce Práctica

**Repositorio:** https://github.com/Rorre12/ecommerce-practica

```bash
git clone https://github.com/Rorre12/ecommerce-practica.git
```

E-commerce minimalista con backend en arquitectura hexagonal (Node.js + Express + Prisma + PostgreSQL) y una SPA en React + Vite.

## Índice

| Documento | Contenido |
|-----------|-----------|
| [Arquitectura](arquitectura.md) | Capas hexagonales, puertos, adaptadores, flujo de una petición |
| [API REST](api.md) | Endpoints, cuerpos, respuestas, errores y ejemplos |
| [Base de datos](base-de-datos.md) | Modelo Prisma, relaciones, diagrama ER, migraciones y seed |
| [Frontend](frontend.md) | Módulos de la SPA, cliente HTTP, manejo de sesión |
| [Instalación y despliegue](instalacion.md) | Requisitos, variables de entorno, ejecución local y producción |

## Resumen rápido

- **Stack backend:** Node.js 18+, Express 4, Prisma 5, PostgreSQL, bcryptjs, JWT.
- **Stack frontend:** React 18, Vite 5, CSS plano.
- **Roles:** `ADMIN` gestiona productos y ve todos los pedidos; `CUSTOMER` compra y ve solo sus pedidos.
- **Credenciales de demo (seed):** `admin@tienda.com` / `Admin123!`
- **Puertos por defecto:** API `http://localhost:4000` · Cliente `http://localhost:5173`
