import type { Ticket } from "../types/ticket";

type TicketCardProps = {
  ticket: Ticket;
  handleDelete: (id: number) => Promise<void>;
  handleStatusChange: (id: number, currentStatus: string) => Promise<void>;
};

function TicketCard({
  ticket,
  handleDelete,
  handleStatusChange,
}: TicketCardProps) {
  return (
    <div className="ticket-card">
      <h2>{ticket.title}</h2>
      <p>{ticket.description}</p>
      <p>
        <strong>Prioridad:</strong> {ticket.priority}
      </p>
      <p>
        <strong>Estado:</strong> {ticket.status}
      </p>
      <p>
        <strong>Fecha:</strong> {ticket.createdAt}
      </p>

      <button onClick={() => handleDelete(ticket.id)}>
        Eliminar
      </button>

      <button onClick={() => handleStatusChange(ticket.id, ticket.status)}>
        Cambiar estado
      </button>
    </div>
  );
}

export default TicketCard;