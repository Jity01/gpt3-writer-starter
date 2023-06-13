import db from '../../../db/db-model';

const addMusicURLToLog = async (req, res) => {
    let { userId, logId, musicURL } = req.body;
    const text = "UPDATE logs_with_replies SET music_url = $1 WHERE user_id = $2 AND id = $3;";
    const values = [musicURL, userId, logId];
    await db.query(text, values);
    res.status(200).json({ message: 'Log updated successfully.' });
};

export default addMusicURLToLog;