import db from '../../../db/db-model';

const addReplyToLog = async (req, res) => {
    let { logId, replyLogId } = req.body;
    const text = "UPDATE logs_with_replies SET reply_log_id = $1 WHERE id = $2;";
    const values = [replyLogId, logId];
    await db.query(text, values);
    res.status(200).json({ message: 'Log updated successfully.' });
};

export default addReplyToLog;
