import { Hono } from "hono";
import { changeApiKey } from "../controller/setting.controller";
import { authMiddleware } from "../middleware/tokenDetector";

const authRoute = new Hono();

authRoute.post("/change", authMiddleware, changeApiKey);

export default authRoute;
