import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { fetchUserProfile } from "./features/profile/profileSlice";
import router from "./routes";

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, token]);

  return (
    <ToastProvider>
      <div className="font-bodyFont">
        <RouterProvider router={router} />
      </div>
    </ToastProvider>
  );
}

export default App;
