const tickets = require("../data/tickets.json");

const findAllTickets = () => {
  return tickets;
};

const findTicketById = (id) => {
  return tickets.find((ticket) => ticket.id === id);
};

const createTicket = (newTicket) => {
  tickets.push(newTicket);
  return newTicket;
};
const updateTicketStatus = (id, status) => {
  const ticket = tickets.find((t) => t.id === id);

  if (!ticket) {
    return null;
  }

  ticket.status = status;
  return ticket;
};

module.exports = {
  findAllTickets,
  findTicketById,
  createTicket,
  updateTicketStatus
};