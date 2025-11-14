// AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  Users,
  ClipboardList,
  TrendingUp,
  Activity,
  Search,
  MoreHorizontal,
  User,
  Briefcase,
} from "lucide-react";

import DashboardsReportServices from "../../services/DashboardsReportServices";
import { loggedInUser } from "../../utils/helpers";

// --- TYPES ---
interface UserSummary {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: "Member" | "Manager";
  active_user: boolean;
  total_tasks: number;
  completed: number;
  performance: number;
}

interface DashboardData {
  user_count: number;
  active_users: number;
  tasks_count: number;
  completed_count: number;
  users_summary: UserSummary[];
}

// --- UI pieces ---

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  theme: "blue" | "green" | "purple" | "orange";
  children?: React.ReactNode;
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  theme,
  children,
}) => {
  const themeClasses = {
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    green: { bg: "bg-green-50", text: "text-green-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
    orange: { bg: "bg-orange-50", text: "text-orange-600" },
  } as const;
  const cardBackground = {
    blue: { bg: "from-blue-100 to-blue-200" },
    green: { bg: "from-green-100 to-green-200" },
    purple: { bg: "from-purple-100 to-purple-200" },
    orange: { bg: "from-orange-100 to-orange-200" },
  };
  const cardbg = cardBackground[theme];
  const currentTheme = themeClasses[theme];

  return (
    <div
      className={`w-full bg-gradient-to-r ${cardbg.bg} rounded-xl shadow-sm p-4 flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs text-gray-500 truncate">{title}</div>
          <div className="text-2xl md:text-3xl font-semibold text-gray-900 mt-1">
            {value}
          </div>
        </div>
        <div
          className={`p-2 rounded-full ${currentTheme.bg} flex items-center justify-center`}
        >
          {React.cloneElement(icon, {
            className: `size-3 sm:size-4 md:size-5 ${currentTheme.text}`,
          })}
        </div>
      </div>

      {children ? (
        <div className="mt-3 text-sm text-gray-600">{children}</div>
      ) : null}
    </div>
  );
};

const RoleBadge: React.FC<{ role: "Manager" | "Member" }> = ({ role }) => {
  return (
    <span
      className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
        role === "Manager"
          ? "bg-indigo-100 text-indigo-800"
          : "bg-gray-100 text-gray-800"
      }`}
    >
      {role === "Manager" ? (
        <Briefcase className="w-3 h-3" />
      ) : (
        <User className="w-3 h-3" />
      )}
      {role}
    </span>
  );
};

const InlineStatus: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="inline-flex items-center gap-2 text-sm">
    <span
      className={`w-2 h-2 rounded-full ${
        active ? "bg-emerald-500" : "bg-rose-500"
      }`}
    />
    <span
      className={`text-sm ${active ? "text-emerald-700" : "text-rose-700"}`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  </div>
);

const ProgressBarCompact: React.FC<{ value: number }> = ({ value }) => {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-2 bg-emerald-500 transition-all"
        style={{ width: `${safe}%` }}
      />
    </div>
  );
};

