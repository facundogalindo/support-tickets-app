const {
  findAllTickets,
  findTicketById,
  createTicket,
  updateTicketStatus,
  deleteTicketById,
  findTicketsByUserId,
  assignTicket,
  closeTicket,
} = require("../repositories/ticket.repository");

const {
  createTicketMessage,
  findMessagesByTicketId,
} = require("../repositories/ticket-message.repository");

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

const createNewTicket = async ({ title, description, priority, userId }) => {
  if (!title || !description || !priority) {
    throw new Error("Todos los campos son obligatorios");
  }

  const validPriorities = ["baja", "media", "alta"];

  if (!validPriorities.includes(priority)) {
    throw new Error("La prioridad debe ser baja, media o alta");
  }

  const newTicket = await createTicket({
    title,
    description,
    priority,
    userId,
  });

  await createTicketMessage({
    ticketId: newTicket.id,
    senderId: userId,
    senderRole: "user",
    message: description,
  });

  return newTicket;
};

const deleteTicketService = async (id, currentUser) => {
  if (currentUser.role !== "agent") {
    throw new Error("No tenés permisos");
  }

  const ticket = await findTicketById(id);

  if (!ticket) {
    return null;
  }

  if (
    ticket.assigned_to !== null &&
    Number(ticket.assigned_to) !== Number(currentUser.id)
  ) {
    throw new Error("No podés eliminar un ticket asignado a otro agente");
  }

  return await deleteTicketById(id);
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

const addTicketMessageService = async (ticketId, message, currentUser) => {
  if (!message || !message.trim()) {
    throw new Error("El mensaje es obligatorio");
  }

  const ticket = await findTicketById(ticketId);

  if (!ticket) {
    return null;
  }

  if (
    currentUser.role === "user" &&
    Number(ticket.user_id) !== Number(currentUser.id)
  ) {
    throw new Error("No tenés permisos para escribir en este ticket");
  }

  if (
    currentUser.role === "agent" &&
    Number(ticket.assigned_to) !== Number(currentUser.id)
  ) {
    throw new Error("Solo el agente asignado puede responder este ticket");
  }

  const newMessage = await createTicketMessage({
    ticketId,
    senderId: currentUser.id,
    senderRole: currentUser.role,
    message,
  });

  if (currentUser.role === "agent") {
    await updateTicketStatus(ticketId, "en control del cliente");
  }

  if (currentUser.role === "user") {
    await updateTicketStatus(ticketId, "en control del agente");
  }

  return newMessage;
};

const getTicketMessagesService = async (ticketId, currentUser) => {
  const ticket = await findTicketById(ticketId);

  if (!ticket) {
    return null;
  }

  if (
    currentUser.role === "user" &&
    Number(ticket.user_id) !== Number(currentUser.id)
  ) {
    throw new Error("No tenés permisos para ver los mensajes de este ticket");
  }

  return await findMessagesByTicketId(ticketId);
};

const closeTicketService = async (ticketId, currentUser) => {
  const ticket = await findTicketById(ticketId);

  if (!ticket) {
    return null;
  }

  if (ticket.status === "cerrado") {
    throw new Error("El ticket ya está cerrado");
  }

  if (currentUser.role === "user") {
    if (Number(ticket.user_id) !== Number(currentUser.id)) {
      throw new Error("No tenés permisos para cerrar este ticket");
    }

    if (
      ticket.status !== "en control del cliente" &&
      ticket.status !== "en control del agente"
    ) {
      throw new Error("No podés cerrar el ticket en este estado");
    }
  }

  if (currentUser.role === "agent") {
    if (Number(ticket.assigned_to) !== Number(currentUser.id)) {
      throw new Error("Solo el agente asignado puede cerrar este ticket");
    }

    if (ticket.status === "en asignacion") {
      throw new Error("No podés cerrar un ticket sin analizar");
    }
  }

  const closed = await closeTicket(ticketId, currentUser.id);

  await createTicketMessage({
    ticketId,
    senderId: currentUser.id,
    senderRole: currentUser.role,
    message:
      currentUser.role === "user"
        ? "El cliente indicó que la respuesta fue satisfactoria y cerró el ticket."
        : "El agente cerró el ticket.",
  });

  return closed;
};

module.exports = {
  getAllTicketsService,
  getTicketById,
  createNewTicket,
  deleteTicketService,
  getMyTickets,
  assignTicketService,
  addTicketMessageService,
  getTicketMessagesService,
  closeTicketService,
};