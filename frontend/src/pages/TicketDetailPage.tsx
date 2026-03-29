import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import {
  getTicketMessagesRequest,
  addTicketMessageRequest,
  getTicketRequest,
  closeTicketRequest,
} from "../services/ticketService";
import type { TicketMessage } from "../types/ticketMessage";
import type { Ticket } from "../types/ticket";

function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState("");

  const ticketId = Number(id);

  const loadTicketData = async () => {
    try {
      setLoading(true);
      setError("");

      const [ticketData, messagesData] = await Promise.all([
        getTicketRequest(ticketId),
        getTicketMessagesRequest(ticketId),
      ]);

      setTicket(ticketData);
      setMessages(messagesData);
    } catch (error: any) {
      console.error("Error al obtener detalle del ticket:", error);
      setError(
        error?.response?.data?.message ||
          "No se pudo cargar la conversación"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("El mensaje no puede estar vacío");
      return;
    }

    try {
      setSending(true);
      setError("");

      await addTicketMessageRequest(ticketId, message);
      setMessage("");
      await loadTicketData();
    } catch (error: any) {
      console.error("Error al enviar mensaje:", error);
      setError(
        error?.response?.data?.message || "No se pudo enviar el mensaje"
      );
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      setClosing(true);
      setError("");

      await closeTicketRequest(ticketId);
      await loadTicketData();
    } catch (error: any) {
      console.error("Error al cerrar ticket:", error);
      setError(
        error?.response?.data?.message || "No se pudo cerrar el ticket"
      );
    } finally {
      setClosing(false);
    }
  };

  useEffect(() => {
    if (!Number.isNaN(ticketId)) {
      loadTicketData();
    }
  }, [ticketId]);

  const isClosed = ticket?.status === "cerrado";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Conversación del ticket
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Ticket #{ticketId}
            </p>
          </div>

          {loading ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <LoadingSpinner />
            </section>
          ) : error ? (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
              <p className="text-sm text-red-600">{error}</p>
            </section>
          ) : (
            <>
              {ticket && (
                <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-3">
                    <h2 className="text-xl font-semibold text-slate-800">
                      {ticket.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {ticket.priority}
                    </span>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {ticket.status}
                    </span>
                  </div>
                </section>
              )}

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                {messages.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No hay mensajes todavía.
                  </p>
                ) : (
                  <div className="max-h-[500px] space-y-4 overflow-y-auto pr-2">
                    {messages.map((msg) => {
                      const isMine =
                        Number(msg.sender_id) === Number(user?.id);

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                              isMine
                                ? "bg-slate-900 text-white"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            <div className="mb-1 text-xs opacity-70">
                              {msg.sender_role}
                            </div>
                            <p>{msg.message}</p>
                            <div className="mt-2 text-[11px] opacity-70">
                              {new Date(msg.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {!isClosed && (
                <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleCloseTicket}
                      disabled={closing}
                      className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {closing
                        ? "Cerrando..."
                        : user?.role === "user"
                        ? "Aceptar respuesta y cerrar"
                        : "Cerrar ticket"}
                    </button>
                  </div>

                  <h2 className="mb-4 text-lg font-semibold text-slate-800">
                    Enviar mensaje
                  </h2>

                  <form onSubmit={handleSendMessage} className="space-y-4">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escribí tu mensaje..."
                      rows={4}
                      disabled={sending || closing}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="submit"
                      disabled={sending || closing}
                      className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sending ? "Enviando..." : "Enviar mensaje"}
                    </button>
                  </form>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}

export default TicketDetailPage;