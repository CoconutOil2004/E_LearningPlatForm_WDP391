import { Add, Email, LocationOn, Person } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  addAddress,
  fetchAddresses,
} from "../../features/address/addressSlice";

// Palette from Checkout for consistency
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
    maxWidth: "600px",
    width: "100%",
    padding: "0",
    border: "none",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    backgroundColor: palette.white,
    overflow: "hidden",
  },
};

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { addresses } = useSelector((state) => state.address);

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

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  const validatePhoneNumber = (phone) => /^0\d{9}$/.test(phone);

  const handleAddAddress = async () => {
    if (!validatePhoneNumber(newAddress.phone)) {
      setPhoneError(
        "Số điện thoại không hợp lệ. Phải bắt đầu bằng số 0 và có 10 chữ số.",
      );
      return;
    }
    setPhoneError("");

    try {
      // Sử dụng unwrap() nếu action được tạo bởi createAsyncThunk
      await dispatch(addAddress(newAddress));
      toast.success("Thêm địa chỉ thành công!");
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
      // Refresh list after adding
      dispatch(fetchAddresses());
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm địa chỉ.");
    }
  };

  return (
    <Box sx={{ bgcolor: palette.cream, minHeight: "100vh", py: 6 }}>
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontFamily: fonts.title,
            fontWeight: 700,
            color: palette.charcoal,
            mb: 4,
            borderBottom: `4px solid ${palette.forestGreen}`,
            display: "inline-block",
            pb: 1,
          }}
        >
          Hồ sơ của tôi
        </Typography>

        <Grid container spacing={4}>
          {/* Left Column: User Info */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 2,
                border: "1px solid #00000010",
                textAlign: "center",
              }}
            >
              <Avatar
                src={user?.avatar || ""}
                alt={user?.username}
                sx={{
                  width: 100,
                  height: 100,
                  mx: "auto",
                  mb: 2,
                  bgcolor: palette.forestGreen,
                }}
              >
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography
                variant="h5"
                sx={{ fontFamily: fonts.title, fontWeight: 600, mb: 1 }}
              >
                {user?.fullname || user?.username}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontFamily: fonts.body, mb: 3 }}
              >
                {user?.email}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ textAlign: "left" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Person sx={{ color: palette.forestGreen, mr: 2 }} />
                  <Typography variant="body1" sx={{ fontFamily: fonts.body }}>
                    {user?.username}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Email sx={{ color: palette.forestGreen, mr: 2 }} />
                  <Typography variant="body1" sx={{ fontFamily: fonts.body }}>
                    {user?.email}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column: Address Book */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{ p: 4, borderRadius: 2, border: "1px solid #00000010" }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LocationOn sx={{ color: palette.forestGreen, mr: 1 }} />
                  <Typography
                    variant="h5"
                    sx={{ fontFamily: fonts.title, fontWeight: 600 }}
                  >
                    Sổ địa chỉ
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setIsAddressModalOpen(true)}
                  sx={{
                    bgcolor: palette.forestGreen,
                    color: palette.white,
                    fontFamily: fonts.body,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#213B2F" },
                  }}
                >
                  Thêm địa chỉ mới
                </Button>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {addresses && addresses.length > 0 ? (
                <Grid container spacing={3}>
                  {addresses.map((address) => (
                    <Grid item xs={12} key={address._id}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          borderColor: address.isDefault
                            ? palette.forestGreen
                            : "divider",
                          bgcolor: address.isDefault
                            ? "rgba(45, 79, 62, 0.04)"
                            : "transparent",
                          position: "relative",
                        }}
                      >
                        {address.isDefault && (
                          <Chip
                            label="Mặc định"
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 16,
                              right: 16,
                              bgcolor: palette.forestGreen,
                              color: palette.white,
                              fontFamily: fonts.body,
                              fontSize: "0.7rem",
                            }}
                          />
                        )}
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontFamily: fonts.body,
                            fontWeight: 600,
                            mb: 1,
                          }}
                        >
                          {address.fullName}{" "}
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.secondary"
                          >
                            | {address.phone}
                          </Typography>
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontFamily: fonts.body, mb: 0.5 }}
                        >
                          {address.street}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontFamily: fonts.body }}
                        >
                          {address.city}, {address.state}, {address.country}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontFamily: fonts.body, textAlign: "center", py: 4 }}
                >
                  Bạn chưa lưu địa chỉ nào.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Add Address Modal - Copied from Checkout */}
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
                  fontFamily: fonts.body,
                  textTransform: "none",
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
                  fontFamily: fonts.body,
                  textTransform: "none",
                  bgcolor: palette.forestGreen,
                  color: palette.white,
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

export default Profile;
