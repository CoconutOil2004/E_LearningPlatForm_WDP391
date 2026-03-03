import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import DiscountIcon from "@mui/icons-material/Discount";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  addAddress,
  fetchAddresses,
} from "../../features/address/addressSlice";
import { removeSelectedItems } from "../../features/cart/cartSlice";
import {
  applyVoucher,
  clearVoucher,
} from "../../features/voucher/voucherSlice";
import OrderService from "../../services/api/OrderService";

// Thiết kế bảng màu
const palette = {
  cream: "#F9F7F2",
  forestGreen: "#2D4F3E",
  charcoal: "#1A1A1A",
  softGold: "#C5A059",
  white: "#FFFFFF",
};

const fonts = {
  title: "'Playfair Display', serif",
  body: "'Montserrat', sans-serif",
};

// Kiểu dáng Modal tùy chỉnh
const customModalStyles = {
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 1000,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    position: "relative",
    top: "auto",
    left: "auto",
    right: "auto",
    bottom: "auto",
    maxWidth: "500px",
    width: "100%",
    padding: "0",
    border: "none",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    backgroundColor: palette.white,
    overflow: "hidden",
  },
};

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { token } = useSelector((state) => state.auth) || {};
  const cartItems = useSelector((state) => state.cart?.items || []);
  const addresses = useSelector((state) => state.address?.addresses || []);
  const {
    voucher,
    loading: voucherLoading,
    error: voucherError,
  } = useSelector((state) => state.voucher);

  const selectedItems = location.state?.selectedItems || [];
  const selectedProducts = cartItems.filter(
    (item) => item.productId && selectedItems.includes(item.productId._id),
  );

  const [couponCode, setCouponCode] = useState("");
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "Việt Nam",
    isDefault: false,
  });
  const [phoneError, setPhoneError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (token) dispatch(fetchAddresses());
    return () => {
      dispatch(clearVoucher());
    };
  }, [dispatch, token]);

  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddress =
        addresses.find((address) => address.isDefault) || addresses[0];
      if (defaultAddress) setSelectedAddressId(defaultAddress._id);
    }
  }, [addresses]);

  const validatePhoneNumber = (phone) => /^0\d{9}$/.test(phone);

  const subtotal = selectedProducts.reduce(
    (total, item) => total + (item.productId?.price || 0) * item.quantity,
    0,
  );

  const calculateDiscount = () => {
    if (!voucher) return 0;
    if (subtotal < voucher.minOrderValue) {
      return 0;
    }
    const discountAmount =
      voucher.discountType === "fixed"
        ? voucher.discount
        : (subtotal * voucher.discount) / 100;
    return voucher.maxDiscount > 0
      ? Math.min(discountAmount, voucher.maxDiscount)
      : discountAmount;
  };

  const discount = calculateDiscount();
  const total = Math.max(subtotal - discount, 0);

  const handleAddAddress = () => {
    if (!validatePhoneNumber(newAddress.phone)) {
      setPhoneError(
        "Số điện thoại không hợp lệ. Phải bắt đầu bằng số 0 và có 10 chữ số.",
      );
      return;
    }
    setPhoneError("");
    dispatch(addAddress(newAddress));
    setIsAddressModalOpen(false);
    setNewAddress({
      fullName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      country: "Việt Nam",
      isDefault: false,
    });
  };

  const handleApplyCoupon = () => {
    if (couponCode.trim()) {
      dispatch(applyVoucher(couponCode));
    } else {
      toast.error("Vui lòng nhập mã giảm giá");
    }
  };

  const handleCancelVoucher = () => {
    dispatch(clearVoucher());
    setCouponCode("");
    toast.info("Đã hủy áp dụng mã giảm giá.");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }
    setIsProcessing(true);
    const orderDetails = {
      selectedItems: selectedProducts.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
      })),
      selectedAddressId,
      couponCode: voucher ? voucher.code : "",
    };
    try {
      const result = await OrderService.createOrderWithPayPal(orderDetails);
      const productIds = selectedProducts.map((item) => item.productId._id);
      await dispatch(removeSelectedItems(productIds)).unwrap();
      toast.success("Đặt hàng thành công!");
      setTimeout(() => navigate("/order-history", { replace: true }), 1000);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          error.message ||
          "Không thể tạo đơn hàng",
      );
      setIsProcessing(false);
    }
  };

  const commonButtonSx = {
    fontFamily: fonts.body,
    textTransform: "none",
    borderRadius: 2,
    px: 3,
  };

  return (
    <Box sx={{ bgcolor: palette.cream, minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontFamily: fonts.title,
              fontWeight: 700,
              color: palette.charcoal,
              position: "relative",
              pb: 2,
              mb: 4,
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "60px",
                height: "4px",
                backgroundColor: palette.forestGreen,
                borderRadius: "2px",
              },
            }}
          >
            <ShoppingCartIcon sx={{ mr: 1, verticalAlign: "middle" }} /> Thanh
            toán
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  mb: 4,
                  borderRadius: 2,
                  border: "1px solid #00000010",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <LocalShippingIcon
                    sx={{ mr: 1, color: palette.forestGreen }}
                  />
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    fontFamily={fonts.title}
                  >
                    Địa chỉ nhận hàng
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                {addresses.length > 0 ? (
                  <RadioGroup
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    <Grid container spacing={2}>
                      {addresses.map((address) => (
                        <Grid item xs={12} sm={6} key={address._id}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              borderColor:
                                selectedAddressId === address._id
                                  ? palette.forestGreen
                                  : "divider",
                              bgcolor:
                                selectedAddressId === address._id
                                  ? "rgba(45, 79, 62, 0.04)"
                                  : "transparent",
                              position: "relative",
                              transition: "all 0.2s",
                              fontFamily: fonts.body,
                            }}
                          >
                            {address.isDefault && (
                              <Chip
                                label="Mặc định"
                                size="small"
                                sx={{
                                  position: "absolute",
                                  top: 8,
                                  right: 8,
                                  bgcolor: palette.forestGreen,
                                  color: palette.cream,
                                  fontFamily: fonts.body,
                                }}
                              />
                            )}
                            <FormControlLabel
                              value={address._id}
                              control={
                                <Radio
                                  sx={{
                                    color: palette.forestGreen,
                                    "&.Mui-checked": {
                                      color: palette.forestGreen,
                                    },
                                  }}
                                />
                              }
                              label={
                                <Box sx={{ ml: 1 }}>
                                  <Typography
                                    variant="body1"
                                    fontWeight={600}
                                    fontFamily={fonts.body}
                                  >
                                    {address.fullName}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    fontFamily={fonts.body}
                                  >
                                    {address.phone}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    fontFamily={fonts.body}
                                  >
                                    {`${address.street}, ${address.city}, ${address.state}, ${address.country}`}
                                  </Typography>
                                </Box>
                              }
                              sx={{
                                width: "100%",
                                alignItems: "flex-start",
                                m: 0,
                              }}
                            />
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </RadioGroup>
                ) : (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3, fontFamily: fonts.body }}
                  >
                    Chưa có địa chỉ nào. Vui lòng thêm địa chỉ mới.
                  </Typography>
                )}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddressModalOpen(true)}
                  sx={{
                    mt: 3,
                    ...commonButtonSx,
                    borderColor: palette.forestGreen,
                    color: palette.forestGreen,
                    "&:hover": {
                      borderColor: palette.forestGreen,
                      backgroundColor: "rgba(45, 79, 62, 0.04)",
                    },
                  }}
                >
                  Thêm địa chỉ mới
                </Button>
              </Paper>
              <Paper
                elevation={0}
                sx={{ p: 4, borderRadius: 2, border: "1px solid #00000010" }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <DiscountIcon sx={{ mr: 1, color: palette.forestGreen }} />
                  <Typography
                    variant="h5"
                    fontWeight={600}
                    fontFamily={fonts.title}
                  >
                    Mã giảm giá
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />
                {voucher ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CheckCircleIcon sx={{ color: "success.main", mr: 1 }} />
                      <Typography
                        variant="body1"
                        fontWeight={500}
                        color="success.main"
                        fontFamily={fonts.body}
                      >
                        Đã áp dụng: {voucher.code}
                      </Typography>
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CloseIcon />}
                      onClick={handleCancelVoucher}
                      sx={{ minWidth: 100, fontFamily: fonts.body }}
                    >
                      Hủy mã
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex" }}>
                    <TextField
                      fullWidth
                      placeholder="Nhập mã giảm giá"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      size="small"
                      sx={{
                        mr: 2,
                        "& .MuiInputBase-root": { fontFamily: fonts.body },
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleApplyCoupon}
                      disabled={voucherLoading || !couponCode.trim()}
                      sx={{
                        ...commonButtonSx,
                        minWidth: 100,
                        bgcolor: palette.forestGreen,
                        color: palette.cream,
                        "&:hover": { bgcolor: "#213B2F" },
                      }}
                    >
                      {voucherLoading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Áp dụng"
                      )}
                    </Button>
                  </Box>
                )}
                {voucherError && !voucher && (
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{ mt: 1, fontFamily: fonts.body }}
                  >
                    {voucherError}
                  </Typography>
                )}
                {voucher && subtotal < voucher.minOrderValue && (
                  <Typography
                    variant="body2"
                    color="error"
                    sx={{ mt: 1, fontFamily: fonts.body }}
                  >
                    Đơn hàng phải từ {voucher.minOrderValue.toLocaleString()}đ
                    để áp dụng mã này.
                  </Typography>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 2,
                  position: "sticky",
                  top: 24,
                  border: "1px solid #00000010",
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight={600}
                  mb={3}
                  fontFamily={fonts.title}
                >
                  Tóm tắt đơn hàng
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box
                  sx={{
                    maxHeight: 300,
                    overflowY: "auto",
                    mb: 3,
                    pr: 1,
                    fontFamily: fonts.body,
                  }}
                >
                  {selectedProducts.map((item) => (
                    <Box
                      key={item.productId?._id}
                      sx={{
                        display: "flex",
                        mb: 2,
                        pb: 2,
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <Box
                        sx={{
                          width: 70,
                          height: 70,
                          flexShrink: 0,
                          bgcolor: "#f5f5f5",
                          borderRadius: 1,
                          overflow: "hidden",
                          mr: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={item.productId?.image}
                          alt={item.productId?.title}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                        />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="body1"
                          fontWeight={500}
                          noWrap
                          fontFamily={fonts.body}
                        >
                          {item.productId?.title || item.productId?.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontFamily={fonts.body}
                        >
                          Số lượng: {item.quantity}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        sx={{ ml: 2, fontFamily: fonts.body }}
                      >
                        {(
                          (item.productId?.price || 0) * item.quantity
                        ).toLocaleString()}
                        .000đ
                      </Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ mb: 3, fontFamily: fonts.body }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography fontFamily={fonts.body}>Tạm tính:</Typography>
                    <Typography fontFamily={fonts.body}>
                      {subtotal.toLocaleString()}.000đ
                    </Typography>
                  </Box>
                  {discount > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                        color: palette.forestGreen,
                      }}
                    >
                      <Typography fontFamily={fonts.body}>Giảm giá:</Typography>
                      <Typography fontFamily={fonts.body}>
                        -{discount.toLocaleString()}đ
                      </Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      fontFamily={fonts.body}
                    >
                      Tổng cộng:
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color={palette.forestGreen}
                      fontFamily={fonts.body}
                    >
                      {total.toLocaleString()}.000đ
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || selectedProducts.length === 0}
                  sx={{
                    ...commonButtonSx,
                    py: 1.5,
                    bgcolor: palette.forestGreen,
                    color: palette.cream,
                    "&:hover": { bgcolor: "#213B2F" },
                  }}
                >
                  {isProcessing ? (
                    <>
                      <CircularProgress
                        size={24}
                        sx={{ color: "white", mr: 1 }}
                      />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đặt hàng (COD)"
                  )}
                </Button>
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: "rgba(45, 79, 62, 0.04)",
                    borderRadius: 2,
                    border: `1px dashed ${palette.forestGreen}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontFamily={fonts.body}
                  >
                    Bằng cách đặt hàng, bạn đồng ý với các điều khoản của chúng
                    tôi. Thanh toán khi nhận hàng.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>

        {/* Modal thêm địa chỉ mới */}
        <Modal
          isOpen={isAddressModalOpen}
          onRequestClose={() => setIsAddressModalOpen(false)}
          style={customModalStyles}
          contentLabel="Thêm địa chỉ mới"
          ariaHideApp={false}
        >
          <Box sx={{ p: 4, fontFamily: fonts.body }}>
            <Typography
              variant="h5"
              fontWeight={600}
              mb={3}
              fontFamily={fonts.title}
            >
              Thêm địa chỉ mới
            </Typography>
            {phoneError && (
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                {phoneError}
              </Typography>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Họ và tên"
                  value={newAddress.fullName}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, fullName: e.target.value })
                  }
                  variant="outlined"
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={newAddress.phone}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, phone: e.target.value })
                  }
                  variant="outlined"
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ chi tiết (Số nhà, tên đường)"
                  value={newAddress.street}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, street: e.target.value })
                  }
                  variant="outlined"
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Thành phố / Huyện"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                  variant="outlined"
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tỉnh"
                  value={newAddress.state}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, state: e.target.value })
                  }
                  variant="outlined"
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quốc gia"
                  value={newAddress.country}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, country: e.target.value })
                  }
                  variant="outlined"
                  size="small"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={newAddress.isDefault}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          isDefault: e.target.checked,
                        })
                      }
                      sx={{
                        color: palette.forestGreen,
                        "&.Mui-checked": { color: palette.forestGreen },
                      }}
                    />
                  }
                  label="Đặt làm địa chỉ mặc định"
                />
              </Grid>
            </Grid>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 3,
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => setIsAddressModalOpen(false)}
                sx={{
                  ...commonButtonSx,
                  borderColor: palette.softGold,
                  color: palette.softGold,
                  "&:hover": {
                    borderColor: palette.softGold,
                    backgroundColor: "rgba(197, 160, 89, 0.04)",
                  },
                }}
              >
                Hủy
              </Button>
              <Button
                variant="contained"
                onClick={handleAddAddress}
                sx={{
                  ...commonButtonSx,
                  bgcolor: palette.forestGreen,
                  color: palette.cream,
                  "&:hover": { bgcolor: "#213B2F" },
                }}
              >
                Lưu địa chỉ
              </Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </Box>
  );
};

export default Checkout;
