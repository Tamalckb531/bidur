import { Hono } from "hono";
import { authMiddleware } from "../middleware/tokenDetector";

const dataRoute = new Hono();

dataRoute.post("/rag/profile", authMiddleware);
dataRoute.post("/rag/repo", authMiddleware);
dataRoute.post("/rag/repo_file", authMiddleware);
dataRoute.post("/rag/repo_folder", authMiddleware);

export default dataRoute;
