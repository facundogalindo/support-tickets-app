import { useEffect, useState } from "react";
import type { Ticket } from "../types/ticket";
import Navbar from "../components/Navbar";
import {
  createTicketRequest,
  getMyTicketsRequest,
} from "../services/ticketService";
import TicketForm from "../components/TicketForm";
import TicketCard from "../components/TicketCard";

function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("media");
  const [formError, setFormError] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const getTickets = async () => {
    try {
      setLoading(true);
      const data = await getMyTicketsRequest();
      setTickets(data);
    } catch (error) {
      console.error("Error al obtener mis tickets:", error);
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!title.trim() || !description.trim() || !priority) {
    setFormError("Todos los campos son obligatorios");
    return;
  }

  setFormError("");

  try {
    setSubmitting(true);

    await createTicketRequest({
      title,
      description,
      priority,
    });

    await getTickets();

    setTitle("");
    setDescription("");
    setPriority("media");
  } catch (error) {
    console.error("Error al crear ticket:", error);
  } finally {
    setSubmitting(false);
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

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Mis tickets</h1>
            <p className="mt-2 text-sm text-slate-500">
              Creá y consultá tus tickets de soporte
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
            {/* FORM */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-800">
                  Nuevo ticket
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Completá el formulario para registrar una incidencia
                </p>
              </div>

              <TicketForm
                title={title}
                description={description}
                priority={priority}
                setTitle={setTitle}
                setDescription={setDescription}
                setPriority={setPriority}
                handleSubmit={handleSubmit}
                formError={formError}
              />
            </section>

            {/* LISTADO */}
            <section className="space-y-6">
              {/* FILTROS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Listado de tickets
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Filtrá y buscá tus tickets cargados
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Filtrar por estado
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    >
                      <option value="todos">Todos</option>
                      <option value="abierto">Abierto</option>
                      <option value="en progreso">En progreso</option>
                      <option value="cerrado">Cerrado</option>
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
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    />
                  </div>
                </div>
              </div>

              {/* RESULTADOS */}
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <p className="text-sm text-slate-500">
                    Cargando tickets...
                  </p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  {tickets.length === 0 ? (
                    <>
                      <h3 className="text-lg font-semibold text-slate-800">
                        No tenés tickets cargados
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        Creá tu primer ticket desde el formulario.
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-slate-800">
                        No hay resultados
                      </h3>
                      <p className="mt-2 text-sm text-slate-500">
                        No hay coincidencias con el filtro o búsqueda.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredTickets.map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

export default MyTicketsPage;