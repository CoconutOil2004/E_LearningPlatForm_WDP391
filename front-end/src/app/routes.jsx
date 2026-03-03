import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

// ─── Layouts ─────────────────────────────────────────────────────────────────
import AdminLayout from "../layouts/AdminLayout";
import AnonymousLayout from "../layouts/AnonymousLayout";
import SellerLayout from "../layouts/SellerLayout";

// ─── Error ───────────────────────────────────────────────────────────────────
import ErrorPage from "../pages/ErrorPage";

// ─── Public Pages ─────────────────────────────────────────────────────────────
import Watchlist from "../components/home/Header/Watchlist";
import AboutUs from "../pages/AboutUs/AboutUs";
import Address from "../pages/Address/Address";
import AuthCallback from "../pages/AuthCallback";
import Cart from "../pages/Cart/Cart";
import Chat from "../pages/Chat/Chat";
import Checkout from "../pages/Checkout/Checkout";
import CreateDisputeForm from "../pages/Disputes/CreateDisputeForm";
import MyDisputes from "../pages/Disputes/MyDisputes";
import ForgotPassword from "../pages/ForgotPassword";
import Home from "../pages/Home";
import MyReviews from "../pages/MyReviews/MyReviews";
import OrderDetail from "../pages/OrderHistory/OrderDetail";
import OrderHistory from "../pages/OrderHistory/OrderHistory";
import OTPVerification from "../pages/OTPVerification";
import Payment from "../pages/Payment/Payment";
import PaymentResult from "../pages/PaymentResult/PaymentResult";
import AuthProductDetail from "../pages/ProductDetail/AuthProductDetail";
import ProductList from "../pages/ProductList/ProductList";
import Profile from "../pages/Profile/Profile";
import ReturnRequestsList from "../pages/ReturnRequests/ReturnRequestsList";
import WriteReview from "../pages/Review/WriteReview";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";
import StoreRegistration from "../pages/StoreRegistration";

// ─── Seller Pages ─────────────────────────────────────────────────────────────
import ManageDispute from "../pages/DashboardSeller/ManageDispute/ManageDispute";
import ManageOrder from "../pages/DashboardSeller/ManageOrder/ManageOrderHistory";
import ManageInventory from "../pages/DashboardSeller/ManageProduct/ManageInventory";
import ManageProduct from "../pages/DashboardSeller/ManageProduct/ManageProduct";
import SellerProductDetail from "../pages/DashboardSeller/ManageProduct/ProductDetail";
import SellerManageReturnRequest from "../pages/DashboardSeller/ManageReturnRequest/ManageReturnRequest";
import ManageShipping from "../pages/DashboardSeller/ManageShipping/ManageShipping";
import ManageStoreProfile from "../pages/DashboardSeller/ManageStoreProfile/ManageStoreProfile";
import SellerOverview from "../pages/DashboardSeller/Overview/Overview";

// ─── Admin Pages ──────────────────────────────────────────────────────────────
import ManagePayment from "../pages/DashboardAdmin/ManagePayment/ManagePayment";
import AdminManageProduct from "../pages/DashboardAdmin/ManageProduct/ManageProduct";
import ManageStore from "../pages/DashboardAdmin/ManageShop/ManageStore";
import ManageUser from "../pages/DashboardAdmin/ManageUser/ManageUser";
import ManageVoucher from "../pages/DashboardAdmin/ManageVoucher/ManageVoucher";
import AdminOverview from "../pages/DashboardAdmin/Overview/Overview";

// ─────────────────────────────────────────────────────────────────────────────

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route errorElement={<ErrorPage />}>
      {/* ── Anonymous / Public routes ─────────────────────────────────────── */}
      <Route element={<AnonymousLayout />}>
        <Route index element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/products" element={<ProductList />} />
        <Route
          path="/auth/product/:productId"
          element={<AuthProductDetail />}
        />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/address" element={<Address />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/payment-result" element={<PaymentResult />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/order-details/:id" element={<OrderDetail />} />
        <Route path="/my-reviews" element={<MyReviews />} />
        <Route path="/write-review/:productId" element={<WriteReview />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/disputes" element={<MyDisputes />} />
        <Route
          path="/create-dispute/:orderItemId"
          element={<CreateDisputeForm />}
        />
        <Route path="/return-requests" element={<ReturnRequestsList />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
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
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="manage-products" element={<AdminManageProduct />} />
        <Route path="manage-users" element={<ManageUser />} />
        <Route path="manage-stores" element={<ManageStore />} />
        <Route path="manage-vouchers" element={<ManageVoucher />} />
        <Route path="manage-payments" element={<ManagePayment />} />
      </Route>

      {/* ── Fallback ─────────────────────────────────────────────────────── */}
      <Route path="*" element={<ErrorPage />} />
    </Route>,
  ),
);

export default router;
