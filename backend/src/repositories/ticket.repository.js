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

module.exports = {
  findAllTickets,
  findTicketById,
  createTicket,
};