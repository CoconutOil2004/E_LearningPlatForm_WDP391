"use client";

import { Headphones, Lock, RotateCcw, Truck } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Miễn phí vận chuyển",
    description: "Giao hàng miễn phí cho tất cả các đơn hàng",
  },
  {
    icon: RotateCcw,
    title: "Đổi trả trong 7 ngày",
    description: "Chính sách hoàn tiền 100% nếu không hài lòng",
  },
  {
    icon: Lock,
    title: "Thanh toán an toàn",
    description: "Bảo mật giao dịch với công nghệ mã hóa",
  },
  {
    icon: Headphones,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ hỗ trợ khách hàng sẵn sàng giúp đỡ",
  },
];

export default function Features() {
  return (
    <section className="py-16 bg-soft-gold/10">
      <div className="px-4 mx-auto max-w-7xl md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex flex-row items-start gap-4 text-left"
              >
                <div className="flex flex-row p-4 rounded-full bg-[#1E4D3B] shrink-0">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex flex-col">
                  <h3 className="mb-2 font-serif text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
