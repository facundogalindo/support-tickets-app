const eventBus = require("../utils/eventBus");
const { sendMail } = require("../services/mail.service");
const { findUserById } = require("../repositories/user.repository");

const getStatusLabel = (status) => {
  const labels = {
    "en asignacion": "En asignación",
    "en analisis": "En análisis",
    "en control del cliente": "En control del cliente",
    "en control del agente": "En control del agente",
    "cerrado": "Cerrado",
  };

  return labels[status] || status;
};

eventBus.on("ticket.status.changed", async (payload) => {
  try {
    const { ticket, previousStatus, newStatus, triggeredBy } = payload;

    if (previousStatus === newStatus) {
      return;
    }

    let recipient = null;
    let subject = "";
    let html = "";

    if (newStatus === "en analisis") {
      recipient = await findUserById(ticket.user_id);

      if (!recipient?.email) return;

      subject = `Tu ticket #${ticket.id} fue asignado`;
      html = `
        <h2>Tu ticket fue tomado por un agente</h2>
        <p><strong>Título:</strong> ${ticket.title}</p>
        <p><strong>Nuevo estado:</strong> ${getStatusLabel(newStatus)}</p>
      `;
    }

    if (newStatus === "en control del cliente") {
      recipient = await findUserById(ticket.user_id);

      if (!recipient?.email) return;

      subject = `Nuevo mensaje en tu ticket #${ticket.id}`;
      html = `
        <h2>Un agente respondió tu ticket</h2>
        <p><strong>Título:</strong> ${ticket.title}</p>
        <p><strong>Nuevo estado:</strong> ${getStatusLabel(newStatus)}</p>
      `;
    }

    if (newStatus === "en control del agente") {
      if (!ticket.assigned_to) return;

      recipient = await findUserById(ticket.assigned_to);

      if (!recipient?.email) return;

      subject = `El cliente respondió el ticket #${ticket.id}`;
      html = `
        <h2>El cliente respondió el ticket</h2>
        <p><strong>Título:</strong> ${ticket.title}</p>
        <p><strong>Nuevo estado:</strong> ${getStatusLabel(newStatus)}</p>
      `;
    }

    if (newStatus === "cerrado") {
      recipient = await findUserById(ticket.user_id);

      if (!recipient?.email) return;

      subject = `El ticket #${ticket.id} fue cerrado`;
      html = `
        <h2>Tu ticket fue cerrado</h2>
        <p><strong>Título:</strong> ${ticket.title}</p>
        <p><strong>Nuevo estado:</strong> ${getStatusLabel(newStatus)}</p>
        <p><strong>Cerrado por:</strong> ${triggeredBy.role}</p>
      `;
    }

    if (!recipient?.email || !subject || !html) {
      return;
    }

    await sendMail({
      to: recipient.email,
      subject,
      html,
    });
  } catch (error) {
    console.error("Error en ticketStatusEmailObserver:", error.message);
  }
});