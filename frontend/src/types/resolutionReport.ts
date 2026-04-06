export type ResolutionReportTicket = {
  id: number;
  report_id: number;
  title: string;
  priority: string;
  status: string;
  created_at: string;
  closed_at: string;
  resolution_seconds: number;
  resolution_human: string;
};

export type ReportStatusItem = {
  status: string;
  count: number;
  percentage: number;
};

export type ReportPriorityItem = {
  priority: string;
  count: number;
  percentage: number;
};

export type ReportsDashboardResponse = {
  filters: {
    search: string;
    closedFrom: string | null;
    closedTo: string | null;
    priority: string;
    status: string;
    assignedTo: string | number;
    page: number;
    limit: number;
  };
  kpis: {
    totalTickets: number;
    closedTickets: number;
    averageResolutionSeconds: number;
    averageResolutionHuman: string;
    highPriorityTickets: number;
    inAgentControlTickets: number;
    inClientControlTickets: number;
  };
  byStatus: {
    total: number;
    items: ReportStatusItem[];
  };
  byPriority: {
    total: number;
    items: ReportPriorityItem[];
  };
  resolution: {
    totalClosedTickets: number;
    averageResolutionSeconds: number;
    averageResolutionHuman: string;
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    tickets: ResolutionReportTicket[];
  };
};