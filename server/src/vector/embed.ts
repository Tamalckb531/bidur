import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { HTTPException } from "hono/http-exception";
import { Constants, VectorData } from "../types/data.type";
import { createQdrantClient } from "./client";

export const storeEmbeddings = async (
  docs: string[],
  apiKey: string,
  info: string,
  qdrantKey: string,
  qdrantUrl: string
) => {
  try {
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: apiKey,
      model: "models/embedding-001",
    });

    const vectors = await embeddings.embedDocuments(docs);

    const now = new Date().toISOString();
    const upsertData: VectorData[] = vectors.map((values, i) => ({
      id: `doc-${i}-${Date.now()}`,
      vector: values,
      metadata: {
        info: info,
        date: now,
        text: docs[i],
      },
    }));

    //? Init qdrant
    const collection = Constants.COLLECTION;
    const client = createQdrantClient(qdrantKey, qdrantUrl);
    await client.upsert(collection, { points: upsertData });
  } catch (error: any) {
    throw new HTTPException(500, {
      message:
        error.message ||
        "Error occurred while embeddings or storing data in vector database",
    });
  }
};
