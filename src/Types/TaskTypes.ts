// TaskTypes.ts

export type Role = "Admin" | "Manager" | "Member";

export type UserLite = {
  id: 3;
  name: string;
  username: string;
  email: string;
};

export type AssignmentLite = {
  id: 1;
  task: "36cd6150-4050-4c1b-b461-1e8adb75c266";
  user: "Moin User1";
  assigned_by: 2;
  assigned_at: "2025-11-04T12:37:45.143971Z";
  role_at_assignment: null;
  user_id: 3;
  user_name: "Member1";
};

export type Task = {
  id: string;
  title?: string | null;
  description?: string | null;
  priority?: "LOW" | "MEDIUM" | "HIGH" | string;
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | string;
  due_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  completed_at?: string | null;
  created_by?: UserLite | null;
  is_deleted?: boolean;
  meta?: any;
  assignee?: UserLite;
  files?: any[];
  comments?: any[];
};

// members assigned Task
export interface taskShortType {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  created_at: string | null;
}
export interface membersAssigendtaskType {
  id: number;
  task: taskShortType;
  user: string;
  assigned_by: UserLite;
  assigned_at: string;
  role_at_assignment: null;
  user_id: number;
  user_name: string;
  user_email: string;
}
