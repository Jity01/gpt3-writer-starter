const db = require('../../../db/db-model');

const getUserId = async (req, res) => {
  const { firstName, lastName, email } = req.body;
  const text = "SELECT id FROM users WHERE first_name = $1 AND last_name = $2 AND email = $3";
  const values = [firstName, lastName, email];
  const response = await db.query(text, values);
  res.status(200).json({ userId: response[0] ? response[0].id : -1 });
};

export default getUserId;
