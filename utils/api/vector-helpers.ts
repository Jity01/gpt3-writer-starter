import { PineconeClient } from "@pinecone-database/pinecone";

export const fetchVectorFromLogs = async (userId: number, idOfLogsToFetch: string) => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_LOGS_ENV as string,
    apiKey: process.env.PINECONE_LOGS_API_KEY as string,
  });
  const pineconeIndex = pinecone.Index('logs');

  let pineconeResult = await pineconeIndex.fetch({
    ids: [idOfLogsToFetch],
    namespace: `logs-of-user-${userId}`,
  });

  return pineconeResult;
};


export const fetchVectorFromFeedback = async (userId: number, idOfLogsToFetch: string) => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_FEEDBACK_ENV as string,
    apiKey: process.env.PINECONE_FEEDBACK_API_KEY as string,
  });
  const pineconeIndex = pinecone.Index('feedback');

  let pineconeResult = await pineconeIndex.fetch({
    ids: [idOfLogsToFetch],
    namespace: `feedback-of-user-${userId}`,
  });

  return pineconeResult;
};

export const deleteVector = async (userId: number, idOfLogsToDelete: string) => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_LOGS_ENV as string,
    apiKey: process.env.PINECONE_LOGS_API_KEY as string,
  });
  const pineconeIndex = pinecone.Index('logs');

  let pineconeResult = await pineconeIndex._delete({
    deleteRequest: {
      ids: [idOfLogsToDelete],
      namespace: `logs-of-user-${userId}`, 
    },
  });

  return pineconeResult;
};
