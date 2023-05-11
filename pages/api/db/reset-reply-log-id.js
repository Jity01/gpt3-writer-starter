import db from '../../../db/db-model';

const resetReplyLogId = async (req, res) => {
    let { logId } = req.body;
    const text = 'UPDATE logs_with_replies SET reply_log_id = NULL WHERE id = $1';
    const values = [logId];
    await db.query(text, values);
    res.status(200).json({ message: 'Reply log ID resetted successfully.' });
};

export default resetReplyLogId;