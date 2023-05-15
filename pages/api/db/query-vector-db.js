import { queryVectorDB } from "../../../utils/api/query-vector-db";

const query = async (req, res) => {
  let { userId, userInput } = req.body;
  const matches = await queryVectorDB(userId, userInput);
  res.status(200).json({ scoredVectors: matches });
};

export default query;