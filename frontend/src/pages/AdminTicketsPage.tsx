import { useEffect, useState } from "react";
import type { Ticket } from "../types/ticket";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

import {
  deleteTicketRequest,
  getAllTicketsRequest,
  assignTicketRequest,
} from "../services/ticketService";

import TicketCard from "../components/TicketCard";

function AdminTicketsPage() {
  const { user } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [assignmentFilter, setAssignmentFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);

  const getTickets = async () => {
    try {
      setLoading(true);
      const data = await getAllTicketsRequest();
      setTickets(data);
    } catch (error) {
      console.error("Error al obtener tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTickets();
  }, []);

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "¿Seguro que querés eliminar este ticket?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteTicketRequest(id);
      await getTickets();
    } catch (error) {
      console.error("Error al eliminar ticket:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAssign = async (id: number) => {
    try {
      setAssigningId(id);
      await assignTicketRequest(id);
      await getTickets();
    } catch (error) {
      console.error("Error al asignar ticket:", error);
    } finally {
      setAssigningId(null);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === "todos" || ticket.status === statusFilter;

    const matchesSearch = ticket.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesAssignment =
      assignmentFilter === "todos" ||
      (assignmentFilter === "sin_asignar" && ticket.assigned_to == null) ||
      (assignmentFilter === "mis_tickets" &&
        Number(ticket.assigned_to) === Number(user?.id));

    return matchesStatus && matchesSearch && matchesAssignment;
  });

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Administración de tickets
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Gestioná todos los tickets del sistema
              </p>
            </div>

            <Link
              to="/admin/reports"
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Reportes y Estadísticas
            </Link>
          </div>

          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-800">
                  Filtros y búsqueda
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Estado
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3"
                  >
                    <option value="todos">Todos</option>
                    <option value="en asignacion">En asignación</option>
                    <option value="en analisis">En análisis</option>
                    <option value="en control del cliente">
                      En control del cliente
                    </option>
                    <option value="en control del agente">
                      En control del agente
                    </option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Asignación
                  </label>
                  <select
                    value={assignmentFilter}
                    onChange={(e) => setAssignmentFilter(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3"
                  >
                    <option value="todos">Todos</option>
                    <option value="sin_asignar">Sin asignar</option>
                    <option value="mis_tickets">Asignados a mí</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Buscar
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <LoadingSpinner />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <p className="text-slate-500">No hay tickets disponibles</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    currentUserId={Number(user?.id)}
                    handleDelete={handleDelete}
                    showActions={true}
                    isDeleting={deletingId === ticket.id}
                    onAssign={handleAssign}
                    isAssigning={assigningId === ticket.id}
                    assignedTo={ticket.assigned_to}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

export default AdminTicketsPage;