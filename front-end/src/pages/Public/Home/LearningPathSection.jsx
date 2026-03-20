import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { MILESTONES } from "./homeConstants";

const MILESTONE_POSITIONS = [
  { left: "12.5%", top: "80%", delay: 0, animDelay: "0s" },
  { left: "37.5%", top: "30%", delay: 0.15, animDelay: "0.5s" },
  { left: "62.5%", top: "75%", delay: 0.3, animDelay: "1s" },
  { left: "91.7%", top: "30%", delay: 0.45, animDelay: "1.5s" },
];

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
      <div className="mb-16 text-center">
        <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-heading">
          Your Learning Journey
        </h2>
        <p className="font-medium text-muted">
          Four strategic milestones from beginner to certified professional
        </p>
      </div>

      <div className="relative min-h-[500px] flex items-center justify-center">
        {/* Ribbon SVG */}
        <svg
          className="absolute z-0 w-full pointer-events-none"
          style={{ height: 500 }}
          preserveAspectRatio="none"
          viewBox="0 0 1200 500"
        >
          <defs>
            <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--color-primary)" />
              <stop offset="50%" stopColor="var(--color-secondary)" />
              <stop offset="100%" stopColor="var(--color-success)" />
            </linearGradient>
            <filter
              id="ribbonGlow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <path
            className="opacity-60"
            d="M 150 400 C 300 400,350 150,450 150 C 550 150,650 375,750 375 C 850 375,950 150,1100 150"
            fill="none"
            stroke="url(#ribbonGrad)"
            strokeWidth="12"
            strokeLinecap="round"
            filter="url(#ribbonGlow)"
          />
          <path
            className="opacity-80"
            d="M 150 400 C 300 400,350 150,450 150 C 550 150,650 375,750 375 C 850 375,950 150,1100 150"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="2 10"
          />
        </svg>

        {/* Milestone nodes */}
        <div className="absolute inset-0 z-10">
          {MILESTONES.map((ms, idx) => {
            const { left, top, delay, animDelay } = MILESTONE_POSITIONS[idx];
            return (
              <motion.button
                key={ms.title}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay }}
                whileHover={{ scale: 1.08 }}
                onClick={() => navigate(ms.route)}
                className="absolute flex flex-col items-center milestone-float"
                style={{
                  left,
                  top,
                  transform: "translate(-50%,-50%)",
                  animationDelay: animDelay,
                }}
              >
                <div
                  className="w-40 h-28 glass-card rounded-[2rem] border-2 flex flex-col items-center justify-center p-4"
                  style={{
                    borderColor: "rgba(52,211,153,0.5)",
                    boxShadow: "0 0 30px rgba(52,211,153,0.15)",
                  }}
                >
                  <Icon name={ms.icon} size={36} color="var(--color-primary)" />
                  <span className="mt-2 text-sm font-bold text-heading">
                    {ms.title}
                  </span>
                </div>
                <p className="text-[9px] text-muted font-bold uppercase mt-3 tracking-widest">
                  {ms.sub}
                </p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LearningPathSection;
