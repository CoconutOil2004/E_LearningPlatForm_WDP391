import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

// ─── Layouts ─────────────────────────────────────────────────────────────────
import AdminLayout from "./layouts/AdminLayout";
import AnonymousLayout from "./layouts/AnonymousLayout";
import SellerLayout from "./layouts/SellerLayout";

// ─── Error ───────────────────────────────────────────────────────────────────
import ErrorPage from "./pages/ErrorPage";

// ─── Public Pages ─────────────────────────────────────────────────────────────
import Watchlist from "./components/home/Header/Watchlist";
import AuthCallback from "./pages/AuthCallback";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import OTPVerification from "./pages/OTPVerification";
import Payment from "./pages/Payment/Payment";
import PaymentResult from "./pages/PaymentResult/PaymentResult";
import Profile from "./pages/Profile/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import StoreRegistration from "./pages/StoreRegistration";

// ─── Seller Pages ─────────────────────────────────────────────────────────────
import ManageDispute from "./pages/DashboardSeller/ManageDispute/ManageDispute";
import ManageOrder from "./pages/DashboardSeller/ManageOrder/ManageOrderHistory";
import ManageInventory from "./pages/DashboardSeller/ManageProduct/ManageInventory";
import ManageProduct from "./pages/DashboardSeller/ManageProduct/ManageProduct";
import SellerProductDetail from "./pages/DashboardSeller/ManageProduct/ProductDetail";
import SellerManageReturnRequest from "./pages/DashboardSeller/ManageReturnRequest/ManageReturnRequest";
import ManageShipping from "./pages/DashboardSeller/ManageShipping/ManageShipping";
import ManageStoreProfile from "./pages/DashboardSeller/ManageStoreProfile/ManageStoreProfile";
import SellerOverview from "./pages/DashboardSeller/Overview/Overview";

// ─────────────────────────────────────────────────────────────────────────────

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<ErrorPage />}>
      {/* ── Anonymous / Public routes ─────────────────────────────────────── */}
      <Route element={<AnonymousLayout />}>
        <Route index element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-result" element={<PaymentResult />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/store-registration" element={<StoreRegistration />} />
      </Route>

      {/* ── Seller routes ────────────────────────────────────────────────── */}
      <Route element={<SellerLayout />} errorElement={<ErrorPage />}>
        <Route path="/overview" element={<SellerOverview />} />
        <Route path="/manage-product" element={<ManageProduct />} />
        <Route path="/manage-inventory" element={<ManageInventory />} />
        <Route path="/manage-store" element={<ManageStoreProfile />} />
        <Route path="/product/:id" element={<SellerProductDetail />} />
        <Route path="/manage-order" element={<ManageOrder />} />
        <Route path="/manage-shipping" element={<ManageShipping />} />
        <Route path="/manage-dispute" element={<ManageDispute />} />
        <Route
          path="/manage-return-request"
          element={<SellerManageReturnRequest />}
        />
      </Route>

      {/* ── Admin routes ─────────────────────────────────────────────────── */}
      <Route path="/admin" element={<AdminLayout />} />

      {/* ── Fallback ─────────────────────────────────────────────────────── */}
      <Route path="*" element={<ErrorPage />} />
    </Route>,
  ),
);

export default router;
