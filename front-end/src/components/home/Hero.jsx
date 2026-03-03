// Hero.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cauchuyen1 from "../../assets/images/home/cau-chuyen-ve-yen1.jpg";
import cauchuyen2 from "../../assets/images/home/cau-chuyen-ve-yen2.jpg";
import cauchuyen3 from "../../assets/images/home/cau-chuyen-ve-yen3.jpg";
import herohome from "../../assets/images/home/tea-garden.jpg";

const Hero = () => {
  const navigate = useNavigate(); // Khởi tạo hàm điều hướng
  const scrollToProducts = () => {
    const productSection = document.getElementById("product-listing");
    if (productSection) {
      productSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // ===== Slideshow Logic =====
  const images = [cauchuyen1, cauchuyen2, cauchuyen3];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section className="relative overflow-hidden">
      {/* UPPER HERO SECTION */}
      <div className="relative w-full h-[600px] md:h-[700px] lg:h-[100vh]">
        <div
          className="absolute inset-0 z-0 bg-top bg-cover"
          style={{ backgroundImage: `url(${herohome})` }}
        >
          <div className="absolute inset-0 bg-black/30 bg-gradient-to-b from-black/50 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 flex flex-col items-center justify-center h-full px-6 mx-auto lg:px-12">
          <div className="flex flex-col items-center">
            <h1
              className="font-sans italic text-3xl md:text-5xl lg:text-[2.5rem] 
              text-[#F8EFD8] leading-tight drop-shadow-lg text-center mb-6"
            >
              SỨ MỆNH TỪ NHỮNG LÁ TRÀ BỊ BỎ LỠ
            </h1>

            <p
              className="font-sans max-w-2xl mx-auto text-center text-sm md:text-base 
              text-[#F8EFD8]/100 leading-relaxed font-light"
            >
              Hồi sinh nét đẹp tiềm ẩn từ những lá trà bị bỏ lỡ, YÊN mang chất
              trà thật đến bên những người chọn sống bằng giá trị nội tại.
            </p>

            <button
              onClick={() => navigate("/products")}
              className="mt-6 px-12 py-4 bg-[#1E4D3B] text-white rounded-full font-bold uppercase text-xs tracking-[0.2em] hover:bg-[#15382B] transition-all transform hover:-translate-y-1 shadow-xl"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* LOWER DESCRIPTION SECTION */}
      <div className="relative pt-24 pb-24 bg-[#fdfbf7]">
        <div className="container px-6 mx-auto lg:px-16">
          <div className="grid items-center grid-cols-1 gap-16 lg:grid-cols-2">
            {/* TEXT */}
            <div className="order-2 space-y-8 lg:order-1">
              <div className="space-y-2">
                <h2 className="font-serif text-sm tracking-[0.3em] text-[#1E4D3B] uppercase font-bold">
                  Câu chuyện của chúng tôi
                </h2>

                <h3 className="font-serif text-4xl md:text-5xl text-[#15382B] leading-tight">
                  Hành trình đánh thức
                  <br /> <span>những chiếc lá bị bỏ quên</span>
                </h3>
              </div>

              <p className="text-[#333333]/80 leading-relaxed text-[1rem] font-light max-w-xl">
                Trên những đồi cao, hàng tấn trà tốt bị bỏ lại chỉ vì "lệch
                chuẩn ngoại hình", dù phẩm chất bên trong vẫn vẹn nguyên tinh
                túy. Dưới phố thị, người trẻ khao khát sự thanh lọc nhưng lại
                lạc lối giữa ma trận hương liệu và những lời hứa sáo rỗng.
                <br />
                <br />
                YÊN ra đời từ nghịch lý ấy. Chúng tôi hàn gắn đứt gãy này bằng
                cách đánh thức những chiếc lá bị lãng quên, mang đến cho bạn
                dòng detox từ trọn vẹn "chất trà" thật – nơi giá trị nội tại
                chiến thắng vẻ hào nhoáng bên ngoài.
              </p>

              <button className="group flex items-center gap-4 font-bold text-xs tracking-[0.2em] text-[#1E4D3B] uppercase">
                <span>KHÁM PHÁ CÂU CHUYỆN CỦA YÊN</span>
                <div className="w-12 h-[1px] bg-[#1E4D3B] transition-all group-hover:w-20"></div>
              </button>
            </div>

            {/* SLIDESHOW */}
            <div className="relative flex justify-center order-1 lg:order-2">
              <div className="relative w-full max-w-md overflow-hidden shadow-2xl aspect-square rounded-2xl">
                {/* Images */}
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt="Câu chuyện Yên"
                    className={`absolute inset-0 object-cover w-full h-full transition-opacity duration-700 ${
                      index === currentSlide ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}

                {/* Prev */}
                <button
                  onClick={prevSlide}
                  className="absolute px-3 py-1 text-white -translate-y-1/2 rounded-lg bg-black/40 left-2 top-1/2"
                >
                  ‹
                </button>

                {/* Next */}
                <button
                  onClick={nextSlide}
                  className="absolute px-3 py-1 text-white -translate-y-1/2 rounded-lg bg-black/40 right-2 top-1/2"
                >
                  ›
                </button>

                {/* Dots */}
                <div className="absolute flex gap-2 -translate-x-1/2 bottom-3 left-1/2">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2.5 h-2.5 rounded-full ${
                        index === currentSlide ? "bg-white" : "bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
