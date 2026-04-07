# CRM Homework Spec

## Stack
- **Backend**: Bun + Bun.serve, Drizzle ORM
- **Frontend**: Vite + Vue.js
- **Endpoints**: `/clients/list`, `/clients/update`, `/clients/delete`

## Frontend Requirements
- Table displaying all clients (columns from DB schema)
- Delete column with confirmation alert
- Highlight empty required fields in red

## Database Schema
| Field | Type | Rules |
|-------|------|-------|
| id | UUID or Auto-increment | Primary key |
| nombre_completo | String | Required |
| email | String | Required, unique, valid email format |
| telefono | String | Optional |
| empresa | String | Required |

## To-Do List

**Backend Setup**
- [ ] Initialize Drizzle schema with 5 fields
- [ ] Create Bun server with `/clients/list`, `/update`, `/delete` handlers
- [ ] Add email validation & uniqueness constraint at DB level
- [ ] Test CRUD operations

**Frontend Setup**
- [ ] Create Vue.js table component
- [ ] Bind to client data
- [ ] Implement delete column with confirmation modal
- [ ] Style empty cells in red
- [ ] Connect to backend API endpoints

## Open Questions

1. **Database**: SQLite (built-in with Bun) or PostgreSQL?
    -> bun sqlite
2. **REST conventions**: Use standard REST (`GET /clients`, `POST /clients`, `PUT /clients/:id`, `DELETE /clients/:id`) instead of non-standard endpoints?
    - use standard endpoints.
3. **Email uniqueness**: Enforce at DB level or application level?
    - DB level
4. **Frontend styling**: Tailwind CSS or vanilla CSS?
    - tailwind
5. **Drizzle driver**: Which database driver to configure?
    - sqlite
