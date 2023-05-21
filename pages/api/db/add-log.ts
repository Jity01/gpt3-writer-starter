import db from '../../../db/db-model';

const addLog = async (req, res) => {
    let { logMessage, userId, isReply } = req.body;
    const text = "INSERT INTO logs_with_replies (message, user_id, is_reply) VALUES ($1, $2, $3)";
    const values = [logMessage, userId, isReply];
    await db.query(text, values);
    const lastLog = await db.query("SELECT * FROM logs_with_replies ORDER BY id DESC LIMIT 1");
    res.status(200).json({ lastLog });
};

export default addLog;
