import { Outlet } from "react-router-dom";
import { AuthProvider } from "../contexts/AuthContext";

/**
 * RootLayout — bọc AuthProvider 1 lần duy nhất cho toàn bộ app.
 * Nằm bên trong RouterProvider nên useNavigate() hoạt động bình thường.
 */
const RootLayout = () => (
  <AuthProvider>
    <Outlet />
  </AuthProvider>
);

export default RootLayout;
