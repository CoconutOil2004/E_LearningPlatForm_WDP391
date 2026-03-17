import { Outlet } from "react-router-dom";
import GlobalInitializer from "../components/shared/GlobalInitializer";
import { AuthProvider } from "../contexts/AuthContext";
import { ToastProvider } from "../contexts/ToastContext";

const RootLayout = () => (
  <ToastProvider>
    <AuthProvider>
      <GlobalInitializer />
      <Outlet />
    </AuthProvider>
  </ToastProvider>
);

export default RootLayout;
