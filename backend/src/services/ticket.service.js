const {
  findAllTickets,
  findTicketById,
  createTicket,
  updateTicketStatus,
  deleteTicketById,
  findTicketsByUserId,
  assignTicket,
} = require("../repositories/ticket.repository");

const getAllTicketsService = async () => {
  return await findAllTickets();
};

const getTicketById = async (id, currentUser) => {
  const ticket = await findTicketById(id);

  if (!ticket) {
    return null;
  }

  if (
    currentUser.role === "user" &&
    Number(ticket.user_id) !== Number(currentUser.id)
  ) {
    throw new Error("No tenés permisos para ver este ticket");
  }

  return ticket;
};

const updateTicketStatusService = async (id, status, currentUser) => {
  if (currentUser.role !== "agent") {
    throw new Error("No tenés permisos para actualizar el estado");
  }

  const validStatuses = ["abierto", "en progreso", "cerrado"];

  if (!validStatuses.includes(status)) {
    throw new Error("Estado inválido");
  }

  const ticket = await findTicketById(id);

  if (!ticket) {
    return null;
  }

  const currentStatus = ticket.status;

  const validTransitions = {
    abierto: ["en progreso"],
    "en progreso": ["cerrado"],
    cerrado: [],
  };

  if (!validTransitions[currentStatus].includes(status)) {
    throw new Error(
      `No se puede cambiar de "${currentStatus}" a "${status}"`
    );
  }

  const updated = await updateTicketStatus(id, status);
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

const deleteTicketService = async (id, currentUser) => {
  if (currentUser.role !== "agent") {
    throw new Error("No tenés permisos para eliminar tickets");
  }

  const deleted = await deleteTicketById(id);

  if (!deleted) {
    return null;
  }

  return deleted;
};

const getMyTickets = async (userId) => {
  return await findTicketsByUserId(userId);
};

const assignTicketService = async (ticketId, currentUser) => {
  if (currentUser.role !== "agent") {
    throw new Error("Solo los agentes pueden asignarse tickets");
  }

  const updated = await assignTicket(ticketId, currentUser.id);

  if (!updated) {
    throw new Error("El ticket ya fue asignado");
  }

  return updated;
};

module.exports = {
  getAllTicketsService,
  getTicketById,
  createNewTicket,
  updateTicketStatusService,
  deleteTicketService,
  getMyTickets,
  assignTicketService,
};