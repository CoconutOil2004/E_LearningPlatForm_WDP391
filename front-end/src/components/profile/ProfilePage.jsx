import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui";
import AuthenService from "../../services/api/AuthenService";
import CourseService from "../../services/api/CourseService";
import useAuthStore from "../../store/slices/authStore";
import { pageVariants } from "../../utils/helpers";

const ROLE_META = {
  student: {
    label: "Student",
    bg: "rgba(16,185,129,0.12)",
    text: "var(--color-success)",
    emoji: "🎓",
  },
  instructor: {
    label: "Instructor",
    bg: "rgba(2,132,199,0.12)",
    text: "var(--color-primary)",
    emoji: "🧑‍🏫",
  },
  admin: {
    label: "Administrator",
    bg: "rgba(139,92,246,0.12)",
    text: "#8B5CF6",
    emoji: "🛡️",
  },
};

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuthStore();
  const roleMeta = ROLE_META[user?.role] || ROLE_META.student;

  const [form, setForm] = useState({
    username: user?.username || "",
    fullname: user?.fullname || "",
    avatarURL: user?.avatarURL || "",
  });
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    password: "",
    confirm: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [msg, setMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!token) navigate("/signin");
  }, [token, navigate]);

  // Sync form when user updates in store
  useEffect(() => {
    setForm({
      username: user?.username || "",
      fullname: user?.fullname || "",
      avatarURL: user?.avatarURL || "",
    });
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type and size
    if (!file.type.startsWith("image/")) {
      setMsg({ type: "error", text: "Please select an image file" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: "error", text: "Image must be under 5MB" });
      return;
    }

    setUploadingAvatar(true);
    setMsg(null);
    try {
      const urls = await CourseService.uploadImages(file);
      if (urls && urls.length > 0) {
        setForm((f) => ({ ...f, avatarURL: urls[0].url }));
      }
    } catch {
      setMsg({ type: "error", text: "Image upload failed, please try again" });
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileRef.current) fileRef.current.value = "";
    }
  };


  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await AuthenService.updateProfile({
        username: form.username,
        fullname: form.fullname,
        avatarURL: form.avatarURL,
      });
      if (res.success) {
        // Correctly map backend 'data' property to auth store
        updateUser({ 
          username: res.data?.username,
          fullname: res.data?.fullname, 
          avatarURL: res.data?.avatarURL 
        });
        setMsg({ type: "success", text: "Profile updated successfully!" });
        setEditMode(false);
      } else {
        setMsg({ type: "error", text: res.message || "Update failed" });
      }
    } catch (err) {
      setMsg({ type: "error", text: err?.response?.data?.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.password !== pwForm.confirm) {
      setPwMsg({ type: "error", text: "Passwords do not match" });
      return;
    }
    if (pwForm.password.length < 6) {
      setPwMsg({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    setSavingPw(true);
    setPwMsg(null);
    try {
      const res = await AuthenService.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.password,
      });
      if (res.success) {
        setPwMsg({ type: "success", text: "Password changed successfully!" });
        setPwForm({ currentPassword: "", password: "", confirm: "" });
      } else {
        setPwMsg({ type: "error", text: res.message || "Change failed" });
      }
    } catch (err) {
      setPwMsg({ type: "error", text: err?.response?.data?.message || "Change failed" });
    } finally {
      setSavingPw(false);
    }
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-3xl px-6 py-10 mx-auto">
        {/* ── Header ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-black tracking-tight text-heading">
            My <span className="gradient-text">Profile</span>
          </h1>
          <p className="mt-1 text-muted">Manage your personal information</p>
        </motion.div>

        {/* ── Profile Card ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass-card rounded-[2rem] p-8 mb-6"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          {/* Avatar + name + role */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative flex-shrink-0">
              {form.avatarURL ? (
                <img
                  src={form.avatarURL}
                  alt="avatar"
                  className="object-cover w-20 h-20 rounded-full ring-4 ring-primary/20"
                />
              ) : (
                <div
                  className="flex items-center justify-center w-20 h-20 text-2xl font-black text-white rounded-full"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  {getInitials(user?.fullname || user?.username || "U")}
                </div>
              )}
              <span
                className="absolute -bottom-1 -right-1 text-lg"
                title={roleMeta.label}
              >
                {roleMeta.emoji}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h2 className="text-2xl font-black text-heading">
                  {user?.fullname || user?.username || "User"}
                </h2>
                <span
                  className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest"
                  style={{ background: roleMeta.bg, color: roleMeta.text }}
                >
                  {roleMeta.label}
                </span>
              </div>
              <p className="text-sm truncate text-muted">{user?.email}</p>
              {joinedDate && (
                <p className="mt-1 text-xs text-muted">Member since {joinedDate}</p>
              )}
            </div>

            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold transition-all rounded-full btn-aurora"
              >
                ✏️ Edit
              </button>
            )}
          </div>

          {/* Edit Form */}
          {editMode ? (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Avatar Upload Selection */}
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-3xl border-border bg-white/30">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => !uploadingAvatar && fileRef.current?.click()}
                >
                  <div className="relative w-28 h-28 overflow-hidden rounded-full ring-4 ring-primary/20">
                    {form.avatarURL ? (
                      <img
                        src={form.avatarURL}
                        alt="avatar"
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className="flex items-center justify-center w-full h-full text-3xl font-black text-white"
                        style={{ background: "var(--gradient-brand)" }}
                      >
                        {getInitials(user?.fullname || user?.username || "U")}
                      </div>
                    )}
                    
                    {/* Upload Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 bg-black/40 opacity-0 group-hover:opacity-100">
                      <Icon name="upload" size={24} color="white" />
                      <span className="mt-1 text-[10px] font-bold text-white uppercase">Upload</span>
                    </div>

                    {uploadingAvatar && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <div className="w-6 h-6 border-2 rounded-full border-primary border-t-transparent animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />

                <p className="mt-3 text-xs font-semibold text-muted">
                  Click to upload a new photo (supports JPG, PNG, max 5MB)
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block mb-2 text-xs font-bold uppercase text-muted">
                    Username
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-4 py-3 text-sm border rounded-xl bg-white/60 border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-heading"
                    placeholder="Your username"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-xs font-bold uppercase text-muted">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.fullname}
                    onChange={(e) => setForm({ ...form, fullname: e.target.value })}
                    className="w-full px-4 py-3 text-sm border rounded-xl bg-white/60 border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-heading"
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              {msg && (
                <p
                  className={`text-sm font-medium p-3 rounded-xl ${
                    msg.type === "success" 
                      ? "bg-green-50 text-green-600 border border-green-100" 
                      : "bg-red-50 text-red-500 border border-red-100"
                  }`}
                >
                  {msg.text}
                </p>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={saving || uploadingAvatar}
                  className="px-8 py-3 text-sm font-bold rounded-full btn-aurora disabled:opacity-60 disabled:cursor-not-allowed grow"
                >
                  {saving ? "Saving Changes..." : "Save Profile"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setMsg(null);
                    setForm({
                      fullname: user?.fullname || "",
                      avatarURL: user?.avatarURL || "",
                    });
                  }}
                  className="px-8 py-3 text-sm font-bold rounded-full glass-card hover:bg-white/60 text-muted"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* Info display */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { label: "Username", value: user?.username || "—" },
                { label: "Email", value: user?.email || "—" },
                { label: "Full Name", value: user?.fullname || "—" },
                { label: "Role", value: roleMeta.label },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl bg-white/50">
                  <p className="mb-1 text-xs font-bold uppercase text-muted">
                    {item.label}
                  </p>
                  <p className="text-sm font-semibold text-heading">{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Change Password Card ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="glass-card rounded-[2rem] p-8"
          style={{ boxShadow: "var(--shadow-lg)" }}
        >
          <h3 className="mb-6 text-lg font-black text-heading">
            🔐 Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block mb-1 text-xs font-bold uppercase text-muted">
                Current Password
              </label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                className="w-full px-4 py-3 text-sm border rounded-xl bg-white/60 border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-heading"
                placeholder="Your current password"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-bold uppercase text-muted">
                New Password
              </label>
              <input
                type="password"
                value={pwForm.password}
                onChange={(e) => setPwForm({ ...pwForm, password: e.target.value })}
                className="w-full px-4 py-3 text-sm border rounded-xl bg-white/60 border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-heading"
                placeholder="At least 6 characters"
                required
              />
            </div>
            <div>
              <label className="block mb-1 text-xs font-bold uppercase text-muted">
                Confirm Password
              </label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                className="w-full px-4 py-3 text-sm border rounded-xl bg-white/60 border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-heading"
                placeholder="Repeat new password"
                required
              />
            </div>

            {pwMsg && (
              <p
                className={`text-sm font-medium ${pwMsg.type === "success" ? "text-green-600" : "text-red-500"}`}
              >
                {pwMsg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={savingPw}
              className="px-6 py-2.5 text-sm font-bold rounded-full btn-aurora disabled:opacity-60"
            >
              {savingPw ? "Changing…" : "Change Password"}
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
