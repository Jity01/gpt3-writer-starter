import { PineconeClient } from "@pinecone-database/pinecone";

export const fetchVector = async (userId, idsOfLogsToFetch) => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_ENV,
    apiKey: process.env.PINECONE_API_KEY,
  });
  const pineconeIndex = pinecone.Index('logs');

  let pineconeResult = await pineconeIndex.fetch({
    ids: [idsOfLogsToFetch],
    namespace: `logs-of-user-${userId}`,
  });

  return pineconeResult;
};