import { useEffect, useState } from "react";
import type { Ticket } from "../types/ticket";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  deleteTicketRequest,
  getAllTicketsRequest,
  updateTicketStatusRequest,
  assignTicketRequest
} from "../services/ticketService";
import TicketCard from "../components/TicketCard";

function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);

  const getTickets = async () => {
    try {
      setLoading(true);
      const data = await getAllTicketsRequest();
      setTickets(data);
    } catch (error) {
      console.error("Error al obtener todos los tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      "¿Seguro que querés eliminar este ticket?"
    );

    if (!confirmed) {
      return;
    }

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

  const getNextStatus = (currentStatus: string) => {
    if (currentStatus === "abierto") {
      return "en progreso";
    }

    if (currentStatus === "en progreso") {
      return "cerrado";
    }

    return "cerrado";
  };

  const handleStatusChange = async (id: number, currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);

    try {
      setUpdatingId(id);
      await updateTicketStatusRequest(id, nextStatus);
      await getTickets();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    getTickets();
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === "todos" || ticket.status === statusFilter;

    const matchesSearch = ticket.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });
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

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Administración de tickets
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Vista general de todos los tickets cargados en el sistema
            </p>
          </div>

          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-800">
                  Filtros y búsqueda
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Filtrá por estado o buscá tickets por título
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="statusFilter"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Filtrar por estado
                  </label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="todos">Todos</option>
                    <option value="abierto">Abierto</option>
                    <option value="en progreso">En progreso</option>
                    <option value="cerrado">Cerrado</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="searchTerm"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Buscar por título
                  </label>
                  <input
                    id="searchTerm"
                    type="text"
                    placeholder="Ej: impresora"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <LoadingSpinner />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                {tickets.length === 0 ? (
                  <>
                    <h3 className="text-lg font-semibold text-slate-800">
                      No hay tickets cargados
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      Todavía no se registraron tickets en el sistema.
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-slate-800">
                      No hay resultados
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      No hay tickets que coincidan con la búsqueda o el filtro
                      seleccionado.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    handleDelete={handleDelete}
                    handleStatusChange={handleStatusChange}
                    showActions={true}
                    isDeleting={deletingId === ticket.id}
                    isUpdating={updatingId === ticket.id}
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