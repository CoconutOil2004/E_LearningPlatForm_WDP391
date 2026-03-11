/**
 * useAdminUsers — custom hook quản lý state cho trang Admin Users
 *
 * Tách toàn bộ logic fetch / mutate ra khỏi UI component:
 *   - Page component chỉ gọi hook → nhận data + handlers → render
 *   - Muốn đổi logic → sửa hook, không đụng JSX
 *   - Muốn viết unit test → test hook độc lập
 */

import { useState, useEffect, useCallback } from "react";
import UserService from "../services/api/UserService";

const TABS = { INSTRUCTOR: "instructor", STUDENT: "student" };
const PAGE_SIZE = 20;

/**
 * @returns {{
 *   tab, setTab,
 *   instructors, students,
 *   pagination, page, setPage,
 *   loading, error,
 *   isCreating, createError,
 *   openCreateModal, closeCreateModal, showCreateModal,
 *   handleCreate,
 *   handleToggleLock,
 *   refetch
 * }}
 */
const useAdminUsers = () => {
  // ── Tab state ──────────────────────────────────────────────────────────────
  const [tab,  setTab]  = useState(TABS.INSTRUCTOR);
  const [page, setPage] = useState(1);

  // ── List data ──────────────────────────────────────────────────────────────
  const [instructors,  setInstructors]  = useState([]);
  const [students,     setStudents]     = useState([]);
  const [pagination,   setPagination]   = useState({ total: 0, totalPages: 1 });
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  // ── Create modal ───────────────────────────────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating,      setIsCreating]      = useState(false);
  const [createError,     setCreateError]     = useState(null);

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchInstructors = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await UserService.getInstructors({ page: p, limit: PAGE_SIZE });
      setInstructors(res.instructors ?? []);
      setPagination(res.pagination ?? { total: 0, totalPages: 1 });
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không thể tải danh sách instructor");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStudents = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await UserService.getStudents({ page: p, limit: PAGE_SIZE });
      setStudents(res.students ?? []);
      setPagination(res.pagination ?? { total: 0, totalPages: 1 });
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không thể tải danh sách student");
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch khi đổi tab hoặc page
  useEffect(() => {
    setPage(1);
  }, [tab]);

  useEffect(() => {
    if (tab === TABS.INSTRUCTOR) fetchInstructors(page);
    else                          fetchStudents(page);
  }, [tab, page, fetchInstructors, fetchStudents]);

  const refetch = useCallback(() => {
    if (tab === TABS.INSTRUCTOR) fetchInstructors(page);
    else                          fetchStudents(page);
  }, [tab, page, fetchInstructors, fetchStudents]);

  // ── Create instructor ──────────────────────────────────────────────────────
  const openCreateModal  = () => { setCreateError(null); setShowCreateModal(true);  };
  const closeCreateModal = () => { setCreateError(null); setShowCreateModal(false); };

  const handleCreate = async ({ email, fullname }) => {
    setIsCreating(true);
    setCreateError(null);
    try {
      await UserService.createInstructor({ email, fullname });
      closeCreateModal();
      fetchInstructors(1);      // refresh về trang 1 sau khi tạo
      setPage(1);
      return { success: true };
    } catch (err) {
      const msg = err?.response?.data?.message ?? "Tạo instructor thất bại";
      setCreateError(msg);
      return { success: false, message: msg };
    } finally {
      setIsCreating(false);
    }
  };

  // ── Toggle lock / unlock ───────────────────────────────────────────────────
  const handleToggleLock = async (instructor) => {
    const nextAction = instructor.action === "lock" ? "unlock" : "lock";
    // Optimistic update — đổi UI ngay, roll back nếu lỗi
    setInstructors((prev) =>
      prev.map((i) => (i._id === instructor._id ? { ...i, action: nextAction } : i))
    );
    try {
      await UserService.updateInstructorAction(instructor._id, nextAction);
    } catch (err) {
      // Roll back
      setInstructors((prev) =>
        prev.map((i) => (i._id === instructor._id ? { ...i, action: instructor.action } : i))
      );
    }
  };

  return {
    // Tab
    tab, setTab, TABS,
    // Data
    instructors, students, pagination, page, setPage,
    loading, error,
    // Create
    showCreateModal, isCreating, createError,
    openCreateModal, closeCreateModal, handleCreate,
    // Actions
    handleToggleLock,
    refetch,
  };
};

export default useAdminUsers;