const tickets = require("../data/tickets.json");

const findAllTickets = () => {
  return tickets;
};

const findTicketById = (id) => {
  return tickets.find((ticket) => ticket.id === id);
};

module.exports = {
  findAllTickets,
  findTicketById
};