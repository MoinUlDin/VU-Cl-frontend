// src/pages/ProfilePage.tsx
import React, { useEffect, useState } from "react";
import {
  Edit2,
  Save,
  Key,
  Camera,
  Trash2,
  LogOut,
  Check,
  X,
  Eye,
  EyeClosed,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";
import UserManagerment from "../../services/UserManagerment";

type UserInfo = {
  id?: number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  department?: string | null;
  employee_number?: string | null;
  picture?: string | null;
  is_active?: boolean;
  approved?: boolean;
};

export default function ProfilePage(): React.ReactElement {
  // load from localStorage (the user said profile is in user_info)
  const raw = localStorage.getItem("user_info");
  const initialUser: UserInfo = raw ? JSON.parse(raw) : {};

  const [user, setUser] = useState<UserInfo>(initialUser);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [showPass, setShowPass] = useState<boolean>(false);
  // picture upload preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialUser.picture ?? null
  );

  // change password modal
  const [pwOpen, setPwOpen] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [pwSaving, setPwSaving] = useState<boolean>(false);

  useEffect(() => {
    // update preview when file selected
    if (!selectedFile) return;
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  // helpers
  function handleInput<K extends keyof UserInfo>(
    key: K,
    value: UserInfo[K]
  ): void {
    setUser((u) => ({ ...u, [key]: value }));
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setSelectedFile(f);
    }
  }

  async function handleSaveProfile() {
    setSaving(true);
    try {
      // build payload; if photo selected use FormData
      let resData;
      if (selectedFile) {
        const form = new FormData();
        form.append("first_name", user.first_name ?? "");
        form.append("last_name", user.last_name ?? "");
        form.append("department", user.department ?? "");
        form.append("employee_number", user.employee_number ?? "");
        form.append("picture", selectedFile);
        // your service should accept multipart/form-data
        resData = await UserManagerment.updateProfile(form);
      } else {
        // json payload
        const payload = {
          first_name: user.first_name,
          last_name: user.last_name,
          department: user.department,
          employee_number: user.employee_number,
        };
        resData = await UserManagerment.updateProfile(payload);
      }

      // optimistic update: update local state + localStorage
      const updatedUser = {
        ...user,
        ...(resData ?? {}),
        // if response includes picture path, use it
        picture: resData?.picture ?? previewUrl,
      };
      setUser(updatedUser);
      localStorage.setItem("user_info", JSON.stringify(updatedUser));
      setEditMode(false);
      toast.success("Profile updated");
    } catch (err: any) {
      console.error("Failed to update profile", err);
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePicture() {
    // optional: call an endpoint to remove picture; we'll just clear locally and call update
    setSaving(true);
    try {
      // If you have an endpoint to delete only picture you'd call it; otherwise send payload with null picture
      await UserManagerment.updateProfile({
        picture: null,
      });
      const updatedUser = { ...user, picture: null };
      setUser(updatedUser);
      setPreviewUrl(null);
      setSelectedFile(null);
      localStorage.setItem("user_info", JSON.stringify(updatedUser));
      toast.success("Profile picture removed");
    } catch (e) {
      console.error("Failed to remove picture", e);
      toast.error("Failed to remove picture");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    setPwSaving(true);
    try {
      await UserManagerment.updatePassword({
        old_password: currentPassword,
        new_password: newPassword,
      });
      setPwOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    } catch (err: any) {
      console.error("Password update failed", err);
      toast.error(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to update password"
      );
    } finally {
      setPwSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");
    // optional: redirect to login; adjust per your router
    window.location.href = "/";
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* avatar */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 rounded-full bg-slate-100 overflow-hidden border">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl text-slate-600 font-semibold">
                  {(user.first_name?.[0] ?? "") + (user.last_name?.[0] ?? "") ||
                    user.username?.slice(0, 2).toUpperCase()}
                </div>
              )}

              <label
                htmlFor="upload-photo"
                className="absolute right-1 bottom-1 bg-white rounded-full p-1 shadow hover:bg-slate-50 cursor-pointer"
                title="Upload new picture"
              >
                <Camera className="w-4 h-4 text-slate-700" />
              </label>
              <input
                id="upload-photo"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            <div className="mt-2 flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => setSelectedFile(null)}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border text-sm text-slate-700 hover:bg-slate-50"
              >
                <Edit2 className="w-4 h-4" />
                Change
              </button>

              <button
                type="button"
                onClick={handleDeletePicture}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border text-sm text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </div>
          </div>

          {/* details form */}
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Profile</h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border text-sm text-rose-600 hover:bg-rose-50"
                  type="button"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-600 text-white text-sm hover:bg-sky-700"
                    type="button"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
                      type="button"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setSelectedFile(null);
                        setPreviewUrl(initialUser.picture ?? null);
                        setUser(initialUser);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border text-sm hover:bg-slate-50"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500">First name</label>
                <input
                  className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={user.first_name ?? ""}
                  onChange={(e) => handleInput("first_name", e.target.value)}
                  disabled={!editMode}
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">Last name</label>
                <input
                  className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={user.last_name ?? ""}
                  onChange={(e) => handleInput("last_name", e.target.value)}
                  disabled={!editMode}
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">Username</label>
                <input
                  className="mt-1 block w-full border rounded px-3 py-2 bg-gray-50 cursor-not-allowed"
                  value={user.username ?? ""}
                  disabled
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">Email</label>
                <input
                  className="mt-1 block w-full border rounded px-3 py-2 bg-gray-50 cursor-not-allowed"
                  value={user.email ?? ""}
                  disabled
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">Department</label>
                <input
                  className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={user.department ?? ""}
                  onChange={(e) => handleInput("department", e.target.value)}
                  disabled={!editMode}
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">Employee #</label>
                <input
                  className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={user.employee_number ?? ""}
                  onChange={(e) =>
                    handleInput("employee_number", e.target.value)
                  }
                  disabled={!editMode}
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">Role</label>
                <input
                  className="mt-1 block w-full border rounded px-3 py-2 bg-gray-50 cursor-not-allowed"
                  value={user.role ?? ""}
                  disabled
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">Status</label>
                <div className="mt-1 text-sm text-slate-700">
                  {user.is_active ? "Active" : "Inactive"}{" "}
                  {user.approved ? "(Approved)" : "(Pending)"}
                </div>
              </div>
            </div>

            {/* change password */}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setPwOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border text-sm hover:bg-slate-50"
                type="button"
              >
                <Key className="w-4 h-4" />
                Change password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password modal */}
      {pwOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-slate-700" />
                <h3 className="text-lg font-medium">Change Password</h3>
              </div>
              <button
                onClick={() => setPwOpen(false)}
                className="inline-flex items-center justify-center w-9 h-9 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs text-slate-500">
                  Current password
                </label>
                <input
                  type={showPass ? "password" : "text"}
                  className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">New password</label>
                <input
                  type={showPass ? "password" : "text"}
                  className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">
                  Confirm new password
                </label>
                <input
                  type={showPass ? "password" : "text"}
                  className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <p
                  onClick={() => setShowPass((p) => !p)}
                  className="mt-1 underline flex items-center gap-1 hover:cursor-pointer"
                >
                  {showPass ? (
                    <Eye className="mt-1" size={16} />
                  ) : (
                    <EyeOff className="mt-1" size={16} />
                  )}
                  {!showPass ? "Hide" : "Show"} Password
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setPwOpen(false)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border text-sm hover:bg-slate-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>

                <button
                  onClick={handleChangePassword}
                  disabled={pwSaving}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  Update password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
