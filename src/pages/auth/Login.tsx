// src/pages/auth/Login.tsx
import React, { useState } from "react";
import { LogIn, Eye, EyeOff, Mail, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import AuthServices from "../../services/AuthServices";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    AuthServices.login({ username, password })
      .then((r) => {
        if (r.user_info?.role === "Admin") nav("/Admin-Dashboard");
        else if (r.user_info?.role === "Manager") nav("/Manager-Dashboard");
        else nav("/Member-Dashboard");
      })
      .catch((e) => {
        console.error(e);
        // Normalize error messages
        const msg =
          e?.response?.data?.detail ||
          e?.response?.data?.message ||
          e?.message ||
          "Login failed — please check credentials.";
        setError(msg);
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-sky-50 p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left hero */}
        <div className="hidden md:flex flex-col justify-center gap-6 p-8 rounded-2xl bg-white/70 backdrop-blur-sm shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-indigo-100">
              <LogIn className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-semibold">Welcome back</h2>
          </div>

          <p className="text-gray-600">
            Sign in to access your personalized dashboard. If you are a new
            user, register and wait for admin approval.
          </p>

          <div className="text-sm text-gray-500">
            <strong>Tip:</strong> Use your assigned username (not email) to sign
            in.
          </div>
        </div>

        {/* Right form */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <LogIn className="w-5 h-5 text-indigo-500" />
            Sign in
          </h3>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" /> Username
              </span>
              <input
                className="mt-1 block w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-indigo-200"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                name="username"
                autoComplete="username"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" /> Password
              </span>
              <div className="relative mt-1">
                <input
                  className="block w-full rounded-md border px-3 py-2 pr-10 focus:ring-2 focus:ring-indigo-200"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-2 text-gray-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </label>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex items-center justify-between gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>

              <Link
                to="/register"
                className="text-sm text-indigo-600 hover:underline"
              >
                Create account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
