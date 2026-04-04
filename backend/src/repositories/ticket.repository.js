const pool = require("../config/db");

const getExecutor = (client) => client || pool;

const findTicketById = async (id, client) => {
  const executor = getExecutor(client);

  const query = `
    SELECT id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at
    FROM tickets
    WHERE id = $1
      AND deleted_at IS NULL;
  `;

  const result = await executor.query(query, [id]);
  return result.rows[0];
};

const createTicket = async (
  { title, description, priority, userId, status },
  client
) => {
  const executor = getExecutor(client);

  const query = `
    INSERT INTO tickets (title, description, priority, status, user_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at;
  `;

  const values = [title, description, priority, status, userId];
  const result = await executor.query(query, values);

  return result.rows[0];
};

const updateTicketStatus = async (id, status, client) => {
  const executor = getExecutor(client);

  const query = `
    UPDATE tickets
    SET status = $1
    WHERE id = $2
      AND deleted_at IS NULL
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at;
  `;

  const values = [status, id];
  const result = await executor.query(query, values);

  return result.rows[0];
};

const deleteTicketById = async (id, client) => {
  const executor = getExecutor(client);

  const query = `
    UPDATE tickets
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at;
  `;

  const result = await executor.query(query, [id]);
  return result.rows[0];
};

const findTicketsByUserId = async (userId, client) => {
  const executor = getExecutor(client);

  const query = `
    SELECT id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at
    FROM tickets
    WHERE user_id = $1
      AND deleted_at IS NULL
    ORDER BY created_at DESC;
  `;

  const result = await executor.query(query, [userId]);
  return result.rows;
};

const findAllTickets = async (client) => {
  const executor = getExecutor(client);

  const query = `
    SELECT id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at
    FROM tickets
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC;
  `;

  const result = await executor.query(query);
  return result.rows;
};

const assignTicket = async (ticketId, agentId, status, client) => {
  const executor = getExecutor(client);

  const query = `
    UPDATE tickets
    SET assigned_to = $1,
        status = $2
    WHERE id = $3
      AND assigned_to IS NULL
      AND deleted_at IS NULL
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at;
  `;

  const result = await executor.query(query, [agentId, status, ticketId]);
  return result.rows[0];
};

const closeTicket = async (ticketId, userId, status, client) => {
  const executor = getExecutor(client);

  const query = `
    UPDATE tickets
    SET status = $1,
        closed_by = $2,
        closed_at = CURRENT_TIMESTAMP
    WHERE id = $3
      AND deleted_at IS NULL
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to, closed_by, closed_at, deleted_at;
  `;

  const result = await executor.query(query, [status, userId, ticketId]);
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