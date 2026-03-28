const pool = require("../config/db");

const findTicketById = async (id) => {
  const query = `
    SELECT id, title, description, priority, status, created_at, user_id
    FROM tickets
    WHERE id = $1;
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const createTicket = async ({ title, description, priority, userId }) => {
  const query = `
    INSERT INTO tickets (title, description, priority, status, user_id)
    VALUES ($1, $2, $3, 'abierto', $4)
    RETURNING id, title, description, priority, status, created_at, user_id;
  `;

  const values = [title, description, priority, userId];
  const result = await pool.query(query, values);

  return result.rows[0];
};

const updateTicketStatus = async (id, status) => {
  const query = `
    UPDATE tickets
    SET status = $1
    WHERE id = $2
    RETURNING id, title, description, priority, status, created_at, user_id;
  `;

  const values = [status, id];
  const result = await pool.query(query, values);

  return result.rows[0];
};

const deleteTicketById = async (id) => {
  const query = `
    DELETE FROM tickets
    WHERE id = $1
    RETURNING id, title, description, priority, status, created_at, user_id;
  `;

  const result = await pool.query(query, [id]);
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
const assignTicket = async (ticketId, agentId) => {
  const query = `
    UPDATE tickets
    SET assigned_to = $1
    WHERE id = $2 AND assigned_to IS NULL
    RETURNING *;
  `;

  const result = await pool.query(query, [agentId, ticketId]);
  return result.rows[0];
};
module.exports = {
  findAllTickets,
  findTicketById,
  createTicket,
  updateTicketStatus,
  deleteTicketById,
  findTicketsByUserId,
  assignTicket,
};