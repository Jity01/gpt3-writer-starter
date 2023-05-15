import { PineconeClient } from "@pinecone-database/pinecone";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const queryVectorDB = async (userId, userInput) => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_ENV,
    apiKey: process.env.PINECONE_API_KEY,
  });

  const embeddingResult = await openai.createEmbedding({
    model: 'text-embedding-ada-002',
    input: [userInput],
  });
  const inputVector = embeddingResult.data.data[0].embedding;

  const pineconeIndex = pinecone.Index('logs');

  let pineconeResult = await pineconeIndex.query({
    queryRequest: {
      vector: inputVector,
      topK: 3,
      namespace: `logs-of-user-${userId}`,
      includeMetadata: true,
    },
  });
  let matches = pineconeResult.matches;

  return matches;
};
