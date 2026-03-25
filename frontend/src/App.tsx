import { useEffect, useState } from "react";
import axios from "axios";
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
  


return (
  <div className="container">
    <h1>Support Tickets App</h1>
    <p>Listado de tickets</p>
    <TicketForm
      title={title}
      description={description}
      priority={priority}
      setTitle={setTitle}
      setDescription={setDescription}
      setPriority={setPriority}
      handleSubmit={handleSubmit}
    />

    {tickets.length === 0 ? (
      <p>No hay tickets cargados.</p>
    ) : (
      <div className="tickets-grid">
{tickets.map((ticket) => (
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