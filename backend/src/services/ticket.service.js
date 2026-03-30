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

const eventBus = require("../utils/eventBus");

const {
  createTicketMessage,
  findMessagesByTicketId,
} = require("../repositories/ticket-message.repository");

const {
  TicketEvents,
  resolveTicketState,
} = require("../utils/ticketStateResolver");

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

  const initialStatus = resolveTicketState(TicketEvents.CREATED);

  const newTicket = await createTicket({
    title,
    description,
    priority,
    userId,
    status: initialStatus,
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

  const deletedTicket = await deleteTicketById(id);

  if (!deletedTicket) {
    return null;
  }

  return deletedTicket;
};

const getMyTickets = async (userId) => {
  return await findTicketsByUserId(userId);
};

const assignTicketService = async (ticketId, currentUser) => {
  if (currentUser.role !== "agent") {
    throw new Error("Solo los agentes pueden asignarse tickets");
  }

  const ticket = await findTicketById(ticketId);

  if (!ticket) {
    return null;
  }

  const previousStatus = ticket.status;
  const assignedStatus = resolveTicketState(TicketEvents.ASSIGNED);

  const updated = await assignTicket(ticketId, currentUser.id, assignedStatus);

  if (!updated) {
    throw new Error("El ticket ya fue asignado");
  }

  await eventBus.emit("ticket.status.changed", {
    ticket: updated,
    previousStatus,
    newStatus: updated.status,
    triggeredBy: currentUser,
  });

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

  const previousStatus = ticket.status;

  const newMessage = await createTicketMessage({
    ticketId,
    senderId: currentUser.id,
    senderRole: currentUser.role,
    message,
  });

  const event =
    currentUser.role === "agent"
      ? TicketEvents.AGENT_REPLY
      : TicketEvents.USER_REPLY;

  const newStatus = resolveTicketState(event);

  const updatedTicket = await updateTicketStatus(ticketId, newStatus);

  await eventBus.emit("ticket.status.changed", {
    ticket: updatedTicket,
    previousStatus,
    newStatus: updatedTicket.status,
    triggeredBy: currentUser,
  });

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

  const previousStatus = ticket.status;
  const closedStatus = resolveTicketState(TicketEvents.CLOSED);

  const closed = await closeTicket(ticketId, currentUser.id, closedStatus);

  await createTicketMessage({
    ticketId,
    senderId: currentUser.id,
    senderRole: currentUser.role,
    message:
      currentUser.role === "user"
        ? "El cliente indicó que la respuesta fue satisfactoria y cerró el ticket."
        : "El agente cerró el ticket.",
  });

  await eventBus.emit("ticket.status.changed", {
    ticket: closed,
    previousStatus,
    newStatus: closed.status,
    triggeredBy: currentUser,
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