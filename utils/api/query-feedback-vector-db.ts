import { PineconeClient } from "@pinecone-database/pinecone";

export const queryFeedbackVectorDB = async (userId: number, inputVector: Array<number>) => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_FEEDBACK_ENV as string,
    apiKey: process.env.PINECONE_FEEDBACK_API_KEY as string,
  });

  const pineconeIndex = pinecone.Index('feedback-index');
  let pineconeResult = await pineconeIndex.query({
    queryRequest: {
      vector: inputVector,
      topK: 1,
      namespace: `feedback-of-user-${userId}`,
      includeMetadata: true,
      includeValues: true,
    },
  }) as {
    matches: Array<{
      id: string;
      score: number;
      metadata: {
        userId: number;
        outputs: Array<string>;
      };
      values: Array<number>;
    }>;
  };

  let match;
  if (!pineconeResult.matches || pineconeResult.matches.length === 0) {
    match = null;
  } else if (pineconeResult.matches[0].score < 0.99) {
    match = null;
  }else {
    match = pineconeResult.matches[0];
  }

  return { match, inputVector };
};