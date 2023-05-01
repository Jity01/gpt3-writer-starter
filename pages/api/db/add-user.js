import db from '../../../db/db-model';

const addUser = async (firstName, lastName, email) => {
    const text = "INSERT INTO users (first_name, last_name, email) VALUES ($1, $2, $3)";
    const values = [firstName, lastName, email];
    await db.query(text, values);
};

export default addUser;
