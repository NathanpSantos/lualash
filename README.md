# Lua Lash

Online booking site for Lua Lash (eyelash extensions in Guarulhos), built with Next.js and hosted on Netlify.

- **Data:** Netlify Database (Postgres) through Drizzle ORM. The schema lives in `db/schema.ts`. After changing it, run `npx drizzle-kit generate --name <change>`. Migrations go to `netlify/database/migrations/`, and Netlify applies them on deploy.
- **Admin (`/admin`):** protected by Netlify Identity. A user can manage the agenda if they have the `admin` role, or if their email is listed in the comma-separated `ADMIN_EMAILS` environment variable.
- **Local development:** `netlify dev` (this runs `next dev` and emulates the database and Identity).
