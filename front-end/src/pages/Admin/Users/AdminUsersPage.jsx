/**
 * AdminUsersPage — Quản lý Instructor & Student
 *
 * Cấu trúc:
 *   1. Sub-components  (Avatar, StatusBadge, Pagination, CreateModal, tables)
 *   2. Main component  (AdminUsersPage) — chỉ gọi hook + render
 *
 * Muốn thêm filter/search → thêm vào useAdminUsers hook, không sửa gì ở đây.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../../../components/ui";
import { pageVariants, getInitials } from "../../../utils/helpers";
import useAdminUsers from "../../../hooks/useAdminUsers";

// ─── Màu chủ đạo — đồng bộ với AdminDashboard ────────────────────────────────
const C = {
  ocean: "#0077B6",
  teal:  "#00BFA5",
  bg:    "#F8FAFB",
};

// ─── 1. Sub-components ────────────────────────────────────────────────────────

/** Avatar chữ cái đầu tên */
const Avatar = ({ name, size = "md" }) => {
  const sz = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div
      className={`${sz} rounded-full flex items-center justify-center text-white font-black shrink-0`}
      style={{ background: `linear-gradient(135deg, ${C.ocean}, ${C.teal})` }}
    >
      {getInitials(name)}
    </div>
  );
};

/** Badge trạng thái lock / unlock */
const ActionBadge = ({ action }) =>
  action === "lock" ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-500">
      <Icon name="lock" size={11} color="#EF4444" /> Locked
    </span>
  ) : (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase"
      style={{ background: "rgba(0,191,165,0.1)", color: C.teal }}
    >
      <Icon name="check" size={11} color={C.teal} /> Active
    </span>
  );

/** Pagination bar */
const Pagination = ({ page, totalPages, onPage }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-4">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-slate-100 transition-colors"
      >
        <Icon name="chevronRight" size={16} color="#64748b" className="rotate-180" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce((acc, p, idx, arr) => {
          if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
          acc.push(p);
          return acc;
        }, [])
        .map((p, i) =>
          p === "..." ? (
            <span key={`dot-${i}`} className="text-slate-400 text-sm px-1">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              className="w-8 h-8 rounded-lg text-sm font-bold transition-all"
              style={
                p === page
                  ? { background: C.teal, color: "white" }
                  : { color: "#64748b" }
              }
            >
              {p}
            </button>
          )
        )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="w-8 h-8 rounded-lg flex items-center justify-center disabled:opacity-30 hover:bg-slate-100 transition-colors"
      >
        <Icon name="chevronRight" size={16} color="#64748b" />
      </button>
    </div>
  );
};

