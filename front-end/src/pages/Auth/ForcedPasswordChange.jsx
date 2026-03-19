import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthenService from "../../services/api/AuthenService";
import useAuthStore from "../../store/slices/authStore";
import { ROUTES } from "../../utils/constants";
import { pageVariants } from "../../utils/helpers";
import { useToast } from "../../contexts/ToastContext";

const ShieldIcon = () => (
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const ForcedPasswordChange = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, updateUser, logout, isAuthenticated } = useAuthStore();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  // Security guard: if not authenticated or doesn't need change, send away
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", { replace: true });
    } else if (user && user.mustChangePassword === false) {
      // Only redirect away if we ARE sure they don't need to be here
      const role = user?.role;
      if (role === "admin") navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      else if (role === "instructor") navigate(ROUTES.INSTRUCTOR_DASHBOARD, { replace: true });
      else navigate("/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Confirm password does not match");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await AuthenService.changePasswordRequired({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      if (res.success) {
        // toast.success("Password updated successfully!"); // Handled globally
        updateUser({ mustChangePassword: false });
        
        // Short delay for the user to breathe
        setTimeout(() => {
          const role = user?.role;
          if (role === "admin") navigate(ROUTES.ADMIN_DASHBOARD);
          else if (role === "instructor") navigate(ROUTES.INSTRUCTOR_DASHBOARD);
          else navigate("/");
        }, 1000);
      } else {
        // toast.error(res.message || "An error occurred"); // Handled globally
      }
    } catch (err) {
      // toast.error(err.response?.data?.message || "An error occurred"); // Handled globally
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user?.mustChangePassword) return null;

  return (
    <div
      className="relative flex items-center justify-center min-h-screen px-4 overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* Floating blobs - matching SignIn */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full auth-blob -top-20 -left-20 w-80 h-80 opacity-30"
          style={{ background: "radial-gradient(circle, var(--color-primary-bg), transparent)" }}
        />
        <div
          className="absolute rounded-full auth-blob-delay -bottom-16 -right-16 w-72 h-72 opacity-30"
          style={{ background: "radial-gradient(circle, var(--color-secondary-bg), transparent)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase"
            style={{ background: "var(--color-primary-bg)", color: "var(--color-primary)" }}
          >
            <ShieldIcon />
            <span>Security Check</span>
          </motion.div>
          <h1 className="text-4xl font-black" style={{ color: "var(--text-heading)" }}>
            Account Security
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            Please set a new password to continue using the system.
          </p>
        </div>

        <div className="auth-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="auth-label">Current password (from Email)</label>
              <input
                type="password"
                required
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                className="auth-input"
                placeholder="••••••••"
              />
            </div>

            <div className="h-px bg-gray-100 my-2 opacity-50" />

            <div>
              <label className="auth-label">New password</label>
              <input
                type="password"
                required
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="auth-input"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="auth-label">Confirm new password</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="auth-input"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="mt-2 auth-btn-submit"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner />
                  Updating...
                </span>
              ) : (
                "Update password"
              )}
            </motion.button>
          </form>

          <button
            onClick={() => logout()}
            className="w-full mt-6 text-xs text-center font-bold transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
            style={{ color: "var(--text-disabled)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red-500)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-disabled)")}
          >
            Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForcedPasswordChange;
