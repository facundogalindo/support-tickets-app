const {
  getTicketById,
  createNewTicket,
  updateTicketStatusService,
  deleteTicketService,
  getMyTickets,
  getAllTicketsService,
} = require("../services/ticket.service");

const getTicket = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ticket = await getTicketById(id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTicketStatusController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const updated = await updateTicketStatusService(id, status);

    if (!updated) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const createTicket = async (req, res) => {
  try {
    const newTicket = await createNewTicket({
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      userId: req.user.id,
    });

    res.status(201).json(newTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTicketController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteTicketService(id);

    if (!deleted) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    res.json(deleted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyTicketsController = async (req, res) => {
  try {
    const tickets = await getMyTickets(req.user.id);
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllTicketsController = async (req, res) => {
  try {
    const tickets = await getAllTicketsService();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTicket,
  createTicket,
  updateTicketStatusController,
  deleteTicketController,
  getMyTicketsController,
  getAllTicketsController,
};