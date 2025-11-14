// src/pages/dashboards/ManagerDashboard.tsx

export default function ManagerDashboard() {
  const userInfo = JSON.parse(localStorage.getItem("user_info") || "{}");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Manager Dashboard</h1>
      <p className="mt-2">Welcome back, {userInfo?.first_name}!</p>
      <p className="text-gray-500">You are visiting the Manager dashboard.</p>
      <p className="text-gray-500">Page is under construction.</p>
    </div>
  );
}
