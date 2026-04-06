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
  getDashboardKpis,
  getTicketsByStatusReport,
  getTicketsByPriorityReport,
  getResolutionDetailReport,
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
const formatResolutionTime = (totalSeconds) => {
  if (totalSeconds == null || Number.isNaN(totalSeconds)) {
    return "Sin datos";
  }

  const seconds = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
};

const getResolutionTimeReportService = async ({
  search = "",
  from = null,
  to = null,
  page = 1,
  limit = 10,
}) => {
  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number(limit) > 0 ? Number(limit) : 10;

  const filters = {
    search,
    from,
    to,
    page: safePage,
    limit: safeLimit,
  };

  const summary = await getResolutionReportSummary(filters);
  const tickets = await getResolvedTicketsWithTime(filters);

  const totalItems = tickets.length > 0 ? tickets[0].total_items : 0;
  const totalPages = Math.ceil(totalItems / safeLimit);

  return {
    filters: {
      search,
      from,
      to,
      page: safePage,
      limit: safeLimit,
    },
    totalClosedTickets: summary?.total_closed_tickets ?? 0,
    averageResolutionSeconds: summary?.average_resolution_seconds
      ? Math.floor(summary.average_resolution_seconds)
      : 0,
    averageResolutionHuman: formatResolutionTime(
      summary?.average_resolution_seconds
        ? Math.floor(summary.average_resolution_seconds)
        : 0
    ),
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
    tickets: tickets.map(({ total_items, ...ticket }) => ({
      ...ticket,
      resolution_human: formatResolutionTime(ticket.resolution_seconds),
    })),
  };
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
        ticketId,
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
        ticketId,
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
const buildPercentageItems = (items, total, keyName) => {
  return items.map((item) => ({
    [keyName]: item[keyName],
    count: Number(item.count),
    percentage:
      total > 0 ? Number(((Number(item.count) / total) * 100).toFixed(2)) : 0,
  }));
};

const normalizeDashboardFilters = ({
  search = "",
  closedFrom = null,
  closedTo = null,
  priority = "",
  status = "",
  page = 1,
  limit = 10,
} = {}) => {
  return {
    search,
    closedFrom,
    closedTo,
    priority,
    status,
    page: Number(page) > 0 ? Number(page) : 1,
    limit: Number(limit) > 0 ? Number(limit) : 10,
  };
};

const getReportsDashboardService = async (rawFilters = {}) => {
  const filters = normalizeDashboardFilters(rawFilters);

  const globalFilters = {
    search: filters.search,
    closedFrom: filters.closedFrom,
    closedTo: filters.closedTo,
  };

  const detailFilters = {
    search: filters.search,
    closedFrom: filters.closedFrom,
    closedTo: filters.closedTo,
    priority: filters.priority,
    status: filters.status,
    page: filters.page,
    limit: filters.limit,
  };

  const [kpis, byStatusRows, byPriorityRows, resolutionRows] = await Promise.all([
    getDashboardKpis(globalFilters),
    getTicketsByStatusReport(globalFilters),
    getTicketsByPriorityReport(globalFilters),
    getResolutionDetailReport(detailFilters),
  ]);

  const totalTickets = Number(kpis?.total_tickets ?? 0);
  const totalClosedTickets = Number(kpis?.closed_tickets ?? 0);

  const totalResolutionItems =
    resolutionRows.length > 0 ? Number(resolutionRows[0].total_items) : 0;

  const totalResolutionPages = Math.ceil(totalResolutionItems / filters.limit);

  return {
    globalFilters: {
      search: filters.search,
      closedFrom: filters.closedFrom,
      closedTo: filters.closedTo,
    },
    detailFilters: {
      priority: filters.priority,
      status: filters.status,
    },
    kpis: {
      totalTickets,
      closedTickets: totalClosedTickets,
      averageResolutionSeconds: kpis?.average_resolution_seconds
        ? Math.floor(kpis.average_resolution_seconds)
        : 0,
      averageResolutionHuman: formatResolutionTime(
        kpis?.average_resolution_seconds
          ? Math.floor(kpis.average_resolution_seconds)
          : 0
      ),
      highPriorityTickets: Number(kpis?.high_priority_tickets ?? 0),
      inAgentControlTickets: Number(kpis?.in_agent_control_tickets ?? 0),
      inClientControlTickets: Number(kpis?.in_client_control_tickets ?? 0),
    },
    byStatus: {
      total: totalTickets,
      items: buildPercentageItems(byStatusRows, totalTickets, "status"),
    },
    byPriority: {
      total: totalTickets,
      items: buildPercentageItems(byPriorityRows, totalTickets, "priority"),
    },
    resolution: {
      totalClosedTickets,
      averageResolutionSeconds: kpis?.average_resolution_seconds
        ? Math.floor(kpis.average_resolution_seconds)
        : 0,
      averageResolutionHuman: formatResolutionTime(
        kpis?.average_resolution_seconds
          ? Math.floor(kpis.average_resolution_seconds)
          : 0
      ),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        totalItems: totalResolutionItems,
        totalPages: totalResolutionPages,
        hasNextPage: filters.page < totalResolutionPages,
        hasPrevPage: filters.page > 1,
      },
      tickets: resolutionRows.map(({ total_items, ...ticket }) => ({
        ...ticket,
        resolution_human: formatResolutionTime(ticket.resolution_seconds),
      })),
    },
  };
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
  getReportsDashboardService,
};