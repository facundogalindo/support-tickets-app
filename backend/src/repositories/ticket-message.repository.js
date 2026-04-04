const pool = require("../config/db");

const getExecutor = (client) => client || pool;

const createTicketMessage = async (
  {
    ticketId,
    senderId,
    senderRole,
    message,
  },
  client
) => {
  const executor = getExecutor(client);

  const query = `
    INSERT INTO ticket_messages (ticket_id, sender_id, sender_role, message)
    VALUES ($1, $2, $3, $4)
    RETURNING id, ticket_id, sender_id, sender_role, message, created_at;
  `;

  const values = [ticketId, senderId, senderRole, message];
  const result = await executor.query(query, values);

  return result.rows[0];
};

const findMessagesByTicketId = async (ticketId, client) => {
  const executor = getExecutor(client);

  const query = `
    SELECT id, ticket_id, sender_id, sender_role, message, created_at
    FROM ticket_messages
    WHERE ticket_id = $1
    ORDER BY created_at ASC;
  `;

  const result = await executor.query(query, [ticketId]);
  return result.rows;
};

module.exports = {
  createTicketMessage,
  findMessagesByTicketId,
};