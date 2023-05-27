import { PineconeClient } from "@pinecone-database/pinecone";

const generateRandomStringOfLength = (length) => {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

export const insertInputIntoFeedbackDB = async (
  userId: number,
  inputEmbeddings: Array<number>,
  stringifiedOutputEmbeddingsArray: Array<string>
) => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_FEEDBACK_ENV as string,
    apiKey: process.env.PINECONE_FEEDBACK_API_KEY as string,
  });
  let embeddings = inputEmbeddings.slice();

  // link embeddings to logs
  let vector = {
      id: generateRandomStringOfLength(10),
      metadata: {
        userId: userId,
        outputs: stringifiedOutputEmbeddingsArray,
      },
      values: embeddings,
  };

  const pineconeIndex = pinecone.Index('feedback');

  // add vectors to pinecone
  let pineconeResult = await pineconeIndex.upsert({
    upsertRequest: {
      vectors: [vector],
      namespace: `feedback-of-user-${userId}`,
    },
  });

  return pineconeResult;
};