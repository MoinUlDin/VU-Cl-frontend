// src/pages/dashboards/MemberDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  Users,
  Activity,
  CheckCircle,
  Clock,
  Calendar,
} from "lucide-react";
import DashboardsReportServices from "../../services/DashboardsReportServices";

type LastTaskItem = {
  assignment_id: number;
  assigned_at: string | null;
  assigned_by: { id?: number | null; name?: string } | null;
  task: {
    id: string;
    title: string;
    description?: string | null;
    priority?: string;
    status?: string;
    due_date?: string | null;
    created_at?: string | null;
  };
};

type MemberDashboardResponse = {
  total_tasks: number;
  completed: number;
  progress_count: number;
  overdue: number;
  performance: number; // percent
  last_tasks: LastTaskItem[];
};

export default function MemberDashboard(): React.ReactElement {
  const [data, setData] = useState<MemberDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await DashboardsReportServices.MemberDashboard();
      setData(res as MemberDashboardResponse);
    } catch (e: any) {
      console.error("Member Dash Error: ", e);
      setError("Failed to load dashboard");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(iso?: string | null) {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  }

  function priorityBadge(p?: string) {
    switch (p) {
      case "HIGH":
        return "bg-red-100 text-red-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      case "LOW":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function statusBadge(s?: string) {
    switch (s) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-700";
      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700";
      case "COMPLETED":
        return "bg-green-50 text-green-700";
      case "CANCELLED":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  }

  // small progress bar component
  const ProgressBar = ({ value }: { value: number }) => {
    const v = Math.max(0, Math.min(100, Math.round(value)));
    return (
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-300 bg-emerald-600"
          style={{ width: `${v}%` }}
        />
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-slate-800">
            Member Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Welcome{userInfo?.first_name ? `, ${userInfo.first_name}` : ""} —
            your tasks summary is below.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-md shadow-sm text-sm text-slate-700 hover:bg-slate-50"
            aria-label="Refresh"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {loading ? (
        <div className="p-6 bg-white rounded-lg shadow-sm text-center text-slate-600">
          Loading dashboard...
        </div>
      ) : error ? (
        <div className="p-6 bg-white rounded-lg shadow-sm text-center text-red-600">
          {error}
        </div>
      ) : !data ? (
        <div className="p-6 bg-white rounded-lg shadow-sm text-center text-slate-600">
          No data available.
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-md bg-indigo-50">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-500">Total Tasks</div>
                <div className="text-2xl font-semibold text-slate-800">
                  {data.total_tasks}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Assigned to you
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-md bg-blue-50">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-500">In Progress</div>
                <div className="text-2xl font-semibold text-slate-800">
                  {data.progress_count}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Tasks currently in progress
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-md bg-green-50">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-500">Completed</div>
                <div className="text-2xl font-semibold text-slate-800">
                  {data.completed}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Tasks completed by you
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-3">
              <div className="p-2 rounded-md bg-rose-50">
                <Clock className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-500">Overdue</div>
                <div className="text-2xl font-semibold text-slate-800">
                  {data.overdue}
                </div>
                <div className="text-xs text-slate-400 mt-1">Past due date</div>
              </div>
            </div>
          </div>

          {/* Performance bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-slate-500">Performance</div>
                <div className="text-lg font-semibold text-slate-800">
                  {data.performance}% complete
                </div>
              </div>
              <div className="text-xs text-slate-400">
                <Calendar className="inline-block mr-1" />
                Last 30 days
              </div>
            </div>

            <div className="mt-2">
              <ProgressBar value={data.performance} />
            </div>
          </div>

          {/* Last tasks area */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm sm:text-lg font-semibold text-slate-800">
                Last tasks
              </h2>
              <div className="text-xs sm:text-sm text-slate-500">
                Showing {data.last_tasks?.length ?? 0} recent assignments
              </div>
            </div>

            {/* Table for md+ (compact columns for md, full columns for lg+) */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm">
              <div className="overflow-hidden">
                <table className="w-full table-fixed">
                  <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3 text-left w-1/3">Task</th>

                      {/* full columns only on lg */}
                      <th className="px-4 py-3 text-left hidden lg:table-cell w-1/12">
                        Priority
                      </th>
                      <th className="px-4 py-3 text-left hidden lg:table-cell w-1/6">
                        Status
                      </th>

                      {/* compact columns on md (visible md, hidden on lg) */}
                      <th className="px-4 py-3 text-left hidden md:table-cell lg:hidden w-1/6">
                        Status / Priority
                      </th>

                      <th className="px-4 py-3 text-left w-1/6">Assigned by</th>

                      {/* compact "when/due" for md and separate columns for lg */}
                      <th className="px-4 py-3 text-left hidden md:table-cell lg:hidden w-1/6">
                        Assigned / Due
                      </th>

                      <th className="px-4 py-3 text-left hidden lg:table-cell w-1/6">
                        Assigned at
                      </th>
                      <th className="px-4 py-3 text-right hidden lg:table-cell w-1/6">
                        Due
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {data.last_tasks.map((a) => {
                      const t = a.task;
                      const overdue =
                        t.due_date &&
                        new Date(t.due_date) < new Date() &&
                        t.status !== "COMPLETED";
                      const completed = t.status === "COMPLETED";

                      return (
                        <tr key={a.assignment_id} className="hover:bg-slate-50">
                          {/* Task */}
                          <td className="px-4 py-3 align-top max-w-xs">
                            <div className="text-sm font-medium truncate">
                              {completed ? (
                                <span className="line-through text-slate-400">
                                  {t.title}
                                </span>
                              ) : (
                                <span>{t.title}</span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 truncate mt-1">
                              {t.description ?? "No description"}
                            </div>
                          </td>

                          {/* Priority (lg) */}
                          <td className="px-4 py-3 align-top hidden lg:table-cell">
                            <span
                              className={`inline-block text-xs font-semibold px-2 py-1 rounded ${priorityBadge(
                                t.priority
                              )}`}
                            >
                              {t.priority ?? "N/A"}
                            </span>
                          </td>

                          {/* Status (lg) */}
                          <td className="px-4 py-3 align-top hidden lg:table-cell">
                            <span
                              className={`inline-block text-xs font-semibold px-2 py-1 rounded ${statusBadge(
                                t.status
                              )}`}
                            >
                              {t.status ?? "—"}
                            </span>
                          </td>

                          {/* Compact Status/Priority (md only, hidden on lg) */}
                          <td className="px-4 py-3 align-top hidden md:table-cell lg:hidden">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-block text-xs font-semibold px-2 py-1 rounded ${statusBadge(
                                  t.status
                                )}`}
                              >
                                {t.status ?? "—"}
                              </span>
                              <span
                                className={`inline-block text-xs font-semibold px-2 py-1 rounded ${priorityBadge(
                                  t.priority
                                )}`}
                              >
                                {t.priority ?? "N/A"}
                              </span>
                            </div>
                          </td>

                          {/* Assigned by */}
                          <td className="px-4 py-3 align-top">
                            <div className="text-sm truncate">
                              {a.assigned_by?.name ?? "—"}
                            </div>
                          </td>

                          {/* Compact Assigned / Due (md only) */}
                          <td className="px-4 py-3 align-top hidden md:table-cell lg:hidden">
                            <div className="text-xs">
                              <div className="truncate">
                                {formatDate(a.assigned_at)}
                              </div>
                              <div
                                className={`text-xs mt-1 ${
                                  overdue
                                    ? "text-rose-600 font-semibold"
                                    : "text-slate-500"
                                }`}
                              >
                                {t.due_date ? formatDate(t.due_date) : "—"}
                              </div>
                            </div>
                          </td>

                          {/* Assigned at (lg) */}
                          <td className="px-4 py-3 align-top hidden lg:table-cell">
                            <div className="text-xs">
                              {formatDate(a.assigned_at)}
                            </div>
                          </td>

                          {/* Due (lg) */}
                          <td className="px-4 py-3 align-top text-right hidden lg:table-cell">
                            <div
                              className={`text-xs ${
                                overdue
                                  ? "text-rose-600 font-semibold"
                                  : "text-slate-600"
                              }`}
                            >
                              {t.due_date ? formatDate(t.due_date) : "—"}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile / small screens: cards */}
            <div className="md:hidden space-y-3">
              {data.last_tasks.map((a) => {
                const t = a.task;
                const overdue =
                  t.due_date &&
                  new Date(t.due_date) < new Date() &&
                  t.status !== "COMPLETED";
                const completed = t.status === "COMPLETED";
                return (
                  <article
                    key={a.assignment_id}
                    className="bg-white p-4 rounded-lg shadow-sm border"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold truncate">
                            {completed ? (
                              <span className="line-through text-slate-400">
                                {t.title}
                              </span>
                            ) : (
                              t.title
                            )}
                          </h3>
                          <div
                            className={`text-xs font-semibold px-2 py-1 rounded ${statusBadge(
                              t.status
                            )}`}
                          >
                            {t.status}
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 mt-2 truncate">
                          {t.description ?? "No description"}
                        </p>

                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                          <div
                            className={`inline-flex items-center gap-2 px-2 py-1 rounded ${priorityBadge(
                              t.priority
                            )}`}
                          >
                            {t.priority ?? "N/A"}
                          </div>
                          <div>• Assigned by {a.assigned_by?.name ?? "—"}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400">
                      <div>Assigned: {formatDate(a.assigned_at)}</div>
                      <div
                        className={overdue ? "text-rose-600 font-semibold" : ""}
                      >
                        Due: {t.due_date ? formatDate(t.due_date) : "—"}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
