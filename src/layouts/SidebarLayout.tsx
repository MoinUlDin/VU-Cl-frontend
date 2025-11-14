// SidebarLayout.tsx
import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Bell, X, Check, Clock, User, LogOut } from "lucide-react";
import NotificationServices from "../services/NotificationServices";
import type { NotificationsType } from "../Types/Notifications";
import { loggedInUser } from "../utils/helpers";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

type Props = {
  children: React.ReactNode;
};

export default function SidebarLayout({ children }: Props) {
  const [noti, setNoti] = useState<NotificationsType[] | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const loggedUser = loggedInUser();
  // unread count derived from notifications
  const unreadCount = (noti || []).reduce(
    (acc, n) => (n.read ? acc : acc + 1),
    0
  );

  // format ISO timestamp to friendly string (today/tomorrow or date + time)
  function formatTime(iso?: string | null) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const diff = Date.now() - d.getTime();
      const minute = 60 * 1000;
      const hour = 60 * minute;
      const day = 24 * hour;

      if (diff < minute) return "just now";
      if (diff < hour) return `${Math.floor(diff / minute)}m`;
      if (diff < day) return `${Math.floor(diff / hour)}h`;
      return d.toLocaleString();
    } catch {
      return String(iso);
    }
  }

  // fetch notifications
  const fetchNotifications = async (): Promise<void> => {
    try {
      const r = await NotificationServices.FetchNotifications();
      setNoti(Array.isArray(r) ? (r as NotificationsType[]) : []);
    } catch (e) {
      console.error("Error Notifications: ", e);
    }
  };

  // initial fetch + polling every 10s (clean up on unmount)
  useEffect(() => {
    fetchNotifications();
    const id = window.setInterval(fetchNotifications, 10_000);
    return () => {
      window.clearInterval(id);
    };
  }, []); // run once

  // close dropdown on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!open) return;
      if (!dropdownRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // close Menue on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuOpen) return;
      if (!menuRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  // mark a single notification as read (optimistic update)
  const handleDelete = (id: string) => {
    if (!id) return toast.error("No id provided");
    NotificationServices.DeleteNotification(id)
      .then(() => {
        toast.success("Notifications Deleted Successfully");
        fetchNotifications();
      })
      .catch(() => {
        toast.error("Error Deleting Notification");
      });
  };
  async function handleMarkRead(id: string) {
    // optimistic UI
    setNoti((prev) =>
      prev ? prev.map((n) => (n.id === id ? { ...n, read: true } : n)) : prev
    );

    try {
      if (typeof (NotificationServices as any).MarkAsRead === "function") {
        await (NotificationServices as any).MarkAsRead(id);
      } else if (
        typeof (NotificationServices as any).markAsRead === "function"
      ) {
        await (NotificationServices as any).markAsRead(id);
      } else {
        // fallback: refetch after a short delay
        await fetchNotifications();
        return;
      }
      // refresh list to get authoritative data
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification read", err);
      // rollback optimistic
      setNoti((prev) =>
        prev ? prev.map((n) => (n.id === id ? { ...n, read: false } : n)) : prev
      );
    }
  }

  // mark all as read
  async function handleMarkAllRead() {
    // optimistic set
    setNoti((prev) => (prev ? prev.map((n) => ({ ...n, read: true })) : prev));
    try {
      if (typeof (NotificationServices as any).MarkAllAsRead === "function") {
        await (NotificationServices as any).MarkAllAsRead();
      } else if (
        typeof (NotificationServices as any).markAllAsRead === "function"
      ) {
        await (NotificationServices as any).markAllAsRead();
      } else {
        // fallback: iterate individual calls if batch not available
        const list = noti || [];
        for (const n of list) {
          try {
            if (!n.read) {
              if (
                typeof (NotificationServices as any).MarkAsRead === "function"
              ) {
                await (NotificationServices as any).MarkAsRead(n.id);
              } else if (
                typeof (NotificationServices as any).markAsRead === "function"
              ) {
                await (NotificationServices as any).markAsRead(n.id);
              }
            }
          } catch (e) {
            console.warn(
              "failed to mark single notification in fallback",
              n.id,
              e
            );
          }
        }
      }
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all notifications read", err);
      // rollback: refetch to be safe
      fetchNotifications();
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar (left) */}
      <Sidebar />

      {/* ================ Main Content (right) ============= */}
      <div className="w-full ml-[56px] md:ml-0">
        {/* Header */}
        <div className="flex border w-full h-18 justify-between items-center px-6 py-3 bg-white">
          <div>
            <h1 className="text-blue-900 sm:hidden font-bold text-sm sm:text-lg md:text-xl">
              Welcome to RBAC
            </h1>
            <h1 className="text-blue-900 hidden sm:block font-bold text-sm sm:text-lg md:text-xl">
              Welcome to Role Based Access Control System
            </h1>
            <p className="text-gray-500 hidden sm:block text-sm sm:text-lg md:text-xl">
              Virtual University of Pakistan
            </p>
            <p className="text-gray-500 sm:hidden text-sm sm:text-lg md:text-xl">
              VU -Pakistan
            </p>
          </div>

          {/* Bell and User main */}
          <div className="flex items-center gap-1">
            <div className="relative mr-6">
              {/* bell button */}
              <button
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={open}
                className="relative p-2 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                title="Notifications"
              >
                <Bell size={20} className="text-slate-700" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 min-w-[20px] h-5 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center px-1.5">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown Notifications*/}
              {open && (
                <div
                  ref={dropdownRef}
                  className="absolute -right-8 md:right-0 mt-2 min-w-[250px] sm:min-w-[350px] md:min-w-[390px] max-w-[92vw] bg-white rounded-lg shadow-lg border overflow-hidden z-50"
                  role="dialog"
                  aria-label="Notifications"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-slate-600" />
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          Notifications
                        </div>
                        <div className="text-xs text-slate-500">
                          {(noti || []).length} total
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs px-2 py-1 bg-sky-50 text-sky-700 rounded hover:bg-sky-100"
                          title="Mark all read"
                          type="button"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        onClick={() => setOpen(false)}
                        className="p-1 rounded hover:bg-slate-100"
                        title="Close"
                      >
                        <X className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-84 overflow-auto">
                    {noti && noti.length === 0 ? (
                      <div className="p-6 text-center text-slate-500">
                        No notifications
                      </div>
                    ) : (
                      <ul className="divide-y">
                        {(noti || []).map((n) => (
                          <li
                            key={String(n.id)}
                            className={`flex gap-3 px-4 py-3 ${
                              n.read ? "bg-white" : "bg-slate-200"
                            }`}
                          >
                            <div className="flex-shrink-0">
                              <div
                                className={`w-10 h-10 rounded-md flex items-center justify-center ${
                                  !n.read
                                    ? "bg-slate-600 border"
                                    : "bg-sky-600 text-white"
                                }`}
                              >
                                {!n.read ? (
                                  <Clock className="w-4 h-4 text-white" />
                                ) : (
                                  <Check className="w-4 h-4 text-white" />
                                )}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-slate-900 truncate">
                                    {n.title}
                                  </div>
                                  <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                                    {n.message}
                                  </div>
                                </div>

                                <div className="text-xs text-slate-400 text-right whitespace-nowrap pl-2">
                                  {formatTime(n.created_at)}
                                </div>
                              </div>

                              <div className="mt-2 flex items-center gap-2">
                                {!n.read && (
                                  <button
                                    onClick={() => handleMarkRead(String(n.id))}
                                    className="text-xs px-2 py-1 bg-sky-50 text-sky-700 rounded hover:bg-sky-100"
                                    type="button"
                                  >
                                    Mark read
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(String(n.id))}
                                  className="text-xs px-2 py-1 bg-sky-50 text-sky-700 rounded hover:bg-sky-100"
                                  type="button"
                                >
                                  Delete
                                </button>
                                <div className="text-xs text-slate-400">
                                  Type: {n.type}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="px-4 py-3 border-t text-xs text-slate-500">
                    Notification data from server — click an item to mark as
                    read.
                  </div>
                </div>
              )}
            </div>
            <div
              onClick={() => setMenuOpen((p) => !p)}
              className="rounded-full relative hover:cursor-pointer"
            >
              {loggedUser?.picture ? (
                <img
                  className="size-8 rounded-full"
                  src={loggedUser?.picture}
                  alt=""
                />
              ) : (
                <User />
              )}

              {/* User Drop Down */}
              {menuOpen && (
                <div
                  className="absolute -right-4 md:right-0 mt-2 min-w-[160px] sm:min-w-[200px] max-w-[92vw] bg-white rounded-lg shadow-lg border overflow-hidden z-50"
                  ref={menuRef}
                >
                  <ul className="space-y-1">
                    <li
                      onClick={() => navigate("/user-profile")}
                      className="px-4 py-3 hover:bg-slate-700 hover:text-white font-semibold flex items-center gap-1"
                    >
                      <User size={14} />
                      Profile
                    </li>
                    <li
                      onClick={handleLogout}
                      className="px-4 py-3 hover:bg-slate-700 hover:text-white font-semibold flex items-center gap-1"
                    >
                      <LogOut size={14} />
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
