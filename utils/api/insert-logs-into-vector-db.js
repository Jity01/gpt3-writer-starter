import { PineconeClient } from "@pinecone-database/pinecone";
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const insertLogsIntoVectorDB = async (userId, logs) => {
  const pinecone = new PineconeClient();
  await pinecone.init({
    environment: process.env.PINECONE_ENV,
    apiKey: process.env.PINECONE_API_KEY,
  });

  let inputs = logs.slice();
  let embeddings = [];

  // batch the inputs (limit of 4096)
  while (inputs.length) {
    let tokenCount = 0;
    let batch = [];
    while (inputs.length && tokenCount < 4096) {
      let logmessage = inputs.shift().message;
      batch.push(logmessage);
      tokenCount += logmessage.split(' ').length;
    }
    let embeddingResult = await openai.createEmbedding({
        model: 'text-embedding-ada-002',
        input: batch,
    });
    embeddings = embeddings.concat(embeddingResult.data.data.map((entry) => entry.embedding));
  }

  // link embeddings to logs
  let vectors = logs.map((log, idx) => {
    return {
      id: log.id.toString(),
      metadata: {
        userId: userId,
        logMessage: log.message,
      },
      values: embeddings[idx],
    }
  });

  const pineconeIndex = pinecone.Index('logs');

  // add vectors to pinecone
  let insertBatches = [];
  while (vectors.length) {
    let batch = vectors.splice(0, 250);
    let pineconeResult = await pineconeIndex.upsert({
      upsertRequest: {
        vectors: batch,
        namespace: `logs-of-user-${userId}`,
      },
    });
    insertBatches.push(pineconeResult);
  }

  return insertBatches;
};
