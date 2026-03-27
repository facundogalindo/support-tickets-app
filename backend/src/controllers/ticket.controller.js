  const {
    getAllTickets,
    getTicketById,
    createNewTicket,
    updateTicketStatusService,
    deleteTicketService,
    getMyTickets,
    getAllTicketsService
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
  const updateTicketStatusController = (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    try {
      const updated = updateTicketStatusService(id, status);

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
  const deleteTicketController = (req, res) => {
    const id = Number(req.params.id);
    const deleted = deleteTicketService(id);

    if (!deleted) {
      return res.status(404).json({ message: "Ticket no encontrado" });
    }

    res.json(deleted);
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
  getTickets,
  getTicket,
  createTicket,
  updateTicketStatusController,
  deleteTicketController,
  getMyTicketsController,
  getAllTicketsController
};