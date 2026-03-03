"use client";

import phaTraImg from "../../assets/images/home/anh2.jpg";
import matchaImg from "../../assets/images/home/anh3.jpg";
import haGiangImg from "../../assets/images/home/doi-che-co-thu-ha-giang.jpg";

const newsArticles = [
  {
    id: 1,
    category: "HÀNH TRÌNH",
    title: "Trở về với những nương chè lặng lẽ Lâm Đồng",
    excerpt:
      "Bước chân lên những đồi chè lâu năm, nơi từng có những búp trà lỡ hẹn với thời gian. Giờ đây, chúng kể tiếp câu chuyện về hương vị nguyên bản và sự tử tế của đất lành. Một hành trình vừa tìm lại nguồn cội, vừa cảm nhận sự yên bình giữa thiên nhiên.",
    image: haGiangImg,
    slug: "kham-pha-doi-che-co-thu-ha-giang",
  },
  {
    id: 2,
    category: "VĂN HÓA",
    title: "Thưởng trà - Khoảnh khắc tĩnh lặng giữa nhịp sống hối hả",
    excerpt:
      "Nhấm nháp từng ngụm trà, cảm nhận hương thơm dịu dàng và hơi thở của lá trà. Những nghi thức giản đơn, tinh tế không chỉ giúp điều chỉnh nhiệt độ hay thời gian, mà còn dạy ta cách chậm lại, lắng nghe bản thân và tìm thấy bình yên trong những khoảnh khắc tưởng chừng nhỏ bé.",
    image: phaTraImg,
    slug: "nghe-thuat-pha-tra-tinh-hoa",
  },
  {
    id: 3,
    category: "ĐỜI SỐNG",
    title: "Trà và những câu chuyện bất ngờ",
    excerpt:
      "Bạn có biết mỗi loại lá trà đều mang một câu chuyện riêng? Từ chè xanh thanh mát, trà ô long nồng nàn, đến trà thảo mộc dịu dàng… Mỗi tách trà mở ra một hành trình nhỏ, để bạn vừa nhấm nháp hương vị, vừa khám phá những điều thú vị quanh thế giới trà.",
    image: matchaImg,
    slug: "matcha-cao-cap-xu-huong-hien-dai",
  },
];

export default function NewsSection() {
  return (
    <section className="relative py-20 overflow-hidden bg-cream">
      {/* <div className="px-6 mx-auto mb-16 text-center max-w-7xl lg:px-8">
        <p className="mb-3 text-sm font-medium tracking-widest uppercase text-amber-700">
          Số báo 042 — 2024
        </p>
        <h2 className="font-serif text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Khám phá
        </h2>
      </div> */}

      {/* Full-width grid without gaps */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        {newsArticles.map((article) => (
          <div
            key={article.id}
            // to={`/news/${article.slug}`}
            className="relative block overflow-hidden group aspect-[3/4]"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={article.image || "/placeholder.svg"}
                alt={article.title}
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
              />
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
            </div>

            {/* Content overlay */}
            <div className="relative flex flex-col justify-end h-full p-8 text-white">
              {/* Category badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-green-600 rounded-full">
                  {article.category}
                </span>
              </div>

              {/* Title */}
              <h3 className="mb-4 font-serif text-2xl font-bold leading-tight transition-transform duration-300 lg:text-3xl group-hover:translate-x-1">
                {article.title}
              </h3>

              {/* Excerpt */}
              <p className="mb-6 text-sm leading-relaxed text-white/90 line-clamp-2">
                {article.excerpt}
              </p>

              {/* CTA */}
              {/* <div className="flex items-center transition-transform duration-300 group-hover:translate-x-2">
                <span className="text-sm font-semibold tracking-wide uppercase">
                  Xem chi tiết
                </span>
                <ChevronRight className="w-5 h-5 ml-2" />
              </div> */}
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-green-900/20 to-transparent group-hover:opacity-100"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
