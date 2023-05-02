import db from '../../../db/db-model';

const addLog = async (req, res) => {
    let { logMessage, userId } = req.body;
    const text = "INSERT INTO logs (message, user_id) VALUES ($1, $2)";
    const values = [logMessage, userId];
    await db.query(text, values);
    res.status(200).json({ message: 'Log added successfully.' });
};

export default addLog;
