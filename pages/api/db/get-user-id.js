const db = require('../../../db/db-model');

const getUserId = async (firstName, lastName, email) => {
  const text = "SELECT id FROM users WHERE first_name = $1 AND last_name = $2 AND email = $3";
  const values = [firstName, lastName, email];
  const response = await db.query(text, values);
  console.log(response.rows);
  res.status(200).json({ userId: response.rows[0]?.id || null });
};

export default getUserId;
