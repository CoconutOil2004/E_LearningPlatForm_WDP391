import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";

import { ToastProvider } from "../context/ToastContext";
import { fetchCart } from "../features/cart/cartSlice";
import router from "./routes";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <ToastProvider>
      <div className="font-bodyFont">
        <RouterProvider router={router} />
      </div>
    </ToastProvider>
  );
}

export default App;
