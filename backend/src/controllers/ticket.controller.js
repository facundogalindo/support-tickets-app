const {
  getAllTickets,
  getTicketById,
} = require("../services/ticket.service");

const getTickets = (req, res) => {
  const tickets = getAllTickets();
  res.json(tickets);
};

const getTicket = (req, res) => {
  const id = Number(req.params.id);
  const ticket = getTicketById(id);

  if (!ticket) {
    return res.status(404).json({ message: "Ticket no encontrado" });
  }

  res.json(ticket);
};

module.exports = {
  getTickets,
  getTicket,
};