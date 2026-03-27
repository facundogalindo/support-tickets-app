  const tickets = require("../data/tickets.json");
  const pool = require("../config/db");


  const findTicketById = (id) => {
    return tickets.find((ticket) => ticket.id === id);
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
  const updateTicketStatus = (id, status) => {
    const ticket = tickets.find((t) => t.id === id);

    if (!ticket) {
      return null;
    }

    ticket.status = status;
    return ticket;
  };

  const deleteTicketById = (id) => {
    const index = tickets.findIndex((ticket) => ticket.id === id);

    if (index === -1) {
      return null;
    }

    const deletedTicket = tickets[index];
    tickets.splice(index, 1);

    return deletedTicket;
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
    findAllTickets,
    findTicketById,
    createTicket,
    updateTicketStatus,
    deleteTicketById,
    findTicketsByUserId,
    findAllTickets

  };