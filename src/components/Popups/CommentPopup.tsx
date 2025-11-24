import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import TaskServices from "../../services/TaskServices";
import type { taskShortType } from "../../Types/TaskTypes";
import type { Task } from "../../Types/TaskTypes";
import toast from "react-hot-toast";

interface Props {
  onClose: () => void;
  task: taskShortType | Task;
}

interface Author {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  email?: string;
}

interface CommentType {
  id: string;
  task: string;
  author: Author;
  content: string;
  created_at: string;
  edited_at?: string | null;
  parent?: string | null;
  is_deleted: boolean;
  meta?: any;
  self?: boolean; // optional, API may provide it
}

function getCurrentUserId(): string | null {
  try {
    const u = localStorage.getItem("user");
    if (!u) return null;
    return JSON.parse(u).id;
  } catch {
    return null;
  }
}

export default function CommentPopup({ onClose, task }: Props) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const id = task?.id;
  const intervalRef = useRef<number | null>(null);
  const currentUserId = getCurrentUserId();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // keep focus on textarea when modal opens
  useEffect(() => {
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, []);

  // lock body scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const load = async () => {
    if (!id) return;

    try {
      // TaskServices.FetchComments should call /comments/by-task/{id}/
      const res = await TaskServices.FetchComments(id);
      const data = res?.data ?? res;
      setComments(data);
    } catch (e) {
      console.error("Fetch comments error:", e);
      toast.error("Unable to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
    // refresh every 10s
    intervalRef.current = window.setInterval(() => {
      load();
    }, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id]);

  const post = async () => {
    if (!id) return toast.error("Task ID missing");
    if (!newComment.trim()) return toast.error("Please enter a comment");
    setPosting(true);
    try {
      const payload = { task: id, content: newComment.trim(), parent: null };
      await TaskServices.PostComment(payload);
      setNewComment("");
      await load(); // refresh after posting
    } catch (err) {
      console.error("Post comment error:", err);
      toast.error("Unable to post comment");
    } finally {
      setPosting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      post();
    }
  };

  // render modal into portal (create a simple container if not present)
  const modalRootId = "comment-popup-root";
  useEffect(() => {
    let root = document.getElementById(modalRootId);
    if (!root) {
      root = document.createElement("div");
      root.id = modalRootId;
      document.body.appendChild(root);
    }
  }, []);

  const modalContent = (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal box */}
      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-slate-800">
            <h3 className="text-lg font-semibold">
              Comments — {task?.title ?? "Task"}
            </h3>
            <div className="flex items-center gap-2">
              {/* Optionally show diagram icon / preview */}
              <button
                type="button"
                title="Close"
                onClick={onClose}
                className="rounded px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 flex-1 overflow-hidden flex flex-col gap-3">
            <div className="flex-1 overflow-y-auto rounded border p-2 bg-gray-50 dark:bg-slate-800">
              {loading ? (
                <div className="text-center text-sm text-gray-500">
                  Loading comments...
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center text-sm text-gray-500">
                  No comments yet. Be the first to comment.
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {comments.map((c) => {
                    const isSelf =
                      c.self ??
                      (c.author && c.author.id === currentUserId) ??
                      false;
                    return (
                      <li
                        key={c.id}
                        className={`flex items-start gap-3 ${
                          isSelf ? "justify-end" : "justify-start"
                        }`}
                      >
                        {/* avatar (left for others) */}
                        {!isSelf && (
                          <div className="shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-slate-700 flex items-center justify-center text-sm font-medium text-gray-800">
                              {c.author?.first_name
                                ? c.author.first_name[0].toUpperCase()
                                : c.author?.username?.[0]?.toUpperCase() ?? "U"}
                            </div>
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] ${
                            isSelf ? "text-right" : "text-left"
                          }`}
                        >
                          <div
                            className={`inline-block px-4 py-2 rounded-lg break-words ${
                              isSelf
                                ? "bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200"
                                : "bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100"
                            }`}
                            style={{ wordBreak: "break-word" }}
                          >
                            <div className="text-sm font-medium">
                              {c.author?.first_name ||
                                c.author?.username ||
                                "Unknown User"}
                              <span className="ml-2 text-xs text-gray-400">
                                {new Date(c.created_at).toLocaleString()}
                              </span>
                            </div>
                            <div className="mt-1 text-sm">{c.content}</div>
                          </div>
                        </div>

                        {/* avatar on right for self */}
                        {isSelf && (
                          <div className="shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-slate-700 flex items-center justify-center text-sm font-medium text-gray-800">
                              {c.author?.first_name
                                ? c.author.first_name[0].toUpperCase()
                                : c.author?.username?.[0]?.toUpperCase() ?? "U"}
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Input area */}
            <div className="flex flex-col sm:flex-row gap-2 items-end">
              <textarea
                ref={textareaRef}
                className="flex-1 p-3 rounded border resize-none min-h-[80px] focus:outline-none focus:ring dark:bg-slate-900 dark:border-slate-800"
                placeholder="Write a comment... (Ctrl/Cmd+Enter to send)"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={post}
                  disabled={posting}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {posting ? "Posting..." : "Send"}
                </button>
              </div>
            </div>
          </div>

          {/* Footer (optional small hint) */}
          <div className="px-4 py-2 text-xs text-gray-500 border-t dark:border-slate-800">
            Tip: Press{" "}
            <kbd className="px-1 rounded bg-gray-100 dark:bg-slate-700">
              Ctrl
            </kbd>
            /
            <kbd className="px-1 rounded bg-gray-100 dark:bg-slate-700">
              Cmd
            </kbd>{" "}
            +{" "}
            <kbd className="px-1 rounded bg-gray-100 dark:bg-slate-700">
              Enter
            </kbd>{" "}
            to send.
          </div>
        </div>
      </div>
    </div>
  );

  const root = document.getElementById(modalRootId);
  return root ? createPortal(modalContent, root) : null;
}
