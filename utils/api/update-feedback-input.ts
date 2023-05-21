import { PineconeClient } from "@pinecone-database/pinecone";

export const updateFeedbackInput = async (
  userId: number,
  id: string,
  newArrayOfStringifiedOutputEmbeddings: Array<string>
) => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_FEEDBACK_ENV as string,
    apiKey: process.env.PINECONE_FEEDBACK_API_KEY as string,
  });

  const pineconeIndex = pinecone.Index('feedback');

  let pineconeResult = await pineconeIndex.update({
    updateRequest: {
      id,
      namespace: `feedback-of-user-${userId}`,
      setMetadata: {
        userId: userId,
        outputs: newArrayOfStringifiedOutputEmbeddings,
      }
    },
  });

  return pineconeResult;
};