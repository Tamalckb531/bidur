import { Context } from "hono";
import {
  Enriched,
  RepoData,
  RepoFileData,
  RepoFolderData,
  UrlType,
} from "../types/data.type";
import { handleEnrichedData } from "../services/insert.service";

export const insertData = (type: UrlType) => {
  return async (c: Context) => {
    const data: Enriched | RepoData | RepoFileData | RepoFolderData =
      await c.req.json();
    const userId: string | null = c.get("userId");
    const apiKey: string = c.env.AI_API_KEY;
    const encryptKey: string = c.env.ENCRYPTION_KEY;
    const qdrantKey: string = c.env.QDRANT_API_KEY;
    const qdrantUrl: string = c.env.QDRANT_URL;
    const db_url: string = c.env.DATABASE_URL;

    console.log(
      "Got the data from extension : ",
      !!data,
      " with info : ",
      data.info
    );

    await handleEnrichedData(
      data,
      type,
      userId,
      apiKey,
      encryptKey,
      qdrantKey,
      qdrantUrl,
      db_url
    );

    return c.json({ status: "ok" });
  };
};
