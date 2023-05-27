import db from '../../../db/db-model';

const addLike = async (req, res) => {
    const { logId, updatedLikes } = req.body;
    const text = "UPDATE logs_with_replies SET num_of_likes = $1 WHERE id = $2";
    const values = [updatedLikes, logId];
    await db.query(text, values);
    res.status(200).json({ message: 'like added' });
};

export default addLike;