const pool = require("../config/db");

const findTicketById = async (id) => {
  const query = `
    SELECT id, title, description, priority, status, created_at, user_id, assigned_to
    FROM tickets
    WHERE id = $1;
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};
const createTicket = async ({ title, description, priority, userId }) => {
  const query = `
    INSERT INTO tickets (title, description, priority, status, user_id)
    VALUES ($1, $2, $3, 'en asignacion', $4)
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to;
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
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to;
  `;

  const values = [status, id];
  const result = await pool.query(query, values);

  return result.rows[0];
};

const deleteTicketById = async (id) => {
  const query = `
    DELETE FROM tickets
    WHERE id = $1
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to;
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const findTicketsByUserId = async (userId) => {
  const query = `
    SELECT id, title, description, priority, status, created_at, user_id, assigned_to
    FROM tickets
    WHERE user_id = $1
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

const findAllTickets = async () => {
  const query = `
    SELECT id, title, description, priority, status, created_at, user_id, assigned_to
    FROM tickets
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query);
  return result.rows;
};
const assignTicket = async (ticketId, agentId) => {
  const query = `
    UPDATE tickets
    SET assigned_to = $1,
        status = 'en analisis'
    WHERE id = $2 AND assigned_to IS NULL
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to;
  `;

  const result = await pool.query(query, [agentId, ticketId]);
  return result.rows[0];
};
const closeTicket = async (ticketId, userId) => {
  const query = `
    UPDATE tickets
    SET status = 'cerrado',
        closed_by = $1,
        closed_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to, closed_by, closed_at;
  `;

  const result = await pool.query(query, [userId, ticketId]);
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
  closeTicket,
};