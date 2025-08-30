import { QdrantClient } from "@qdrant/js-client-rest";
import { Constants } from "../types/data.type";
export const createQdrantClient = (apiKey: string, url: string) => {
  const client = new QdrantClient({
    url: url,
    apiKey: apiKey,
  });

  const exist = client.collectionExists(Constants.COLLECTION);
  if (!exist) {
    client.createCollection(Constants.COLLECTION, {
      vectors: { size: 768, distance: "Cosine" },
    });
  }
  return client;
};
