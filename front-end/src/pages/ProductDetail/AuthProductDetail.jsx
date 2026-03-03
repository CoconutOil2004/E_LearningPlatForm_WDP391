import {
  AddShoppingCart,
  Favorite,
  FavoriteBorder,
  Inventory,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Fade,
  Grid,
  IconButton,
  Paper,
  Rating,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Bảng màu sang trọng cho sản phẩm Trà
const palette = {
  cream: "#F7F6E8",
  forestGreen: "#2D4F3E",
  sageGreen: "#8BA889",
  charcoal: "#1A1A1A",
  softGold: "#C5A059",
  white: "#FFFFFF",
};

// Styled Components - Nâng cấp phong cách "Luxury Tea"
const MainContainer = styled(Container)({
  backgroundColor: palette.cream,
  minHeight: "100vh",
  paddingTop: "60px",
  paddingBottom: "60px",
});

const ElegantImageCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: 0, // Phong cách cổ điển thường dùng góc cạnh sắc sảo hoặc bo cực nhẹ
  backgroundColor: palette.white,
  border: `1px solid ${palette.softGold}`,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "550px",
  position: "relative",
  "&::after": {
    // Viền trang trí kép
    content: '""',
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    bottom: 10,
    border: `1px solid ${palette.cream}`,
    pointerEvents: "none",
  },
}));

const TeaTitle = styled(Typography)({
  fontFamily: '"Playfair Display", serif', // Ưu tiên font có chân sang trọng
  color: palette.forestGreen,
  fontWeight: 700,
  letterSpacing: "1px",
  marginBottom: "16px",
});

const PriceText = styled(Typography)({
  color: palette.softGold,
  fontFamily: '"Montserrat", sans-serif',
  fontWeight: 500,
  fontSize: "2.5rem",
  margin: "20px 0",
});

const LuxuryButton = styled(Button)(({ variant }) => ({
  borderRadius: 0,
  padding: "12px 35px",
  textTransform: "uppercase",
  letterSpacing: "2px",
  fontWeight: 600,
  transition: "all 0.4s ease",
  backgroundColor:
    variant === "contained" ? palette.forestGreen : "transparent",
  borderColor: palette.forestGreen,
  color: variant === "contained" ? palette.cream : palette.forestGreen,
  "&:hover": {
    backgroundColor:
      variant === "contained" ? palette.softGold : palette.forestGreen,
    color: palette.white,
    borderColor: palette.softGold,
    transform: "translateY(-2px)",
  },
}));

const TabHeader = styled(Tabs)({
  borderBottom: `1px solid ${palette.sageGreen}`,
  "& .MuiTabs-indicator": {
    backgroundColor: palette.softGold,
    height: "3px",
  },
});

const ElegantTab = styled(Tab)({
  fontFamily: '"Playfair Display", serif',
  fontWeight: 600,
  color: palette.charcoal,
  "&.Mui-selected": {
    color: palette.softGold,
  },
});

