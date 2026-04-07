# Muebles CRM

A simple client management app. Bun backend + Vite/Vue frontend.

## Setup

Install dependencies for both backend and frontend:

```bash
bun install
cd frontend && bun install
```

## Running

Start both servers with one command:

```bash
bun run dev
```

- Backend API: `http://localhost:3000`
- Frontend: `http://localhost:5173`

Or start them separately:

```bash
bun run dev:api   # backend only
bun run dev:ui    # frontend only
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/clients` | List all clients |
| POST | `/clients` | Create a client |
| PUT | `/clients/:id` | Update a client |
| DELETE | `/clients/:id` | Delete a client |
