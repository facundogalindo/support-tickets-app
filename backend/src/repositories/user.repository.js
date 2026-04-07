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

const findUserById = async (id) => {
  const query = `
    SELECT id, name, email, role, created_at
    FROM users
    WHERE id = $1;
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const saveResetTokenByEmail = async (email, resetToken, expiresAt) => {
  const query = `
    UPDATE users
    SET reset_token = $1,
        reset_token_expires_at = $2
    WHERE email = $3
    RETURNING id, name, email, role, created_at, reset_token, reset_token_expires_at;
  `;

  const values = [resetToken, expiresAt, email];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const findUserByResetToken = async (resetToken) => {
  const query = `
    SELECT *
    FROM users
    WHERE reset_token = $1;
  `;

  const result = await pool.query(query, [resetToken]);
  return result.rows[0];
};

const updatePasswordAndClearResetToken = async (userId, passwordHash) => {
  const query = `
    UPDATE users
    SET password_hash = $1,
        reset_token = NULL,
        reset_token_expires_at = NULL
    WHERE id = $2
    RETURNING id, name, email, role, created_at;
  `;

  const values = [passwordHash, userId];
  const result = await pool.query(query, values);
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
  findUserById,
  saveResetTokenByEmail,
  findUserByResetToken,
  updatePasswordAndClearResetToken,
  findTicketsByUserId,
  findAllTickets,
};