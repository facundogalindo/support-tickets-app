const {
  getTicketById,
  createNewTicket,
  updateTicketStatusService,
  deleteTicketService,
  getMyTickets,
  getAllTicketsService,
  assignTicketService,
} = require("../services/ticket.service");

const getTicket = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ticket = await getTicketById(id, req.user);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    res.json(ticket);
  } catch (error) {
    if (error.message === "No tenés permisos para ver este ticket") {
      return res.status(403).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

const updateTicketStatusController = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const updated = await updateTicketStatusService(id, status, req.user);

    if (!updated) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    res.json(updated);
  } catch (error) {
    if (
      error.message === "No tenés permisos para actualizar el estado"
    ) {
      return res.status(403).json({ message: error.message });
    }

    if (
      error.message === "Estado inválido" ||
      error.message.startsWith("No se puede cambiar de")
    ) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
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

    const deleted = await deleteTicketService(id, req.user);

    if (!deleted) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    res.json(deleted);
  } catch (error) {
    if (error.message === "No tenés permisos para eliminar tickets") {
      return res.status(403).json({ message: error.message });
    }

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

const assignTicketController = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const updated = await assignTicketService(id, req.user);

    res.json(updated);
  } catch (error) {
    if (
      error.message === "Solo los agentes pueden asignarse tickets" ||
      error.message === "El ticket ya fue asignado"
    ) {
      return res.status(400).json({ message: error.message });
    }

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
  assignTicketController,
};