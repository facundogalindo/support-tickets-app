import { Link } from "react-router-dom";
import type { Ticket } from "../types/ticket";

type TicketCardProps = {
  ticket: Ticket;
  currentUserId?: number;
  handleDelete?: (id: number) => Promise<void>;
  onAssign?: (id: number) => Promise<void>;
  showActions?: boolean;
  isDeleting?: boolean;
  isAssigning?: boolean;
  assignedTo?: number | null;
};

function TicketCard({
  ticket,
  currentUserId,
  handleDelete,
  onAssign,
  showActions = false,
  isDeleting = false,
  isAssigning = false,
  assignedTo,
}: TicketCardProps) {
  const isUnassigned = assignedTo == null;
  const hasAgentContext = currentUserId !== undefined;

  const isAssignedToMe =
    hasAgentContext && Number(assignedTo) === Number(currentUserId);

  const isAssignedToOther =
    hasAgentContext &&
    assignedTo != null &&
    Number(assignedTo) !== Number(currentUserId);

  const canManageTicket = isUnassigned || isAssignedToMe;

  const priorityStyles = {
    baja: "bg-green-100 text-green-700",
    media: "bg-yellow-100 text-yellow-700",
    alta: "bg-red-100 text-red-700",
  };

  const statusStyles = {
    "en asignacion": "bg-blue-100 text-blue-700",
    "en analisis": "bg-purple-100 text-purple-700",
    "en control del cliente": "bg-orange-100 text-orange-700",
    "en control del agente": "bg-indigo-100 text-indigo-700",
    cerrado: "bg-slate-200 text-slate-700",
  };

  const assignmentLabel = isUnassigned
    ? "Sin asignar"
    : hasAgentContext
    ? isAssignedToMe
      ? "Asignado a mí"
      : "Asignado a otro"
    : "Asignado";

  const assignmentStyles = isUnassigned
    ? "bg-slate-100 text-slate-700"
    : hasAgentContext
    ? isAssignedToMe
      ? "bg-emerald-100 text-emerald-700"
      : "bg-orange-100 text-orange-700"
    : "bg-emerald-100 text-emerald-700";

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

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${assignmentStyles}`}
        >
          {assignmentLabel}
        </span>
      </div>

      <p className="mb-4 text-xs text-slate-400">
        {new Date(ticket.createdAt).toLocaleDateString()}
      </p>

      <div className="mb-3">
        <Link
          to={`/tickets/${ticket.id}`}
          className="inline-flex rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
        >
          Ver conversación
        </Link>
      </div>

      {showActions && (
        <div className="flex flex-wrap gap-2">
          {onAssign && isUnassigned && (
            <button
              onClick={() => onAssign(ticket.id)}
              disabled={isAssigning || isDeleting}
              className="flex-1 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAssigning ? "Asignando..." : "Tomar ticket"}
            </button>
          )}

          {handleDelete && canManageTicket && (
            <button
              onClick={() => handleDelete(ticket.id)}
              disabled={isDeleting || isAssigning}
              className="flex-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          )}
        </div>
      )}

      {showActions && isAssignedToOther && (
        <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
          Este ticket está asignado a otro agente.
        </div>
      )}
    </div>
  );
}

export default TicketCard;