import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FeedbackIcon from "@mui/icons-material/Feedback";
import HomeIcon from "@mui/icons-material/Home";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import MenuIcon from "@mui/icons-material/Menu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import WidgetsIcon from "@mui/icons-material/Widgets";
import { Avatar, Chip } from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
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
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useEffect, useState } from "react";

import { useDispatch } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { logout } from "../features/auth/authSlice";
import { resetUserInfo } from "../redux/slices/orebi.slice";
import AuthenService from "../services/api/AuthenService";
import SellerService from "../services/api/SellerService";

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
      <Link color="inherit" href="/">
        ebay
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

// ─── Theme ────────────────────────────────────────────────────────────────────

const drawerWidth = 260;

const theme = createTheme({
  palette: {
    primary: { main: "#0064D3", light: "#3b82f6", dark: "#1d4ed8" },
    secondary: { main: "#E53238", light: "#ef5350", dark: "#c62828" },
    success: { main: "#86B817", light: "#a3d06c", dark: "#5a7e12" },
    error: { main: "#E53238", light: "#ef5350", dark: "#c62828" },
    warning: { main: "#F5AF02", light: "#fdd835", dark: "#c49000" },
    info: { main: "#0064D3", light: "#42a5f5", dark: "#0d47a1" },
    background: { default: "#f9fafb", paper: "#ffffff" },
    text: { primary: "#1f2937", secondary: "#4b5563", disabled: "#9ca3af" },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6, textTransform: "none", fontWeight: 500 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow:
            "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
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
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
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
    backgroundColor: theme.palette.background.paper,
    boxShadow:
      "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
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
    "& .MuiListItemIcon-root": {
      color: theme.palette.primary.main,
      minWidth: 36,
    },
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius,
  margin: "4px 8px",
  transition: "all 0.2s ease",
  "&:hover": { backgroundColor: theme.palette.primary.light + "20" },
  ...(selected && {
    backgroundColor: theme.palette.primary.light + "20",
    "&:hover": { backgroundColor: theme.palette.primary.light + "30" },
    "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
    "& .MuiListItemText-primary": {
      fontWeight: 600,
      color: theme.palette.primary.main,
    },
  }),
}));

// ─── Component ────────────────────────────────────────────────────────────────

export default function SellerLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [dashboardTitle, setDashboardTitle] = React.useState("Dashboard");
  const [open, setOpen] = React.useState(true);
  const [storeInfo, setStoreInfo] = useState(null);

  const currentPath = location.pathname;

  useEffect(() => {
    SellerService.getStoreProfile()
      .then((res) => setStoreInfo(res.data))
      .catch(() => setStoreInfo(null));
  }, []);

  const toggleDrawer = () => setOpen(!open);
  const isActive = (path) => currentPath.includes(path);
  const handleSetDashboardTitle = (title) => setDashboardTitle(title);

  const navTo = (path) => navigate(path);

  const handleSignOut = async () => {
    try {
      await AuthenService.logout();
      dispatch(logout());
      dispatch(resetUserInfo());
      navigate("/signin");
    } catch {
      navigate("/signin");
    }
  };

  // ─── Nav items config ───────────────────────────────────────────────────────
  const navItems = [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/overview" },
    { label: "Go to Shop", icon: <HomeIcon />, path: "/" },
  ];

  const storeItems = [
    { label: "Store Profile", icon: <StorefrontIcon />, path: "/manage-store" },
    { label: "Products", icon: <WidgetsIcon />, path: "/manage-product" },
    { label: "Inventory", icon: <WarehouseIcon />, path: "/manage-inventory" },
  ];

  const orderItems = [
    { label: "Orders", icon: <ShoppingCartIcon />, path: "/manage-order" },
    {
      label: "Shipping",
      icon: <LocalShippingIcon />,
      path: "/manage-shipping",
    },
  ];

  const serviceItems = [
    {
      label: "Return Requests",
      icon: <KeyboardReturnIcon />,
      path: "/manage-return-request",
    },
    { label: "Disputes", icon: <FeedbackIcon />, path: "/manage-dispute" },
  ];

  const renderNavItem = ({ label, icon, path }) => (
    <StyledListItemButton
      key={path}
      onClick={() => navTo(path)}
      selected={isActive(path)}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      {open && <ListItemText primary={label} />}
    </StyledListItemButton>
  );

  const renderSectionLabel = (label) =>
    open && (
      <Box sx={{ mx: 2, mt: 2, mb: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          sx={{ pl: 1 }}
        >
          {label}
        </Typography>
      </Box>
    );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />

        {/* ─── AppBar ─────────────────────────────────────────── */}
        <AppBar position="absolute" open={open}>
          <Toolbar sx={{ pr: "24px" }}>
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
              color="inherit"
              noWrap
              sx={{ flexGrow: 1, fontWeight: 600 }}
            >
              {dashboardTitle}
            </Typography>
            {storeInfo ? (
              <Chip
                avatar={
                  <Avatar
                    src={storeInfo.sellerId?.avatarURL}
                    alt={storeInfo.sellerId?.fullname}
                    sx={{ width: 32, height: 32, border: "2px solid white" }}
                  />
                }
                label={storeInfo.sellerId?.fullname}
                sx={{
                  ml: 2,
                  fontWeight: 600,
                  fontSize: 16,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                  height: 38,
                }}
              />
            ) : (
              <Chip
                avatar={<Avatar />}
                label="Loading..."
                sx={{
                  ml: 2,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  color: "white",
                }}
              />
            )}
          </Toolbar>
        </AppBar>

        {/* ─── Drawer ─────────────────────────────────────────── */}
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
              height: 70,
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            {open && (
              <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    ml: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <StorefrontIcon sx={{ mr: 1 }} />
                  Seller Portal
                </Typography>
              </Box>
            )}
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>

          <Box
            sx={{
              height: "calc(100vh - 70px)",
              overflowY: "auto",
              py: 2,
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#e2e8f0",
                borderRadius: "10px",
              },
            }}
          >
            <List component="nav">
              {navItems.map(renderNavItem)}

              {renderSectionLabel("STORE MANAGEMENT")}
              {storeItems.map(renderNavItem)}

              {renderSectionLabel("ORDERS & SHIPPING")}
              {orderItems.map(renderNavItem)}

              {renderSectionLabel("CUSTOMER SERVICE")}
              {serviceItems.map(renderNavItem)}

              <Divider sx={{ my: 2 }} />

              <StyledListItemButton
                onClick={handleSignOut}
                sx={{ color: "error.main" }}
              >
                <ListItemIcon sx={{ color: "error.main" }}>
                  <MeetingRoomIcon />
                </ListItemIcon>
                {open && <ListItemText primary="Sign Out" />}
              </StyledListItemButton>
            </List>

            {open && (
              <Box sx={{ mt: 4, px: 2 }}>
                <Copyright />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  align="center"
                  display="block"
                  sx={{ mt: 1 }}
                >
                  v1.0.0
                </Typography>
              </Box>
            )}
          </Box>
        </Drawer>

        {/* ─── Main Content ────────────────────────────────────── */}
        <Box
          component="main"
          sx={{
            backgroundColor: "#f9fafb",
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar sx={{ height: 70 }} />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box
              sx={{
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                p: { xs: 2, md: 3 },
              }}
            >
              <Outlet context={{ handleSetDashboardTitle }} />
            </Box>
            <Copyright sx={{ pt: 4 }} />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
