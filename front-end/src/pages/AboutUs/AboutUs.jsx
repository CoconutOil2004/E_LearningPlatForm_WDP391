import { motion } from "framer-motion";
import topImg from "../../assets/images/home/anh3.jpg";

const AboutUs = () => {
  const colors = {
    primary: "#0fe633",
    backgroundLight: "#f8fcf9",
    backgroundDark: "#102213",
  };

  return (
    <div className="w-full bg-white">
      {/* 2. Hero Section */}
      <section className="relative flex items-center justify-center h-screen overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={topImg}
            alt="Vườn trà detox"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-10 max-w-4xl px-6 text-center text-white"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-4 text-sm font-light tracking-widest uppercase"
          >
            Thành lập 2026
          </motion.p>
          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
            Yên: Tinh Hoa Trà Detox
          </h1>
          <p className="max-w-2xl mx-auto text-lg font-light leading-relaxed md:text-xl">
            Trải nghiệm sự tinh khiết từ lá trà detox được thu hoạch vào buổi
            sáng sớm từ những vườn trà trên núi cao, mang đến cho bạn một liệu
            trình thanh lọc cơ thể toàn diện.
          </p>
        </motion.div>

        {/* Wavy Bottom Divider */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* 3. The Essence Section */}
      <section className="max-w-6xl px-6 py-24 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="mb-4 text-sm tracking-widest text-center text-gray-500 uppercase">
            Câu Chuyện Của Chúng Tôi
          </p>
          <h2
            className="mb-12 text-4xl font-bold text-center md:text-5xl"
            style={{ color: colors.backgroundDark }}
          >
            Tinh Hoa Của Yên
          </h2>

          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-6 leading-relaxed text-gray-700">
              <p>
                Sinh ra từ đất và nuôi dưỡng bởi truyền thống, Yên đại diện cho
                một hành trình từ những vườn trà thanh bình đến liệu trình chăm
                sóc sức khỏe hàng ngày của bạn. Câu chuyện của chúng tôi là về
                sự kết nối—với thiên nhiên, với nghề thủ công, và với những
                khoảnh khắc tĩnh lặng định hình hạnh phúc của chúng ta.
              </p>
              <p>
                Chúng tôi tin rằng phụ nữ hiện đại xứng đáng có một nơi trú ẩn
                trong tách trà. Mỗi lá trà được chọn lọc không chỉ vì hàm lượng
                chất chống oxy hóa, mà còn vì sự thanh thản nó mang lại cho tâm
                trí. Detox không chỉ là thanh lọc cơ thể, mà còn là thanh lọc
                tinh thần.
              </p>
            </div>

            <div className="relative w-full h-[400px] md:h-[500px]">
              <img
                src={topImg}
                alt="Pha trà detox"
                className="object-cover w-full h-full shadow-lg rounded-2xl"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. Our Pillars Section */}
      <section
        className="px-6 py-24"
        style={{ backgroundColor: colors.backgroundLight }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-4xl font-bold text-center md:text-5xl"
            style={{ color: colors.backgroundDark }}
          >
            Những Giá Trị Cốt Lõi
          </motion.h2>

          <div className="grid gap-12 md:grid-cols-3">
            <PillarItem
              icon="🌿"
              title="100% Tự Nhiên"
              desc="Mỗi thành phần đều được tuyển chọn từ thiên nhiên, không hóa chất, không chất bảo quản. Chỉ có lá trà nguyên chất và thảo mộc hữu cơ."
              colors={colors}
            />
            <PillarItem
              icon="💚"
              title="Detox Toàn Diện"
              desc="Công thức độc quyền giúp thanh lọc gan, thận, hệ tiêu hóa. Loại bỏ độc tố tích tụ, mang lại làn da rạng rỡ từ bên trong."
              colors={colors}
            />
            <PillarItem
              icon="🧘‍♀️"
              title="Cân Bằng Cơ Thể"
              desc="Hỗ trợ giảm cân lành mạnh, cải thiện giấc ngủ, tăng cường năng lượng. Một liệu trình trà là một lối sống cân bằng."
              colors={colors}
            />
          </div>
        </div>
      </section>

      {/* 5. Parallax Quote */}
      <section className="relative flex items-center justify-center overflow-hidden h-96">
        <div className="absolute inset-0">
          <img
            src={topImg}
            alt="Nghi lễ trà"
            className="object-cover w-full h-full"
            style={{
              transform: "translateY(0)",
              transition: "transform 0.5s ease-out",
            }}
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <motion.blockquote
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl px-6 text-center text-white"
        >
          <p className="mb-6 text-2xl italic font-light leading-relaxed md:text-3xl">
            "Vẻ đẹp thật sự bắt đầu từ một khoảnh khắc yên tĩnh và tâm hồn trong
            sáng. Chúng tôi không chỉ bán trà; chúng tôi mang đến sự trở về với
            chính mình."
          </p>
          <cite className="text-sm not-italic tracking-widest uppercase opacity-80">
            — Elara Thorne, Nhà Sáng Lập —
          </cite>
        </motion.blockquote>
      </section>

      {/* 6. Final CTA */}
      {/* <section
        className="px-6 py-24 text-center"
        style={{ backgroundColor: colors.backgroundDark }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            Bắt Đầu Hành Trình Rạng Rỡ Của Bạn
          </h2>
          <p className="mb-12 text-xl leading-relaxed text-gray-300">
            Khám phá dòng sản phẩm phù hợp với nhu cầu của bạn. Từ 'Rạng Ngời
            Buổi Sáng' detox đặc trưng đến 'Hoa Nở Đêm' thư giãn, nghi lễ của
            bạn đang chờ đợi.
          </p>

          <div className="flex flex-col justify-center gap-6 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 text-lg font-semibold transition-all rounded-full shadow-lg"
              style={{
                backgroundColor: colors.primary,
                color: colors.backgroundDark,
              }}
            >
              Khám Phá Bộ Sưu Tập
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 text-lg font-semibold transition-all border-2 rounded-full"
              style={{
                borderColor: colors.primary,
                color: colors.primary,
              }}
            >
              Trắc Nghiệm Sức Khỏe
            </motion.button>
          </div>
        </motion.div>
      </section> */}
    </div>
  );
};

// Sub-components
const PillarItem = ({ icon, title, desc, colors }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -10 }}
    transition={{ duration: 0.5 }}
    className="p-8 text-center transition-all bg-white shadow-lg rounded-2xl hover:shadow-2xl"
  >
    <div className="mb-6 text-6xl">{icon}</div>
    <h3
      className="mb-4 text-2xl font-bold"
      style={{ color: colors.backgroundDark }}
    >
      {title}
    </h3>
    <p className="leading-relaxed text-gray-600">{desc}</p>
  </motion.div>
);

export default AboutUs;
