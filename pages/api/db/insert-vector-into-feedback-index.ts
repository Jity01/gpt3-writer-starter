import { insertInputIntoFeedbackDB } from "../../../utils/api/insert-input-into-feedback-db";

const insertAction = async (req, res) => {
  let { userId, inputVector, outputEmbeddingsStrings }: {
    userId: number,
    inputVector: Array<number>,
    outputEmbeddingsStrings: Array<string>
  } = req.body;
  const data = await insertInputIntoFeedbackDB(userId, inputVector, outputEmbeddingsStrings);
  res.status(200).json({ data });
};

export default insertAction;