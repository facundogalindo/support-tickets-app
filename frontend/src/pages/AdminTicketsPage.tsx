import { useEffect, useState } from "react";
import type { Ticket } from "../types/ticket";
import Navbar from "../components/Navbar";
import {
  deleteTicketRequest,
  getAllTicketsRequest,
  updateTicketStatusRequest,
} from "../services/ticketService";
import TicketCard from "../components/TicketCard";

function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");

  const getTickets = async () => {
    try {
      const data = await getAllTicketsRequest();
      setTickets(data);
    } catch (error) {
      console.error("Error al obtener todos los tickets:", error);
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
    <>
  <Navbar />

  <div className="container"></div>
    <div className="container">
      <h1>Administración de tickets</h1>
      <p>Vista general de todos los tickets</p>

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
                showActions={true}
                />
          ))}
        </div>
      )}
    </div>
    </>
  );
}

export default AdminTicketsPage;