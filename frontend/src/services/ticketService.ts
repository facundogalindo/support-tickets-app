import axios from "axios";
import type { Ticket } from "../types/ticket";

const API_URL = "http://localhost:3001/tickets";

export const getTicketsRequest = async (): Promise<Ticket[]> => {
  const response = await axios.get<Ticket[]>(API_URL);
  return response.data;
};

export const createTicketRequest = async (data: {
  title: string;
  description: string;
  priority: string;
}): Promise<void> => {
  await axios.post(API_URL, data);
};

export const deleteTicketRequest = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

export const updateTicketStatusRequest = async (
  id: number,
  status: string
): Promise<void> => {
  await axios.patch(`${API_URL}/${id}/status`, { status });
};