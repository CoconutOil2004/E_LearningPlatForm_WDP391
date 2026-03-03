import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PaymentIcon from "@mui/icons-material/Payment";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import StoreIcon from "@mui/icons-material/Store";
import { Avatar, Badge, Chip, Tooltip } from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import MuiDrawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useEffect, useState } from "react";

import { useDispatch } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { resetUserInfo } from "../redux/slices/orebi.slice";
import AdminService from "../services/api/AdminService";
import AuthenService from "../services/api/AuthenService";

// ─── Copyright ───────────────────────────────────────────────────────────────

function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="#!">
        Detox Tea Company
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

// ─── Theme ────────────────────────────────────────────────────────────────────

const drawerWidth = 260;

const customTheme = createTheme({
  palette: {
    primary: {
      main: "#1a237e",
      light: "#534bae",
      dark: "#000051",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ff6f00",
      light: "#ffa040",
      dark: "#c43e00",
      contrastText: "#000000",
    },
    background: { default: "#f5f7fa" },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "rgba(255,255,255,0.12)",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
          },
          "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 4px 12px 0 rgba(0,0,0,0.05)",
        },
      },
    },
  },
});

// ─── Styled Components ────────────────────────────────────────────────────────

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  boxShadow: "0 4px 20px 0 rgba(0,0,0,0.1)",
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: { width: theme.spacing(9) },
    }),
  },
}));

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [dashboardTitle, setDashboardTitle] = React.useState("Admin Dashboard");
  const [open, setOpen] = React.useState(true);
  const [adminInfo, setAdminInfo] = useState(null);

  const currentPath = location.pathname;

  const [openAdminMgmt, setOpenAdminMgmt] = React.useState(
    currentPath.includes("/manage-users") ||
      currentPath.includes("/manage-stores"),
  );

  useEffect(() => {
    // Dùng AdminService thay vì hardcode axios + localhost:9999
    AdminService.getReport()
      .then((res) => {
        if (res?.success) {
          setAdminInfo({
            totalUsers: res.data.totalUsers,
            totalSellers: res.data.totalSellers,
            totalProducts: res.data.totalProducts,
            totalOrders: res.data.totalOrders,
            avatarURL: "https://randomuser.me/api/portraits/men/41.jpg",
            fullname: "Admin User",
          });
        }
      })
      .catch(() => setAdminInfo(null));
  }, []);

  const toggleDrawer = () => setOpen(!open);
  const handleSetDashboardTitle = (title) => setDashboardTitle(title);

  const handleSignOut = async () => {
    await AuthenService.logout();
    dispatch(resetUserInfo());
    navigate("/signin");
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />

        {/* ─── AppBar ─────────────────────────────────────────── */}
        <AppBar position="absolute" open={open} color="default">
          <Toolbar sx={{ pr: "24px", backgroundColor: "white" }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer}
              sx={{ marginRight: "36px", ...(open && { display: "none" }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h5"
              color="primary"
              noWrap
              sx={{ flexGrow: 1, fontWeight: "bold" }}
            >
              {dashboardTitle}
            </Typography>

            <Tooltip title="Notifications">
              <IconButton color="primary" sx={{ mr: 1 }}>
                <Badge badgeContent={4} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title="Settings">
              <IconButton color="primary" sx={{ mr: 1 }}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Help">
              <IconButton color="primary" sx={{ mr: 2 }}>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>

            <Chip
              avatar={
                <Avatar
                  src={adminInfo?.avatarURL}
                  alt={adminInfo?.fullname || "Admin"}
                />
              }
              label={adminInfo?.fullname || "Admin"}
              color="primary"
              variant="outlined"
              sx={{ ml: 1, fontWeight: 600, fontSize: 16 }}
            />
          </Toolbar>
        </AppBar>

        {/* ─── Drawer ─────────────────────────────────────────── */}
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: [1],
              backgroundColor: "primary.dark",
            }}
          >
            {open && (
              <Typography
                variant="h6"
                color="primary.contrastText"
                sx={{ ml: 1 }}
              >
                Detox Tea Admin
              </Typography>
            )}
            <IconButton
              onClick={toggleDrawer}
              sx={{ color: "primary.contrastText" }}
            >
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>

          <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

          <List component="nav">
            {/* Dashboard */}
            <ListItemButton
              onClick={() => navigate("/admin")}
              selected={currentPath === "/admin"}
            >
              <ListItemIcon sx={{ color: "primary.contrastText" }}>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText
                primary="Dashboard Overview"
                primaryTypographyProps={{
                  fontWeight: currentPath === "/admin" ? "bold" : "normal",
                }}
              />
            </ListItemButton>

            {/* User Management (collapsible) */}
            <ListItemButton onClick={() => setOpenAdminMgmt((p) => !p)}>
              <ListItemIcon sx={{ color: "primary.contrastText" }}>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="User Management" />
              {openAdminMgmt ? (
                <ExpandLess sx={{ color: "primary.contrastText" }} />
              ) : (
                <ExpandMore sx={{ color: "primary.contrastText" }} />
              )}
            </ListItemButton>

            <Collapse in={openAdminMgmt} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => navigate("/admin/manage-users")}
                  selected={currentPath === "/admin/manage-users"}
                >
                  <ListItemIcon sx={{ color: "primary.contrastText" }}>
                    <PeopleIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Manage Users"
                    primaryTypographyProps={{
                      fontWeight:
                        currentPath === "/admin/manage-users"
                          ? "bold"
                          : "normal",
                    }}
                  />
                </ListItemButton>

                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => navigate("/admin/manage-stores")}
                  selected={currentPath === "/admin/manage-stores"}
                >
                  <ListItemIcon sx={{ color: "primary.contrastText" }}>
                    <StoreIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Manage Shops"
                    primaryTypographyProps={{
                      fontWeight:
                        currentPath === "/admin/manage-stores"
                          ? "bold"
                          : "normal",
                    }}
                  />
                </ListItemButton>
              </List>
            </Collapse>

            {/* Products */}
            <ListItemButton
              onClick={() => navigate("/admin/manage-products")}
              selected={currentPath === "/admin/manage-products"}
            >
              <ListItemIcon sx={{ color: "primary.contrastText" }}>
                <InventoryIcon />
              </ListItemIcon>
              <ListItemText
                primary="Manage Products"
                primaryTypographyProps={{
                  fontWeight:
                    currentPath === "/admin/manage-products"
                      ? "bold"
                      : "normal",
                }}
              />
            </ListItemButton>

            {/* Vouchers */}
            <ListItemButton
              onClick={() => navigate("/admin/manage-vouchers")}
              selected={currentPath === "/admin/manage-vouchers"}
            >
              <ListItemIcon sx={{ color: "primary.contrastText" }}>
                <LocalOfferIcon />
              </ListItemIcon>
              <ListItemText
                primary="Manage Vouchers"
                primaryTypographyProps={{
                  fontWeight:
                    currentPath === "/admin/manage-vouchers"
                      ? "bold"
                      : "normal",
                }}
              />
            </ListItemButton>

            {/* Payments */}
            <ListItemButton
              onClick={() => navigate("/admin/manage-payments")}
              selected={currentPath === "/admin/manage-payments"}
            >
              <ListItemIcon sx={{ color: "primary.contrastText" }}>
                <PaymentIcon />
              </ListItemIcon>
              <ListItemText
                primary="Payment Management"
                primaryTypographyProps={{
                  fontWeight:
                    currentPath === "/admin/manage-payments"
                      ? "bold"
                      : "normal",
                }}
              />
            </ListItemButton>

            <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.1)" }} />

            {/* Sign Out */}
            <ListItemButton onClick={handleSignOut}>
              <ListItemIcon sx={{ color: "primary.contrastText" }}>
                <MeetingRoomIcon />
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
            </ListItemButton>
          </List>
        </Drawer>

        {/* ─── Main Content ────────────────────────────────────── */}
        <Box
          component="main"
          sx={{
            backgroundColor: "background.default",
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />
          <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: "12px",
                boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
                mb: 3,
              }}
            >
              <Outlet context={{ handleSetDashboardTitle }} />
            </Paper>
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