/** Modal tạo instructor mới */
const CreateInstructorModal = ({ onClose, onSubmit, loading, error }) => {
  const [form, setForm] = useState({ email: "", fullname: "" });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black" style={{ color: C.ocean }}>Tạo Instructor mới</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Hệ thống sẽ tạo mật khẩu ngẫu nhiên và gửi qua email
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Icon name="x" size={18} color="#94a3b8" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
              Email <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center border border-slate-200 rounded-xl px-3 gap-2 focus-within:border-teal-400 transition-colors">
              <Icon name="mail" size={16} color="#94a3b8" />
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="instructor@example.com"
                required
                className="flex-1 py-2.5 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
              Họ tên
            </label>
            <div className="flex items-center border border-slate-200 rounded-xl px-3 gap-2 focus-within:border-teal-400 transition-colors">
              <Icon name="user" size={16} color="#94a3b8" />
              <input
                type="text"
                value={form.fullname}
                onChange={set("fullname")}
                placeholder="Nguyễn Văn A"
                className="flex-1 py-2.5 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm">
              <Icon name="x" size={15} color="#EF4444" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all disabled:opacity-60"
              style={{ background: C.teal }}
            >
              {loading ? "Đang tạo…" : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

/** Bảng Instructors */
const InstructorTable = ({ data, onToggleLock }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-slate-50/60 border-b border-slate-100">
          {["Instructor", "Email", "Trạng thái", "Ngày tạo", "Hành động"].map((h, i) => (
            <th
              key={h}
              className={`px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400 ${i === 4 ? "text-right" : ""}`}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.map((ins) => (
          <motion.tr
            key={ins._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hover:bg-teal-50/30 transition-colors"
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <Avatar name={ins.fullname || ins.email} />
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {ins.fullname || "—"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">{ins.username}</p>
                </div>
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600">{ins.email}</td>
            <td className="px-6 py-4">
              <ActionBadge action={ins.action ?? "unlock"} />
            </td>
            <td className="px-6 py-4 text-xs text-slate-500 font-mono">
              {new Date(ins.createdAt).toLocaleDateString("vi-VN")}
            </td>
            <td className="px-6 py-4 text-right">
              <button
                onClick={() => onToggleLock(ins)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all hover:scale-105"
                style={
                  ins.action === "lock"
                    ? { borderColor: C.teal, color: C.teal, background: "rgba(0,191,165,0.06)" }
                    : { borderColor: "#EF4444", color: "#EF4444", background: "rgba(239,68,68,0.06)" }
                }
              >
                <Icon name={ins.action === "lock" ? "check" : "lock"} size={12} color={ins.action === "lock" ? C.teal : "#EF4444"} />
                {ins.action === "lock" ? "Mở khoá" : "Khoá"}
              </button>
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Bảng Students */
const StudentTable = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="bg-slate-50/60 border-b border-slate-100">
          {["Student", "Email", "Username", "Ngày tham gia"].map((h) => (
            <th key={h} className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {data.map((stu) => (
          <motion.tr
            key={stu._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hover:bg-teal-50/30 transition-colors"
          >
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <Avatar name={stu.fullname || stu.email} />
                <p className="text-sm font-bold text-slate-800">
                  {stu.fullname || "—"}
                </p>
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-slate-600">{stu.email}</td>
            <td className="px-6 py-4 text-xs text-slate-500 font-mono">{stu.username}</td>
            <td className="px-6 py-4 text-xs text-slate-500 font-mono">
              {new Date(stu.createdAt).toLocaleDateString("vi-VN")}
            </td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Empty state */
const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-20 text-slate-400">
    <Icon name="users" size={40} color="#cbd5e1" />
    <p className="mt-3 text-sm">{message}</p>
  </div>
);

/** Loading skeleton rows */
const SkeletonRows = () => (
  <div className="divide-y divide-slate-50">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-6 py-4">
        <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-100 rounded animate-pulse w-40" />
          <div className="h-2.5 bg-slate-100 rounded animate-pulse w-28" />
        </div>
        <div className="h-3 bg-slate-100 rounded animate-pulse w-24" />
        <div className="h-6 bg-slate-100 rounded-full animate-pulse w-16" />
      </div>
    ))}
  </div>
);

// ─── 2. Main component ────────────────────────────────────────────────────────

const AdminUsersPage = () => {
  const {
    tab, setTab, TABS,
    instructors, students, pagination, page, setPage,
    loading, error,
    showCreateModal, isCreating, createError,
    openCreateModal, closeCreateModal, handleCreate,
    handleToggleLock,
  } = useAdminUsers();

  const isInstructor = tab === TABS.INSTRUCTOR;
  const currentData  = isInstructor ? instructors : students;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="p-8 min-h-screen"
      style={{ background: C.bg }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: C.ocean }}>
            User Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý instructor và student trên hệ thống
          </p>
        </div>

        {/* Chỉ hiện nút tạo khi ở tab Instructor */}
        {isInstructor && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold hover:scale-105 transition-transform shadow-lg"
            style={{ background: C.teal, boxShadow: "0 8px 20px -8px rgba(0,191,165,0.5)" }}
          >
            <Icon name="plus" size={16} color="white" />
            Tạo Instructor
          </button>
        )}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6">
        {[
          { key: TABS.INSTRUCTOR, label: "Instructors", icon: "user" },
          { key: TABS.STUDENT,    label: "Students",    icon: "users" },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={
              tab === key
                ? { background: C.teal, color: "white", boxShadow: "0 4px 12px rgba(0,191,165,0.3)" }
                : { background: "white", color: "#64748b", border: "1px solid #e2e8f0" }
            }
          >
            <Icon name={icon} size={15} color={tab === key ? "white" : "#64748b"} />
            {label}
            {tab === key && pagination.total > 0 && (
              <span className="bg-white/20 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {pagination.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Table card ──────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border border-white/60 overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 10px 40px -10px rgba(0,191,165,0.12)",
        }}
      >
        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 text-sm border-b border-red-100">
            <Icon name="x" size={15} color="#EF4444" />
            {error}
          </div>
        )}

        {/* Table content */}
        {loading ? (
          <SkeletonRows />
        ) : currentData.length === 0 ? (
          <EmptyState message={isInstructor ? "Chưa có instructor nào" : "Chưa có student nào"} />
        ) : isInstructor ? (
          <InstructorTable data={instructors} onToggleLock={handleToggleLock} />
        ) : (
          <StudentTable data={students} />
        )}

        {/* Pagination */}
        {!loading && currentData.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-50">
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              onPage={setPage}
            />
          </div>
        )}
      </div>

      {/* ── Create modal ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateInstructorModal
            onClose={closeCreateModal}
            onSubmit={handleCreate}
            loading={isCreating}
            error={createError}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminUsersPage;