import db from '../../../db/db-model';

const addImgURLToLog = async (req, res) => {
    let { userId, logId, imgURL } = req.body;
    const text = "UPDATE logs_with_replies SET imgurl = $1 WHERE user_id = $2 AND id = $3;";
    const values = [imgURL, userId, logId];
    await db.query(text, values);
    res.status(200).json({ message: 'Log updated successfully.' });
};

export default addImgURLToLog;
