import axios from "axios";
import type { Ticket } from "../types/ticket";

const API_URL = "http://localhost:3001/tickets";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const mapTicket = (data: any): Ticket => ({
  id: data.id,
  title: data.title,
  description: data.description,
  priority: data.priority,
  status: data.status,
  createdAt: data.created_at,
});

export const getMyTicketsRequest = async (): Promise<Ticket[]> => {
  const response = await axios.get(`${API_URL}/my`, getAuthHeaders());
  return response.data.map(mapTicket);
};

export const getAllTicketsRequest = async (): Promise<Ticket[]> => {
  const response = await axios.get(`${API_URL}`, getAuthHeaders());
  return response.data.map(mapTicket);
};

export const createTicketRequest = async (ticketData: {
  title: string;
  description: string;
  priority: string;
}): Promise<Ticket> => {
  const response = await axios.post(`${API_URL}`, ticketData, getAuthHeaders());
  return mapTicket(response.data);
};

export const updateTicketStatusRequest = async (
  id: number,
  status: string
): Promise<Ticket> => {
  const response = await axios.patch(
    `${API_URL}/${id}/status`,
    { status },
    getAuthHeaders()
  );

  return mapTicket(response.data);
};

export const deleteTicketRequest = async (id: number): Promise<Ticket> => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  return mapTicket(response.data);
};