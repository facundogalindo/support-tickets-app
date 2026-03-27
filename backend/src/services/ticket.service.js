const {
  findAllTickets,
  findTicketById,
  createTicket,
  updateTicketStatus,
  deleteTicketById,
  findTicketsByUserId,
} = require("../repositories/ticket.repository");

const getAllTicketsService = async () => {
  return await findAllTickets();
};

const getTicketById = async (id) => {
  return await findTicketById(id);
};

const updateTicketStatusService = async (id, status) => {
  const validStatuses = ["abierto", "en progreso", "cerrado"];

  if (!validStatuses.includes(status)) {
    throw new Error("Estado inválido");
  }

  const updated = await updateTicketStatus(id, status);

  if (!updated) {
    return null;
  }

  return updated;
};

const createNewTicket = async ({ title, description, priority, userId }) => {
  if (!title || !description || !priority) {
    throw new Error("Todos los campos son obligatorios");
  }

  const validPriorities = ["baja", "media", "alta"];

  if (!validPriorities.includes(priority)) {
    throw new Error("La prioridad debe ser baja, media o alta");
  }

  return await createTicket({
    title,
    description,
    priority,
    userId,
  });
};

const deleteTicketService = async (id) => {
  return await deleteTicketById(id);
};

const getMyTickets = async (userId) => {
  return await findTicketsByUserId(userId);
};

module.exports = {
  getAllTicketsService,
  getTicketById,
  createNewTicket,
  updateTicketStatusService,
  deleteTicketService,
  getMyTickets,
};