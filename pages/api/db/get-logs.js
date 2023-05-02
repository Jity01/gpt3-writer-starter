const db = require('../../../db/db-model');

const getLogs = async (req, res) => {
  const { userId } = req.body;
  const text = 
  `SELECT logs.id, logs.message, logs.created_at 
  FROM logs JOIN users ON logs.user_id = users.id 
  WHERE users.id = $1;`;
  const values = [userId];
  const response = await db.query(text, values);
  res.status(200).json({ logs: response });
};

export default getLogs;