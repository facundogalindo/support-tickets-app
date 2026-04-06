const pool = require("../config/db");

const getExecutor = (client) => client || pool;

const findTicketById = async (id, client) => {
  const executor = getExecutor(client);

  const query = `
    SELECT id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at
    FROM tickets
    WHERE id = $1
      AND deleted_at IS NULL;
  `;

  const result = await executor.query(query, [id]);
  return result.rows[0];
};

const createTicket = async (
  { title, description, priority, userId, status },
  client
) => {
  const executor = getExecutor(client);

  const query = `
    INSERT INTO tickets (title, description, priority, status, user_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at;
  `;

  const values = [title, description, priority, status, userId];
  const result = await executor.query(query, values);

  return result.rows[0];
};

const updateTicketStatus = async (id, status, client) => {
  const executor = getExecutor(client);

  const query = `
    UPDATE tickets
    SET status = $1
    WHERE id = $2
      AND deleted_at IS NULL
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at;
  `;

  const values = [status, id];
  const result = await executor.query(query, values);

  return result.rows[0];
};

const deleteTicketById = async (id, client) => {
  const executor = getExecutor(client);

  const query = `
    UPDATE tickets
    SET deleted_at = CURRENT_TIMESTAMP
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at;
  `;

  const result = await executor.query(query, [id]);
  return result.rows[0];
};

const findTicketsByUserId = async (userId, client) => {
  const executor = getExecutor(client);

  const query = `
    SELECT id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at
    FROM tickets
    WHERE user_id = $1
      AND deleted_at IS NULL
    ORDER BY created_at DESC;
  `;

  const result = await executor.query(query, [userId]);
  return result.rows;
};

const findAllTickets = async (client) => {
  const executor = getExecutor(client);

  const query = `
    SELECT id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at
    FROM tickets
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC;
  `;

  const result = await executor.query(query);
  return result.rows;
};

const assignTicket = async (ticketId, agentId, status, client) => {
  const executor = getExecutor(client);

  const query = `
    UPDATE tickets
    SET assigned_to = $1,
        status = $2
    WHERE id = $3
      AND assigned_to IS NULL
      AND deleted_at IS NULL
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to, deleted_at;
  `;

  const result = await executor.query(query, [agentId, status, ticketId]);
  return result.rows[0];
};

const closeTicket = async (ticketId, userId, status, client) => {
  const executor = getExecutor(client);

  const query = `
    UPDATE tickets
    SET status = $1,
        closed_by = $2,
        closed_at = CURRENT_TIMESTAMP
    WHERE id = $3
      AND deleted_at IS NULL
    RETURNING id, title, description, priority, status, created_at, user_id, assigned_to, closed_by, closed_at, deleted_at;
  `;

  const result = await executor.query(query, [status, userId, ticketId]);
  return result.rows[0];
};

const getResolutionReportSummary = async (
  { search = "", from = null, to = null } = {},
  client
) => {
  const executor = getExecutor(client);

  const conditions = [
    `status = 'cerrado'`,
    `closed_at IS NOT NULL`,
    `deleted_at IS NULL`,
  ];

  const values = [];
  let paramIndex = 1;

  if (search && search.trim()) {
    conditions.push(`title ILIKE $${paramIndex}`);
    values.push(`%${search.trim()}%`);
    paramIndex++;
  }

  if (from) {
    conditions.push(`closed_at >= $${paramIndex}`);
    values.push(from);
    paramIndex++;
  }

  if (to) {
    conditions.push(`closed_at <= $${paramIndex}`);
    values.push(to);
    paramIndex++;
  }

  const whereClause = conditions.join(" AND ");

  const query = `
    SELECT
      COUNT(*)::int AS total_closed_tickets,
      AVG(EXTRACT(EPOCH FROM (closed_at - created_at)))::float AS average_resolution_seconds
    FROM tickets
    WHERE ${whereClause};
  `;

  const result = await executor.query(query, values);
  return result.rows[0];
};
const getResolvedTicketsWithTime = async (
  { search = "", from = null, to = null, page = 1, limit = 10 } = {},
  client
) => {
  const executor = getExecutor(client);

  const conditions = [
    `status = 'cerrado'`,
    `closed_at IS NOT NULL`,
    `deleted_at IS NULL`,
  ];

  const values = [];
  let paramIndex = 1;

  if (search && search.trim()) {
    conditions.push(`title ILIKE $${paramIndex}`);
    values.push(`%${search.trim()}%`);
    paramIndex++;
  }

  if (from) {
    conditions.push(`closed_at >= $${paramIndex}`);
    values.push(from);
    paramIndex++;
  }

  if (to) {
    conditions.push(`closed_at <= $${paramIndex}`);
    values.push(to);
    paramIndex++;
  }

  const offset = (page - 1) * limit;
  const whereClause = conditions.join(" AND ");

  const rowNumberParam = paramIndex;
  const limitParam = paramIndex + 1;
  const offsetParam = paramIndex + 2;

  const query = `
    SELECT
      ROW_NUMBER() OVER (ORDER BY closed_at DESC) + $${rowNumberParam} AS report_id,
      title,
      priority,
      status,
      created_at,
      closed_at,
      EXTRACT(EPOCH FROM (closed_at - created_at))::int AS resolution_seconds,
      COUNT(*) OVER()::int AS total_items
    FROM tickets
    WHERE ${whereClause}
    ORDER BY closed_at DESC
    LIMIT $${limitParam} OFFSET $${offsetParam};
  `;

  values.push(offset, limit, offset);

  const result = await executor.query(query, values);
  return result.rows;
};

