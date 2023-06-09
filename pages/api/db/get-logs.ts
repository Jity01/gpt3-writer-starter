const db = require('../../../db/db-model');

const getLogs = async (req, res) => {
  const { userId } = req.body;
  const text = 
  `SELECT logs_with_replies.id, logs_with_replies.user_id, logs_with_replies.message, logs_with_replies.created_at, logs_with_replies.is_reply, logs_with_replies.reply_log_id, logs_with_replies.num_of_likes, logs_with_replies.imgurl
  FROM logs_with_replies
  JOIN users ON logs_with_replies.user_id = users.id WHERE users.id = $1;`;
  const values = [userId];
  const response = await db.query(text, values);
  res.status(200).json({ logs: response });
};

export default getLogs;