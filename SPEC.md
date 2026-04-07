# CRM Spec

## Stack
- **Backend**: Bun + Bun.serve, Drizzle ORM
- **Frontend**: Bun HTML imports + Vue.js
- **Database**: SQLite via `import { Database } from "bun:sqlite"`
- **ORM**: Drizzle ORM — use Drizzle queries wherever possible; fall back to raw SQL only when Drizzle cannot express the operation

## API Endpoints
- `GET /clients` — list all clients
- `PUT /clients/:id` — update a client
- `DELETE /clients/:id` — delete a client

## Frontend Requirements
- Table displaying all clients (columns match DB schema)
- Delete button per row with confirmation alert before deleting
- Highlight empty required fields in red

## Database Schema
| Field | Type | Rules |
|-------|------|-------|
| id | Auto-increment integer | Primary key |
| nombre_completo | String | Required |
| email | String | Required, unique, valid email format |
| telefono | String | Optional |
| empresa | String | Required |

- Email uniqueness enforced at the DB level
- Email format validated at the application level

## To-Do List

**Backend**
- [ ] Initialize Drizzle schema with 5 fields
- [ ] Set up `bun:sqlite` database with `import { Database } from "bun:sqlite"`
- [ ] Wire Drizzle ORM to the SQLite instance
- [ ] Implement `GET /clients`, `PUT /clients/:id`, `DELETE /clients/:id` handlers using Drizzle queries
- [ ] Add email format validation at application level
- [ ] Test CRUD operations

**Frontend**
- [ ] Serve `index.html` via Bun.serve HTML imports (no Vite)
- [ ] Create Vue.js client table component
- [ ] Bind table to client data from API
- [ ] Implement delete button with confirmation dialog
- [ ] Highlight empty required-field cells in red
- [ ] Connect all actions to backend API endpoints

## Decisions
- Database: SQLite via `bun:sqlite`
- REST conventions: standard REST endpoints
- Email uniqueness: DB-level constraint
- Frontend styling: Tailwind CSS
- ORM: Drizzle with `bun:sqlite` driver
- Bundler/dev server: Bun HTML imports (not Vite)
