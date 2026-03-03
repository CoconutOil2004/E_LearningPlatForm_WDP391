import { API_BASE_URL } from '../../../utils/constants';
import * as React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";

export default function UpdateUser({
  targetUser,
  onUpdated,
  open,
  handleClose,
}) {
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("");
  const [status, setStatus] = React.useState(""); // rename action → status
  const [loading, setLoading] = React.useState(false);

  const [snackbar, setSnackbar] = React.useState({
    open: false,
    msg: "",
    severity: "success",
  });

  React.useEffect(() => {
    if (targetUser && open) {
      setUsername(targetUser.username || "");
      setEmail(targetUser.email || "");
      setRole(targetUser.role || "");
      setStatus(targetUser.action || "");
    }
  }, [targetUser, open]);

  const handleUpdateUser = async (e) => {
  e.preventDefault();
  if (!targetUser?._id) return;

  try {
    setLoading(true);

    const res = await axios.put(
      `${API_BASE_URL}/api/admin/users/${targetUser._id}`,
      {
        username,
        email,
        role,
        action: status,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    );

    setSnackbar({
      open: true,
      msg: "Update successful!",
      severity: "success",
    });

    // 🔥 CỰC QUAN TRỌNG
    onUpdated?.();      // refresh list
    handleClose();      // đóng dialog NGAY

  } catch (error) {
    setSnackbar({
      open: true,
      msg: error?.response?.data?.message || "Update failed!",
      severity: "error",
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 22, color: "#1976d2" }}>
          Update User
        </DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Update user information and permissions below.
          </DialogContentText>

          <form onSubmit={handleUpdateUser}>
            <TextField
              label="Username"
              fullWidth
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              select
              label="Role"
              fullWidth
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="seller">Seller</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>

            <TextField
              select
              label="Status"
              fullWidth
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="lock">Lock</MenuItem>
              <MenuItem value="unlock">Unlock</MenuItem>
            </TextField>

            <DialogActions sx={{ px: 0 }}>
              <Button onClick={handleClose} color="secondary">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
