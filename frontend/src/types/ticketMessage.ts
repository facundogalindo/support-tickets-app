export type TicketMessage = {
  id: number;
  ticket_id: number;
  sender_id: number;
  sender_role: string;
  message: string;
  created_at: string;
};