import { updateFeedbackInput } from "../../../utils/api/update-feedback-input";

const updateAction = async (req, res) => {
  let { userId, id, outputEmbeddingsStrings }: {
    userId: number,
    id: string,
    outputEmbeddingsStrings: Array<string>
  } = req.body;
  const data = await updateFeedbackInput(userId, id, outputEmbeddingsStrings);
  res.status(200).json({ data });
};

export default updateAction;
