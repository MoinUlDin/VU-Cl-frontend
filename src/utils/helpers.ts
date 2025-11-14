//  utils/helpers.ts
export interface SavedUserInfoType {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: null | string;
  employee_number: string;
  picture: string | null;
  is_active: boolean;
  approved: boolean;
}
export function loggedInUser() {
  const raw = localStorage.getItem("user_info");
  if (!raw) return null;
  const user: SavedUserInfoType = JSON.parse(raw);
  if (user) return user;
  return null;
}

export const formatDate = (iso?: string | null): string => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return String(iso);
  }
};

export const getInitials = (name?: string | null): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return ((parts[0][0] || "") + (parts[1][0] || "")).toUpperCase();
};

export const priorityBadge = (p?: string) => {
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

export const statusColor = (s?: string) => {
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
