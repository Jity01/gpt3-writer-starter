// eslint-disable-next-line import/no-extraneous-dependencies
const { Pool } = require('pg');

const connectionString = process.env.DB_URL;
const pool = new Pool({ connectionString });

/**
 * DATABASE SCHEMA:
 *   id serial primary key,
 *   full_prompt_text varchar not null,
 *   highlighted_prompt_text varchar not null,
 *   highlight_flag varchar not null,
 *   reason_for_highlight varchar not null,
 */

module.exports.query = async (text, values, callback) => {
  try {
    const result = await pool.query(text, values, callback);
    const data = result.rows;
    return result;
  } catch(err) {
    console.log('Error when executing query:', err.stack);
  }
};