// --- main component ---

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");
  const user_info = loggedInUser();

  useEffect(() => {
    console.log("role: ", user_info);

    setLoading(true);
    DashboardsReportServices.AdminDashboard()
      .then((r: DashboardData) => {
        setDashboardData(r);
        console.log("admin Dash Data: ", r);
      })
      .catch((e) => {
        console.error(e);
        setError("Failed to load dashboard data. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-lg text-gray-600">Loading Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-lg text-gray-600">No data available.</div>
      </div>
    );
  }

  const {
    user_count,
    active_users,
    tasks_count,
    completed_count,
    users_summary,
  } = dashboardData;
  const managers = users_summary.filter((u) => u.role === "Manager").length;
  const members = users_summary.filter((u) => u.role === "Member").length;
  const completionRate =
    tasks_count > 0 ? Math.round((completed_count / tasks_count) * 100) : 0;

  // client-side filter for users
  const filteredUsers = users_summary.filter((u) => {
    if (!query) return true;
    const q = query.trim().toLowerCase();
    return (
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      (u.username || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {user_info?.role === "Admin"
              ? "Admin Dashboard"
              : "Manager Dashboard"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage users and monitor system performance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10 pr-3 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Users"
          value={String(user_count)}
          icon={<Users />}
          theme="blue"
        >
          <div className="text-sm text-gray-700">
            {managers} Managers • {members} Members
          </div>
        </StatCard>

        <StatCard
          title="Total Tasks"
          value={String(tasks_count)}
          icon={<ClipboardList />}
          theme="green"
        >
          <div className="text-sm text-gray-700">
            {completionRate}% completion rate
          </div>
        </StatCard>

        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={<TrendingUp />}
          theme="purple"
        >
          <div className="text-sm text-gray-700">
            {completed_count} of {tasks_count} tasks completed
          </div>
        </StatCard>

        <StatCard
          title="Active Users"
          value={String(active_users)}
          icon={<Activity />}
          theme="orange"
        >
          <div className="text-sm text-gray-700">
            {active_users} users currently active
          </div>
        </StatCard>
      </div>

      {/* User management - show cards on small screens, table on md+ */}
      <div className="space-y-4">
        {/* Mobile Screens */}
        <div className="block lg:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-10 pr-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Mobile list (cards) */}
        <div className="grid gap-3 lg:hidden">
          {filteredUsers.length === 0 ? (
            <div className="text-center text-gray-600 p-6 bg-white rounded-lg shadow-sm">
              No users found.
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u.email}
                className="bg-white rounded-lg shadow-sm p-4 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="hidden sm:flex size-12 text-sm rounded-full bg-gray-100  items-center justify-center text-gray-700 font-semibold">
                    {(u.first_name?.[0] ?? "") + (u.last_name?.[0] ?? "")}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate text-xs">
                      {u.first_name} {u.last_name}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {u.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col sm:flex-row items-center gaps-2 sm:gap-3">
                    <RoleBadge role={u.role} />
                    <InlineStatus active={u.active_user} />
                  </div>

                  <div className="text-sm text-gray-600">
                    {u.completed} / {u.total_tasks}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-700 mb-2">Performance</div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs sm:text-sm font-medium text-gray-700 w-12">
                      {u.performance}%
                    </div>
                    <div className="flex-1 min-w-1">
                      <ProgressBarCompact value={u.performance} />
                    </div>
                    <button className="ml-2 p-2 rounded hover:bg-gray-100 text-gray-500">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                User Management
              </h2>
              <div className="text-sm text-gray-500">
                {filteredUsers.length} users
              </div>
            </div>
          </div>

          <div className="p-4 overflow-x-auto">
            {" "}
            {/* overflow-x-auto only as fallback but content will not overflow */}
            <table className="w-full table-auto">
              <thead className="text-xs text-gray-600 uppercase tracking-wide">
                <tr>
                  <th className="py-3 text-left">User</th>
                  <th className="py-3 text-left">Role</th>
                  <th className="py-3 text-left">Status</th>
                  <th className="py-3 text-left">Tasks</th>
                  <th className="py-3 text-left">Performance</th>
                  <th className="py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((u) => (
                  <tr key={u.email} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-semibold">
                          {(u.first_name?.[0] ?? "") + (u.last_name?.[0] ?? "")}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {u.first_name} {u.last_name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <RoleBadge role={u.role} />
                    </td>

                    <td className="py-3">
                      <InlineStatus active={u.active_user} />
                    </td>

                    <td className="py-3 text-sm text-gray-700">
                      {u.completed} / {u.total_tasks}
                    </td>

                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-gray-700 w-12">
                          {u.performance}%
                        </div>
                        <div className="w-full max-w-[160px]">
                          <ProgressBarCompact value={u.performance} />
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <button className="p-2 rounded hover:bg-gray-100 text-gray-500">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-600">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
