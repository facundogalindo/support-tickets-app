const {
  getTicketById,
  createNewTicket,
  deleteTicketService,
  getMyTickets,
  getAllTicketsService,
  assignTicketService,
  addTicketMessageService,
  getTicketMessagesService,
  closeTicketService,
  getReportsDashboardService,
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
    if (
      error.message === "No tenés permisos" ||
      error.message === "No podés eliminar un ticket asignado a otro agente"
    ) {
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

const addTicketMessageController = async (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    const { message } = req.body;

    const newMessage = await addTicketMessageService(
      ticketId,
      message,
      req.user
    );

    if (!newMessage) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    if (
      error.message === "El mensaje es obligatorio" ||
      error.message === "Solo el agente asignado puede responder este ticket"
    ) {
      return res.status(400).json({ message: error.message });
    }

    if (
      error.message === "No tenés permisos para escribir en este ticket"
    ) {
      return res.status(403).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

const getTicketMessagesController = async (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    const messages = await getTicketMessagesService(ticketId, req.user);

    if (!messages) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    res.json(messages);
  } catch (error) {
    if (
      error.message ===
      "No tenés permisos para ver los mensajes de este ticket"
    ) {
      return res.status(403).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

const closeTicketController = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const closed = await closeTicketService(id, req.user);

    if (!closed) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    res.json(closed);
  } catch (error) {
    if (
      error.message === "El ticket ya está cerrado" ||
      error.message === "No podés cerrar el ticket en este estado" ||
      error.message === "No podés cerrar un ticket sin analizar"
    ) {
      return res.status(400).json({ message: error.message });
    }

    if (
      error.message === "No tenés permisos para cerrar este ticket" ||
      error.message === "Solo el agente asignado puede cerrar este ticket"
    ) {
      return res.status(403).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};
const getResolutionTimeReportController = async (req, res) => {
  try {
    const { search = "", from = null, to = null, page = 1, limit = 10 } = req.query;

    const report = await getResolutionTimeReportService({
      search,
      from,
      to,
      page,
      limit,
    });

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getReportsDashboardController = async (req, res) => {
  try {
    const {
      search = "",
      closedFrom = null,
      closedTo = null,
      priority = "",
      status = "",
      page = 1,
      limit = 10,
    } = req.query;

    const dashboard = await getReportsDashboardService({
      search,
      closedFrom,
      closedTo,
      priority,
      status,
      page,
      limit,
    });

    res.json(dashboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getTicket,
  createTicket,
  deleteTicketController,
  getMyTicketsController,
  getAllTicketsController,
  assignTicketController,
  addTicketMessageController,
  getTicketMessagesController,
  closeTicketController,
  getReportsDashboardController,
};