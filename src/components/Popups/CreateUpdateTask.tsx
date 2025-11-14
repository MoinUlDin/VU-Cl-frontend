// CreateOrEditTaskModal.tsx
import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import TaskServices from "../../services/TaskServices";
import type { Task } from "../../Types/TaskTypes"; // adjust import path if needed
import toast from "react-hot-toast";

type Props = {
  onClose: () => void;
  /**
   * Called after successful create/update with the saved task object
   */
  onSaved?: () => void;
  /**
   * If provided, modal works in "edit" mode. If not, it's "create" mode.
   */
  initialData?: Task | null;
};

type FormState = {
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | string;
  due_date: string; // ISO string or empty
};

function toInputDatetimeLocal(iso?: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    // produce yyyy-MM-ddTHH:mm string required by input[type=datetime-local]
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  } catch {
    return "";
  }
}

function toIsoFromLocalInput(value: string): string | null {
  if (!value) return null;
  try {
    // value like "2025-11-04T10:30" -> create Date and toISOString
    const d = new Date(value);
    return d.toISOString();
  } catch {
    return null;
  }
}

export default function CreateUpdateTask({
  onClose,
  onSaved,
  initialData,
}: Props): React.ReactElement | null {
  const isEdit = Boolean(initialData && initialData.id);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "PENDING",
    due_date: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // initialize form from initialData or clear for create
    if (initialData) {
      setForm({
        title: initialData.title ?? "",
        description: initialData.description ?? "",
        priority: initialData.priority ?? "MEDIUM",
        status: initialData.status ?? "PENDING",
        due_date: toInputDatetimeLocal(initialData.due_date ?? null),
      });
      setError(null);
    } else {
      setForm({
        title: "",
        description: "",
        priority: "MEDIUM",
        status: "PENDING",
        due_date: "",
      });
      setError(null);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  if (!open) return null;

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  async function handleSubmit(e?: React.FormEvent) {
    console.log("submit Called");
    if (e) e.preventDefault();
    setError(null);

    // basic validation
    if (!form.title || form.title.trim().length < 3) {
      setError("Title is required (min 3 characters).");
      return;
    }

    const payload: Record<string, any> = {
      title: form.title.trim(),
      description: form.description?.trim() || null,
      priority: form.priority,
      status: form.status,
      due_date: toIsoFromLocalInput(form.due_date),
    };

    setLoading(true);
    try {
      if (isEdit && initialData && initialData.id) {
        console.log("ID: ", initialData.id);
        // Update path
        TaskServices.updateTask(initialData.id, payload)
          .then(() => {
            onSaved?.();
            toast.success("Task updated Successfully", { duration: 4000 });
            onClose();
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        // Create path
        TaskServices.createTask(payload)
          .then(() => {
            onSaved?.();
            toast.success("Task created Successfully", { duration: 4000 });
            onClose();
          })
          .catch(() => {});
      }
    } catch (err: any) {
      console.error("Failed to save task", err);
      // prefer server message if available
      const message =
        err?.response?.data?.detail ||
        err?.response?.data ||
        err?.message ||
        "Failed to save task. Please try again.";
      setError(String(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit task" : "Create task"}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl h-[95vh] overflow-auto bg-white rounded-lg shadow-lg"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {isEdit ? "Edit Task" : "Create Task"}
            </h2>
            <p className="text-sm text-slate-500">
              {isEdit
                ? "Update task details and save"
                : "Fill the details to create a new task"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Task title"
              required
              minLength={3}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Optional: describe the task in detail"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Priority
            </label>
            <select
              name="priority"
              value={form.priority}
              onChange={(e) => setField("priority", e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={(e) => setField("status", e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Due date
            </label>
            <input
              type="datetime-local"
              name="due_date"
              value={form.due_date}
              onChange={(e) => setField("due_date", e.target.value)}
              className="w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Optional — leave empty for no deadline
            </p>
          </div>
        </div>

        {error && (
          <div className="px-6">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-md bg-white border border-slate-200 text-sm hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-sky-600 text-white text-sm hover:bg-sky-700 disabled:opacity-60"
          >
            <Check className="w-4 h-4" />
            <span>
              {loading
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                ? "Save changes"
                : "Create task"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
