import { Hono } from "hono";
import { authMiddleware } from "../middleware/tokenDetector";
import { insertData } from "../controller/data.controller";

const dataRoute = new Hono();

dataRoute.post("/rag/profile", authMiddleware, insertData("PROFILE"));
dataRoute.post("/rag/repo", authMiddleware, insertData("REPO"));
dataRoute.post("/rag/repo_file", authMiddleware, insertData("REPO_IN_File"));
dataRoute.post(
  "/rag/repo_folder",
  authMiddleware,
  insertData("REPO_IN_Folder")
);

export default dataRoute;
