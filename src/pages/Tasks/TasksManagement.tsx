// TasksManagement.tsx
import { useEffect, useState, type JSX } from "react";
import {
  Edit2,
  Trash2,
  UserPlus,
  PlusCircle,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import TaskServices from "../../services/TaskServices";
import type { Task } from "../../Types/TaskTypes";
import CreateUpdateTask from "../../components/Popups/CreateUpdateTask";
import AssignTaskModal from "../../components/Popups/AssignTaskModal";

export default function TasksManagement(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [openCreate, setOpenCreate] = useState<boolean>(false);
  const [openAssign, setOpenAssign] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [initialData, setInitialData] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const res = await TaskServices.FetchTasks();
      setTasks(Array.isArray(res) ? (res as Task[]) : []);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      setError("Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh(): Promise<void> {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  }

  const formatDate = (iso?: string | null): string => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return String(iso);
    }
  };

  const getInitials = (name?: string | null): string => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return ((parts[0][0] || "") + (parts[1][0] || "")).toUpperCase();
  };

  const priorityBadge = (p?: string) => {
    switch (p) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statusColor = (s?: string) => {
    switch (s) {
      case "PENDING":
        return "text-yellow-600";
      case "IN_PROGRESS":
        return "text-blue-600";
      case "COMPLETED":
        return "text-green-600";
      case "CANCELLED":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const onCreate = () => {
    setInitialData(null);
    setOpenCreate(true);
  };
  const onEdit = (data: Task) => {
    setInitialData(data);
    setOpenCreate(true);
  };
  const onAssign = (data: Task) => {
    setSelectedTask(data);
    setOpenAssign(true);
  };
  const onComment = (data: Task) => {
    // placeholder: currently does nothing (component will be added later)
    // keep selectedTask in case parent wants to use later
    setSelectedTask(data);
  };

  return (
    <div className="max-w-7xl mx-auto p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Tasks</h1>
          <p className="text-sm text-slate-500">
            All tasks visible to you. Click actions to manage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-md shadow-sm text-sm text-slate-700 hover:bg-slate-50"
            aria-label="Refresh"
            title="Refresh"
            type="button"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-3 py-2 bg-sky-600 text-white rounded-md shadow-sm text-sm hover:bg-sky-700"
            aria-label="Create Task"
            title="Create Task"
            type="button"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Desktop / Large screens: use a table (md+) */}
      <div className="hidden md:block bg-white border border-slate-100 rounded-lg shadow-sm overflow-hidden">
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed px-2">
            <colgroup>
              <col className="w-[120%] lg:w-[60%]" />
              <col style={{ width: "14%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>

            <thead className="bg-slate-50 text-sm text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Task</th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 text-left hidden lg:table-cell">
                  Assignee
                </th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="text-sm text-slate-700 divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Loading tasks…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-red-600"
                  >
                    {error}
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No tasks found.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50">
                    {/* Task cell */}
                    <td className="px-4 py-4 align-top">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold">
                            {getInitials(
                              task.title ?? task.created_by?.username ?? "T"
                            )}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-slate-900 truncate">
                              {task.title}
                            </div>
                            <div className="text-xs text-slate-400">•</div>
                            <div className="text-xs text-slate-500">
                              {formatDate(task.created_at)}
                            </div>
                          </div>

                          <div className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {task.description ?? (
                              <span className="italic text-slate-400">
                                No description
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex items-center gap-3">
                            <div
                              className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs ${priorityBadge(
                                task.priority
                              )}`}
                            >
                              <span className="font-medium">
                                {task.priority ?? "N/A"}
                              </span>
                            </div>

                            <div className="text-xs flex items-center gap-2">
                              <span
                                className={`${statusColor(
                                  task.status
                                )} font-medium`}
                              >
                                {task.status ?? "—"}
                              </span>
                            </div>

                            <div className="text-xs text-slate-400">
                              Created by: {task.created_by?.username ?? "—"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status cell (hidden on smaller desktop widths if desired) */}
                    <td className="px-4 py-4 align-top hidden lg:table-cell">
                      <div
                        className={`${statusColor(task.status)} font-medium`}
                      >
                        {task.status}
                      </div>
                    </td>

                    {/* Assignee */}
                    <td className="px-4 py-4 align-top hidden lg:table-cell">
                      {task.assignee ? (
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-700 border border-white">
                            {getInitials(task.assignee.username)}
                          </div>
                          <div className="text-sm truncate">
                            {task.assignee.username}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-slate-400 italic">
                          Unassigned
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-2 align-top text-right">
                      <div className="inline-flex items-center gap-1">
                        {task.status !== "COMPLETED" &&
                          task.status !== "IN_PROGRESS" && (
                            <button
                              onClick={() => onAssign(task)}
                              title="Assign"
                              className="p-0.5 rounded hover:bg-slate-100 text-slate-600"
                              type="button"
                            >
                              <UserPlus size={16} />
                            </button>
                          )}

                        {task.status !== "COMPLETED" && (
                          <button
                            onClick={() => onEdit(task)}
                            title="Edit"
                            className="p-0.5 rounded hover:bg-slate-100 text-slate-600"
                            type="button"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => onComment(task)}
                          title="Comment"
                          className="p-0.5 rounded hover:bg-slate-100 text-slate-600"
                          type="button"
                        >
                          <MessageSquare size={16} />
                        </button>

                        <button
                          // onClick={() => onDelete && onDelete(task)}
                          title="Delete"
                          className="p-0.5 rounded hover:bg-slate-100 text-slate-600 hover:text-red-600"
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile / tablet: card view */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading tasks…</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : tasks.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No tasks found.</div>
        ) : (
          tasks.map((task) => (
            <article
              key={task.id}
              className="bg-white rounded-lg shadow p-4 border"
            >
              <div className="flex items-start gap-1 sm:gap-3">
                <div className="size-8 sm:size-12 text-xs sm:text-sm rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-semibold flex-shrink-0">
                  {getInitials(task.title ?? task.created_by?.username ?? "T")}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                      {task.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2">
                    {task.description ?? (
                      <span className="italic text-slate-400">
                        No description
                      </span>
                    )}
                  </p>
                  <div className="mt-3 text-[10px] sm:text-xs text-slate-400">
                    Due:{" "}
                    <span className="font-medium">
                      {formatDate(task.due_date)}
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-500">
                    Created: {formatDate(task.created_at)}
                  </div>

                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-full">
                      <div
                        className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${priorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </div>
                      <div
                        className={`text-[10px] sm:text-xs ${statusColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-400">
                        By {task.created_by?.username ?? "—"}
                      </div>
                    </div>

                    {/* actions */}
                    <div className="flex items-center gap-2 w-full">
                      {task.status !== "COMPLETED" &&
                        task.status !== "IN_PROGRESS" && (
                          <button
                            onClick={() => onAssign(task)}
                            className="p-2 rounded hover:bg-slate-100 text-slate-600"
                            title="Assign"
                            type="button"
                          >
                            <UserPlus size={16} />
                          </button>
                        )}
                      {task.status !== "COMPLETED" && (
                        <button
                          onClick={() => onEdit(task)}
                          className="p-2 rounded hover:bg-slate-100 text-slate-600"
                          title="Edit"
                          type="button"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => onComment(task)}
                        className="p-2 rounded hover:bg-slate-100 text-slate-600"
                        title="Comment"
                        type="button"
                      >
                        <MessageSquare size={16} />
                      </button>

                      <button
                        className="p-2 rounded hover:bg-slate-100 text-slate-600"
                        title="Delete"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {openCreate && (
        <CreateUpdateTask
          onSaved={fetchTasks}
          initialData={initialData}
          onClose={() => setOpenCreate(false)}
        />
      )}
      {openAssign && selectedTask && (
        <AssignTaskModal
          task={selectedTask}
          onClose={() => {
            setOpenAssign(false);
            setSelectedTask(null);
          }}
          onSaved={() => {
            fetchTasks();
            setOpenAssign(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
}
