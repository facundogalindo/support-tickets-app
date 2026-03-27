const pool = require("../config/db");

const createUser = async ({ name, email, passwordHash, role }) => {
  const query = `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at;
  `;

  const values = [name, email, passwordHash, role];

  const result = await pool.query(query, values);

  return result.rows[0];
};
const findUserByEmail = async (email) => {
  const query = `
    SELECT * FROM users
    WHERE email = $1;
  `;

  const result = await pool.query(query, [email]);

  return result.rows[0];
};
const findTicketsByUserId = async (userId) => {
  const query = `
    SELECT id, title, description, priority, status, created_at, user_id
    FROM tickets
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};
const findAllTickets = async () => {
  const query = `
    SELECT id, title, description, priority, status, created_at, user_id
    FROM tickets
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query);
  return result.rows;
};

module.exports = {
  createUser,
  findUserByEmail,
  findTicketsByUserId,
  findAllTickets
}