const {
  findAllTickets,
  findTicketById,
} = require("../repositories/ticket.repository");

const getAllTickets = () => {
  return findAllTickets();
};

const getTicketById = (id) => {
  return findTicketById(id);
};

module.exports = {
  getAllTickets,
  getTicketById,
};