const TicketEvents = {
  CREATED: "CREATED",
  ASSIGNED: "ASSIGNED",
  AGENT_REPLY: "AGENT_REPLY",
  USER_REPLY: "USER_REPLY",
  CLOSED: "CLOSED",
};

const resolveTicketState = (eventType) => {
  switch (eventType) {
    case TicketEvents.CREATED:
      return "en asignacion";

    case TicketEvents.ASSIGNED:
      return "en analisis";

    case TicketEvents.AGENT_REPLY:
      return "en control del cliente";

    case TicketEvents.USER_REPLY:
      return "en control del agente";

    case TicketEvents.CLOSED:
      return "cerrado";

    default:
      throw new Error("Evento inválido");
  }
};

module.exports = {
  TicketEvents,
  resolveTicketState,
};