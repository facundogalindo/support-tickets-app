const {
  findAllTickets,
  findTicketById,
  createTicket,
  updateTicketStatus
} = require("../repositories/ticket.repository");

const generateId = require("../utils/generateId");

const getAllTickets = () => {
  return findAllTickets();
};

const getTicketById = (id) => {
  return findTicketById(id);
};
const updateTicketStatusService = (id, status) => {
  const validStatuses = ["abierto", "en progreso", "cerrado"];

  if (!validStatuses.includes(status)) {
    throw new Error("Estado inválido");
  }

  const updated = updateTicketStatus(id, status);

  if (!updated) {
    return null;
  }

  return updated;
};

const createNewTicket = ({ title, description, priority }) => {
  if (!title || !description || !priority) {
    throw new Error("Todos los campos son obligatorios");
  }

  const validPriorities = ["baja", "media", "alta"];

  if (!validPriorities.includes(priority)) {
    throw new Error("La prioridad debe ser baja, media o alta");
  }

  const tickets = findAllTickets();

  const newTicket = {
    id: generateId(tickets),
    title,
    description,
    priority,
    status: "abierto",
    createdAt: new Date().toISOString().split("T")[0],
  };

  return createTicket(newTicket);
};

module.exports = {
  getAllTickets,
  getTicketById,
  createNewTicket,
  updateTicketStatusService,
};