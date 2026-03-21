import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { MILESTONES } from "./homeConstants";

/**
 * Giải pháp đúng: render cả ribbon + card bên trong cùng 1 SVG
 * dùng <foreignObject> để nhúng JSX vào SVG coordinate system.
 * Điều này đảm bảo card luôn CENTER ĐÚNG tại (cx, cy) bất kể
 * container width là bao nhiêu.
 *
 * SVG viewBox 1200×520 (thêm 20px dưới cho sub-label)
 * Path đi qua 4 điểm: (150,390) (450,140) (750,365) (1100,140)
 */

const STEP_COLORS = [
  "var(--color-primary)",   // Register
  "#8B5CF6",                // Payment
  "var(--color-secondary)", // Learn
  "#F59E0B",                // Certificate
];

// Tọa độ tâm mỗi card (nằm TRÊN ribbon path)
const DOTS = [
  { cx: 150,  cy: 390 },
  { cx: 450,  cy: 140 },
  { cx: 750,  cy: 365 },
  { cx: 1100, cy: 140 },
];

const CARD_W = 158;
const CARD_H = 130;

const PATH = "M 150 390 C 280 390,320 140,450 140 C 580 140,650 365,750 365 C 850 365,960 140,1100 140";

const LearningPathSection = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative px-6 py-16 mx-auto max-w-7xl"
      style={{
        background:
          "radial-gradient(circle at 50% 50%,rgba(240,253,250,0.5) 0%,transparent 100%)",
      }}
    >
      {/* Heading */}
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-heading">
          Your Learning Journey
        </h2>
        <p className="font-medium text-muted">
          Four simple steps from sign-up to certified professional
        </p>
      </div>

      {/* SVG canvas — preserveAspectRatio="xMidYMid meet" giữ tỷ lệ đúng */}
      <svg
        viewBox="0 0 1200 520"
        className="w-full"
        style={{ overflow: "visible" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="var(--color-primary)"   stopOpacity="0.55" />
            <stop offset="38%"  stopColor="#8B5CF6"                stopOpacity="0.50" />
            <stop offset="68%"  stopColor="var(--color-secondary)" stopOpacity="0.50" />
            <stop offset="100%" stopColor="#F59E0B"                stopOpacity="0.55" />
          </linearGradient>
          <filter id="glow" x="-15%" y="-60%" width="130%" height="220%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ribbon glow */}
        <path d={PATH} fill="none" stroke="url(#rg)" strokeWidth="18"
          strokeLinecap="round" filter="url(#glow)" />

        {/* Ribbon dashed animated */}
        <path d={PATH} fill="none" stroke="white" strokeWidth="2.5"
          strokeLinecap="round" strokeOpacity="0.9"
          strokeDasharray="6 14"
          style={{ animation: "dashFlow 1.8s linear infinite" }}
        />

        {/* Milestone cards via foreignObject — center tại cx/cy */}
        {MILESTONES.map((ms, idx) => {
          const { cx, cy } = DOTS[idx];
          const color = STEP_COLORS[idx];

          return (
            <g key={ms.title}>
              {/* foreignObject: x/y từ góc trên-trái */}
              <foreignObject
                x={cx - CARD_W / 2}
                y={cy - CARD_H / 2}
                width={CARD_W}
                height={CARD_H + 28} /* +28 cho sub-label */
              >
                {/* xmlns cần thiết cho SVG foreignObject */}
                <div xmlns="http://www.w3.org/1999/xhtml"
                  style={{
                    width:       CARD_W,
                    height:      "100%",
                    display:     "flex",
                    flexDirection: "column",
                    alignItems:  "center",
                    gap:         0,
                    animation:   `milestoneFloat 4s ease-in-out ${idx * 0.7}s infinite`,
                  }}
                >
                  {/* Card */}
                  <button
                    onClick={() => navigate(ms.route)}
                    style={{
                      width:          CARD_W,
                      height:         CARD_H,
                      borderRadius:   20,
                      border:         `1.5px solid ${color}50`,
                      background:     "rgba(255,255,255,0.94)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      boxShadow:      `0 8px 30px ${color}22, 0 2px 8px rgba(0,0,0,0.07)`,
                      display:        "flex",
                      flexDirection:  "column",
                      alignItems:     "center",
                      justifyContent: "center",
                      gap:            8,
                      padding:        "16px 12px 12px",
                      cursor:         "pointer",
                      outline:        "none",
                      textAlign:      "center",
                      transition:     "transform 0.2s, box-shadow 0.2s",
                      flexShrink:     0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.06) translateY(-3px)";
                      e.currentTarget.style.boxShadow = `0 16px 40px ${color}35, 0 4px 12px rgba(0,0,0,0.1)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1) translateY(0)";
                      e.currentTarget.style.boxShadow = `0 8px 30px ${color}22, 0 2px 8px rgba(0,0,0,0.07)`;
                    }}
                  >
                    {/* Icon circle */}
                    <div style={{
                      width:          44,
                      height:         44,
                      borderRadius:   "50%",
                      background:     `${color}18`,
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "center",
                      flexShrink:     0,
                    }}>
                      <Icon name={ms.icon} size={24} color={color} />
                    </div>

                    {/* Title */}
                    <span style={{
                      fontSize:      13,
                      fontWeight:    800,
                      color:         "#111827",
                      letterSpacing: "-0.01em",
                      lineHeight:    1.2,
                    }}>
                      {ms.title}
                    </span>
                  </button>

                  {/* Sub-label */}
                  <p style={{
                    fontSize:      9,
                    color:         "#9ca3af",
                    fontWeight:    700,
                    textTransform: "uppercase",
                    letterSpacing: "0.13em",
                    marginTop:     7,
                    textAlign:     "center",
                    whiteSpace:    "nowrap",
                  }}>
                    {ms.sub}
                  </p>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </section>
  );
};

export default LearningPathSection;