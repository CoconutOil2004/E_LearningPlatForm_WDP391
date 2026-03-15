import { Outlet } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";
import GlobalInitializer from "../components/shared/GlobalInitializer";

/**
 * RootLayout — bọc AuthProvider 1 lần duy nhất cho toàn bộ app.
 * Nằm bên trong RouterProvider nên useNavigate() hoạt động bình thường.
 */
const RootLayout = () => (
  <AuthProvider>
    <GlobalInitializer />
    <Outlet />
  </AuthProvider>
);

export default RootLayout;
