const {
  getAllTickets,
  getTicketById,
  createNewTicket,
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

const createTicket = (req, res) => {
  try {
    const newTicket = createNewTicket(req.body);
    res.status(201).json(newTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getTickets,
  getTicket,
  createTicket,
};