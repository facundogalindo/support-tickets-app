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
      <strong>Prioridad:</strong>{" "}
      <span className={`badge badge-priority ${ticket.priority}`}>
        {ticket.priority}
      </span>
    </p>

    <p>
      <strong>Estado:</strong>{" "}
      <span
        className={`badge badge-status ${ticket.status.replace(" ", "-")}`}
      >
        {ticket.status}
      </span>
    </p>
      <p>
        <strong>Fecha:</strong> {ticket.createdAt}
      </p>

      <div className="ticket-actions">
        <button
          onClick={() => handleDelete(ticket.id)}
          className="btn btn-danger"
        >
          Eliminar
        </button>

        <button
          onClick={() => handleStatusChange(ticket.id, ticket.status)}
          className="btn btn-secondary"
        >
          Cambiar estado
        </button>
      </div>
    </div>
  );
}

export default TicketCard;