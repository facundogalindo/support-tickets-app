const pool = require("../config/db");

const getExecutor = (client) => client || pool;

const createTicketTransaction = async (
  {
    ticketId,
    action,
    fieldName = null,
    oldValue = null,
    newValue = null,
    performedBy = null,
  },
  client
) => {
  const executor = getExecutor(client);

  const query = `
    INSERT INTO ticket_transactions (
      ticket_id,
      action,
      field_name,
      old_value,
      new_value,
      performed_by
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      id,
      ticket_id,
      action,
      field_name,
      old_value,
      new_value,
      performed_by,
      created_at;
  `;

  const values = [
    ticketId,
    action,
    fieldName,
    oldValue,
    newValue,
    performedBy,
  ];

  const result = await executor.query(query, values);
  return result.rows[0];
};

const findTransactionsByTicketId = async (ticketId, client) => {
  const executor = getExecutor(client);

  const query = `
    SELECT
      id,
      ticket_id,
      action,
      field_name,
      old_value,
      new_value,
      performed_by,
      created_at
    FROM ticket_transactions
    WHERE ticket_id = $1
    ORDER BY created_at ASC, id ASC;
  `;

  const result = await executor.query(query, [ticketId]);
  return result.rows;
};

module.exports = {
  createTicketTransaction,
  findTransactionsByTicketId,
};