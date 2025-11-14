import React, { useEffect, useMemo, useState } from "react";
import TaskServices from "../../services/TaskServices";
import toast from "react-hot-toast";
import { Activity, CheckCircle } from "lucide-react";
import type { membersAssigendtaskType } from "../../Types/TaskTypes";
import ConfirmationModal from "../../components/Popups/ConfirmationModal";

/* ---------- Utilities ---------- */
function formatDate(dateStr?: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString();
}

function isOverdue(task: any) {
  if (!task.due_date) return false;
  const status = (task.status || task.task?.status || "")
    .toString()
    .toLowerCase();
  if (status === "completed") return false;
  return new Date(task.due_date || task.task?.due_date) < new Date();
}

/* ---------- Component: TaskCard ---------- */
function TaskCard({
  task,
  onMarkComplete,
  onStart,
  saving,
}: {
  task: membersAssigendtaskType;
  onMarkComplete: (id: string) => Promise<void>;
  onStart: (id: string) => Promise<void>;
  saving: boolean | { start?: boolean; complete?: boolean };
}) {
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);

  // Normalized status and priority access
  const status = (task.task?.status || "").toString().toUpperCase();
  const completed = status === "COMPLETED";
  const inProgress = status === "IN_PROGRESS";
  const pending = status === "PENDING";
  const overdue = isOverdue(task.task ? task.task : task);

  const priority =
    (task.task?.priority || "").toString().toUpperCase() || "MEDIUM";
  const priorityColor =
    priority === "HIGH"
      ? "bg-red-500"
      : priority === "MEDIUM"
      ? "bg-amber-500"
      : "bg-green-400";

  const onConfirmation = () => {
    onMarkComplete(task.task.id);
    setOpenConfirmation(false);
  };

  return (
    <div
      className={`${
        overdue ? "border-red-400" : ""
      } bg-white border rounded-xl shadow-sm p-5 flex flex-col justify-between min-h-[220px]`}
    >
      <div>
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h3
              className={`text-lg font-semibold text-slate-800 truncate ${
                completed ? "line-through text-slate-400" : ""
              }`}
              title={task.task.title}
            >
              {task.task.title}
            </h3>
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">
              {task.task.description || "No description"}
            </p>
          </div>

          <div className="flex flex-col gap-2 justify-center items-end">
            <div
              className={`px-2 py-1 rounded text-xs font-semibold text-white ${priorityColor} self-start`}
            >
              {priority}
            </div>

            <div
              className={`text-xs py-0.5 px-2 rounded text-center flex gap-1 items-center ${
                completed
                  ? "bg-green-400 text-white"
                  : overdue
                  ? "bg-rose-200 text-rose-700"
                  : inProgress
                  ? "bg-sky-100 text-sky-700"
                  : "bg-gray-100 text-slate-700"
              }`}
              title={`Status: ${status}${overdue ? " (Overdue)" : ""}`}
            >
              {completed && <CheckCircle size={14} />}
              <span className="font-medium">
                {completed
                  ? "Completed"
                  : overdue
                  ? "Overdue"
                  : inProgress
                  ? "In Progress"
                  : "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* meta row */}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <div className="text-sm text-slate-700 truncate">
                {task.user_name}
              </div>
              <div className="text-xs text-slate-400">
                By: {task.assigned_by?.name ?? "—"}
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-400 text-right">
            <div>
              Due:{" "}
              <span
                className={`${overdue ? "text-red-500 font-semibold" : ""}`}
              >
                {formatDate(task.task.due_date)}
              </span>
            </div>
            <div className="mt-1">At: {formatDate(task.task.created_at)}</div>
          </div>
        </div>
      </div>

      {/* bottom row: actions */}
      <div className="mt-4 flex items-center justify-end gap-3">
        {/* If pending -> show Start button */}
        {pending && !completed && !inProgress && (
          <button
            onClick={() => onStart(task.task.id)}
            disabled={Boolean((saving as any)?.start)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 disabled:opacity-60"
            title="Start Task"
          >
            <Activity size={14} />
            Start
          </button>
        )}

        {/* If in progress -> allow mark complete */}
        {inProgress && !completed && (
          <button
            onClick={() => setOpenConfirmation(true)}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
            title="Mark Complete"
            disabled={Boolean((saving as any)?.complete)}
          >
            <CheckCircle size={16} /> Mark Complete
          </button>
        )}

        {completed && (
          <div className="inline-flex items-center gap-2 bg-green-400 text-white px-3 py-1 rounded-md text-sm">
            Completed
          </div>
        )}
      </div>

      {openConfirmation && (
        <ConfirmationModal
          onCancel={() => setOpenConfirmation(false)}
          text="Are you sure you want to mark as Completed?"
          onConfirm={onConfirmation}
        />
      )}
    </div>
  );
}

/* ---------- Main page component ---------- */
export default function MemberTaskPage() {
  const [tasks, setTasks] = useState<membersAssigendtaskType[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<
    "all" | "completed" | "in_progress" | "pending" | "overdue"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "HIGH" | "MEDIUM" | "LOW"
  >("all");
  const [search, setSearch] = useState<string>("");
  const [savingMap, setSavingMap] = useState<
    Record<string, { start?: boolean; complete?: boolean }>
  >({});

  useEffect(() => {
    loadTasks();
  }, []);

  function loadTasks() {
    setLoading(true);
    TaskServices.fetchMembersTasks()
      .then((r) => {
        setTasks(Array.isArray(r) ? r : []);
      })
      .catch((e) => {
        console.error(e);
        toast.error("Failed to load tasks");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(
      (t) => (t.task.status || "").toString().toLowerCase() === "completed"
    ).length;
    const inProgress = tasks.filter(
      (t) => (t.task.status || "").toString().toLowerCase() === "in_progress"
    ).length;
    const overdue = tasks.filter((t) => {
      const due = t.task?.due_date;
      if (!due) return false;
      const s = (t.task.status || "").toString().toLowerCase();
      return s !== "completed" && new Date(due) < new Date();
    }).length;
    const pending = total - completed - inProgress;
    return { total, completed, inProgress, overdue, pending };
  }, [tasks]);

  async function handleMarkComplete(id: string) {
    const prev = tasks.slice();
    setSavingMap((m) => ({ ...m, [id]: { ...(m[id] || {}), complete: true } }));
    try {
      await TaskServices.updateMembersTasks(id, {
        status: "COMPLETED",
      });
      toast.success("Task marked complete");
      loadTasks();
    } catch (err) {
      console.error(err);
      setTasks(prev);
      toast.error("Failed to mark complete");
    } finally {
      setSavingMap((m) => ({
        ...m,
        [id]: { ...(m[id] || {}), complete: false },
      }));
    }
  }

  async function handleStartTask(id: string) {
    const prev = tasks.slice();
    setSavingMap((m) => ({ ...m, [id]: { ...(m[id] || {}), start: true } }));
    try {
      await TaskServices.updateMembersTasks(id, {
        status: "IN_PROGRESS",
      });
      toast.success("Task started");
      loadTasks();
    } catch (err) {
      console.error(err);
      setTasks(prev);
      toast.error("Failed to start task");
    } finally {
      setSavingMap((m) => ({ ...m, [id]: { ...(m[id] || {}), start: false } }));
    }
  }

  const filteredTasks = tasks.filter((t) => {
    const status = (t.task.status || "").toString().toLowerCase();
    // status filter
    if (filter === "completed" && status !== "completed") return false;
    if (filter === "in_progress" && status !== "in_progress") return false;
    if (filter === "pending" && status !== "pending") return false;
    if (filter === "overdue") {
      const due = t.task?.due_date;
      if (!due) return false;
      if (status === "completed") return false;
      if (new Date(due) >= new Date()) return false;
    }

    // priority filter
    if (
      priorityFilter !== "all" &&
      (t.task.priority || "").toString().toUpperCase() !== priorityFilter
    ) {
      return false;
    }

    // search by title
    if (
      search &&
      !(t.task.title || "").toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* header */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-emerald-700">My Tasks</h1>
          <p className="text-sm text-slate-500">
            Manage your assigned tasks and track progress
          </p>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Tasks" value={stats.total} />
          <StatCard label="Completed" value={stats.completed} />
          <StatCard label="In Progress" value={stats.inProgress} />
          <StatCard label="Overdue" value={stats.overdue} />
        </div>

        {/* filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="border rounded px-3 py-2 text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="pl-3 pr-3 py-2 border rounded text-sm w-full md:w-72"
            />
          </div>

          <div className="text-sm text-slate-500">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
        </div>

        {/* tasks grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-slate-500 py-10">
              Loading tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="col-span-full text-center text-slate-500 py-10">
              No tasks found.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onMarkComplete={handleMarkComplete}
                onStart={handleStartTask}
                saving={savingMap[task.task.id] || {}}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- small StatCard helper ---------- */
function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="text-2xl font-bold text-slate-800 mt-2">{value}</div>
    </div>
  );
}
