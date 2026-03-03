import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaBox,
  FaCheck,
  FaClock,
  FaCreditCard,
  FaExchangeAlt,
  FaExclamationCircle,
  FaMapMarkerAlt,
  FaMoneyBill,
  FaReceipt,
  FaRegStar,
  FaShippingFast,
  FaSpinner,
  FaStar,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import { fetchDisputeDetails } from "../../features/dispute/disputeSlice";
import {
  clearOrderDetails,
  fetchOrderDetails,
} from "../../features/order/orderSlice";
import { checkPaymentStatus } from "../../features/payment/paymentSlice";
import { createReturnRequest } from "../../features/returnRequest/returnRequestSlice";
import {
  createReview,
  fetchUserReviews,
} from "../../features/review/reviewSlice";

const OrderDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const disputeId = searchParams.get("disputeId");
  const focusItemId = searchParams.get("focusItemId");

  const { orderDetails, loading } = useSelector((state) => state.order);
  const {
    success: reviewSuccess,
    loading: reviewLoading,
    userReviews,
  } = useSelector((state) => state.review);
  const { currentDispute, loading: disputeLoading } = useSelector(
    (state) => state.dispute,
  );
  const { success: returnRequestSuccess, loading: returnRequestLoading } =
    useSelector((state) => state.returnRequest || {});

  // State for review form
  const [reviewForm, setReviewForm] = useState({
    productId: "",
    rating: 5,
    comment: "",
  });
  const [reviewFormVisible, setReviewFormVisible] = useState(false);

  // State for return request form
  const [returnForm, setReturnForm] = useState({
    orderItemId: "",
    reason: "",
  });
  const [returnFormVisible, setReturnFormVisible] = useState(false);

  // State for payment status
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Track which products have been reviewed
  const [reviewedProducts, setReviewedProducts] = useState(new Set());
  const [reviewedProductsList, setReviewedProductsList] = useState([]);

  // Track which items have return requests
  const [returnRequestedItems, setReturnRequestedItems] = useState(new Set());

  // State for dispute display
  const [showDisputeDetails, setShowDisputeDetails] = useState(false);

  // Helper to translate status to Vietnamese
  const translateStatus = (status) => {
    const statusMap = {
      // Order/Item statuses
      pending: "Chờ xử lý",
      shipping: "Đang vận chuyển",
      shipped: "Đã giao hàng",
      "failed to ship": "Giao thất bại",
      rejected: "Đã từ chối",
      cancelled: "Đã hủy",
      // Payment statuses
      paid: "Đã thanh toán",
      failed: "Thất bại",
      // Dispute statuses
      open: "Đang mở",
      under_review: "Đang xem xét",
      resolved: "Đã giải quyết",
      closed: "Đã đóng",
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetails(id));
    }

    // Fetch user reviews to check which products have already been reviewed
    dispatch(fetchUserReviews({ page: 1, limit: 100 }));

    // If disputeId is provided, fetch dispute details
    if (disputeId) {
      dispatch(fetchDisputeDetails(disputeId));
      setShowDisputeDetails(true);
    }

    // Cleanup when component unmounts
    return () => {
      dispatch(clearOrderDetails());
    };
  }, [dispatch, id, disputeId]);

  // Fetch payment status when orderDetails are loaded
  useEffect(() => {
    if (orderDetails && orderDetails._id) {
      setCheckingPayment(true);

      dispatch(checkPaymentStatus(orderDetails._id))
        .then((resultAction) => {
          if (checkPaymentStatus.fulfilled.match(resultAction)) {
            const data = resultAction.payload;
            setPaymentStatus(data?.payment?.status || null);
            setPaymentMethod(data?.payment?.method || null);
          }
        })
        .finally(() => {
          setCheckingPayment(false);
        });
    }
  }, [dispatch, orderDetails]);

  // Update reviewedProducts Set when userReviews are fetched
  useEffect(() => {
    if (userReviews && userReviews.length > 0) {
      const reviewedProductIds = new Set();
      const reviewedList = [];

      userReviews.forEach((review) => {
        // Only consider primary reviews (not replies)
        if (review.parentId === null || !review.parentId) {
          let productId = null;

          if (review.productId?._id) {
            productId = review.productId._id;
            reviewedProductIds.add(productId);
          } else if (typeof review.productId === "string") {
            productId = review.productId;
            reviewedProductIds.add(productId);
          }

          if (productId) {
            reviewedList.push(productId);
          }
        }
      });

      setReviewedProductsList(reviewedList);
      setReviewedProducts(reviewedProductIds);

      // Debug log to check what products are being marked as reviewed
      console.log("Reviewed products:", [...reviewedProductIds]);
    }
  }, [userReviews]);

  // Reset review form when review submission is successful
  useEffect(() => {
    if (reviewSuccess) {
      setReviewForm({
        productId: "",
        rating: 5,
        comment: "",
      });
      setReviewFormVisible(false);

      // Refresh user reviews to update the list of reviewed products
      dispatch(fetchUserReviews({ page: 1, limit: 100 }));
    }
  }, [reviewSuccess, dispatch]);

  // Reset return form when return request submission is successful
  useEffect(() => {
    if (returnRequestSuccess) {
      setReturnForm({
        orderItemId: "",
        reason: "",
      });
      setReturnFormVisible(false);

      // Add the order item ID to the return requested items set
      if (returnForm.orderItemId) {
        setReturnRequestedItems(
          (prev) => new Set([...prev, returnForm.orderItemId]),
        );
      }
    }
  }, [returnRequestSuccess, returnForm.orderItemId]);

  // Scroll to the focused item when the component mounts
  useEffect(() => {
    if (focusItemId && !loading) {
      const element = document.getElementById(`order-item-${focusItemId}`);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("highlight-item");
        }, 500);
      }
    }
  }, [focusItemId, loading, orderDetails]);

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingChange = (rating) => {
    setReviewForm((prev) => ({
      ...prev,
      rating,
    }));
  };

  const showReviewForm = (productId) => {
    setReviewForm({
      productId,
      rating: 5,
      comment: "",
    });
    setReviewFormVisible(true);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    dispatch(createReview(reviewForm));
  };

  const handleReturnChange = (e) => {
    const { name, value } = e.target;
    setReturnForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showReturnForm = (orderItemId) => {
    setReturnForm({
      orderItemId,
      reason: "",
    });
    setReturnFormVisible(true);
  };

  const handleReturnSubmit = (e) => {
    e.preventDefault();
    dispatch(createReturnRequest(returnForm));
  };

  // Handler for proceeding to payment
  const handleProceedToPayment = () => {
    if (!orderDetails || !orderDetails._id) return;

    toast.info("Đang chuyển hướng đến trang thanh toán...");
    navigate("/payment", {
      state: {
        orderId: orderDetails._id,
        totalPrice: orderDetails.totalPrice,
        preferredMethod: "PayOS",
        directPayment: true, // This will trigger automatic payment
        replaceExisting: true, // Indicate that existing payment records should be deleted
      },
    });
  };

  // Check if we should show the payment button
  const shouldShowPaymentButton = () => {
    // Hide button when checking payment status
    if (checkingPayment) return false;

    // Don't show payment button for COD orders
    if (paymentMethod === "COD") return false;

    // Show payment button if there's no payment record or payment failed
    if (!paymentStatus || paymentStatus === "failed") return true;

    // Don't show button if payment is completed
    if (paymentStatus === "paid") return false;

    // For all other cases (pending, etc), show the button
    return true;
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      return "Ngày không hợp lệ";
    }
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "shipping":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "shipped":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "failed to ship":
      case "rejected":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Helper function to get payment status badge color
  const getPaymentStatusBadgeColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "failed":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Helper function to get dispute status badge color
  const getDisputeStatusBadgeColor = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "under_review":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "resolved":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "closed":
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaClock className="mr-1" />;
      case "shipping":
        return <FaShippingFast className="mr-1" />;
      case "shipped":
        return <FaCheck className="mr-1" />;
      case "failed to ship":
      case "rejected":
        return <span className="mr-1">×</span>;
      default:
        return null;
    }
  };

  // Helper function to get payment status icon
  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <FaCheck className="mr-1" />;
      case "pending":
        return <FaClock className="mr-1" />;
      case "failed":
        return <span className="mr-1">×</span>;
      default:
        return <FaMoneyBill className="mr-1" />;
    }
  };

  // Get payment method display text
  const getPaymentMethodText = (method) => {
    switch (method) {
      case "COD":
        return "Thanh toán khi nhận hàng (COD)";
      case "VietQR":
        return "VietQR";
      case "PayOS":
        return "PayOS";
      default:
        return "Chưa xác định";
    }
  };

  // Only show review button for shipped items that haven't been reviewed yet
  const canReview = (item) => {
    if (!item || !item.productId) return false;

    const productId = item.productId._id;
    // Make sure item is shipped and has not been reviewed yet
    return item.status === "shipped" && !reviewedProducts.has(productId);
  };

  // Only show dispute button for shipped items that haven't been disputed yet
  const canDispute = (item) => {
    if (!item || !item.productId) return false;

    // Can only dispute shipped items
    return item.status === "shipped";
  };

  // Check if item can be returned (shipped items that haven't been returned yet)
  const canReturn = (item) => {
    if (!item || !item._id) return false;

    // Can only return shipped items and not already requested
    return item.status === "shipped" && !returnRequestedItems.has(item._id);
  };

  // Check if this item has an active dispute
  const hasDispute = (itemId) => {
    if (
      currentDispute &&
      currentDispute.orderItemId &&
      currentDispute.orderItemId._id === itemId
    ) {
      return true;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[60vh]">
        <FaSpinner className="mb-4 text-5xl text-[#2D4F3E] animate-spin" />
        <p className="font-medium text-gray-600">
          Đang tải chi tiết đơn hàng...
        </p>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="container px-4 py-16 mx-auto">
        <div className="max-w-lg p-8 mx-auto text-center bg-white shadow-md rounded-xl">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
            <FaReceipt className="text-2xl text-gray-500" />
          </div>
          <h2 className="mb-4 text-2xl font-bold text-gray-700">
            Không tìm thấy đơn hàng
          </h2>
          <p className="mb-6 text-gray-600">
            Chúng tôi không thể tìm thấy đơn hàng bạn đang tìm kiếm.
          </p>
          <Link
            to="/order-history"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 font-medium text-white transition-colors bg-[#2D4F3E] rounded-lg hover:bg-blue-700"
          >
            <FaArrowLeft className="text-sm" /> Quay lại Lịch sử đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto font-bodyFont">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link
          to="/order-history"
          className="inline-flex items-center gap-2 font-medium text-[#1A1A1A]"
        >
          <FaArrowLeft className="text-sm" /> Quay lại Lịch sử đơn hàng
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-6 mb-6 bg-white border border-gray-100 shadow-lg rounded-xl md:p-8"
      >
        <div className="flex flex-wrap items-start justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="p-2 bg-blue-100 rounded-lg">
                <FaReceipt className="text-[#2D4F3E]" />
              </span>
              <h1 className="text-2xl text-gray-800 md:text-3xl">
                Đơn hàng #{orderDetails._id.slice(-8).toUpperCase()}
              </h1>
            </div>
            <p className="flex items-center gap-2 text-gray-500">
              <FaClock className="text-sm" />
              Đặt ngày{" "}
              {formatDate(orderDetails.orderDate || orderDetails.createdAt)}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div
              className={`px-4 py-2 rounded-full text-sm font-medium flex items-center border ${getStatusBadgeColor(orderDetails.status)}`}
            >
              {getStatusIcon(orderDetails.status)}
              {translateStatus(orderDetails.status)}
            </div>

            {/* Payment Status Badge */}
            {checkingPayment ? (
              <div className="flex items-center gap-2 text-gray-500">
                <FaSpinner className="animate-spin" />
                <span>Đang kiểm tra thanh toán...</span>
              </div>
            ) : (
              <div>
                <div
                  className={`px-4 py-2 rounded-full text-sm font-medium flex items-center border ${getPaymentStatusBadgeColor(paymentStatus)}`}
                >
                  {getPaymentStatusIcon(paymentStatus)}
                  {paymentStatus === "paid" && "Đã thanh toán"}
                  {paymentStatus === "pending" && "Chờ thanh toán"}
                  {paymentStatus === "failed" && "Thanh toán thất bại"}
                  {!paymentStatus && "Chưa thanh toán"}
                </div>
                {paymentMethod && (
                  <div className="mt-1 text-xs text-center text-gray-600">
                    {getPaymentMethodText(paymentMethod)}
                  </div>
                )}
              </div>
            )}

            {/* Pay Now Button - Only show if not COD and not paid */}
            {shouldShowPaymentButton() && (
              <button
                onClick={handleProceedToPayment}
                className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-[#2D4F3E] rounded-lg hover:bg-blue-700"
              >
                <FaCreditCard />
                Thanh toán ngay
              </button>
            )}
          </div>
        </div>

        {/* Show dispute details if available */}
        {currentDispute && showDisputeDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-4 mb-8 border border-red-200 rounded-lg bg-red-50"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 mb-3">
                <FaExclamationCircle className="text-lg text-red-600" />
                <h3 className="text-lg font-bold text-gray-800">
                  Thông tin khiếu nại
                </h3>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center border ${getDisputeStatusBadgeColor(currentDispute.status)}`}
              >
                {currentDispute.status === "open" && (
                  <FaExclamationCircle className="mr-1" />
                )}
                {currentDispute.status === "under_review" && (
                  <FaClock className="mr-1" />
                )}
                {(currentDispute.status === "resolved" ||
                  currentDispute.status === "closed") && (
                  <span className="mr-1">✓</span>
                )}
                {translateStatus(currentDispute.status)}
              </div>
            </div>

            <div className="mb-2">
              <p className="text-sm text-gray-500">
                Đã gửi ngày: {formatDate(currentDispute.createdAt)}
              </p>
            </div>

            <div className="mb-4">
              <h4 className="mb-2 text-sm font-medium text-gray-700">Mô tả:</h4>
              <p className="p-3 text-gray-700 whitespace-pre-line bg-white border border-red-100 rounded-lg">
                {currentDispute.description}
              </p>
            </div>

            {currentDispute.resolution && (
              <div>
                <h4 className="mb-2 text-sm font-medium text-gray-700">
                  Hướng giải quyết:
                </h4>
                <p className="p-3 text-gray-700 bg-white border border-red-100 rounded-lg">
                  {currentDispute.resolution}
                </p>
              </div>
            )}

            <button
              onClick={() => setShowDisputeDetails(false)}
              className="mt-3 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              Ẩn chi tiết khiếu nại
            </button>
          </motion.div>
        )}

        <div className="grid gap-8 mb-10 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-lg bg-gray-50"
          >
            <h2 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
              <FaMapMarkerAlt className="text-[#2D4F3E]" />
              Địa chỉ giao hàng
            </h2>
            {orderDetails.addressId ? (
              <div className="space-y-1 text-gray-700">
                <p className="font-semibold text-gray-900">
                  {orderDetails.addressId.name ||
                    orderDetails.addressId.fullName}
                </p>
                <p>{orderDetails.addressId.phone}</p>
                <p>
                  {orderDetails.addressId.address ||
                    orderDetails.addressId.street}
                  , {orderDetails.addressId.city}
                </p>
                <p>
                  {orderDetails.addressId.province ||
                    orderDetails.addressId.state}
                  , {orderDetails.addressId.country}
                </p>
                <p>Mã bưu chính: {orderDetails.addressId.zipCode}</p>
              </div>
            ) : (
              <p className="italic text-gray-500">Không có thông tin địa chỉ</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-lg bg-gray-50"
          >
            <h2 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-800">
              <FaBox className="text-[#2D4F3E]" />
              Tóm tắt đơn hàng
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng tiền hàng:</span>
                <span className="font-medium">
                  ${orderDetails.totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển:</span>
                <span className="font-medium">Miễn phí</span>
              </div>
              <div className="h-px my-2 bg-gray-200"></div>
              <div className="flex justify-between text-lg">
                <span className="font-bold text-gray-800">Tổng cộng:</span>
                <span className="font-bold text-[#2D4F3E]">
                  ${orderDetails.totalPrice.toFixed(2)}
                </span>
              </div>

              {/* Payment Status */}
              <div className="h-px my-2 bg-gray-200"></div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Trạng thái thanh toán:</span>
                {checkingPayment ? (
                  <div className="flex items-center gap-2">
                    <FaSpinner className="text-gray-500 animate-spin" />
                    <span className="text-gray-500">Đang kiểm tra...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border inline-flex items-center ${getPaymentStatusBadgeColor(paymentStatus)}`}
                    >
                      {getPaymentStatusIcon(paymentStatus)}
                      {paymentStatus === "paid" && "Đã thanh toán"}
                      {paymentStatus === "pending" && "Chờ thanh toán"}
                      {paymentStatus === "failed" && "Thất bại"}
                      {!paymentStatus && "Chưa thanh toán"}
                    </span>
                    {paymentMethod && (
                      <span className="mt-1 text-xs text-gray-500">
                        {getPaymentMethodText(paymentMethod)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Pay Now Button */}
              {shouldShowPaymentButton() && (
                <div className="mt-4">
                  <button
                    onClick={handleProceedToPayment}
                    className="flex items-center justify-center w-full gap-2 px-4 py-2 font-medium text-white transition-colors bg-[#2D4F3E] rounded-lg hover:bg-blue-700"
                  >
                    <FaCreditCard />
                    Thanh toán ngay
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="flex items-center gap-2 pb-4 mb-6 text-xl font-bold text-gray-800 border-b">
            <FaBox className="text-[#2D4F3E]" />
            Sản phẩm
          </h2>

          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Giá
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Số lượng
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Thành tiền
                  </th>
                  <th className="px-6 py-4 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderDetails.items &&
                  orderDetails.items.map((item, index) => (
                    <motion.tr
                      id={`order-item-${item._id}`}
                      key={item._id}
                      className={`hover:bg-gray-50 transition-colors ${item._id === focusItemId ? "bg-yellow-50" : ""}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * (index + 1) }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.productId?.image ? (
                            <div className="flex-shrink-0 mr-4 h-14 w-14">
                              <img
                                src={item.productId.image}
                                alt={item.productId?.title}
                                className="object-cover rounded-lg shadow-sm h-14 w-14"
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center flex-shrink-0 mr-4 bg-gray-100 rounded-lg h-14 w-14">
                              <FaBox className="text-xl text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                              {item.productId?.title ||
                                "Sản phẩm không khả dụng"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${item.unitPrice?.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center w-10 h-8 text-sm font-medium bg-gray-100 rounded-md">
                          {item.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center w-fit ${getStatusBadgeColor(item.status)}`}
                        >
                          {getStatusIcon(item.status)}
                          {translateStatus(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-right text-gray-900 whitespace-nowrap">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {item.status === "shipped" && item.productId && (
                          <>
                            {reviewedProducts.has(item.productId._id) ? (
                              <span className="text-green-600 bg-green-50 px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-1">
                                <FaCheck className="text-xs" /> Đã đánh giá
                              </span>
                            ) : (
                              <button
                                className="text-[#2D4F3E] hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 transition-colors px-3 py-1.5 rounded-lg text-sm"
                                onClick={() =>
                                  showReviewForm(item.productId._id)
                                }
                              >
                                Viết đánh giá
                              </button>
                            )}
                          </>
                        )}
                        <div className="flex flex-wrap justify-end gap-2 mt-2">
                          {canDispute(item) && (
                            <div>
                              {/* If this item has a current dispute that matches the one we fetched */}
                              {hasDispute(item._id) ? (
                                <div className="flex items-center justify-end gap-1 text-sm text-red-600">
                                  <FaExclamationCircle className="text-xs" />
                                  <span>Đang khiếu nại</span>
                                  {!showDisputeDetails && (
                                    <button
                                      onClick={() =>
                                        setShowDisputeDetails(true)
                                      }
                                      className="ml-2 text-[#2D4F3E] underline hover:text-blue-800"
                                    >
                                      Xem chi tiết
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <Link
                                  to={`/create-dispute/${item._id}`}
                                  className="text-red-600 hover:text-red-800 font-medium bg-red-50 hover:bg-red-100 transition-colors px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-1"
                                >
                                  <FaExclamationCircle className="text-xs" />{" "}
                                  Báo cáo sự cố
                                </Link>
                              )}
                            </div>
                          )}

                          {canReturn(item) && (
                            <button
                              onClick={() => showReturnForm(item._id)}
                              className="text-amber-600 hover:text-amber-800 font-medium bg-amber-50 hover:bg-amber-100 transition-colors px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-1"
                            >
                              <FaExchangeAlt className="text-xs" /> Trả hàng
                            </button>
                          )}

                          {returnRequestedItems.has(item._id) && (
                            <div className="flex items-center justify-end gap-1 text-sm text-amber-600">
                              <FaExchangeAlt className="text-xs" />
                              <span>Đã yêu cầu trả hàng</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr className="border-t-2 border-gray-200">
                  <td
                    colSpan="4"
                    className="px-6 py-4 font-bold text-right text-gray-700"
                  >
                    Tổng cộng:
                  </td>
                  <td className="px-6 py-4 font-bold text-right text-[#2D4F3E]">
                    ${orderDetails.totalPrice.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {reviewFormVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center w-full h-full overflow-y-auto bg-gray-900 bg-opacity-60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md p-8 mx-auto bg-white shadow-2xl rounded-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Viết đánh giá
                </h3>
                <button
                  onClick={() => setReviewFormVisible(false)}
                  className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:text-gray-700 hover:bg-gray-200"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleReviewSubmit}>
                <div className="mb-6">
                  <label className="block mb-3 text-sm font-bold text-gray-700">
                    Đánh giá của bạn
                  </label>
                  <div className="flex gap-2 p-3 rounded-lg bg-gray-50">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className="text-2xl transition-transform focus:outline-none hover:scale-110"
                      >
                        {star <= reviewForm.rating ? (
                          <FaStar className="text-yellow-400" />
                        ) : (
                          <FaRegStar className="text-gray-300" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="comment"
                    className="block mb-3 text-sm font-bold text-gray-700"
                  >
                    Nhận xét của bạn
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={reviewForm.comment}
                    onChange={handleReviewChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewFormVisible(false)}
                    className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#2D4F3E] text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                    disabled={reviewLoading}
                  >
                    {reviewLoading ? (
                      <>
                        <FaSpinner className="animate-spin" /> Đang gửi...
                      </>
                    ) : (
                      <>
                        <FaCheck /> Gửi đánh giá
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Return Request Form Modal */}
      <AnimatePresence>
        {returnFormVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center w-full h-full overflow-y-auto bg-gray-900 bg-opacity-60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md p-8 mx-auto bg-white shadow-2xl rounded-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Yêu cầu trả hàng
                </h3>
                <button
                  onClick={() => setReturnFormVisible(false)}
                  className="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors bg-gray-100 rounded-full hover:text-gray-700 hover:bg-gray-200"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleReturnSubmit}>
                <div className="mb-6">
                  <label
                    htmlFor="reason"
                    className="block mb-3 text-sm font-bold text-gray-700"
                  >
                    Lý do trả hàng
                  </label>
                  <textarea
                    id="reason"
                    name="reason"
                    value={returnForm.reason}
                    onChange={handleReturnChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Vui lòng giải thích lý do bạn muốn trả hàng..."
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReturnFormVisible(false)}
                    className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium transition-colors flex items-center gap-2"
                    disabled={returnRequestLoading}
                  >
                    {returnRequestLoading ? (
                      <>
                        <FaSpinner className="animate-spin" /> Đang gửi...
                      </>
                    ) : (
                      <>
                        <FaExchangeAlt /> Gửi yêu cầu
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add CSS for highlight animation */}
      <style jsx="true">{`
        .highlight-item {
          animation: highlight 2s ease-in-out;
        }

        @keyframes highlight {
          0% {
            background-color: #fff;
          }
          25% {
            background-color: rgba(253, 224, 71, 0.5);
          }
          75% {
            background-color: rgba(253, 224, 71, 0.5);
          }
          100% {
            background-color: #fff;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderDetail;
