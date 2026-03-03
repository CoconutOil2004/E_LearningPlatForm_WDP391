import { API_BASE_URL } from '../../../utils/constants';
import * as React from "react";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Users from "./Users";
import UpdateUser from "./UpdateUser";
import ConfirmDialog from "./ConfirmDialog";
import { useOutletContext } from "react-router-dom";
import axios from "axios";

export default function ManageUser() {
  const { handleSetDashboardTitle } = useOutletContext();

  const [users, setUsers] = React.useState([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const [selectedUser, setSelectedUser] = React.useState(null);
  const [openUpdate, setOpenUpdate] = React.useState(false);
  const [openConfirm, setOpenConfirm] = React.useState(false);
  const [confirmType, setConfirmType] = React.useState(""); // delete | lock

  // =========================
  // Title
  // =========================
  React.useEffect(() => {
    handleSetDashboardTitle("Manage Users");
  }, [handleSetDashboardTitle]);

  // =========================
  // Fetch users
  // =========================
  const updateUserList = async (page = 1) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/admin/users?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      setUsers(res.data.data || []);
      setTotalPages(res.data.totalPages || 1);
      setCurrentPage(res.data.currentPage || page);
    } catch (error) {
      console.error("Error fetching user list:", error);
    }
  };

  React.useEffect(() => {
    updateUserList(1);
  }, []);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      updateUserList(page);
    }
  };

  // =========================
  // Actions
  // =========================
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenUpdate(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setConfirmType("delete");
    setOpenConfirm(true);
  };

  const handleLockUser = (user) => {
    setSelectedUser(user);
    setConfirmType("lock");
    setOpenConfirm(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;

    try {
      if (confirmType === "delete") {
        await axios.delete(
          `${API_BASE_URL}/api/admin/users/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
      }

      if (confirmType === "lock") {
        await axios.patch(
          `${API_BASE_URL}/api/admin/users/${selectedUser._id}/status`,
          {
            action:
              selectedUser.action === "lock" ? "unlock" : "lock",
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
      }

      updateUserList(currentPage);
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setOpenConfirm(false);
      setSelectedUser(null);
    }
  };

  return (
    <>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Users
            users={users}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onLock={handleLockUser}
          />
        </Paper>
      </Grid>

      {/* UPDATE USER */}
      <UpdateUser
        open={openUpdate}
        targetUser={selectedUser}
        handleClose={() => setOpenUpdate(false)}
        onUpdated={() => updateUserList(currentPage)}
      />

      {/* CONFIRM DELETE / LOCK */}
      <ConfirmDialog
        open={openConfirm}
        title={
          confirmType === "delete"
            ? "Delete User"
            : "Lock / Unlock User"
        }
        content={
          confirmType === "delete"
            ? "Are you sure you want to delete this user?"
            : "Are you sure you want to change user status?"
        }
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmAction}
      />
    </>
  );
}
