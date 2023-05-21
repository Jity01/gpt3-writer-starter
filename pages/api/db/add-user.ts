import db from '../../../db/db-model';

const addUser = async (req, res) => {
    const { firstName, lastName, email } = req.body;
    const text = "INSERT INTO users (first_name, last_name, email) VALUES ($1, $2, $3)";
    const values = [firstName, lastName, email];
    console.log('adding user #2')
    await db.query(text, values);
    res.status(200).json({ message: 'user added' });
};

export default addUser;
