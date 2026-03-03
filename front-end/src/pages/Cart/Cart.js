import { Box, Container, Grid, Typography } from "@mui/material";
import { Checkbox, ConfigProvider, Divider, InputNumber } from "antd";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import { FaShoppingBag } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchCart,
  removeCartItem,
  removeSelectedItems,
  updateCartItem,
} from "../../features/cart/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth) || {};
  const { items: cartItems } = useSelector((state) => state.cart);

  const [selectedItems, setSelectedItems] = useState([]);
  const [totalAmt, setTotalAmt] = useState(0);

  const colors = {
    cream: "#FDFBF7",
    forestGreen: "#1E4D3B",
    deepGreen: "#15382B",
    gold: "#C5A059",
    border: "#EAE6DF",
  };

  useEffect(() => {
    if (token) dispatch(fetchCart());
    else navigate("/signin");
  }, [dispatch, token, navigate]);

  useEffect(() => {
    const price = cartItems.reduce((acc, item) => {
      if (selectedItems.includes(item.productId?._id)) {
        return acc + (item.productId?.price || 0) * item.quantity;
      }
      return acc;
    }, 0);
    setTotalAmt(price);
  }, [cartItems, selectedItems]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.forestGreen,
          borderRadius: 2,
          fontFamily: "'Montserrat', sans-serif",
        },
      }}
    >
      <Box
        sx={{
          backgroundColor: colors.cream,
          minHeight: "100vh",
          py: { xs: 4, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          {cartItems.length > 0 ? (
            <Grid container spacing={{ xs: 4, md: 8 }}>
              {/* DANH SÁCH SẢN PHẨM */}
              <Grid item xs={12} md={7} lg={8}>
                <div className="mb-6 pb-4 border-b border-[#EAE6DF] flex justify-between items-center">
                  <Checkbox
                    indeterminate={
                      selectedItems.length > 0 &&
                      selectedItems.length < cartItems.length
                    }
                    checked={selectedItems.length === cartItems.length}
                    onChange={(e) =>
                      setSelectedItems(
                        e.target.checked
                          ? cartItems.map((i) => i.productId._id)
                          : [],
                      )
                    }
                  >
                    <span className="uppercase tracking-widest text-[10px] md:text-[11px] font-bold ml-2">
                      Chọn tất cả
                    </span>
                  </Checkbox>
                  {selectedItems.length > 0 && (
                    <button
                      onClick={() =>
                        dispatch(removeSelectedItems(selectedItems))
                      }
                      className="text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1"
                    >
                      <Trash2 size={12} />{" "}
                      <span className="hidden sm:inline">Xóa đã chọn</span> (
                      {selectedItems.length})
                    </button>
                  )}
                </div>

                <AnimatePresence mode="popLayout">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.productId?._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="flex gap-3 md:gap-8 py-6 md:py-8 border-b border-[#F0EEEA] group relative"
                    >
                      <div className="pt-2">
                        <Checkbox
                          checked={selectedItems.includes(item.productId?._id)}
                          onChange={() =>
                            setSelectedItems((prev) =>
                              prev.includes(item.productId._id)
                                ? prev.filter((id) => id !== item.productId._id)
                                : [...prev, item.productId._id],
                            )
                          }
                        />
                      </div>

                      {/* Ảnh sản phẩm: Co giãn theo màn hình */}
                      <div className="w-20 h-28 md:w-32 md:h-40 bg-white overflow-hidden rounded-sm border border-[#F0EEEA] flex-shrink-0">
                        <img
                          src={item.productId?.image}
                          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                          alt={item.productId?.title}
                        />
                      </div>

                      {/* Chi tiết sản phẩm */}
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div className="flex justify-between gap-2">
                          <div className="overflow-hidden">
                            <Typography
                              variant="h6"
                              className="font-serif text-base md:text-xl text-[#15382B] mb-1 truncate md:whitespace-normal"
                            >
                              {item.productId?.title || item.productId?.name}
                            </Typography>
                            <p className="text-[10px] md:text-xs font-medium tracking-widest text-gray-400 uppercase">
                              {item.productId?.price?.toLocaleString("vi-VN")}
                              .000đ / đơn vị
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              dispatch(removeCartItem(item.productId._id))
                            }
                            className="flex-shrink-0 text-gray-300 transition-colors hover:text-red-500"
                          >
                            <Trash2 size={18} strokeWidth={1.5} />
                          </button>
                        </div>

                        <div className="flex flex-col items-start justify-between gap-3 mt-4 sm:flex-row sm:items-end">
                          {/* Số lượng */}
                          <div className="inline-flex items-center border border-[#EAE6DF] rounded-sm bg-white scale-90 origin-left md:scale-100">
                            <InputNumber
                              min={1}
                              max={item.productId?.inventoryQuantity}
                              value={item.quantity}
                              onChange={(val) =>
                                dispatch(
                                  updateCartItem({
                                    productId: item.productId._id,
                                    quantity: val,
                                  }),
                                )
                              }
                              bordered={false}
                              className="w-16 font-bold text-center md:w-24"
                              controls={true}
                            />
                          </div>

                          {/* Thành tiền */}
                          <div className="w-full text-left sm:text-right">
                            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-1 font-bold">
                              Thành tiền
                            </p>
                            <Typography className="font-bold text-base md:text-lg text-[#1E4D3B]">
                              {(
                                item.quantity * (item.productId?.price || 0)
                              ).toLocaleString("vi-VN")}
                              .000đ
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </Grid>

              {/* TÓM TẮT THANH TOÁN */}
              <Grid item xs={12} md={5} lg={4}>
                <div className="bg-white p-6 md:p-10 border border-[#EAE6DF] sticky top-32">
                  <Typography
                    variant="h5"
                    className="font-serif mb-6 md:mb-8 text-[#15382B] text-xl md:text-2xl text-center"
                  >
                    Tóm tắt đơn hàng
                  </Typography>

                  <div className="space-y-4 md:space-y-5 text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400">
                    <div className="flex justify-between">
                      <span>Tạm tính ({selectedItems.length})</span>
                      <span className="text-black">
                        {totalAmt.toLocaleString("vi-VN")}.000đ
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Phí vận chuyển</span>
                      <span className="text-[9px] italic text-gray-300">
                        Tính tại bước sau
                      </span>
                    </div>
                  </div>

                  <Divider className="my-6 md:my-8 border-[#F0EEEA]" />

                  <div className="flex items-baseline justify-between mb-8 md:mb-10">
                    <span className="font-serif text-lg md:text-xl text-[#15382B]">
                      Tổng
                    </span>
                    <div className="text-right">
                      <Typography
                        variant="h4"
                        className="font-bold text-[#1E4D3B] text-2xl md:text-3xl"
                      >
                        {totalAmt.toLocaleString("vi-VN")}.000đ
                      </Typography>
                      <p className="text-[9px] text-gray-400 uppercase tracking-tighter">
                        * Đã bao gồm thuế VAT
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={selectedItems.length === 0}
                    onClick={() =>
                      navigate("/checkout", { state: { selectedItems } })
                    }
                    className={`w-full py-4 md:py-5 flex items-center justify-center gap-3 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs transition-all
                      ${
                        selectedItems.length > 0
                          ? "bg-[#1E4D3B] text-white hover:bg-[#15382B] shadow-xl active:scale-[0.98]"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    Thanh toán <ArrowRight size={16} />
                  </button>

                  <div className="mt-6 text-center">
                    <p className="text-[9px] text-gray-400 leading-relaxed uppercase tracking-widest">
                      Đảm bảo bảo mật 100%
                    </p>
                  </div>
                </div>
              </Grid>
            </Grid>
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
                Túi hàng đang trống
              </h2>

              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 font-medium transition-colors rounded-lg bg-forest-green text-cream hover:bg-forest-green/90"
              >
                <FaShoppingBag className="text-sm" />
                Bắt đầu mua sắm
              </Link>
            </motion.div>
          )}
        </Container>
      </Box>
    </ConfigProvider>
  );
};

export default Cart;
