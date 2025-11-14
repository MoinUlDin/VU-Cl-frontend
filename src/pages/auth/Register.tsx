// src/pages/auth/Register.tsx
import React, { useState } from "react";
import { UserPlus, Camera, Eye, EyeOff } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AuthServices from "../../services/AuthServices";
import toast from "react-hot-toast";

type FormState = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  role: "Member" | "Manager" | "";
  employee_number: string;
  department: string;
  phone?: string;
  picture?: File | null;
};

export default function Register() {
  const [form, setForm] = useState<FormState>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    role: "",
    employee_number: "",
    department: "",
    phone: "",
    picture: null,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPass, setShowPass] = useState<boolean>(false);
  const navigate = useNavigate();

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, files } = e.target as any;
    if (name === "picture") {
      const f: File | null = files?.[0] ?? null;
      setForm((s) => ({ ...s, picture: f }));
      if (f) setPreview(URL.createObjectURL(f));
      else setPreview(null);
    } else {
      setForm((s) => ({ ...s, [name]: value }));
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    AuthServices.register(form)
      .then(() => {
        setMessage("Registration submitted. Please wait for admin approval.");
        toast.success("Registration successful, please wait for approval");
        setTimeout(() => navigate("/"), 3000);
      })
      .catch((err) => {
        console.log("org:", err);
        const msg =
          err?.detail ||
          err?.username ||
          err?.email ||
          err?.password ||
          "Registration failed";
        setMessage(msg);
        toast.error(msg || "Error");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-6">
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
        {/* Left graphic/marketing */}
        <div className="hidden col-span-3 sm:col-span-1 md:flex flex-col gap-6 p-6 rounded-2xl bg-white/70 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-emerald-100">
              <UserPlus className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-semibold">Create your account</h2>
          </div>
          <p className="text-gray-600">
            Complete the form to request access. Your account will be reviewed
            by an administrator.
          </p>
          <ul className="text-sm text-gray-500 space-y-2">
            <li>• Provide accurate details for faster approval</li>
            <li>• Upload a clear profile picture</li>
            <li>• Employee number is required</li>
          </ul>
        </div>

        {/* Form */}
        <div className="col-span-3 sm:col-span-2 bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-600" /> Register
          </h3>

          <form
            onSubmit={submit}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <div className="flex flex-col">
              <label htmlFor="first_name" className="text-sm font-medium">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                placeholder="First name"
                value={form.first_name}
                onChange={onChange}
                required
                className="p-2 border rounded-md"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="last_name" className="text-sm font-medium">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                placeholder="Last name"
                value={form.last_name}
                onChange={onChange}
                required
                className="p-2 border rounded-md"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={onChange}
                required
                className="p-2 border rounded-md"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={onChange}
                required
                className="p-2 border rounded-md"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative flex overflow-hidden">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={onChange}
                  required
                  className="p-2 border rounded-md flex-1"
                />
                <span
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute flex items-center justify-center right-0 top-0 px-3 h-full hover:cursor-pointer bg-slate-100"
                >
                  {!showPass ? <Eye size={18} /> : <EyeOff size={18} />}
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={onChange}
                required
                className="p-2 border rounded-md"
              >
                <option value="">Select role</option>
                <option value="Member">Member</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="employee_number" className="text-sm font-medium">
                Employee Number
              </label>
              <input
                id="employee_number"
                name="employee_number"
                placeholder="Employee number"
                value={form.employee_number}
                onChange={onChange}
                required
                className="p-2 border rounded-md"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="department" className="text-sm font-medium">
                Department
              </label>
              <input
                id="department"
                name="department"
                placeholder="Department"
                value={form.department}
                onChange={onChange}
                className="p-2 border rounded-md"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone (optional)
              </label>
              <input
                id="phone"
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={onChange}
                className="p-2 border rounded-md"
              />
            </div>

            {/* Picture upload + preview */}
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Camera className="w-4 h-4 text-gray-500" /> Profile picture
              </label>
              <div className="flex items-center gap-4">
                <label
                  className="flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer hover:bg-gray-50"
                  htmlFor="picture"
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Upload photo</span>
                  <input
                    id="picture"
                    name="picture"
                    type="file"
                    accept="image/*"
                    onChange={onChange}
                    className="hidden"
                  />
                </label>

                <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center border">
                  {preview ? (
                    <img
                      src={preview}
                      alt="preview"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-gray-400 text-xs">No photo</div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-2 flex items-center justify-between gap-4 mt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "Submitting…" : "Register"}
              </button>

              <Link to="/" className="text-sm text-emerald-600 hover:underline">
                Already have an account?
              </Link>
            </div>

            {message && (
              <div className="md:col-span-2 text-sm text-red-500">
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
