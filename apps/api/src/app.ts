import { Hono } from "hono";
import { getPlayerDetail, searchPlayers } from "./database.ts";

export const app = new Hono().basePath("/api");

app.use("*", async (context, next) => {
  await next();
  context.header("X-Content-Type-Options", "nosniff");
});

app.get("/health", (context) => {
  context.header("Cache-Control", "public, max-age=60");
  return context.json({ status: "ok" });
});

app.get("/players", (context) => {
  return context.json(searchPlayers(new URL(context.req.url).searchParams));
});

app.get("/players/:id", (context) => {
  const id = context.req.param("id");
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    return context.json({ error: "Invalid player ID" }, 400);
  }

  const detail = getPlayerDetail(id);
  if (!detail) {
    return context.json({ error: "Player not found" }, 404);
  }

  context.header("Cache-Control", "public, max-age=300");
  return context.json(detail);
});

app.notFound((context) => context.json({ error: "Not found" }, 404));

app.onError((error, context) => {
  console.error(error);
  return context.json({ error: "Internal server error" }, 500);
});
