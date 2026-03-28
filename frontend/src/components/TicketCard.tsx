import type { Ticket } from "../types/ticket";

type TicketCardProps = {
  ticket: Ticket;
  handleDelete?: (id: number) => Promise<void>;
  handleStatusChange?: (id: number, currentStatus: string) => Promise<void>;
  showActions?: boolean;
};

function TicketCard({
  ticket,
  handleDelete,
  handleStatusChange,
  showActions = false,
}: TicketCardProps) {
  const canChangeStatus = ticket.status !== "cerrado";

  const priorityStyles = {
    baja: "bg-green-100 text-green-700",
    media: "bg-yellow-100 text-yellow-700",
    alta: "bg-red-100 text-red-700",
  };

  const statusStyles = {
    abierto: "bg-blue-100 text-blue-700",
    "en progreso": "bg-purple-100 text-purple-700",
    cerrado: "bg-slate-200 text-slate-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">
          {ticket.title}
        </h3>
      </div>

      <p className="mb-4 text-sm text-slate-600 line-clamp-3">
        {ticket.description}
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            priorityStyles[ticket.priority as keyof typeof priorityStyles]
          }`}
        >
          {ticket.priority}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            statusStyles[ticket.status as keyof typeof statusStyles]
          }`}
        >
          {ticket.status}
        </span>
      </div>

      <p className="mb-4 text-xs text-slate-400">
        {new Date(ticket.createdAt).toLocaleDateString()}
      </p>

      {showActions && (
        <div className="flex gap-2">
          {handleDelete && (
            <button
              onClick={() => handleDelete(ticket.id)}
              className="flex-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
            >
              Eliminar
            </button>
          )}

          {handleStatusChange && canChangeStatus && (
            <button
              onClick={() => handleStatusChange(ticket.id, ticket.status)}
              className="flex-1 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Cambiar estado
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default TicketCard;