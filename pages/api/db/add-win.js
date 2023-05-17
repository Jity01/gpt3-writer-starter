import db from '../../../db/db-model';

const addWin = async (req, res) => {
    const { logId, updatedWins } = req.body;
    const text = "UPDATE logs_with_replies SET wins = $1 WHERE id = $2";
    const values = [updatedWins, logId];
    await db.query(text, values);
    res.status(200).json({ message: 'win added' });
};

export default addWin;