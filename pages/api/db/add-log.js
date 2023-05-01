import db from '../../../db/db-model';

const addLog = async (logMessage, userId) => {
    const text = "INSERT INTO logs (log_message, user_id) VALUES ($1, $2)";
    const values = [logMessage, userId];
    await db.query(text, values);
};

export default addLog;
