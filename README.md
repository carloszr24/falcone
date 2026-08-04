# Falcone Propiedades — Web

Next.js + TypeScript + Tailwind. **Datos locales** en `data/properties.json` y `data/leads.json` (sin base de datos externa).

Inmobiliaria en Tarifa (Cádiz).

---

## Setup en local

```bash
npm install
cp .env.example .env
npm run dev
```

- Web: [http://localhost:3000](http://localhost:3000)
- Admin propiedades: `/admin`
- Admin leads: `/admin/leads`

---

## Propiedades

El catálogo vive en [`data/properties.json`](data/properties.json). Las fotos van en `public/images/properties/<id>/`.

Para añadir una propiedad:

1. Copia las imágenes a `public/images/properties/<id>/`
2. Añade la ficha en `data/properties.json`
3. Reinicia el servidor de desarrollo si hace falta

También puede gestionarse desde `/admin` en local (escribe en los mismos archivos).

---

## Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Almacenamiento local (JSON + carpeta `public/`)
