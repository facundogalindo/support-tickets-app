const pool = require("../config/db");

const findTicketById = async (id) => {
  const query = `
    SELECT id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at
    FROM tickets
    WHERE id = $1
      AND deleted_at IS NULL;
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const createTicket = async ({ title, description, priority, userId, status }) => {
  const query = `
    INSERT INTO tickets (title, description, priority, status, user_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at;
  `;

  const values = [title, description, priority, status, userId];
  const result = await pool.query(query, values);

  return result.rows[0];
};

const updateTicketStatus = async (id, status) => {
  const query = `
    UPDATE tickets
    SET status = $1
    WHERE id = $2
      AND deleted_at IS NULL
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at;
  `;

  const values = [status, id];
  const result = await pool.query(query, values);

  return result.rows[0];
};

const deleteTicketById = async (id) => {
  const query = `
    UPDATE tickets
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at;
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const findTicketsByUserId = async (userId) => {
  const query = `
    SELECT id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at
    FROM tickets
    WHERE user_id = $1
      AND deleted_at IS NULL
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

const findAllTickets = async () => {
  const query = `
    SELECT id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at
    FROM tickets
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query);
  return result.rows;
};

const assignTicket = async (ticketId, agentId, status) => {
  const query = `
    UPDATE tickets
    SET assigned_to = $1,
        status = $2
    WHERE id = $3
      AND assigned_to IS NULL
      AND deleted_at IS NULL
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at;
  `;

  const result = await pool.query(query, [agentId, status, ticketId]);
  return result.rows[0];
};

const closeTicket = async (ticketId, userId, status) => {
  const query = `
    UPDATE tickets
    SET status = $1,
        closed_by = $2,
        closed_at = CURRENT_TIMESTAMP
    WHERE id = $3
      AND deleted_at IS NULL
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to, closed_by, closed_at, deleted_at;
  `;

  const result = await pool.query(query, [status, userId, ticketId]);
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

module.exports = {
  findAllTickets,
  findTicketById,
  createTicket,
  updateTicketStatus,
  deleteTicketById,
  findTicketsByUserId,
  assignTicket,
  closeTicket,
  findUserById
};