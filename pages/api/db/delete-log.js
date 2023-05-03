import db from '../../../db/db-model';

const deleteLog = async (req, res) => {
    let { logId } = req.body;
    const text = "DELETE FROM logs WHERE id = $1";
    const values = [logId];
    await db.query(text, values);
    res.status(200).json({ message: 'Log deleted successfully.' });
};

export default deleteLog;
