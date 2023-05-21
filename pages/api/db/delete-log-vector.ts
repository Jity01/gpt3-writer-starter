import { deleteVector } from "../../../utils/api/vector-helpers";

const deleteAction = async (req, res) => {
  let { userId, logId }: {
    userId: number,
    logId: number
  } = req.body;
  const data = await deleteVector(userId, logId.toString());
  res.status(200).json({ data });
};

export default deleteAction;