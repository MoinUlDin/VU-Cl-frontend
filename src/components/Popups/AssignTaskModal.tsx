// AssignTaskModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { X, Check, UserPlus, Search } from "lucide-react";
import toast from "react-hot-toast";
import TaskServices from "../../services/TaskServices";
import UserManagerment from "../../services/UserManagerment";
import type { Task } from "../../Types/TaskTypes";
import type { MembersTypes } from "../../Types/MembersTypes";

type Props = {
  task: Task | null;
  onClose: () => void;
  onSaved?: () => void;
};

export default function AssignTaskModal({
  task,
  onClose,
  onSaved,
}: Props): React.ReactElement | null {
  const [members, setMembers] = useState<MembersTypes[]>([]);
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [loadingMembers, setLoadingMembers] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Initialize selectedId from task.assignee (new payload shape)
  useEffect(() => {
    if (!task) {
      setSelectedId(null);
      return;
    }
    setSelectedId(task.assignee?.id ?? null);
  }, [task]);

  // Load members
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoadingMembers(true);
      setError(null);
      try {
        const res = await UserManagerment.FetchMembers();
        if (!mounted) return;
        setMembers(Array.isArray(res) ? (res as MembersTypes[]) : []);
        console.log("MEmbers :", res);
      } catch (err) {
        console.error("Failed to load members", err);
        setError("Failed to load members. Try again later.");
        setMembers([]);
      } finally {
        if (mounted) setLoadingMembers(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      const name = (m.first_name ?? "").toLowerCase();
      const email = (m.email ?? "").toLowerCase();
      const id = String(m.id);
      return name.includes(q) || email.includes(q) || id.includes(q);
    });
  }, [members, search]);

  function choose(id: number | string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  async function handleSave() {
    if (!task) {
      setError("No task selected.");
      return;
    }

    setSaving(true);
    setError(null);

    // backend now expects single assignee field `assignee_id` (or null to unassign)
    const payload = { assignee_id: selectedId };

    try {
      // prefer dedicated assignTask if available; otherwise patch task
      if (typeof (TaskServices as any).assignTask === "function") {
        await (TaskServices as any).assignTask(task.id, payload);
      } else if (typeof (TaskServices as any).updateTask === "function") {
        await (TaskServices as any).updateTask(task.id, payload);
      } else {
        throw new Error("No assign API found on TaskServices.");
      }

      toast.success("Assignment updated");
      if (onSaved) onSaved();
      onClose();
    } catch (err: any) {
      console.error("Failed to save assignment", err);
      const message =
        err?.response?.data?.detail || err?.message || "Failed to assign task";
      setError(String(message));
      toast.error(String(message));
    } finally {
      setSaving(false);
    }
  }

  if (!task) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Assign task ${task.title ?? ""}`}
    >
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-slate-600" />
              Assign Task
            </h3>
            <p className="text-sm text-slate-500">
              Task: <span className="font-medium">{task.title}</span>
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center w-9 h-9 rounded hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-2 flex-1 rounded-md border border-slate-200 px-3 py-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  className="w-full outline-none text-sm"
                  placeholder="Search members by name, email or id"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="h-72 overflow-auto border rounded-md border-slate-100">
              {loadingMembers ? (
                <div className="p-6 text-center text-slate-500">
                  Loading members…
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">
                  No members found.
                </div>
              ) : (
                <ul>
                  {filtered.map((m) => {
                    const id = m.id;
                    const checked = selectedId === id;
                    return (
                      <li
                        key={String(id)}
                        className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 cursor-pointer"
                        onClick={() => choose(id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-medium">
                            {String(m.first_name ?? String(m.id))
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate">
                              {m.first_name ?? `User ${m.id}`}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {m.email ?? m.role ?? ""}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            id={`member-${id}`}
                            type="radio"
                            name="assignee"
                            checked={checked}
                            onChange={() => setSelectedId(id)}
                            className="w-4 h-4"
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="md:col-span-1 border-l pl-4">
            <div className="text-sm text-slate-600 mb-3">Selected</div>

            <div className="mb-3">
              <div className="text-2xl font-semibold text-slate-800">
                {selectedId ? 1 : 0}
              </div>
              <div className="text-xs text-slate-400">member selected</div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-medium text-slate-700">
                Current assignee
              </div>
              <div className="mt-2 text-sm text-slate-600">
                {task.assignee ? (
                  <span>
                    {task.assignee.name ??
                      task.assignee.username ??
                      `User ${task.assignee.id}`}
                  </span>
                ) : (
                  <span className="italic text-slate-400">Unassigned</span>
                )}
              </div>
            </div>

            <div className="mt-auto flex flex-col gap-2">
              {error && <div className="text-sm text-red-600">{error}</div>}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? "Saving…" : "Save assignment"}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-white border border-slate-200 text-sm hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