const AuthProductDetail = () => {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [product, setProduct] = useState(location.state?.item || null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const authState = useSelector((state) => state.auth);
  const { isAuthenticated, token, user } = authState;
  const API_BASE_URL = process.env.REACT_APP_API_URL || API_BASE_URL;

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/api/products/${productId}/detail`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setProduct(response.data.data);
    } catch (error) {
      toast.error("Không thể tải thông tin sản phẩm");
      if (error.response?.status === 401) navigate("/signin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/signin", {
        state: { redirectTo: `/auth/product/${productId}` },
      });
      return;
    }
    fetchProductDetail();
  }, [productId]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await axios.post(
        `${API_BASE_URL}/api/buyers/cart/add`,
        { productId: product.product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Đã thêm tinh hoa trà vào giỏ hàng");
    } catch (error) {
      toast.error("Lỗi khi thêm vào giỏ hàng");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading)
    return (
      <MainContainer>
        <CircularProgress sx={{ color: palette.forestGreen }} />
      </MainContainer>
    );

  const {
    product: data,
    store,
    inventory,
    averageRating,
    totalReviews,
  } = product;

  return (
    <MainContainer maxWidth={false}>
      <Container maxWidth="lg">
        <Grid container spacing={8}>
          {/* Cột trái: Hình ảnh mang hơi hướng nghệ thuật */}
          <Grid item xs={12} md={6}>
            <Fade in timeout={1000}>
              {/* <ElegantImageCard elevation={24}> */}
              <Box
                component="img"
                src={
                  data.image?.startsWith("http")
                    ? data.image
                    : `${API_BASE_URL}/uploads/${data.image}`
                }
                sx={{
                  backgroundColor: palette.white,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  padding: "10px",
                  border: "1px solid #ccc",
                }}
              />
              {/* </ElegantImageCard> */}
            </Fade>
          </Grid>

          {/* Cột phải: Thông tin sản phẩm thanh lịch */}
          <Grid item xs={12} md={6}>
            <Box sx={{ pt: 2 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  label="Tinh hoa trà Việt"
                  size="small"
                  sx={{
                    borderRadius: 0,
                    bgcolor: palette.forestGreen,
                    color: palette.cream,
                  }}
                />
                <Chip
                  label={data.categoryId?.name}
                  variant="outlined"
                  sx={{
                    borderRadius: 0,
                    borderColor: palette.softGold,
                    color: palette.softGold,
                  }}
                />
              </Stack>

              <TeaTitle variant="h2">{data.title}</TeaTitle>

              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Rating
                  value={averageRating}
                  readOnly
                  precision={0.5}
                  sx={{ color: palette.softGold }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: palette.sageGreen, fontStyle: "italic" }}
                >
                  ({totalReviews} đánh giá từ giới thưởng trà)
                </Typography>
              </Stack>

              <Divider sx={{ borderColor: palette.sageGreen, opacity: 0.3 }} />

              <PriceText>{data.price?.toLocaleString()}.000 VND</PriceText>

              <Typography
                variant="body1"
                sx={{
                  color: palette.charcoal,
                  lineHeight: 2,
                  mb: 4,
                  textAlign: "justify",
                }}
              >
                {data.description.substring(0, 250)}...
              </Typography>

              <Stack spacing={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Inventory sx={{ color: palette.forestGreen }} />
                  <Typography variant="body2" fontWeight={600}>
                    Tình trạng:{" "}
                    {inventory?.quantity > 0
                      ? `Còn ${inventory.quantity} hộp`
                      : "Đã hết"}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                  <LuxuryButton
                    variant="contained"
                    fullWidth
                    startIcon={<AddShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    Thêm vào giỏ hàng
                  </LuxuryButton>

                  <IconButton
                    onClick={() => setIsFavorite(!isFavorite)}
                    sx={{
                      border: `1px solid ${palette.softGold}`,
                      borderRadius: 0,
                    }}
                  >
                    {isFavorite ? (
                      <Favorite sx={{ color: "red" }} />
                    ) : (
                      <FavoriteBorder sx={{ color: palette.softGold }} />
                    )}
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          </Grid>
        </Grid>

        {/* Tab chi tiết: Layout tối giản sang trọng */}
        <Box sx={{ mt: 10 }}>
          <TabHeader
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            centered
          >
            <ElegantTab label="Câu chuyện về Trà" />
            <ElegantTab label="Đánh giá từ khách quý" />
            <ElegantTab label="Thông tin nhà vườn" />
          </TabHeader>

          <Box
            sx={{
              py: 6,
              px: { md: 10 },
              backgroundColor: palette.white,
              mt: 2,
            }}
          >
            {tabValue === 0 && (
              <Fade in>
                <Typography
                  sx={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 2.2,
                    color: palette.charcoal,
                  }}
                >
                  {data.description}
                </Typography>
              </Fade>
            )}

            {tabValue === 1 && (
              <Fade in>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: '"Playfair Display"',
                      mb: 4,
                      color: palette.forestGreen,
                    }}
                  >
                    Cảm nhận người dùng
                  </Typography>
                  {/* Map reviews here with a clean minimalist design */}
                  <Typography variant="body2" color="text.secondary">
                    Chưa có đánh giá nào cho phẩm trà này.
                  </Typography>
                </Box>
              </Fade>
            )}

            {tabValue === 2 && (
              <Fade in>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Avatar
                      src={store?.logoURL}
                      sx={{
                        width: 120,
                        height: 120,
                        border: `2px solid ${palette.softGold}`,
                        mb: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{ color: palette.forestGreen }}
                    >
                      {store?.storeName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Typography sx={{ fontStyle: "italic", lineHeight: 2 }}>
                      {store?.description ||
                        "Nhà cung cấp trà uy tín với các dòng trà thượng hạng."}
                    </Typography>
                  </Grid>
                </Grid>
              </Fade>
            )}
          </Box>
        </Box>
      </Container>
    </MainContainer>
  );
};

export default AuthProductDetail;
