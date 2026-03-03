// Base URL lấy từ env variable, fallback về localhost khi dev
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:9999";
const BACKEND_API_URI = `${API_BASE_URL}/api`;

// Format tiền tệ VND
const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);

export { API_BASE_URL, BACKEND_API_URI, formatCurrency };
