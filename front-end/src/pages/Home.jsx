// Home.jsx
import logoTrang from "../assets/images/home/logo-trang.png";
import Features from "../components/home/features";
import GiftSet from "../components/home/gift-set";
import Header from "../components/home/Header/HeaderHomePage";
import Hero from "../components/home/Hero";
import NewsSection from "../components/home/news-section";
import TeaQuiz from "../components/home/tea-quiz";
import WellnessHomepage from "../components/home/WellnessHomepage";

const Home = () => {
  return (
    <div className="bg-[#fdfbf7] font-sans text-[#333333] antialiased">
      <Header />

      <main>
        <Hero />
        <div id="product-listing">
          <GiftSet />
          <NewsSection />
          <TeaQuiz />
          <WellnessHomepage />
          <Features />
        </div>
      </main>

      {/* Footer */}

      <footer className="bg-[#1E4D3B] text-white pt-20 pb-10">
        <div className="container px-6 mx-auto">
          {/* GRID */}
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
            {/* LOGO + BRAND */}
            <div className="space-y-4 lg:col-span-2">
              <img
                src={logoTrang}
                alt="YÊN Detox Tea"
                className="w-auto h-16"
              />

              <p className="max-w-xs text-sm leading-relaxed text-white/70">
                YÊN trân quý những lá trà Lâm Đồng lỡ hẹn với vẻ ngoài hoàn hảo.
                Chúng tôi chắt chiu tinh túy ấy để tạo nên dòng detox nguyên
                bản.
              </p>
            </div>

            {/* COLUMN 1 - SỨ MỆNH */}
            <div>
              <h4 className="mb-4 text-sm font-semibold tracking-widest uppercase">
                Sứ mệnh
              </h4>

              <p className="text-sm leading-relaxed text-white/70">
                Hồi sinh những lá trà bị bỏ lỡ, mang chất trà thật đến với những
                tâm hồn trân trọng giá trị nội tại.
              </p>
            </div>

            {/* COLUMN 2 - SẢN PHẨM */}
            <div>
              <h4 className="mb-4 text-sm font-semibold tracking-widest uppercase">
                Sản phẩm theo gu
              </h4>

              <ul className="space-y-3 text-sm text-white/70">
                <li className="cursor-pointer hover:text-white">
                  Sương Mai - Thanh nhẹ
                </li>
                <li className="cursor-pointer hover:text-white">
                  Nhã Hương - Thơm dịu
                </li>
                <li className="cursor-pointer hover:text-white">
                  Tình Sắc - Đậm vị
                </li>
                <li className="cursor-pointer hover:text-white">Hộp quà Tết</li>
              </ul>
            </div>

            {/* COLUMN 3 - MINH BẠCH */}
            <div>
              <h4 className="mb-4 text-sm font-semibold tracking-widest uppercase">
                Sự minh bạch
              </h4>

              <ul className="space-y-3 text-sm text-white/70">
                <li className="cursor-pointer hover:text-white">
                  Hành trình trà từ Lâm Đồng
                </li>
                <li className="cursor-pointer hover:text-white">
                  Vẻ đẹp "Trà lệch chuẩn"
                </li>
                <li className="cursor-pointer hover:text-white">
                  Nghệ thuật pha trà
                </li>
              </ul>
            </div>

            {/* NEWSLETTER + CONTACT */}
            <div className="space-y-6">
              <div>
                <h4 className="mb-3 text-sm font-semibold tracking-widest uppercase">
                  Nhận ưu đãi
                </h4>

                <div className="flex">
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="w-full py-2 text-sm bg-transparent outline-none placeholder:text-white/50"
                  />
                </div>
              </div>

              {/* CONTACT */}
              <div>
                <p className="mb-2 text-sm font-semibold tracking-widest uppercase">
                  Kết nối
                </p>

                <p className="text-sm text-white/70">(+84) 271 837 323</p>
                <p className="text-sm text-white/70">yen.detox@gmail.com</p>
              </div>

              {/* SOCIAL */}
              <div className="flex gap-4">
                <div className="w-8 h-8 flex items-center justify-center border border-white/40 rounded-full hover:bg-white hover:text-[#1E4D3B] cursor-pointer transition">
                  f
                </div>
                <div className="w-8 h-8 flex items-center justify-center border border-white/40 rounded-full hover:bg-white hover:text-[#1E4D3B] cursor-pointer transition">
                  in
                </div>
                <div className="w-8 h-8 flex items-center justify-center border border-white/40 rounded-full hover:bg-white hover:text-[#1E4D3B] cursor-pointer transition">
                  yt
                </div>
              </div>
            </div>
          </div>

          {/* BRAND VALUE STRIP */}
          <div className="grid grid-cols-1 gap-10 pt-12 mt-20 text-center border-t md:grid-cols-3 border-white/10">
            <div className="space-y-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto border rounded-full border-white/40">
                🍃
              </div>
              <p className="text-xs tracking-widest uppercase">100% Trà thật</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto border rounded-full border-white/40">
                ♻
              </div>
              <p className="text-xs tracking-widest uppercase">
                Hồi sinh trà Việt
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto border rounded-full border-white/40">
                💧
              </div>
              <p className="text-xs tracking-widest uppercase">Clean Label</p>
            </div>
          </div>

          {/* COPYRIGHT */}
          <div className="pt-6 mt-12 text-xs tracking-widest text-center uppercase border-t border-white/10 text-white/40">
            © 2026 YÊN Detox Tea. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
