/**
 * useAdminUsers — custom hook quản lý state cho trang Admin Users
 */

import { useState, useEffect, useCallback } from "react";
import UserService from "../services/api/UserService";

const TABS = { INSTRUCTOR: "instructor", STUDENT: "student" };
const PAGE_SIZE = 20;

const useAdminUsers = () => {
  const [tab,  setTab]  = useState(TABS.INSTRUCTOR);
  const [page, setPage] = useState(1);

  const [instructors,  setInstructors]  = useState([]);
  const [students,     setStudents]     = useState([]);
  
  // Separate pagination for each type
  const [instructorPagination, setInstructorPagination] = useState({ total: 0, totalPages: 1 });
  const [studentPagination,    setStudentPagination]    = useState({ total: 0, totalPages: 1 });
  
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating,      setIsCreating]      = useState(false);
  const [createError,     setCreateError]     = useState(null);

  const [actionLoading, setActionLoading] = useState(null);

  const fetchInstructors = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await UserService.getInstructors({ page: p, limit: PAGE_SIZE });
      setInstructors(res.instructors ?? []);
      setInstructorPagination(res.pagination ?? { total: 0, totalPages: 1 });
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
      setStudentPagination(res.pagination ?? { total: 0, totalPages: 1 });
    } catch (err) {
      setError(err?.response?.data?.message ?? "Không thể tải danh sách student");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch for both on mount
  useEffect(() => {
    fetchInstructors(1);
    fetchStudents(1);
  }, [fetchInstructors, fetchStudents]);

  // Handle active tab pagination
  useEffect(() => {
    if (page > 1) { // Only refetch if it's not the first page (already handled or reset)
      if (tab === TABS.INSTRUCTOR) fetchInstructors(page);
      else                          fetchStudents(page);
    }
  }, [tab, page, fetchInstructors, fetchStudents]);

  useEffect(() => { 
    // Reset page to 1 when tab changes, which might trigger the second effect if page was > 1
    if (page !== 1) setPage(1); 
  }, [tab]);

  const refetch = useCallback(() => {
    if (tab === TABS.INSTRUCTOR) fetchInstructors(page);
    else                          fetchStudents(page);
  }, [tab, page, fetchInstructors, fetchStudents]);

  const openCreateModal  = () => { setCreateError(null); setShowCreateModal(true);  };
  const closeCreateModal = () => { setCreateError(null); setShowCreateModal(false); };

  const handleCreate = async ({ email, fullname }) => {
    setIsCreating(true);
    setCreateError(null);
    try {
      await UserService.createInstructor({ email, fullname });
      closeCreateModal();
      fetchInstructors(1);
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

  // BUG FIX 1 + 2 + 3:
  // - Đọc user.action === "lock" thay vì user.isLocked (field không tồn tại)
  // - Sửa logic nextAction cho đúng chiều
  // - Tách instructor vs student (BE không có endpoint student)
  const handleToggleLock = async (user) => {
    const isCurrentlyLocked = user.action === "lock";
    const nextAction = isCurrentlyLocked ? "unlock" : "lock";

    setActionLoading(user._id);

    const updateList = (list, setter) =>
      setter(list.map((u) => (u._id === user._id ? { ...u, action: nextAction } : u)));

    // Optimistic update
    if (tab === TABS.INSTRUCTOR) {
      updateList(instructors, setInstructors);
    } else {
      updateList(students, setStudents);
    }

    try {
      if (tab === TABS.INSTRUCTOR) {
        await UserService.updateInstructorAction(user._id, nextAction);
      } else {
        await UserService.updateStudentAction(user._id, nextAction);
      }
    } catch (err) {
      // Roll back on error
      if (tab === TABS.INSTRUCTOR) {
        setInstructors((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, action: user.action } : u))
        );
      } else {
        setStudents((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, action: user.action } : u))
        );
      }
      console.error("Toggle lock failed:", err?.message ?? err);
    } finally {
      setActionLoading(null);
    }
  };

  return {
    tab, setTab, TABS,
    instructors, students, 
    instructorPagination, studentPagination, 
    page, setPage,
    loading, error,
    showCreateModal, isCreating, createError,
    openCreateModal, closeCreateModal, handleCreate,
    handleToggleLock,
    actionLoading,
    refetch,
  };
};

export default useAdminUsers;