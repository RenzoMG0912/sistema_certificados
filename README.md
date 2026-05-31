# TEAMHSEC

Sistema de certificados y verificación construido con Node.js, Express y PostgreSQL.

## Estructura base

```text
teamhsec/
├── .env
├── .gitignore
├── package.json
├── server.js
├── README.md
├── src/
│   ├── config/
│   │   └── db.js
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middlewares/
│   └── utils/
├── public/
├── admin/
├── assets/
│   ├── css/
│   ├── js/
│   └── img/
└── database/
    ├── schema.sql
    └── seed.sql
```

## Tecnologías sugeridas

- Node.js + Express
- PostgreSQL
- JWT para panel administrativo
- express-validator para validación
- qrcode para generación de QR
- HTML + CSS + JS para las vistas públicas y admin

## Arranque

1. Copia `.env.example` a `.env` y ajusta credenciales.
2. Instala dependencias con `npm install`.
3. Ejecuta `npm run dev` para desarrollo o `npm start` para producción.
