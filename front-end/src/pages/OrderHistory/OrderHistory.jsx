import { format } from "date-fns";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FaBox,
  FaCheck,
  FaChevronDown,
  FaClock,
  FaCreditCard,
  FaFilter,
  FaMoneyBill,
  FaSearch,
  FaShippingFast,
  FaShoppingBag,
  FaSpinner,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import { fetchOrderHistory } from "../../features/order/orderSlice";
import { checkPaymentStatus } from "../../features/payment/paymentSlice";
import { fetchUserReviews } from "../../features/review/reviewSlice";

const OrderHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, pagination, loading } = useSelector((state) => state.order);
  const { userReviews } = useSelector((state) => state.review);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedOrders, setExpandedOrders] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const [paymentMethods, setPaymentMethods] = useState({});
  const [checkingPayment, setCheckingPayment] = useState({});
  const [reviewedProducts, setReviewedProducts] = useState(new Set());

  useEffect(() => {
    dispatch(
      fetchOrderHistory({ page: currentPage, limit: 10, status: statusFilter }),
    );
    dispatch(fetchUserReviews({ page: 1, limit: 100 }));
  }, [dispatch, currentPage, statusFilter]);

  useEffect(() => {
    if (orders?.length > 0) {
      orders.forEach((order) => {
        if (!paymentStatuses[order._id] && !checkingPayment[order._id]) {
          setCheckingPayment((prev) => ({ ...prev, [order._id]: true }));
          dispatch(checkPaymentStatus(order._id))
            .then((action) => {
              if (checkPaymentStatus.fulfilled.match(action)) {
                const data = action.payload;
                setPaymentStatuses((prev) => ({
                  ...prev,
                  [order._id]: data?.payment?.status || null,
                }));
                setPaymentMethods((prev) => ({
                  ...prev,
                  [order._id]: data?.payment?.method || null,
                }));
              }
            })
            .finally(() => {
              setCheckingPayment((prev) => ({ ...prev, [order._id]: false }));
            });
        }
      });
    }
  }, [dispatch, orders, paymentStatuses, checkingPayment]);

  useEffect(() => {
    if (userReviews?.length > 0) {
      const reviewedProductIds = new Set(
        userReviews
          .filter((review) => !review.parentId)
          .map((review) => review.productId?._id || review.productId)
          .filter(Boolean),
      );
      setReviewedProducts(reviewedProductIds);
    }
  }, [userReviews]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };
  const toggleOrderExpansion = (orderId) =>
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));

  const handleProceedToPayment = (orderId) => {
    toast.info("Đang chuyển hướng đến trang thanh toán...");
    navigate("/payment", {
      state: {
        orderId,
        preferredMethod: "PayOS",
        directPayment: true,
        replaceExisting: true,
      },
    });
  };

  const shouldShowPaymentButton = (orderId) => {
    if (
      checkingPayment[orderId] ||
      paymentMethods[orderId] === "COD" ||
      paymentStatuses[orderId] === "paid"
    ) {
      return false;
    }
    return !paymentStatuses[orderId] || paymentStatuses[orderId] === "failed";
  };

  const formatOrderDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    } catch {
      return "Ngày không hợp lệ";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-soft-gold/10 text-soft-gold border-soft-gold/20";
      case "shipping":
        return "bg-sage-green/20 text-forest-green border-sage-green/30";
      case "shipped":
        return "bg-forest-green/10 text-forest-green border-forest-green/20";
      case "failed to ship":
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-black/5 text-charcoal/80 border-black/10";
    }
  };

  const getPaymentStatusBadgeColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-forest-green/10 text-forest-green border-forest-green/20";
      case "pending":
        return "bg-soft-gold/10 text-soft-gold border-soft-gold/20";
      case "failed":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-black/5 text-charcoal/80 border-black/10";
    }
  };

  const getStatusText = (status) => {
    const map = {
      pending: "Chờ xử lý",
      shipping: "Đang giao hàng",
      shipped: "Đã giao hàng",
      "failed to ship": "Giao hàng thất bại",
      rejected: "Đã bị từ chối",
    };
    return map[status] || status;
  };

  const getPaymentStatusText = (status) => {
    const map = {
      paid: "Đã thanh toán",
      pending: "Chờ thanh toán",
      failed: "Thanh toán lỗi",
    };
    return map[status] || "Chưa thanh toán";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: FaClock,
      shipping: FaShippingFast,
      shipped: FaCheck,
    };
    const Icon = icons[status];
    return Icon ? <Icon className="mr-1" /> : <span className="mr-1">×</span>;
  };

  const getPaymentStatusIcon = (status) => {
    const icons = { paid: FaCheck, pending: FaClock };
    const Icon = icons[status];
    return Icon ? (
      <Icon className="mr-1" />
    ) : status === "failed" ? (
      <span className="mr-1">×</span>
    ) : (
      <FaMoneyBill className="mr-1" />
    );
  };

  const getPaymentMethodText = (method) =>
    ({ COD: "Thanh toán khi nhận hàng", VietQR: "VietQR", PayOS: "PayOS" })[
      method
    ] || "Chưa xác định";

  return (
    <div className="min-h-screen bg-cream font-bodyFont">
      <div className="container max-w-6xl px-4 py-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="bg-sage-green/20 p-2.5 rounded-full">
              <FaShoppingBag className="text-xl text-forest-green" />
            </div>
            <h1 className="text-2xl font-bold md:text-3xl text-charcoal font-titleFont">
              Đơn hàng của tôi
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-black/10 rounded-lg pl-10 pr-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-forest-green bg-white"
              />
              <FaSearch className="absolute left-3.5 top-3.5 text-charcoal/50" />
            </div>
            <div className="relative">
              <select
                id="status-filter"
                value={statusFilter}
                onChange={handleStatusChange}
                className="border border-black/10 rounded-lg pl-10 pr-4 py-2.5 w-full appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-forest-green"
              >
                <option value="">Tất cả đơn hàng</option>
                <option value="pending">Chờ xử lý</option>
                <option value="shipping">Đang giao hàng</option>
                <option value="shipped">Đã giao hàng</option>
                <option value="failed to ship">Giao hàng thất bại</option>
                <option value="rejected">Đã hủy</option>
              </select>
              <FaFilter className="absolute left-3.5 top-3.5 text-charcoal/50" />
            </div>
          </div>
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <FaSpinner className="mb-4 text-4xl animate-spin text-forest-green" />
            <p className="font-medium text-charcoal/80">
              Đang tải danh sách đơn hàng...
            </p>
          </motion.div>
        ) : orders?.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="space-y-5">
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  className="overflow-hidden bg-white border shadow-sm border-black/10 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index % 5) }}
                >
                  <div
                    className={`flex justify-between items-center p-5 ${expandedOrders[order._id] ? "bg-forest-green/5 border-b border-forest-green/10" : "bg-white"}`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                      <div>
                        <span className="block mb-1 text-xs tracking-wider uppercase text-charcoal/60">
                          Mã đơn hàng
                        </span>
                        <span className="font-mono font-medium text-charcoal">
                          {order._id.slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="block mb-1 text-xs tracking-wider uppercase text-charcoal/60">
                          Ngày đặt
                        </span>
                        <span className="text-sm text-charcoal">
                          {formatOrderDate(order.orderDate || order.createdAt)}
                        </span>
                      </div>
                      <div>
                        <span className="block mb-1 text-xs tracking-wider uppercase text-charcoal/60">
                          Tổng tiền
                        </span>
                        <span className="font-medium text-charcoal">
                          {order.totalPrice.toLocaleString()}.000đ
                        </span>
                      </div>
                      <div>
                        <span className="block mb-1 text-xs tracking-wider uppercase text-charcoal/60">
                          Trạng thái
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center border ${getStatusBadgeColor(order.status)}`}
                        >
                          {getStatusIcon(order.status)}
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      {/* <div>
                        <span className="block mb-1 text-xs tracking-wider uppercase text-charcoal/60">
                          Thanh toán
                        </span>
                        {checkingPayment[order._id] ? (
                          <span className="inline-flex items-center">
                            <FaSpinner className="mr-2 animate-spin text-charcoal/50" />
                            <span className="text-sm text-charcoal/50">
                              Đang kiểm tra...
                            </span>
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center border ${getPaymentStatusBadgeColor(paymentStatuses[order._id])}`}
                            >
                              {getPaymentStatusIcon(paymentStatuses[order._id])}
                              {getPaymentStatusText(paymentStatuses[order._id])}
                            </span>
                            {paymentMethods[order._id] && (
                              <span className="text-xs text-charcoal/50">
                                {getPaymentMethodText(
                                  paymentMethods[order._id],
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div> */}
                    </div>
                    <div className="flex items-center gap-3">
                      {shouldShowPaymentButton(order._id) && (
                        <button
                          onClick={() => handleProceedToPayment(order._id)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg text-cream bg-forest-green hover:bg-forest-green/90"
                        >
                          <FaCreditCard />
                          Thanh toán ngay
                        </button>
                      )}
                      <Link
                        to={`/order-details/${order._id}`}
                        className="hidden px-4 py-2 text-sm font-medium transition-colors rounded-lg text-forest-green hover:text-forest-green/80 bg-forest-green/10 hover:bg-forest-green/20 md:block"
                      >
                        Chi tiết
                      </Link>
                      <button
                        onClick={() => toggleOrderExpansion(order._id)}
                        className={`text-charcoal/70 hover:text-charcoal p-2 rounded-full hover:bg-black/5 transition-all ${expandedOrders[order._id] ? "bg-black/5" : ""}`}
                      >
                        <FaChevronDown
                          className={`transition-transform ${expandedOrders[order._id] ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                  </div>
                  {expandedOrders[order._id] && order.items?.length > 0 && (
                    <motion.div
                      className="p-5"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <h3 className="flex items-center gap-2 mb-4 font-medium text-charcoal">
                        <FaBox className="text-forest-green" />
                        Sản phẩm đã đặt
                      </h3>
                      <div className="overflow-x-auto border rounded-lg border-black/10">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-black/5">
                            <tr>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-charcoal/60">
                                Sản phẩm
                              </th>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-charcoal/60">
                                Đơn giá
                              </th>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-charcoal/60">
                                Số lượng
                              </th>
                              <th className="px-4 py-3 text-xs font-medium tracking-wider text-left uppercase text-charcoal/60">
                                Trạng thái
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-black/5">
                            {order.items.map((item, itemIndex) => (
                              <motion.tr
                                key={item._id}
                                className="transition-colors hover:bg-black/5"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 * (itemIndex + 1) }}
                              >
                                <td className="px-4 py-3.5 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {item.productId?.image ? (
                                      <div className="flex-shrink-0 w-12 h-12 mr-3">
                                        <img
                                          src={item.productId.image}
                                          alt={item.productId?.title}
                                          className="object-cover w-12 h-12 rounded-lg shadow-sm"
                                        />
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mr-3 rounded-lg bg-black/5">
                                        <FaBox className="text-charcoal/40" />
                                      </div>
                                    )}
                                    <span className="text-sm font-medium text-charcoal line-clamp-1">
                                      {item.productId?.title ||
                                        "Sản phẩm không tồn tại"}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 whitespace-nowrap">
                                  <div className="text-sm font-medium text-charcoal">
                                    {item.unitPrice?.toLocaleString()}.000đ
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 whitespace-nowrap">
                                  <div className="flex items-center justify-center w-10 h-8 text-sm font-medium rounded-md bg-black/5">
                                    {item.quantity}
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 whitespace-nowrap">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center w-fit ${getStatusBadgeColor(item.status)}`}
                                  >
                                    {getStatusIcon(item.status)}
                                    {getStatusText(item.status)}
                                  </span>
                                </td>
                                {/* <td className="px-4 py-3.5 whitespace-nowrap text-right">
                                  {item.status === "shipped" &&
                                    item.productId &&
                                    (reviewedProducts.has(
                                      item.productId._id,
                                    ) ? (
                                      <span className="text-forest-green bg-forest-green/10 px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-1">
                                        <FaCheck className="text-xs" />
                                        Đã đánh giá
                                      </span>
                                    ) : (
                                      <Link
                                        to={`/write-review/${item.productId._id}`}
                                        className="text-forest-green hover:text-forest-green/80 bg-forest-green/10 hover:bg-forest-green/20 transition-colors px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-1"
                                      >
                                        <FaStar className="text-xs text-soft-gold" />
                                        Đánh giá
                                      </Link>
                                    ))}
                                </td> */}
                              </motion.tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          {shouldShowPaymentButton(order._id) && (
                            <button
                              onClick={() => handleProceedToPayment(order._id)}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg text-cream bg-forest-green hover:bg-forest-green/90 md:hidden"
                            >
                              <FaCreditCard />
                              Thanh toán ngay
                            </button>
                          )}
                        </div>
                        <Link
                          to={`/order-details/${order._id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg text-forest-green hover:text-forest-green/80 bg-forest-green/10 hover:bg-forest-green/20 md:hidden"
                        >
                          Xem chi tiết đầy đủ
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            {pagination && pagination.pages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
                className="mt-6"
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg p-12 mx-auto text-center bg-white border shadow-sm rounded-xl"
          >
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-forest-green/10">
              <FaShoppingBag className="text-3xl text-forest-green" />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-charcoal font-titleFont">
              Chưa có đơn hàng nào
            </h2>
            <p className="mb-6 text-charcoal/80">
              Bạn chưa thực hiện đơn hàng nào. Hãy bắt đầu mua sắm để thấy đơn
              hàng của bạn tại đây.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 font-medium transition-colors rounded-lg bg-forest-green text-cream hover:bg-forest-green/90"
            >
              <FaShoppingBag className="text-sm" />
              Bắt đầu mua sắm
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
