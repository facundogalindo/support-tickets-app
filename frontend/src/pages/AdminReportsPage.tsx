import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { getReportsDashboardRequest } from "../services/ticketService";
import type { ReportsDashboardResponse } from "../types/resolutionReport";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function AdminReportsPage() {
  const [tableData, setTableData] = useState<ReportsDashboardResponse | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableError, setTableError] = useState("");

  const [search, setSearch] = useState("");
  const [closedFrom, setClosedFrom] = useState("");
  const [closedTo, setClosedTo] = useState("");
  const [priority, setPriority] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isGraphsModalOpen, setIsGraphsModalOpen] = useState(false);
  const [graphsLoading, setGraphsLoading] = useState(false);
  const [graphsError, setGraphsError] = useState("");
  const [graphsData, setGraphsData] = useState<ReportsDashboardResponse | null>(
    null
  );
  const [graphsFrom, setGraphsFrom] = useState("");
  const [graphsTo, setGraphsTo] = useState("");

  const ticketsPerPage = 10;
  const pieColors = ["#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6"];

  const loadTableData = async (page = 1) => {
    try {
      setTableLoading(true);
      setTableError("");

      const data = await getReportsDashboardRequest({
        search,
        closedFrom,
        closedTo,
        priority,
        page,
        limit: ticketsPerPage,
      });

      setTableData(data);
      setCurrentPage(page);
    } catch (error: any) {
      console.error("Error al obtener detalle de reporte:", error);
      setTableError(
        error?.response?.data?.message ||
          "No se pudo obtener el detalle de tickets resueltos"
      );
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    loadTableData(1);
  }, []);

  const handleApplyTableFilters = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    await loadTableData(1);
  };

  const handleClearTableFilters = async () => {
    setSearch("");
    setClosedFrom("");
    setClosedTo("");
    setPriority("");

    try {
      setTableLoading(true);
      setTableError("");

      const data = await getReportsDashboardRequest({
        search: "",
        closedFrom: "",
        closedTo: "",
        priority: "",
        page: 1,
        limit: ticketsPerPage,
      });

      setTableData(data);
      setCurrentPage(1);
    } catch (error: any) {
      console.error("Error al limpiar filtros de tabla:", error);
      setTableError(
        error?.response?.data?.message ||
          "No se pudo obtener el detalle de tickets resueltos"
      );
    } finally {
      setTableLoading(false);
    }
  };

  const handlePrevPage = async () => {
    if (!tableData?.resolution.pagination.hasPrevPage) return;
    await loadTableData(currentPage - 1);
  };

  const handleNextPage = async () => {
    if (!tableData?.resolution.pagination.hasNextPage) return;
    await loadTableData(currentPage + 1);
  };

  const openGraphsModal = () => {
    setIsGraphsModalOpen(true);
    setGraphsError("");
  };

  const closeGraphsModal = () => {
    setIsGraphsModalOpen(false);
    setGraphsError("");
  };

  const handleGenerateGraphs = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setGraphsLoading(true);
      setGraphsError("");

      const data = await getReportsDashboardRequest({
        closedFrom: graphsFrom,
        closedTo: graphsTo,
        page: 1,
        limit: 10,
      });

      setGraphsData(data);
    } catch (error: any) {
      console.error("Error al generar gráficos:", error);
      setGraphsError(
        error?.response?.data?.message || "No se pudieron generar los gráficos"
      );
    } finally {
      setGraphsLoading(false);
    }
  };

  const statusChartData =
    graphsData?.byStatus.items.map((item) => ({
      name: item.status,
      cantidad: item.count,
    })) ?? [];

  const priorityChartData =
    graphsData?.byPriority.items.map((item) => ({
      name: item.priority,
      value: item.count,
    })) ?? [];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Reportes y Estadísticas
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Búsqueda y análisis de tickets resueltos
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={openGraphsModal}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Ver gráficos
              </button>

              <Link
                to="/admin/tickets"
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Volver a tickets
              </Link>
            </div>
          </div>

          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-slate-800">
                Filtros de la tabla
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Estos filtros afectan solo el detalle de tickets resueltos
              </p>
            </div>

            <form
              onSubmit={handleApplyTableFilters}
              className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"
            >
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nombre / título
                </label>
                <input
                  type="text"
                  placeholder="Buscar por título..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Cerrado desde
                </label>
                <input
                  type="datetime-local"
                  value={closedFrom}
                  onChange={(e) => setClosedFrom(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Cerrado hasta
                </label>
                <input
                  type="datetime-local"
                  value={closedTo}
                  onChange={(e) => setClosedTo(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Prioridad
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800"
                >
                  <option value="">Todas</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>

              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Aplicar
                </button>

                <button
                  type="button"
                  onClick={handleClearTableFilters}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Limpiar
                </button>
              </div>
            </form>
          </section>

          {tableData && (
            <section className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Tickets resueltos</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {tableData.resolution.totalClosedTickets}
                </h2>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Tiempo promedio</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {tableData.resolution.averageResolutionHuman}
                </h2>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">Alta prioridad</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-800">
                  {tableData.kpis.highPriorityTickets}
                </h2>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-slate-800">
                Detalle de tickets resueltos
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tabla principal del reporte con búsqueda, filtros y paginación
              </p>
            </div>

            {tableLoading ? (
              <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                <LoadingSpinner />
              </div>
            ) : tableError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
                <p className="text-sm text-red-600">{tableError}</p>
              </div>
            ) : tableData ? (
              <>
                {tableData.resolution.tickets.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No hay tickets resueltos para mostrar.
                  </p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-separate border-spacing-y-2">
                        <thead>
                          <tr className="text-left text-sm text-slate-500">
                            <th className="px-3 py-2">N°</th>
                            <th className="px-3 py-2">Título</th>
                            <th className="px-3 py-2">Prioridad</th>
                            <th className="px-3 py-2">Creado</th>
                            <th className="px-3 py-2">Cerrado</th>
                            <th className="px-3 py-2">Tiempo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.resolution.tickets.map((ticket) => (
                            <tr
                              key={ticket.id}
                              className="rounded-xl bg-slate-50 text-sm text-slate-700"
                            >
                              <td className="px-3 py-3 font-medium">
                                {ticket.report_id}
                              </td>
                              <td className="px-3 py-3">{ticket.title}</td>
                              <td className="px-3 py-3">{ticket.priority}</td>
                              <td className="px-3 py-3">
                                {new Date(ticket.created_at).toLocaleString()}
                              </td>
                              <td className="px-3 py-3">
                                {new Date(ticket.closed_at).toLocaleString()}
                              </td>
                              <td className="px-3 py-3 font-semibold">
                                {ticket.resolution_human}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm text-slate-500">
                        Página {tableData.resolution.pagination.page} de{" "}
                        {tableData.resolution.pagination.totalPages || 1}
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={handlePrevPage}
                          disabled={!tableData.resolution.pagination.hasPrevPage}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Anterior
                        </button>

                        <button
                          onClick={handleNextPage}
                          disabled={!tableData.resolution.pagination.hasNextPage}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : null}
          </section>
        </div>
      </main>

      {isGraphsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Análisis gráfico
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Los gráficos se generan solo por rango de fechas
                </p>
              </div>

              <button
                type="button"
                onClick={closeGraphsModal}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>

            <div className="p-6">
              <section className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Filtros de gráficos
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Estos filtros no afectan la tabla principal
                  </p>
                </div>

                <form
                  onSubmit={handleGenerateGraphs}
                  className="grid gap-4 md:grid-cols-3"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Fecha desde
                    </label>
                    <input
                      type="datetime-local"
                      value={graphsFrom}
                      onChange={(e) => setGraphsFrom(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Fecha hasta
                    </label>
                    <input
                      type="datetime-local"
                      value={graphsTo}
                      onChange={(e) => setGraphsTo(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Generar gráficos
                    </button>
                  </div>
                </form>
              </section>

              {graphsLoading ? (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                  <LoadingSpinner />
                </div>
              ) : graphsError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
                  <p className="text-sm text-red-600">{graphsError}</p>
                </div>
              ) : graphsData ? (
                <div className="grid gap-6 xl:grid-cols-2">
                  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-slate-800">
                        Distribución por estado
                      </h3>
                    </div>

                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="cantidad" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-4 space-y-2">
                      {graphsData.byStatus.items.map((item) => (
                        <div
                          key={item.status}
                          className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
                        >
                          <span className="text-slate-700">{item.status}</span>
                          <span className="font-semibold text-slate-800">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-slate-800">
                        Distribución por prioridad
                      </h3>
                    </div>

                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={priorityChartData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={110}
                            label
                          >
                            {priorityChartData.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={pieColors[index % pieColors.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-4 space-y-2">
                      {graphsData.byPriority.items.map((item) => (
                        <div
                          key={item.priority}
                          className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
                        >
                          <span className="text-slate-700">{item.priority}</span>
                          <span className="font-semibold text-slate-800">
                            {item.count} ({item.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <p className="text-sm text-slate-500">
                    Ingresá un rango de fechas y generá los gráficos.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminReportsPage;