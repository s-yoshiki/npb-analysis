import { serve } from "@hono/node-server";
import { app } from "./app.ts";

const port = Number(process.env.PORT ?? 8080);

serve({
  fetch: app.fetch,
  hostname: "0.0.0.0",
  port,
});

console.log(`NPB API listening on http://localhost:${port}`);
