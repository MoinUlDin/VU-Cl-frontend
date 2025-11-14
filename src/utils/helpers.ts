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
