import db from '../../../db/db-model';

const editLogMessage = async (req, res) => {
    let { userId, logId, message } = req.body;
    const text = "UPDATE logs_with_replies SET message = $1 WHERE user_id = $2 AND id = $3;";
    const values = [message, userId, logId];
    await db.query(text, values);
    res.status(200).json({ message: 'Log updated successfully.' });
};

export default editLogMessage;