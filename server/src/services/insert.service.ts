import {
  Enriched,
  RepoData,
  RepoFileData,
  RepoFolderData,
  UrlType,
} from "../types/data.type";

export const handleEnrichedData = async (
  data: Enriched | RepoData | RepoFileData | RepoFolderData,
  type: UrlType,
  userId: string | null,
  key: string,
  encryptKey: string,
  pineconeKey: string,
  db_url: string
) => {};
