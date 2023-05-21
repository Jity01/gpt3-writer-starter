import { queryVectorDB } from "../../../utils/api/query-vector-db";

const query = async (req, res) => {
  let { userId, userInput } = req.body;
  const data = await queryVectorDB(userId, userInput);
  const { matches, inputVector } = data;
  res.status(200).json({ scoredVectors: matches, inputVector });
};

export default query;