const buildGlobalReportFilters = ({
  search = "",
} = {}) => {
  const conditions = [`deleted_at IS NULL`];
  const values = [];
  let paramIndex = 1;

  if (search && search.trim()) {
    conditions.push(`title ILIKE $${paramIndex}`);
    values.push(`%${search.trim()}%`);
    paramIndex++;
  }

  return {
    whereClause: conditions.join(" AND "),
    values,
    paramIndex,
  };
};

const getDashboardKpis = async (globalFilters = {}, client) => {
  const executor = getExecutor(client);
  const { whereClause, values } = buildGlobalReportFilters(globalFilters);

  const query = `
    SELECT
      COUNT(*)::int AS total_tickets,
      COUNT(*) FILTER (WHERE status = 'cerrado')::int AS closed_tickets,
      COUNT(*) FILTER (WHERE priority = 'alta')::int AS high_priority_tickets,
      COUNT(*) FILTER (WHERE status = 'en control del agente')::int AS in_agent_control_tickets,
      COUNT(*) FILTER (WHERE status = 'en control del cliente')::int AS in_client_control_tickets,
      AVG(
        CASE
          WHEN status = 'cerrado' AND closed_at IS NOT NULL
          THEN EXTRACT(EPOCH FROM (closed_at - created_at))
          ELSE NULL
        END
      )::float AS average_resolution_seconds
    FROM tickets
    WHERE ${whereClause};
  `;

  const result = await executor.query(query, values);
  return result.rows[0];
};

const getTicketsByStatusReport = async (globalFilters = {}, client) => {
  const executor = getExecutor(client);
  const { whereClause, values } = buildGlobalReportFilters(globalFilters);

  const query = `
    SELECT
      status,
      COUNT(*)::int AS count
    FROM tickets
    WHERE ${whereClause}
    GROUP BY status
    ORDER BY status;
  `;

  const result = await executor.query(query, values);
  return result.rows;
};

const getTicketsByPriorityReport = async (globalFilters = {}, client) => {
  const executor = getExecutor(client);
  const { whereClause, values } = buildGlobalReportFilters(globalFilters);

  const query = `
    SELECT
      priority,
      COUNT(*)::int AS count
    FROM tickets
    WHERE ${whereClause}
    GROUP BY priority
    ORDER BY priority;
  `;

  const result = await executor.query(query, values);
  return result.rows;
};

const getResolutionDetailReport = async (
  {
    search = "",
    closedFrom = null,
    closedTo = null,
    priority = "",
    status = "",
    page = 1,
    limit = 10,
  } = {},
  client
) => {
  const executor = getExecutor(client);

  const resolutionBaseFilters = buildResolutionBaseFilters({
    search,
    closedFrom,
    closedTo,
  });

  const detailFilters = buildResolutionDetailFilters({
    priority,
    status,
  });

  const offset = (page - 1) * limit;

  let detailConditionsSql = "";
  const detailValues = [];
  let nextParam = resolutionBaseFilters.paramIndex;

  for (const condition of detailFilters.conditions) {
    detailConditionsSql += ` AND ${condition.field} = $${nextParam}`;
    detailValues.push(condition.value);
    nextParam++;
  }

  const rowNumberParam = nextParam;
  const limitParam = nextParam + 1;
  const offsetParam = nextParam + 2;

const query = `
    SELECT
      id,
      ROW_NUMBER() OVER (ORDER BY closed_at DESC) + $${rowNumberParam} AS report_id,
      title,
      priority,
      created_at,
      closed_at,
      EXTRACT(EPOCH FROM (closed_at - created_at))::int AS resolution_seconds,
      COUNT(*) OVER()::int AS total_items
    FROM tickets
    WHERE ${resolutionBaseFilters.whereClause}
      ${detailConditionsSql}
    ORDER BY closed_at DESC
    LIMIT $${limitParam} OFFSET $${offsetParam};
  `;

  const values = [
    ...resolutionBaseFilters.values,
    ...detailValues,
    offset,
    limit,
    offset,
  ];

  const result = await executor.query(query, values);
  return result.rows;
};



const buildResolutionBaseFilters = ({
  search = "",
  closedFrom = null,
  closedTo = null,
} = {}) => {
  const conditions = [
    `deleted_at IS NULL`,
    `status = 'cerrado'`,
    `closed_at IS NOT NULL`,
  ];

  const values = [];
  let paramIndex = 1;

  if (search && search.trim()) {
    conditions.push(`title ILIKE $${paramIndex}`);
    values.push(`%${search.trim()}%`);
    paramIndex++;
  }

  if (closedFrom) {
    conditions.push(`closed_at >= $${paramIndex}`);
    values.push(closedFrom);
    paramIndex++;
  }

  if (closedTo) {
    conditions.push(`closed_at <= $${paramIndex}`);
    values.push(closedTo);
    paramIndex++;
  }

  return {
    whereClause: conditions.join(" AND "),
    values,
    paramIndex,
  };
};
const buildResolutionDetailFilters = ({
  priority = "",
} = {}) => {
  const conditions = [];
  const values = [];
  let paramIndexOffset = 0;

  if (priority && priority.trim()) {
    paramIndexOffset++;
    conditions.push({
      field: "priority",
      value: priority.trim(),
      offset: paramIndexOffset,
    });
    values.push(priority.trim());
  }

  return {
    conditions,
    values,
    paramIndexOffset,
  };
};

module.exports = {
  findAllTickets,
  findTicketById,
  createTicket,
  updateTicketStatus,
  deleteTicketById,
  findTicketsByUserId,
  assignTicket,
  closeTicket,
  getDashboardKpis,
  getTicketsByStatusReport,
  getTicketsByPriorityReport,
  getResolutionDetailReport,
};