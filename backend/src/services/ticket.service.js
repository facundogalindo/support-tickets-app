const pool = require("../config/db");

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

const {
  createTicketTransaction,
} = require("../repositories/ticketTransaction.repository");

const eventBus = require("../utils/eventBus");

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

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const initialStatus = resolveTicketState(TicketEvents.CREATED);

    const newTicket = await createTicket(
      {
        title,
        description,
        priority,
        userId,
        status: initialStatus,
      },
      client
    );

    await createTicketMessage(
      {
        ticketId: newTicket.id,
        senderId: userId,
        senderRole: "user",
        message: description,
      },
      client
    );

    await createTicketTransaction(
      {
        ticketId: newTicket.id,
        action: "CREATED",
        fieldName: null,
        oldValue: null,
        newValue: null,
        performedBy: userId,
      },
      client
    );

    await client.query("COMMIT");

    return newTicket;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updated = await assignTicket(
      ticketId,
      currentUser.id,
      assignedStatus,
      client
    );

    if (!updated) {
      throw new Error("El ticket ya fue asignado");
    }

    await createTicketTransaction(
      {
        ticketId: updated.id,
        action: "STATUS_CHANGED",
        fieldName: "status",
        oldValue: previousStatus,
        newValue: updated.status,
        performedBy: currentUser.id,
      },
      client
    );

    await client.query("COMMIT");

    await eventBus.emit("ticket.status.changed", {
      ticket: updated,
      previousStatus,
      newStatus: updated.status,
      triggeredBy: currentUser,
    });

    return updated;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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

  const event =
    currentUser.role === "agent"
      ? TicketEvents.AGENT_REPLY
      : TicketEvents.USER_REPLY;

  const newStatus = resolveTicketState(event);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const newMessage = await createTicketMessage(
      {
        ticketId,
        senderId: currentUser.id,
        senderRole: currentUser.role,
        message,
      },
      client
    );

    const updatedTicket = await updateTicketStatus(ticketId, newStatus, client);

    await createTicketTransaction(
      {
        ticketId: ticketId,
        action: "STATUS_CHANGED",
        fieldName: "status",
        oldValue: previousStatus,
        newValue: updatedTicket.status,
        performedBy: currentUser.id,
      },
      client
    );

    await client.query("COMMIT");

    await eventBus.emit("ticket.status.changed", {
      ticket: updatedTicket,
      previousStatus,
      newStatus: updatedTicket.status,
      triggeredBy: currentUser,
    });

    return newMessage;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const closed = await closeTicket(
      ticketId,
      currentUser.id,
      closedStatus,
      client
    );

    await createTicketMessage(
      {
        ticketId,
        senderId: currentUser.id,
        senderRole: currentUser.role,
        message:
          currentUser.role === "user"
            ? "El cliente indicó que la respuesta fue satisfactoria y cerró el ticket."
            : "El agente cerró el ticket.",
      },
      client
    );

    await createTicketTransaction(
      {
        ticketId: ticketId,
        action: "STATUS_CHANGED",
        fieldName: "status",
        oldValue: previousStatus,
        newValue: closed.status,
        performedBy: currentUser.id,
      },
      client
    );

    await client.query("COMMIT");

    await eventBus.emit("ticket.status.changed", {
      ticket: closed,
      previousStatus,
      newStatus: closed.status,
      triggeredBy: currentUser,
    });

    return closed;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
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