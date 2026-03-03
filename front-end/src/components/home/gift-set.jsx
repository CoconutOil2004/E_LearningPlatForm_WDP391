import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import giftset from "../../assets/images/home/gift-set.jpg";
import { addToCart } from "../../features/cart/cartSlice";

const GiftSet = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Kiểm tra trạng thái đăng nhập
  const authState = useSelector((state) => state.auth);
  const isAuthenticated = authState?.isAuthenticated || false;

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để mua hàng");
      navigate("/signin");
      return;
    }

    // Gửi đúng cấu trúc dữ liệu mà thunk addToCart yêu cầu
    dispatch(
      addToCart({
        productId: "60d21b4667d0d8992e610101",
        quantity: 1,
        // price: 550000, // Bạn có thể điều chỉnh giá khớp với database
        // name: "Yên Tết Gift Set",
        // image: "gift-set.jpg", // Tên file ảnh gốc để server xử lý
        // stock: 50,
      }),
    );
  };

  return (
    <section className="bg-[#fdfbf7] py-24 overflow-hidden">
      <div className="container px-6 mx-auto lg:px-16">
        <div className="grid items-center grid-cols-1 gap-16 md:grid-cols-2">
          {/* CỘT TRÁI: HÌNH ẢNH */}
          <div className="relative group">
            <div className="absolute transition-transform transform translate-x-2 translate-y-2 pointer-events-none -inset-4 rounded-2xl group-hover:translate-x-0 group-hover:translate-y-0"></div>

            <div className="relative h-[500px] w-full overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={giftset}
                alt="Yên Tết Gift Set"
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* CỘT PHẢI: NỘI DUNG */}
          <div className="flex flex-col space-y-8">
            <div className="space-y-3">
              <span className="font-sans text-sm tracking-[0.3em] text-[#1E4D3B] uppercase font-bold block">
                Limited Edition Collection
              </span>

              <h2 className="font-serif text-4xl md:text-5xl text-[#15382B] leading-tight">
                YÊN TẾT: Nồng đậm vị trà,
                <br />
                <span className="italic">ngọt thanh bánh xưa</span>
              </h2>
            </div>

            <div className="space-y-6">
              <p className="text-[#333333]/80 leading-relaxed text-[1rem] font-light max-w-xl">
                Gói trọn sự giao thoa giữa mỹ nghệ ép kim lộng lẫy và cốt cách
                trà Việt nguyên bản. Nơi những lá trà được "hồi sinh" sánh đôi
                cùng vị bánh đậu xanh thủ công tan mịn, gửi trao lời chúc an yên
                và thịnh vượng.
              </p>

              <p className="text-[#333333]/80 leading-relaxed text-[1rem] font-light max-w-xl">
                Mỗi hộp quà không chỉ chứa đựng tinh túy từ đất mẹ Lâm Đồng, mà
                còn là nhịp cầu kết nối những tấm chân tình, biến khoảnh khắc
                sum vầy ngày Tết thành một kỷ niệm trọn vẹn.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleBuyNow}
                className="px-12 py-4 bg-[#1E4D3B] text-white rounded-full font-bold uppercase text-xs tracking-[0.2em] hover:bg-[#15382B] transition-all transform hover:-translate-y-1 shadow-xl active:scale-95"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GiftSet;
