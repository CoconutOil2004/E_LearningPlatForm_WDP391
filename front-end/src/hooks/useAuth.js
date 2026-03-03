import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../features/auth/authSlice";
import { resetUserInfo } from "../redux/slices/orebi.slice";
import AuthenService from "../services/api/AuthenService";

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const handleLogout = useCallback(async () => {
    try {
      await AuthenService.logout();
    } catch {
    } finally {
      dispatch(logout());
      dispatch(resetUserInfo());
      navigate("/signin");
    }
  }, [dispatch, navigate]);

  return { user, token, isAuthenticated, handleLogout };
};

export default useAuth;
