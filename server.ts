import { db, initDb } from "./db";
import { clients } from "./db/schema";
import { eq } from "drizzle-orm";
import { ClientInputSchema } from "./shared/clientSchema";

initDb();

const port = Number(process.env.PORT) || 3000;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}

Bun.serve({
  port,
  routes: {
    "/clients": {
      GET() {
        const all = db.select().from(clients).all();
        return json(all);
      },
      async POST(req) {
        const body = await req.json();
        const result = ClientInputSchema.safeParse(body);
        if (!result.success) {
          return json({ error: result.error.format() }, 400);
        }

        const created = db
          .insert(clients)
          .values(result.data)
          .returning()
          .get();

        return json(created, 201);
      },
    },
    "/clients/:id": {
      async PUT(req) {
        const id = Number(req.params.id);
        if (!id) return json({ error: "invalid id" }, 400);

        const body = await req.json();
        const result = ClientInputSchema.safeParse(body);
        if (!result.success) {
          return json({ error: result.error.format() }, 400);
        }

        const updated = db
          .update(clients)
          .set(result.data)
          .where(eq(clients.id, id))
          .returning()
          .get();

        if (!updated) return json({ error: "Client not found" }, 404);
        return json(updated);
      },
      async DELETE(req) {
        const id = Number(req.params.id);
        if (!id) return json({ error: "invalid id" }, 400);

        const deleted = db
          .delete(clients)
          .where(eq(clients.id, id))
          .returning()
          .get();

        if (!deleted) return json({ error: "Client not found" }, 404);
        return json(deleted);
      },
    },
  },
  fetch(req) {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    return new Response("Not found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${port}`);
