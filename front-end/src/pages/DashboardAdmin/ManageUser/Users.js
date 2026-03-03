import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Pagination,
  Stack,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Grid,
  Card,
  CardContent,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  RadioGroup,
  Radio,
  InputAdornment,
  Badge,
  Paper,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import PersonIcon from "@mui/icons-material/Person";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import StorefrontIcon from "@mui/icons-material/Storefront";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import VisibilityIcon from "@mui/icons-material/Visibility";

import Title from "../Title";

/* =========================
   Status Chip
========================= */
const UserStatusChip = ({ status }) => {
  const isLocked = status === "lock";

  return (
    <Chip
      label={isLocked ? "Locked" : "Active"}
      color={isLocked ? "error" : "success"}
      size="small"
      variant="outlined"
      icon={isLocked ? <LockPersonIcon /> : <LockOpenIcon />}
    />
  );
};

/* =========================
   Role Icon
========================= */
const RoleIcon = ({ role }) => {
  switch (role) {
    case "admin":
      return <AdminPanelSettingsIcon color="primary" />;
    case "seller":
      return <StorefrontIcon color="secondary" />;
    default:
      return <PersonIcon color="action" />;
  }
};

/* =========================
   MAIN COMPONENT
========================= */
export default function Users({
  users = [],
  onEdit,
  onDelete,
  onLock,
}) {
  const [keywords, setKeywords] = React.useState("");
  const [selectedRoles, setSelectedRoles] = React.useState([]);
  const [actionFilter, setActionFilter] = React.useState("all");
  const [currentPage, setCurrentPage] = React.useState(1);

  const [actionMenuAnchor, setActionMenuAnchor] = React.useState(null);
  const [selectedUser, setSelectedUser] = React.useState(null);

  /* =========================
     FILTER LOGIC
  ========================= */
  const roles = React.useMemo(() => {
    return [...new Set(users.map((u) => u.role).filter(Boolean))];
  }, [users]);

  const filteredUsers = React.useMemo(() => {
    let data = [...users];

    if (keywords.trim()) {
      const k = keywords.toLowerCase();
      data = data.filter(
        (u) =>
          u.username?.toLowerCase().includes(k) ||
          u.email?.toLowerCase().includes(k)
      );
    }

    if (selectedRoles.length > 0) {
      data = data.filter((u) => selectedRoles.includes(u.role));
    }

    if (actionFilter !== "all") {
      data = data.filter((u) => u.action === actionFilter);
    }

    return data;
  }, [users, keywords, selectedRoles, actionFilter]);

  /* =========================
     PAGINATION
  ========================= */
  const USERS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const pageData = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [keywords, selectedRoles, actionFilter]);

  /* =========================
     ACTION MENU
  ========================= */
  const openMenu = (e, user) => {
    setActionMenuAnchor(e.currentTarget);
    setSelectedUser(user);
  };

  const closeMenu = () => {
    setActionMenuAnchor(null);
    setSelectedUser(null);
  };

  const handleAction = (type) => {
    if (!selectedUser) return;

    if (type === "edit") onEdit?.(selectedUser);
    if (type === "delete") onDelete?.(selectedUser);
    if (type === "lock" || type === "unlock") onLock?.(selectedUser);

    closeMenu();
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <>
      <Box mb={3}>
        <Title highlight>User Management</Title>
        <Typography variant="body2" color="text.secondary">
          Manage all users in the system
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* FILTER */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography fontWeight="bold">
                <FilterAltIcon fontSize="small" /> Filters
              </Typography>

              <TextField
                fullWidth
                size="small"
                placeholder="Search username / email"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ my: 2 }}
              />

              <Typography variant="subtitle2">Role</Typography>
              <FormGroup>
                {roles.map((r) => (
                  <FormControlLabel
                    key={r}
                    control={
                      <Checkbox
                        checked={selectedRoles.includes(r)}
                        onChange={() =>
                          setSelectedRoles((prev) =>
                            prev.includes(r)
                              ? prev.filter((x) => x !== r)
                              : [...prev, r]
                          )
                        }
                      />
                    }
                    label={r}
                  />
                ))}
              </FormGroup>

              <Typography variant="subtitle2" mt={2}>
                Status
              </Typography>
              <RadioGroup
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                <FormControlLabel value="all" control={<Radio />} label="All" />
                <FormControlLabel value="unlock" control={<Radio />} label="Active" />
                <FormControlLabel value="lock" control={<Radio />} label="Locked" />
              </RadioGroup>

              <Divider sx={{ my: 2 }} />

              <IconButton
                onClick={() => {
                  setKeywords("");
                  setSelectedRoles([]);
                  setActionFilter("all");
                }}
              >
                <ClearAllIcon />
              </IconButton>
            </CardContent>
          </Card>
        </Grid>

        {/* TABLE */}
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <Badge badgeContent={filteredUsers.length} color="primary">
                <Typography fontWeight="bold">User List</Typography>
              </Badge>

              <Table component={Paper} sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {pageData.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell>{u._id}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar src={u.avatarURL} sx={{ mr: 1 }} />
                          <Box>
                            <Typography fontWeight="bold">
                              {u.username}
                            </Typography>
                            <Typography variant="caption">
                              {u.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <RoleIcon role={u.role} /> {u.role}
                      </TableCell>
                      <TableCell>
                        <UserStatusChip status={u.action} />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton onClick={(e) => openMenu(e, u)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Stack alignItems="center" mt={2}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, p) => setCurrentPage(p)}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ACTION MENU */}
      <Menu anchorEl={actionMenuAnchor} open={Boolean(actionMenuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={() => handleAction("edit")}>
          <EditIcon fontSize="small" /> Edit
        </MenuItem>
        <MenuItem onClick={() => handleAction("delete")}>
          <DeleteIcon fontSize="small" /> Delete
        </MenuItem>
        {selectedUser?.action === "unlock" && (
          <MenuItem onClick={() => handleAction("lock")}>
            <LockPersonIcon fontSize="small" /> Lock
          </MenuItem>
        )}
        {selectedUser?.action === "lock" && (
          <MenuItem onClick={() => handleAction("unlock")}>
            <LockOpenIcon fontSize="small" /> Unlock
          </MenuItem>
        )}
        <Divider />
        <MenuItem>
          <VisibilityIcon fontSize="small" /> View
        </MenuItem>
      </Menu>
    </>
  );
}
