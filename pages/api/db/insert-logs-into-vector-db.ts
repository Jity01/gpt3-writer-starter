import { insertLogsIntoVectorDB } from "../../../utils/api/insert-logs-into-vector-db";

const insertAction = async (req, res) => {
  let { userId, logs }: {
    userId: number,
    logs: any
  } = req.body;
  const data = await insertLogsIntoVectorDB(userId, logs);
  res.status(200).json({ data });
};

export default insertAction;