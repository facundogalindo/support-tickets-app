import { useEffect, useState } from "react";
import "./App.css";
import type { Ticket } from "./types/ticket";
import {
  getTicketsRequest,
  createTicketRequest,
  deleteTicketRequest,
  updateTicketStatusRequest,
} from "./services/ticketService";
import TicketForm from "./components/TicketForm";
import TicketCard from "./components/TicketCard";


function App() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("media");
  const [formError, setFormError] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
const getTickets = async () => {
  try {
    const data = await getTicketsRequest();
    setTickets(data);
  } catch (error) {
    console.error("Error al obtener tickets:", error);
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
      await deleteTicketRequest(id);
      await getTickets();
    } catch (error) {
      console.error("Error al eliminar ticket:", error);
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
     await updateTicketStatusRequest(id, nextStatus);

    await getTickets();
  } catch (error) {
    console.error("Error al actualizar estado:", error);
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
  <div className="container">
    <h1>Support Tickets App</h1>
    <p>Listado de tickets</p>
    <div>
      <label htmlFor="statusFilter">Filtrar por estado: </label>
      <select
        id="statusFilter"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="todos">Todos</option>
        <option value="abierto">Abierto</option>
        <option value="en progreso">En progreso</option>
        <option value="cerrado">Cerrado</option>
      </select>
    </div>
    <div>
    <input
      type="text"
      placeholder="Buscar por título..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
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

    {filteredTickets.length === 0 ? (
      tickets.length === 0 ? (
        <p>No hay tickets cargados.</p>
      ) : (
        <p>No hay tickets que coincidan con la búsqueda o el filtro seleccionado.</p>
      )
    ) : (
      <div className="tickets-grid">
  {filteredTickets.map((ticket) => (
  <TicketCard
    key={ticket.id}
    ticket={ticket}
    handleDelete={handleDelete}
    handleStatusChange={handleStatusChange}
  />
))}
      </div>
    )}
  </div>
);
}

export default App;