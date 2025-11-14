// src/pages/reports/ReportsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  CloudDownload,
  RefreshCw,
  BarChart,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

import DashboardsReportServices from "../services/DashboardsReportServices";

type TimeseriesRow = {
  date: string;
  created: number;
  completed: number;
  pending_snapshot: number;
};

type ReportPayload = {
  summary: {
    total_tasks: number;
    completed: number;
    in_progress: number;
    pending: number;
    overdue: number;
  };
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  timeseries: TimeseriesRow[];
};

export default function ReportsPage(): React.ReactElement {
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [userId, setUserId] = useState<string>(""); // optional
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<ReportPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildParams() {
    const params = new URLSearchParams();
    params.set("start_date", startDate);
    params.set("end_date", endDate);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (priorityFilter !== "ALL") params.set("priority", priorityFilter);
    if (userId) params.set("user_id", userId);
    return params.toString();
  }

  function fetchReport() {
    setLoading(true);
    setError(null);
    const params = buildParams();

    DashboardsReportServices.FetchReports(params)
      .then((r) => {
        // service returns parsed JSON already; set directly
        setData(r as ReportPayload);
      })
      .catch((e) => {
        console.error("Error fetching report:", e);
        setError(e?.detail || e?.message || "Failed to load report");
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function exportCSV(raw = false) {
    setError(null);
    const params = buildParams();
    const call = raw
      ? DashboardsReportServices.ExportReportsRawCSV(params)
      : DashboardsReportServices.ExportReportsCSV(params);

    // returns blob
    call
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const kind = raw ? "raw" : "timeseries";
        a.download = `report_${startDate}_to_${endDate}_${kind}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("Export error", err);
        setError(err?.message || "Failed to export CSV");
      });
  }

  const chartData = useMemo(() => {
    return (data?.timeseries ?? []).map((r) => ({
      date: r.date,
      created: r.created,
      completed: r.completed,
      pending_snapshot: r.pending_snapshot,
    }));
  }, [data]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Reports
          </h1>
          <p className="text-sm text-slate-500">Task progress & export</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchReport}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => exportCSV(false)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-md text-sm hover:bg-emerald-700"
          >
            <CloudDownload className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* controls */}
      <div className="bg-white p-3 rounded-md shadow-sm mb-4 flex flex-col md:flex-row gap-2 items-start md:items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">From</label>
          <input
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            type="date"
            className="border rounded px-2 py-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">To</label>
          <input
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            type="date"
            className="border rounded px-2 py-1 text-sm"
          />
        </div>

        <select
          className="border px-2 py-1 rounded text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All status</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          className="border px-2 py-1 rounded text-sm"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="ALL">All priority</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <input
          placeholder="User ID (optional)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        />
      </div>

      {loading ? (
        <div className="p-6 bg-white rounded shadow text-center text-slate-600">
          Loading report...
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 rounded text-red-600">{error}</div>
      ) : !data ? (
        <div className="p-4 bg-white rounded shadow text-slate-600">
          No data
        </div>
      ) : (
        <>
          {/* summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded shadow-sm flex items-center gap-3">
              <div className="p-2 rounded bg-indigo-50">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Total</div>
                <div className="text-xl font-semibold text-slate-800">
                  {data.summary.total_tasks}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm flex items-center gap-3">
              <div className="p-2 rounded bg-green-50">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Completed</div>
                <div className="text-xl font-semibold text-slate-800">
                  {data.summary.completed}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm flex items-center gap-3">
              <div className="p-2 rounded bg-blue-50">
                <BarChart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">In Progress</div>
                <div className="text-xl font-semibold text-slate-800">
                  {data.summary.in_progress}
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow-sm flex items-center gap-3">
              <div className="p-2 rounded bg-rose-50">
                <Clock className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Overdue</div>
                <div className="text-xl font-semibold text-slate-800">
                  {data.summary.overdue}
                </div>
              </div>
            </div>
          </div>

          {/* chart */}
          <div className="bg-white p-4 rounded shadow-sm mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-slate-800">
                Task progress (created vs completed)
              </div>
              <div className="text-xs text-slate-500">
                {startDate} → {endDate}
              </div>
            </div>

            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={(d) => d} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="created"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="pending_snapshot"
                    stroke="#F59E0B"
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded shadow-sm">
              <div className="text-sm font-semibold mb-2">By status</div>
              <ul className="space-y-2 text-sm text-slate-700">
                {Object.entries(data.by_status).map(([k, v]) => (
                  <li key={k} className="flex justify-between">
                    <span>{k}</span>
                    <span className="font-medium">{v}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-4 rounded shadow-sm">
              <div className="text-sm font-semibold mb-2">By priority</div>
              <ul className="space-y-2 text-sm text-slate-700">
                {Object.entries(data.by_priority).map(([k, v]) => (
                  <li key={k} className="flex justify-between">
                    <span>{k}</span>
                    <span className="font-medium">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
