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

const deleteTicketById = (id) => {
  const index = tickets.findIndex((ticket) => ticket.id === id);

  if (index === -1) {
    return null;
  }

  const deletedTicket = tickets[index];
  tickets.splice(index, 1);

  return deletedTicket;
};

module.exports = {
  findAllTickets,
  findTicketById,
  createTicket,
  updateTicketStatus,
  deleteTicketById
};