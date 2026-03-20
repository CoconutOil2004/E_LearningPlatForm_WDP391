import { ROUTES } from "../../../utils/constants";

export const STATS = [
  { label: "Learners Worldwide", value: "20K+", delay: 0 },
  { label: "Expert Courses", value: "150+", delay: 0.1 },
  { label: "Satisfaction Rate", value: "95%", delay: 0.2 },
  { label: "App Store Rating", value: "4.9/5", delay: 0.3 },
];

export const TOOLS = [
  {
    icon: "terminal",
    iconColor: "var(--color-primary)",
    bg: "var(--color-primary-bg)",
    title: "Code Lab",
    desc: "Write and run multi-language code directly in your browser.",
    route: ROUTES.COURSES,
  },
  {
    icon: "hub",
    iconColor: "#8B5CF6",
    bg: "#F5F3FF",
    title: "Mind 3D",
    desc: "Organize knowledge through immersive 3D mind mapping.",
    route: ROUTES.COURSES,
  },
  {
    icon: "sparkles",
    iconColor: "#EC4899",
    bg: "#FDF2F8",
    title: "AI Mentor",
    desc: "Get instant answers from your personal AI tutor, 24/7.",
    route: ROUTES.COURSES,
  },
  {
    icon: "users",
    iconColor: "var(--color-secondary)",
    bg: "var(--color-secondary-bg)",
    title: "Live Hub",
    desc: "Connect and collaborate with learners across the globe.",
    route: ROUTES.ABOUT,
  },
];

export const MILESTONES = [
  {
    icon: "compass",
    title: "Discover",
    sub: "Tech Discovery",
    desc: "Find your career direction and passion",
    route: ROUTES.COURSES,
  },
  {
    icon: "book-open",
    title: "Learn",
    sub: "Digital Wisdom",
    desc: "Expert-led, deeply structured curriculum",
    route: ROUTES.COURSES,
  },
  {
    icon: "code",
    title: "Build",
    sub: "Cyber Forge",
    desc: "Ship real projects inside the Lab",
    route: ROUTES.COURSES,
  },
  {
    icon: "award",
    title: "Certify",
    sub: "Neon Credential",
    desc: "Prove your skills internationally",
    route: ROUTES.ABOUT,
  },
];

export const SIDEBAR_ITEMS = [
  {
    icon: "layout",
    label: "Dashboard",
    route: ROUTES.STUDENT_DASHBOARD,
    active: true,
  },
  { icon: "book", label: "Courses", route: ROUTES.MY_COURSES },
  { icon: "trending", label: "Progress", route: ROUTES.PROGRESS },
  { icon: "settings", label: "Settings", route: ROUTES.STUDENT_SETTINGS },
];

export const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=340&fit=crop";

/* ── Tiny shared primitives ── */
export const AuroraBg = () => (
  <div
    aria-hidden
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      background: `radial-gradient(circle at 0% 0%,var(--aurora-tl) 0%,transparent 40%),
        radial-gradient(circle at 100% 0%,var(--aurora-tr) 0%,transparent 40%),
        radial-gradient(circle at 50% 50%,var(--aurora-c) 0%,transparent 70%),
        radial-gradient(circle at 100% 100%,var(--aurora-br) 0%,transparent 40%),
        radial-gradient(circle at 0% 100%,var(--aurora-bl) 0%,transparent 40%)`,
      filter: "blur(60px)",
      opacity: 0.9,
    }}
  />
);

export const GlassCard = ({
  children,
  className = "",
  style = {},
  onClick,
}) => (
  <div className={`glass-card ${className}`} style={style} onClick={onClick}>
    {children}
  </div>
);
