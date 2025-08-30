import { Hono } from "hono";
import { cors } from "hono/cors";
import authRoute from "./routes/auth.route";
import settingRoute from "./routes/setting.route";
import { HTTPException } from "hono/http-exception";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

//? CORS policy
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

//? Global error handling :
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ message: err.message }, err.status);
  }
  return c.json({ message: "Internal Server Error" }, 500);
});

app.get("/health", (c) => {
  return c.json({ message: "server is healthy" });
});

//? Routes
app.route("/api/auth", authRoute);
app.route("/api/auth", settingRoute);

export default app;
