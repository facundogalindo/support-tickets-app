import axios from "axios";
import type { Ticket } from "../types/ticket";
import type { TicketMessage } from "../types/ticketMessage";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/tickets`;

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
  assigned_to: data.assigned_to,
});

export const getMyTicketsRequest = async (): Promise<Ticket[]> => {
  const response = await axios.get(`${API_URL}/my`, getAuthHeaders());
  return response.data.map(mapTicket);
};

export const getAllTicketsRequest = async (): Promise<Ticket[]> => {
  const response = await axios.get(`${API_URL}`, getAuthHeaders());
  return response.data.map(mapTicket);
};

export const getTicketRequest = async (id: number): Promise<Ticket> => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
  return mapTicket(response.data);
};

export const createTicketRequest = async (ticketData: {
  title: string;
  description: string;
  priority: string;
}): Promise<Ticket> => {
  const response = await axios.post(`${API_URL}`, ticketData, getAuthHeaders());
  return mapTicket(response.data);
};

export const deleteTicketRequest = async (id: number): Promise<Ticket> => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  return mapTicket(response.data);
};

export const assignTicketRequest = async (id: number): Promise<Ticket> => {
  const response = await axios.patch(
    `${API_URL}/${id}/assign`,
    {},
    getAuthHeaders()
  );

  return mapTicket(response.data);
};

export const getTicketMessagesRequest = async (
  id: number
): Promise<TicketMessage[]> => {
  const response = await axios.get(`${API_URL}/${id}/messages`, getAuthHeaders());
  return response.data;
};

export const addTicketMessageRequest = async (
  id: number,
  message: string
): Promise<TicketMessage> => {
  const response = await axios.post(
    `${API_URL}/${id}/messages`,
    { message },
    getAuthHeaders()
  );

  return response.data;
};

export const closeTicketRequest = async (id: number): Promise<Ticket> => {
  const response = await axios.patch(
    `${API_URL}/${id}/close`,
    {},
    getAuthHeaders()
  );

  return mapTicket(response.data);
};