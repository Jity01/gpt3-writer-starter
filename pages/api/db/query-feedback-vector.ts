import { queryFeedbackVectorDB } from "../../../utils/api/query-feedback-vector-db";

const queryAction = async (req, res) => {
  let { userId, inputV } = req.body;
  const data = await queryFeedbackVectorDB(userId, inputV);
  const { match, inputVector } = data;
  res.status(200).json({ match, inputVector });
};

export default queryAction;