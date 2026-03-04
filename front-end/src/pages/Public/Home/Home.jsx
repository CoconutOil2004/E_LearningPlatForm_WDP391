import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { logout as logoutAction } from "../features/auth/authSlice";
import { API_BASE_URL } from "../utils/constants";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const theme = {
  colors: {
    bg: "#0A0A0F",
    surface: "#111118",
    card: "#16161F",
    border: "#1E1E2E",
    accent: "#6C63FF",
    accentHover: "#5A52E0",
    gold: "#F5A623",
    teal: "#00C9A7",
    text: "#E8E8F0",
    muted: "#6B6B85",
    danger: "#FF4D6D",
  },
};

// ─── MOCK DATA (COURSES & STATS) ─────────────────────────────────────────────
const MOCK_COURSES = [
  {
    id: 1,
    title: "React & TypeScript Mastery",
    category: "Frontend",
    level: "Advanced",
    price: 1299000,
    thumbnail: "🎯",
    rating: 4.9,
    students: 3241,
    duration: "42h",
    instructorId: 2,
    instructor: "Sarah Chen",
    isApproved: true,
    description:
      "Master React with TypeScript from fundamentals to advanced patterns. Build production-ready applications.",
    lessons: [
      {
        id: 1,
        title: "TypeScript Fundamentals",
        duration: "45min",
        isPreview: true,
        videoUrl: "#",
        content: "Intro to TypeScript...",
      },
      {
        id: 2,
        title: "React Component Patterns",
        duration: "1h 20min",
        isPreview: false,
        videoUrl: "#",
        content: "Advanced patterns...",
      },
      {
        id: 3,
        title: "State Management Deep Dive",
        duration: "1h 45min",
        isPreview: false,
        videoUrl: "#",
        content: "Redux, Zustand, Jotai...",
      },
      {
        id: 4,
        title: "Performance Optimization",
        duration: "55min",
        isPreview: false,
        videoUrl: "#",
        content: "Memoization, lazy loading...",
      },
    ],
    tags: ["React", "TypeScript", "Frontend"],
  },
  {
    id: 2,
    title: "System Design for Engineers",
    category: "Architecture",
    level: "Senior",
    price: 1599000,
    thumbnail: "🏗",
    rating: 4.8,
    students: 1872,
    duration: "38h",
    instructorId: 2,
    instructor: "Sarah Chen",
    isApproved: true,
    description:
      "Design scalable distributed systems. Prepare for system design interviews at FAANG companies.",
    lessons: [
      {
        id: 5,
        title: "Scalability Fundamentals",
        duration: "1h",
        isPreview: true,
        videoUrl: "#",
        content: "CAP theorem, horizontal scaling...",
      },
      {
        id: 6,
        title: "Database Design Patterns",
        duration: "1h 30min",
        isPreview: false,
        videoUrl: "#",
        content: "SQL vs NoSQL...",
      },
    ],
    tags: ["System Design", "Architecture", "Backend"],
  },
  {
    id: 3,
    title: "AI/ML with Python",
    category: "Data Science",
    level: "Intermediate",
    price: 999000,
    thumbnail: "🤖",
    rating: 4.7,
    students: 5120,
    duration: "55h",
    instructorId: 2,
    instructor: "Sarah Chen",
    isApproved: true,
    description:
      "From linear regression to neural networks. Build real ML pipelines with PyTorch.",
    lessons: [
      {
        id: 7,
        title: "Python for ML",
        duration: "2h",
        isPreview: true,
        videoUrl: "#",
        content: "NumPy, Pandas...",
      },
      {
        id: 8,
        title: "Neural Networks",
        duration: "2h 30min",
        isPreview: false,
        videoUrl: "#",
        content: "Backprop, activation functions...",
      },
    ],
    tags: ["Python", "ML", "AI", "Data Science"],
  },
  {
    id: 4,
    title: "UI/UX Design Principles",
    category: "Design",
    level: "Beginner",
    price: 799000,
    thumbnail: "🎨",
    rating: 4.6,
    students: 2890,
    duration: "28h",
    instructorId: 2,
    instructor: "Sarah Chen",
    isApproved: false,
    description:
      "Master user interface design principles and create stunning, user-centered experiences.",
    lessons: [
      {
        id: 9,
        title: "Design Thinking",
        duration: "1h",
        isPreview: true,
        videoUrl: "#",
        content: "Empathy, define, ideate...",
      },
    ],
    tags: ["Design", "UI", "UX", "Figma"],
  },
];

const MOCK_STATS = {
  totalUsers: 12847,
  totalCourses: 284,
  totalRevenue: 987654000,
  pendingCourses: 12,
};

// ─── UTILITIES ────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("vi-VN").format(n) + "đ";

// ─── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      background: #0A0A0F;
      color: #E8E8F0;
      font-family: 'DM Sans', sans-serif;
      min-height: 100vh;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #0A0A0F; }
    ::-webkit-scrollbar-thumb { background: #6C63FF; border-radius: 4px; }

    .syne { font-family: 'Syne', sans-serif; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; } to { opacity: 1; }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .fade-up { animation: fadeUp 0.5s ease forwards; }
    .fade-in { animation: fadeIn 0.3s ease forwards; }
    .float { animation: float 3s ease-in-out infinite; }

    .btn-primary {
      background: linear-gradient(135deg, #6C63FF, #9C63FF);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(108,99,255,0.4);
    }
    .btn-primary:active { transform: translateY(0); }

    .btn-ghost {
      background: transparent;
      color: #E8E8F0;
      border: 1px solid #1E1E2E;
      padding: 12px 24px;
      border-radius: 10px;
      font-family: 'DM Sans', sans-serif;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-ghost:hover { border-color: #6C63FF; color: #6C63FF; }

    .card {
      background: #16161F;
      border: 1px solid #1E1E2E;
      border-radius: 16px;
      transition: all 0.3s ease;
    }
    .card:hover {
      border-color: rgba(108,99,255,0.4);
      transform: translateY(-4px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }

    .input {
      background: #111118;
      border: 1px solid #1E1E2E;
      color: #E8E8F0;
      padding: 12px 16px;
      border-radius: 10px;
      font-family: 'DM Sans', sans-serif;
      font-size: 15px;
      width: 100%;
      outline: none;
      transition: all 0.2s;
    }
    .input:focus { border-color: #6C63FF; box-shadow: 0 0 0 3px rgba(108,99,255,0.15); }
    .input::placeholder { color: #6B6B85; }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .badge-purple { background: rgba(108,99,255,0.15); color: #6C63FF; }
    .badge-gold { background: rgba(245,166,35,0.15); color: #F5A623; }
    .badge-teal { background: rgba(0,201,167,0.15); color: #00C9A7; }

    .nav-link {
      color: #6B6B85;
      text-decoration: none;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.2s;
      cursor: pointer;
      font-size: 15px;
      font-weight: 500;
    }
    .nav-link:hover, .nav-link.active { color: #E8E8F0; background: rgba(108,99,255,0.1); }

    .sidebar-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-radius: 10px;
      color: #6B6B85;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
      font-weight: 500;
    }
    .sidebar-link:hover { background: rgba(108,99,255,0.08); color: #E8E8F0; }
    .sidebar-link.active { background: rgba(108,99,255,0.15); color: #6C63FF; }

    .stat-card {
      background: #16161F;
      border: 1px solid #1E1E2E;
      border-radius: 16px;
      padding: 24px;
    }

    .progress-bar {
      height: 6px;
      background: #1E1E2E;
      border-radius: 100px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #6C63FF, #00C9A7);
      border-radius: 100px;
      transition: width 1s ease;
    }

    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      background: #16161F;
      border: 1px solid #1E1E2E;
      border-radius: 12px;
      padding: 16px 20px;
      min-width: 280px;
      animation: slideIn 0.3s ease;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }

    .hero-grid {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(108,99,255,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(108,99,255,0.05) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    .course-card-img {
      width: 100%;
      height: 140px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 56px;
      background: linear-gradient(135deg, #16161F, #1E1E2E);
      margin-bottom: 16px;
    }

    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 12px 16px; color: #6B6B85; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; border-bottom: 1px solid #1E1E2E; }
    td { padding: 14px 16px; border-bottom: 1px solid rgba(30,30,46,0.5); font-size: 14px; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(108,99,255,0.03); }

    select.input { appearance: none; }

    .lesson-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid transparent;
    }
    .lesson-item:hover { background: rgba(108,99,255,0.05); border-color: rgba(108,99,255,0.2); }
    .lesson-item.active { background: rgba(108,99,255,0.1); border-color: rgba(108,99,255,0.3); }

    .video-player {
      width: 100%;
      aspect-ratio: 16/9;
      background: #000;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
      .sidebar { display: none; }
    }
  `}</style>
);

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
const Avatar = ({ initials, size = 36, color = "#6C63FF" }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}, #9C63FF)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: 700,
      fontSize: size * 0.38,
      fontFamily: "Syne, sans-serif",
      flexShrink: 0,
    }}
  >
    {initials}
  </div>
);

const Stars = ({ rating }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        style={{
          color: i <= Math.round(rating) ? "#F5A623" : "#2A2A3A",
          fontSize: 13,
        }}
      >
        ★
      </span>
    ))}
    <span
      style={{ color: "#6B6B85", fontSize: 12, marginLeft: 4 }}
    >
      {rating}
    </span>
  </div>
);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  const colors = {
    success: "#00C9A7",
    error: "#FF4D6D",
    info: "#6C63FF",
  };
  return (
    <div className="toast">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: colors[type] || colors.info,
          }}
        />
        <span style={{ fontSize: 14, fontWeight: 500 }}>{message}</span>
        <button
          onClick={onClose}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            color: "#6B6B85",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

// ─── NAVBAR ────────────────────────────────────────────────────────────────────
const Navbar = ({ page, setPage, user, onLogin, onLogout }) => (
  <nav
    style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(10,10,15,0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid #1E1E2E",
      padding: "0 24px",
      height: 64,
      display: "flex",
      alignItems: "center",
      gap: 16,
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
      }}
      onClick={() => setPage("home")}
    >
      <div
        style={{
          width: 32,
          height: 32,
          background: "linear-gradient(135deg, #6C63FF, #00C9A7)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
        }}
      >
        ⚡
      </div>
      <span
        className="syne"
        style={{
          fontWeight: 800,
          fontSize: 18,
          background: "linear-gradient(135deg, #6C63FF, #00C9A7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        LearnX
      </span>
    </div>

    <div
      style={{ display: "flex", gap: 4, marginLeft: 24 }}
      className="hide-mobile"
    >
      <span
        className={`nav-link ${page === "home" ? "active" : ""}`}
        onClick={() => setPage("home")}
      >
        Explore
      </span>
      <span
        className={`nav-link ${page === "courses" ? "active" : ""}`}
        onClick={() => setPage("courses")}
      >
        Courses
      </span>
    </div>

    <div
      style={{
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {user ? (
        <>
          <span className="badge badge-purple">{user.role}</span>
          <span
            className="nav-link"
            onClick={() => setPage(`${user.role}-dashboard`)}
          >
            Dashboard
          </span>
          <Avatar initials={user.avatar} size={34} />
          <button
            className="btn-ghost"
            style={{ padding: "7px 14px", fontSize: 13 }}
            onClick={onLogout}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <button
            className="btn-ghost"
            style={{ padding: "8px 18px" }}
            onClick={onLogin}
          >
            Login
          </button>
          <button
            className="btn-primary"
            style={{ padding: "8px 18px" }}
            onClick={onLogin}
          >
            Get Started
          </button>
        </>
      )}
    </div>
  </nav>
);

// ─── SIDEBAR ───────────────────────────────────────────────────────────────────
const Sidebar = ({ role, page, setPage }) => {
  const menus = {
    student: [
      { icon: "⊞", label: "Dashboard", id: "student-dashboard" },
      { icon: "📚", label: "My Courses", id: "my-courses" },
      { icon: "📊", label: "Progress", id: "progress" },
      { icon: "🏆", label: "Certificates", id: "certificates" },
    ],
    instructor: [
      { icon: "⊞", label: "Dashboard", id: "instructor-dashboard" },
      { icon: "🎓", label: "My Courses", id: "instructor-courses" },
      { icon: "➕", label: "Create Course", id: "create-course" },
      { icon: "👥", label: "Students", id: "instructor-students" },
      { icon: "💰", label: "Revenue", id: "revenue" },
    ],
    admin: [
      { icon: "⊞", label: "Dashboard", id: "admin-dashboard" },
      { icon: "👥", label: "Users", id: "admin-users" },
      { icon: "📚", label: "Courses", id: "admin-courses" },
      { icon: "⏳", label: "Approvals", id: "admin-approvals" },
      { icon: "💹", label: "Analytics", id: "analytics" },
    ],
  };

  return (
    <aside
      className="sidebar"
      style={{
        width: 220,
        flexShrink: 0,
        background: "#111118",
        borderRight: "1px solid #1E1E2E",
        padding: "24px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {(menus[role] || []).map((m) => (
        <div
          key={m.id}
          className={`sidebar-link ${page === m.id ? "active" : ""}`}
          onClick={() => setPage(m.id)}
        >
          <span style={{ fontSize: 18 }}>{m.icon}</span>
          <span>{m.label}</span>
        </div>
      ))}
    </aside>
  );
};

// ─── HOME PAGE (LANDING) ──────────────────────────────────────────────────────
const HomePage = ({ setPage, onLogin, user }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      {/* HERO */}
      <section
        style={{
          position: "relative",
          padding: "100px 24px 120px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <div className="hero-grid" />
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: 300,
            height: 300,
            background:
              "radial-gradient(circle, rgba(108,99,255,0.15), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "10%",
            width: 400,
            height: 400,
            background:
              "radial-gradient(circle, rgba(0,201,167,0.1), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "relative",
            maxWidth: 760,
            margin: "0 auto",
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateY(30px)",
            transition: "all 0.8s ease",
          }}
        >
          <div
            className="badge badge-purple"
            style={{ marginBottom: 20, fontSize: 13 }}
          >
            🚀 The future of learning is here
          </div>
          <h1
            className="syne"
            style={{
              fontSize: "clamp(42px, 7vw, 72px)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            Master skills that
            <span
              style={{
                display: "block",
                background:
                  "linear-gradient(135deg, #6C63FF, #00C9A7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              move the world
            </span>
          </h1>
          <p
            style={{
              fontSize: 18,
              color: "#9998C0",
              maxWidth: 520,
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            Learn from industry experts. Build real projects. Join
            50,000+ developers transforming their careers.
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn-primary"
              style={{ padding: "14px 32px", fontSize: 16 }}
              onClick={() => setPage("courses")}
            >
              Browse Courses →
            </button>
            {!user && (
              <button
                className="btn-ghost"
                style={{ padding: "14px 32px", fontSize: 16 }}
                onClick={onLogin}
              >
                Start Free Trial
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 40,
            justifyContent: "center",
            marginTop: 60,
            flexWrap: "wrap",
            position: "relative",
          }}
        >
          {[
            ["50K+", "Students"],
            ["284", "Courses"],
            ["98%", "Satisfaction"],
            ["4.9★", "Rating"],
          ].map(([n, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div
                className="syne"
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#6C63FF",
                }}
              >
                {n}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "#6B6B85",
                  marginTop: 2,
                }}
              >
                {l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section
        style={{
          padding: "60px 24px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 32,
          }}
        >
          <div>
            <h2
              className="syne"
              style={{
                fontSize: 30,
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              Featured Courses
            </h2>
            <p style={{ color: "#6B6B85" }}>
              Curated for maximum impact
            </p>
          </div>
          <span
            style={{
              color: "#6C63FF",
              cursor: "pointer",
              fontSize: 14,
            }}
            onClick={() => setPage("courses")}
          >
            View all →
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {MOCK_COURSES.filter((c) => c.isApproved).map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              setPage={setPage}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{ padding: "80px 24px", textAlign: "center" }}
      >
        <div
          style={{
            maxWidth: 600,
            margin: "0 auto",
            background:
              "linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,201,167,0.05))",
            border: "1px solid rgba(108,99,255,0.2)",
            borderRadius: 24,
            padding: "60px 40px",
          }}
        >
          <div
            style={{ fontSize: 48, marginBottom: 20 }}
            className="float"
          >
            🎓
          </div>
          <h2
            className="syne"
            style={{
              fontSize: 32,
              fontWeight: 800,
              marginBottom: 16,
            }}
          >
            Ready to level up?
          </h2>
          <p
            style={{
              color: "#9998C0",
              marginBottom: 28,
              lineHeight: 1.7,
            }}
          >
            Join thousands of professionals mastering in-demand skills.
            Start your journey today.
          </p>
          <button
            className="btn-primary"
            style={{ padding: "14px 36px", fontSize: 16 }}
            onClick={onLogin}
          >
            Start Learning Free
          </button>
        </div>
      </section>
    </div>
  );
};

// ─── COURSE CARD ───────────────────────────────────────────────────────────────
const CourseCard = ({ course, setPage }) => (
  <div
    className="card fade-up"
    style={{ padding: 20, cursor: "pointer" }}
    onClick={() => setPage(`course-${course.id}`)}
  >
    <div className="course-card-img">{course.thumbnail}</div>
    <div
      style={{
        display: "flex",
        gap: 6,
        marginBottom: 10,
        flexWrap: "wrap",
      }}
    >
      <span className="badge badge-purple">{course.category}</span>
      <span className="badge badge-teal">{course.level}</span>
    </div>
    <h3
      style={{
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 8,
        lineHeight: 1.4,
      }}
    >
      {course.title}
    </h3>
    <p
      style={{
        fontSize: 13,
        color: "#6B6B85",
        marginBottom: 12,
        lineHeight: 1.5,
      }}
    >
      {course.description.slice(0, 80)}...
    </p>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
      }}
    >
      <Avatar
        initials={course.instructor
          .split(" ")
          .map((n) => n[0])
          .join("")}
        size={24}
      />
      <span style={{ fontSize: 13, color: "#9998C0" }}>
        {course.instructor}
      </span>
    </div>
    <Stars rating={course.rating} />
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 14,
        paddingTop: 14,
        borderTop: "1px solid #1E1E2E",
      }}
    >
      <div
        className="syne"
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#6C63FF",
        }}
      >
        {fmt(course.price)}
      </div>
      <div style={{ fontSize: 12, color: "#6B6B85" }}>
        👥 {course.students.toLocaleString()}
      </div>
    </div>
  </div>
);

// ─── COURSES PAGE ──────────────────────────────────────────────────────────────
const CoursesPage = ({ setPage, user }) => {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const cats = ["All", "Frontend", "Architecture", "Data Science", "Design"];
  const filtered = MOCK_COURSES.filter(
    (c) =>
      c.isApproved &&
      (cat === "All" || c.category === cat) &&
      (c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "40px 24px",
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <h1
          className="syne"
          style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}
        >
          All Courses
        </h1>
        <p style={{ color: "#6B6B85" }}>
          Discover {
            MOCK_COURSES.filter((c) => c.isApproved).length
          }{" "}
          expert-led courses
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <input
          className="input"
          style={{ maxWidth: 320 }}
          placeholder="🔍  Search courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div
          style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
        >
          {cats.map((c) => (
            <button
              key={c}
              className={`tab ${cat === c ? "active" : ""}`}
              onClick={() => setCat(c)}
              style={{
                background:
                  cat === c
                    ? "rgba(108,99,255,0.15)"
                    : "#16161F",
                border: "1px solid #1E1E2E",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {filtered.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            setPage={setPage}
          />
        ))}
        {filtered.length === 0 && (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              padding: 60,
              color: "#6B6B85",
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p>
              No courses found for "{search}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── COURSE DETAIL PAGE ────────────────────────────────────────────────────────
const CourseDetailPage = ({
  courseId,
  user,
  setPage,
  onLogin,
  showToast,
}) => {
  const course = MOCK_COURSES.find((c) => c.id === courseId);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeLesson, setActiveLesson] = useState(null);
  const isEnrolled = user?.enrolled?.includes(courseId);

  if (!course)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Course not found
      </div>
    );

  const handleEnroll = () => {
    if (!user) {
      onLogin();
      return;
    }
    showToast("Course purchased! Happy learning! 🎉", "success");
  };

  return (
    <div
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 32,
          alignItems: "start",
        }}
      >
        {/* Left */}
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <span className="badge badge-purple">
              {course.category}
            </span>
            <span className="badge badge-teal">{course.level}</span>
          </div>
          <h1
            className="syne"
            style={{
              fontSize: 32,
              fontWeight: 800,
              marginBottom: 12,
              lineHeight: 1.3,
            }}
          >
            {course.title}
          </h1>
          <p
            style={{
              color: "#9998C0",
              marginBottom: 20,
              lineHeight: 1.7,
            }}
          >
            {course.description}
          </p>

          <div
            style={{
              display: "flex",
              gap: 20,
              marginBottom: 28,
              color: "#6B6B85",
              fontSize: 14,
            }}
          >
            <span>⭐ {course.rating}</span>
            <span>
              👥 {course.students.toLocaleString()} students
            </span>
            <span>⏱ {course.duration}</span>
            <span>📝 {course.lessons.length} lessons</span>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
            {[
              "overview",
              "curriculum",
              isEnrolled ? "player" : null,
            ]
              .filter(Boolean)
              .map((t) => (
                <div
                  key={t}
                  className={`tab ${
                    activeTab === t ? "active" : ""
                  }`}
                  style={{
                    background: "#16161F",
                    border: "1px solid #1E1E2E",
                    textTransform: "capitalize",
                  }}
                  onClick={() => setActiveTab(t)}
                >
                  {t}
                </div>
              ))}
          </div>

          {activeTab === "overview" && (
            <div className="fade-in">
              <h3 style={{ fontWeight: 600, marginBottom: 16 }}>
                What you'll learn
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                {[
                  "Modern best practices",
                  "Real-world projects",
                  "Industry patterns",
                  "Career-ready skills",
                  "Code reviews",
                  "Community support",
                ].map((t) => (
                  <div
                    key={t}
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                      fontSize: 14,
                    }}
                  >
                    <span style={{ color: "#00C9A7" }}>✓</span>{" "}
                    {t}
                  </div>
                ))}
              </div>

              <h3
                style={{
                  fontWeight: 600,
                  marginTop: 28,
                  marginBottom: 16,
                }}
              >
                Tags
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                {course.tags.map((t) => (
                  <span
                    key={t}
                    className="badge badge-purple"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === "curriculum" && (
            <div className="fade-in">
              <h3 style={{ fontWeight: 600, marginBottom: 16 }}>
                {course.lessons.length} Lessons
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {course.lessons.map((lesson, i) => (
                  <div
                    key={lesson.id}
                    className={`lesson-item ${
                      activeLesson?.id === lesson.id
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      if (lesson.isPreview || isEnrolled)
                        setActiveLesson(lesson);
                      else if (!user) {
                        onLogin();
                      } else {
                        showToast(
                          "Purchase this course to access all lessons",
                          "info",
                        );
                      }
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background:
                          lesson.isPreview || isEnrolled
                            ? "rgba(108,99,255,0.15)"
                            : "#1E1E2E",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        color:
                          lesson.isPreview || isEnrolled
                            ? "#6C63FF"
                            : "#6B6B85",
                      }}
                    >
                      {lesson.isPreview || isEnrolled ? "▶" : "🔒"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      >
                        {i + 1}. {lesson.title}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "#6B6B85",
                          marginTop: 2,
                        }}
                      >
                        {lesson.duration}
                      </div>
                    </div>
                    {lesson.isPreview && (
                      <span
                        className="badge badge-gold"
                        style={{ fontSize: 11 }}
                      >
                        FREE
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "player" && activeLesson && (
            <div className="fade-in">
              <h3 style={{ fontWeight: 600, marginBottom: 16 }}>
                {activeLesson.title}
              </h3>
              <div
                className="video-player"
                style={{
                  marginBottom: 20,
                  background:
                    "linear-gradient(135deg, #111118, #1E1E2E)",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{ fontSize: 64, marginBottom: 12 }}
                  >
                    ▶️
                  </div>
                  <p style={{ color: "#6B6B85" }}>
                    Video: {activeLesson.title}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#6B6B85",
                      marginTop: 4,
                    }}
                  >
                    Duration: {activeLesson.duration}
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: "#16161F",
                  border: "1px solid #1E1E2E",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <h4
                  style={{ fontWeight: 600, marginBottom: 8 }}
                >
                  Lesson Notes
                </h4>
                <p
                  style={{
                    color: "#9998C0",
                    lineHeight: 1.7,
                    fontSize: 14,
                  }}
                >
                  {activeLesson.content}
                </p>
              </div>

              {/* Quiz */}
              <div
                style={{
                  marginTop: 20,
                  background: "rgba(108,99,255,0.05)",
                  border: "1px solid rgba(108,99,255,0.2)",
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <h4
                  style={{ fontWeight: 600, marginBottom: 8 }}
                >
                  Quick Quiz
                </h4>
                <p
                  style={{
                    color: "#9998C0",
                    fontSize: 14,
                    marginBottom: 16,
                  }}
                >
                  What is the primary advantage of TypeScript over
                  JavaScript?
                </p>
                {[
                  "Static type checking",
                  "Faster execution",
                  "Smaller bundle size",
                  "Better browser support",
                ].map((opt, i) => (
                  <button
                    key={i}
                    className="btn-ghost"
                    style={{
                      width: "100%",
                      textAlign: "left",
                      marginBottom: 8,
                      padding: "10px 14px",
                      fontSize: 14,
                    }}
                    onClick={() => {
                      if (i === 0)
                        showToast("Correct! 🎉", "success");
                      else
                        showToast(
                          "Not quite. Try again!",
                          "error",
                        );
                    }}
                  >
                    {String.fromCharCode(65 + i)}. {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div style={{ position: "sticky", top: 80 }}>
          <div className="card" style={{ padding: 24 }}>
            <div
              className="course-card-img"
              style={{ height: 160, marginBottom: 20 }}
            >
              {course.thumbnail}
            </div>
            <div
              className="syne"
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: "#6C63FF",
                marginBottom: 8,
              }}
            >
              {fmt(course.price)}
            </div>

            {isEnrolled ? (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 13,
                      color: "#6B6B85",
                      marginBottom: 6,
                    }}
                  >
                    <span>Progress</span>
                    <span>35%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: "35%" }}
                    />
                  </div>
                </div>
                <button
                  className="btn-primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                  }}
                  onClick={() => {
                    setActiveTab("player");
                    setActiveLesson(course.lessons[0]);
                  }}
                >
                  Continue Learning →
                </button>
              </div>
            ) : (
              <button
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
                onClick={handleEnroll}
              >
                {user ? "Enroll Now" : "Login to Enroll"}
              </button>
            )}

            <div
              style={{
                marginTop: 20,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {[
                ["📝", `${course.lessons.length} Lessons`],
                ["⏱", course.duration],
                ["🏆", course.level],
                ["♾", "Full lifetime access"],
              ].map(([icon, text]) => (
                <div
                  key={text}
                  style={{
                    display: "flex",
                    gap: 10,
                    fontSize: 14,
                    color: "#9998C0",
                  }}
                >
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── STUDENT DASHBOARD ─────────────────────────────────────────────────────────
const StudentDashboard = ({ user, setPage }) => {
  const enrolled = MOCK_COURSES.filter((c) =>
    user.enrolled?.includes(c.id),
  );
  const progresses = { 1: 35, 2: 72 };

  return (
    <div
      style={{
        padding: "32px 24px",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <h1
          className="syne"
          style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}
        >
          Good morning, {user.name.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "#6B6B85" }}>
          You're on a 3-day learning streak. Keep it up!
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          {
            label: "Courses Enrolled",
            value: enrolled.length,
            icon: "📚",
            color: "#6C63FF",
          },
          {
            label: "Hours Learned",
            value: "47h",
            icon: "⏱",
            color: "#00C9A7",
          },
          {
            label: "Lessons Done",
            value: 23,
            icon: "✅",
            color: "#F5A623",
          },
          {
            label: "Streak Days",
            value: 3,
            icon: "🔥",
            color: "#FF4D6D",
          },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 28, marginBottom: 8 }}>
              {s.icon}
            </div>
            <div
              className="syne"
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: s.color,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#6B6B85",
                marginTop: 2,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* My Courses */}
      <h2
        className="syne"
        style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}
      >
        Continue Learning
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {enrolled.map((c) => (
          <div
            key={c.id}
            className="card"
            style={{
              padding: 20,
              display: "flex",
              gap: 20,
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => setPage(`course-${c.id}`)}
          >
            <div style={{ fontSize: 40, flexShrink: 0 }}>
              {c.thumbnail}
            </div>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  fontWeight: 600,
                  marginBottom: 4,
                  fontSize: 16,
                }}
              >
                {c.title}
              </h3>
              <p
                style={{
                  color: "#6B6B85",
                  fontSize: 13,
                  marginBottom: 10,
                }}
              >
                {c.instructor}
              </p>
              <div
                className="progress-bar"
                style={{ marginBottom: 4 }}
              >
                <div
                  className="progress-fill"
                  style={{
                    width: `${progresses[c.id] || 0}%`,
                  }}
                />
              </div>
              <div
                style={{ fontSize: 12, color: "#6B6B85" }}
              >
                {progresses[c.id]}% complete
              </div>
            </div>
            <button
              className="btn-primary"
              style={{ flexShrink: 0 }}
            >
              Continue →
            </button>
          </div>
        ))}
      </div>

      {/* Recommended */}
      <h2
        className="syne"
        style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}
      >
        Recommended for You
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {MOCK_COURSES.filter(
          (c) => !user.enrolled?.includes(c.id) && c.isApproved,
        ).map((c) => (
          <CourseCard
            key={c.id}
            course={c}
            setPage={setPage}
          />
        ))}
      </div>
    </div>
  );
};

// ─── INSTRUCTOR DASHBOARD ──────────────────────────────────────────────────────
const InstructorDashboard = ({ user, setPage, showToast }) => {
  const myCourses = MOCK_COURSES.filter(
    (c) => c.instructorId === user.id,
  );
  const [creating, setCreating] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: "",
    category: "Frontend",
    price: "",
  });

  const handleCreate = () => {
    showToast(
      "Course created successfully! Pending admin review.",
      "success",
    );
    setCreating(false);
    setNewCourse({ title: "", category: "Frontend", price: "" });
  };

  return (
    <div
      style={{
        padding: "32px 24px",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 32,
        }}
      >
        <div>
          <h1
            className="syne"
            style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}
          >
            Instructor Studio
          </h1>
          <p style={{ color: "#6B6B85" }}>
            Manage your courses and track performance
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setCreating(true)}
        >
          + New Course
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          {
            label: "Total Courses",
            value: myCourses.length,
            icon: "🎓",
            color: "#6C63FF",
          },
          {
            label: "Total Students",
            value: "5,113",
            icon: "👥",
            color: "#00C9A7",
          },
          {
            label: "Total Revenue",
            value: "₫84.2M",
            icon: "💰",
            color: "#F5A623",
          },
          {
            label: "Avg Rating",
            value: "4.8★",
            icon: "⭐",
            color: "#FF4D6D",
          },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: 28, marginBottom: 8 }}>
              {s.icon}
            </div>
            <div
              className="syne"
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: s.color,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#6B6B85",
                marginTop: 2,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* My Courses Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #1E1E2E",
          }}
        >
          <h2
            className="syne"
            style={{ fontSize: 18, fontWeight: 700 }}
          >
            My Courses
          </h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Course</th>
              <th>Status</th>
              <th>Students</th>
              <th>Revenue</th>
              <th>Rating</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {myCourses.map((c) => (
              <tr key={c.id}>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{c.thumbnail}</span>
                    <div>
                      <div
                        style={{
                          fontWeight: 500,
                          fontSize: 14,
                        }}
                      >
                        {c.title}
                      </div>
                      <div
                        style={{
                          color: "#6B6B85",
                          fontSize: 12,
                        }}
                      >
                        {c.category}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className={`badge ${
                      c.isApproved ? "badge-teal" : "badge-gold"
                    }`}
                  >
                    {c.isApproved ? "Live" : "Pending"}
                  </span>
                </td>
                <td style={{ fontWeight: 500 }}>
                  {c.students.toLocaleString()}
                </td>
                <td
                  style={{
                    color: "#00C9A7",
                    fontWeight: 500,
                  }}
                >
                  {fmt(c.price * c.students * 0.7)}
                </td>
                <td>
                  <Stars rating={c.rating} />
                </td>
                <td>
                  <button
                    className="btn-ghost"
                    style={{
                      padding: "6px 14px",
                      fontSize: 13,
                    }}
                    onClick={() =>
                      showToast("Edit feature coming soon!", "info")
                    }
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Course Modal */}
      {creating && (
        <div
          className="modal-overlay"
          onClick={() => setCreating(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="syne"
              style={{
                fontSize: 22,
                fontWeight: 800,
                marginBottom: 20,
              }}
            >
              Create New Course
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    color: "#6B6B85",
                  }}
                >
                  Course Title
                </label>
                <input
                  className="input"
                  placeholder="e.g. Advanced React Patterns"
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse((p) => ({
                      ...p,
                      title: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    color: "#6B6B85",
                  }}
                >
                  Category
                </label>
                <select
                  className="input"
                  value={newCourse.category}
                  onChange={(e) =>
                    setNewCourse((p) => ({
                      ...p,
                      category: e.target.value,
                    }))
                  }
                >
                  {[
                    "Frontend",
                    "Backend",
                    "Data Science",
                    "Design",
                    "Architecture",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    color: "#6B6B85",
                  }}
                >
                  Price (VND)
                </label>
                <input
                  className="input"
                  placeholder="e.g. 999000"
                  type="number"
                  value={newCourse.price}
                  onChange={(e) =>
                    setNewCourse((p) => ({
                      ...p,
                      price: e.target.value,
                    }))
                  }
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 8,
                }}
              >
                <button
                  className="btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => setCreating(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={handleCreate}
                  disabled={!newCourse.title}
                >
                  Create Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── ADMIN DASHBOARD ───────────────────────────────────────────────────────────
const AdminDashboard = ({ showToast }) => {
  const [tab, setTab] = useState("overview");
  const pending = MOCK_COURSES.filter((c) => !c.isApproved);

  return (
    <div
      style={{
        padding: "32px 24px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: 28 }}>
        <h1
          className="syne"
          style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}
        >
          Admin Control Center
        </h1>
        <p style={{ color: "#6B6B85" }}>
          Full platform oversight and management
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {["overview", "users", "courses", "approvals"].map((t) => (
          <div
            key={t}
            className={`tab ${tab === t ? "active" : ""}`}
            style={{
              background: "#16161F",
              border: "1px solid #1E1E2E",
              textTransform: "capitalize",
              position: "relative",
            }}
            onClick={() => setTab(t)}
          >
            {t}
            {t === "approvals" && pending.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  background: "#FF4D6D",
                  color: "white",
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {pending.length}
              </span>
            )}
          </div>
        ))}
      </div>

      {tab === "overview" && (
        <div className="fade-in">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            {[
              {
                label: "Total Users",
                value: MOCK_STATS.totalUsers.toLocaleString(),
                icon: "👥",
                color: "#6C63FF",
              },
              {
                label: "Total Courses",
                value: MOCK_STATS.totalCourses,
                icon: "📚",
                color: "#00C9A7",
              },
              {
                label: "Total Revenue",
                value: "₫987.6M",
                icon: "💹",
                color: "#F5A623",
              },
              {
                label: "Pending Review",
                value: MOCK_STATS.pendingCourses,
                icon: "⏳",
                color: "#FF4D6D",
              },
            ].map((s) => (
              <div key={s.label} className="stat-card">
                <div style={{ fontSize: 28, marginBottom: 8 }}>
                  {s.icon}
                </div>
                <div
                  className="syne"
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: s.color,
                  }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#6B6B85",
                    marginTop: 2,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Revenue chart (visual) */}
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3
              className="syne"
              style={{ fontWeight: 700, marginBottom: 20 }}
            >
              Monthly Revenue
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 8,
                height: 120,
              }}
            >
              {[
                45, 72, 58, 91, 67, 84, 95, 78, 110, 98, 125, 140,
              ].map((v, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: v * 0.85,
                      background:
                        "linear-gradient(180deg, #6C63FF, rgba(108,99,255,0.3))",
                      borderRadius: "4px 4px 0 0",
                      transition: "height 0.5s ease",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      color: "#6B6B85",
                    }}
                  >
                    {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O",
                    "N", "D"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div
          className="card fade-in"
          style={{ padding: 0, overflow: "hidden" }}
        >
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {/* Static sample users for illustration */}
              {[
                {
                  id: 1,
                  name: "Alex Nguyen",
                  email: "student@demo.com",
                  role: "student",
                  avatar: "AN",
                },
                {
                  id: 2,
                  name: "Sarah Chen",
                  email: "instructor@demo.com",
                  role: "instructor",
                  avatar: "SC",
                },
                {
                  id: 3,
                  name: "Admin Root",
                  email: "admin@demo.com",
                  role: "admin",
                  avatar: "AR",
                },
              ].map((u) => (
                <tr key={u.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Avatar initials={u.avatar} size={32} />
                      <span
                        style={{
                          fontWeight: 500,
                          fontSize: 14,
                        }}
                      >
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        u.role === "admin"
                          ? "badge-gold"
                          : u.role === "instructor"
                          ? "badge-purple"
                          : "badge-teal"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td
                    style={{ color: "#6B6B85", fontSize: 13 }}
                  >
                    {u.email}
                  </td>
                  <td
                    style={{ color: "#6B6B85", fontSize: 13 }}
                  >
                    Jan 2024
                  </td>
                  <td>
                    <span className="badge badge-teal">
                      Active
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-ghost"
                      style={{
                        padding: "5px 12px",
                        fontSize: 12,
                      }}
                      onClick={() =>
                        showToast("User managed!", "success")
                      }
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "courses" && (
        <div
          className="card fade-in"
          style={{ padding: 0, overflow: "hidden" }}
        >
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Instructor</th>
                <th>Students</th>
                <th>Revenue</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_COURSES.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <span style={{ fontSize: 20 }}>
                        {c.thumbnail}
                      </span>
                      <div>
                        <div
                          style={{
                            fontWeight: 500,
                            fontSize: 14,
                          }}
                        >
                          {c.title}
                        </div>
                        <div
                          style={{
                            color: "#6B6B85",
                            fontSize: 12,
                          }}
                        >
                          {c.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{ color: "#9998C0", fontSize: 14 }}
                  >
                    {c.instructor}
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {c.students.toLocaleString()}
                  </td>
                  <td style={{ color: "#00C9A7" }}>
                    {fmt(c.price * c.students * 0.3)}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        c.isApproved ? "badge-teal" : "badge-gold"
                      }`}
                    >
                      {c.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-ghost"
                      style={{
                        padding: "5px 12px",
                        fontSize: 12,
                      }}
                      onClick={() =>
                        showToast("Action performed!", "success")
                      }
                    >
                      {c.isApproved ? "Suspend" : "Approve"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "approvals" && (
        <div className="fade-in">
          <h3
            className="syne"
            style={{ fontWeight: 700, marginBottom: 16 }}
          >
            Courses Awaiting Approval
          </h3>
          {pending.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 60,
                color: "#6B6B85",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <p>All caught up! No pending courses.</p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {pending.map((c) => (
                <div
                  key={c.id}
                  className="card"
                  style={{
                    padding: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <span style={{ fontSize: 40 }}>{c.thumbnail}</span>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{ fontWeight: 600, marginBottom: 4 }}
                    >
                      {c.title}
                    </h3>
                    <p
                      style={{
                        color: "#6B6B85",
                        fontSize: 13,
                      }}
                    >
                      By {c.instructor} · {c.category} ·{" "}
                      {fmt(c.price)}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn-ghost"
                      style={{
                        padding: "8px 16px",
                        fontSize: 13,
                        borderColor: "#FF4D6D",
                        color: "#FF4D6D",
                      }}
                      onClick={() =>
                        showToast("Course rejected.", "error")
                      }
                    >
                      Reject
                    </button>
                    <button
                      className="btn-primary"
                      style={{ padding: "8px 16px", fontSize: 13 }}
                      onClick={() =>
                        showToast(
                          "Course approved! Now live. ✅",
                          "success",
                        )
                      }
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── AUTH USER MAPPING ─────────────────────────────────────────────────────────
const mapAuthUserToLearnXUser = (authUser) => {
  if (!authUser) return null;

  const mappedRole =
    authUser.role === "admin"
      ? "admin"
      : authUser.role === "seller"
      ? "instructor"
      : "student";

  const initials =
    authUser.username?.slice(0, 2).toUpperCase() || "U";

  return {
    id: authUser.id,
    name: authUser.username || "User",
    email: authUser.email || `${authUser.username}@example.com`,
    role: mappedRole,
    avatar: initials,
    enrolled: [1, 2],
    courses: [1, 3],
  };
};

// ─── MAIN PAGE WRAPPER ─────────────────────────────────────────────────────────
const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  const [page, setPage] = useState("home");
  const [toast, setToast] = useState(null);

  const user = mapAuthUserToLearnXUser(auth.user);

  useEffect(() => {
    if (!user) {
      setPage("home");
      return;
    }
    if (user.role === "student") setPage("student-dashboard");
    else if (user.role === "instructor")
      setPage("instructor-dashboard");
    else if (user.role === "admin") setPage("admin-dashboard");
  }, [user]);

  const showToast = (message, type = "info") =>
    setToast({ message, type });

  const handleLogin = () => {
    navigate("/signin");
  };

  const handleLogout = async () => {
    try {
      const token =
        auth.token || localStorage.getItem("accessToken");
      if (token) {
        await axios.post(
          `${API_BASE_URL}/api/logout`,
          null,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }
    } catch (error) {
      console.error("Logout error", error);
    } finally {
      dispatch(logoutAction());
      showToast("Đăng xuất thành công", "info");
      navigate("/signin");
    }
  };

  const courseMatch = page.match(/^course-(\d+)$/);
  const courseId = courseMatch ? parseInt(courseMatch[1], 10) : null;

  const renderContent = () => {
    if (courseId)
      return (
        <CourseDetailPage
          courseId={courseId}
          user={user}
          setPage={setPage}
          onLogin={handleLogin}
          showToast={showToast}
        />
      );

    switch (page) {
      case "home":
        return (
          <HomePage
            setPage={setPage}
            onLogin={handleLogin}
            user={user}
          />
        );
      case "courses":
        return <CoursesPage setPage={setPage} user={user} />;
      case "student-dashboard":
      case "my-courses":
      case "progress":
      case "certificates":
        return (
          user && (
            <StudentDashboard user={user} setPage={setPage} />
          )
        );
      case "instructor-dashboard":
      case "instructor-courses":
      case "create-course":
      case "instructor-students":
      case "revenue":
        return (
          user && (
            <InstructorDashboard
              user={user}
              setPage={setPage}
              showToast={showToast}
            />
          )
        );
      case "admin-dashboard":
      case "admin-users":
      case "admin-courses":
      case "admin-approvals":
      case "analytics":
        return <AdminDashboard showToast={showToast} />;
      default:
        return (
          <HomePage
            setPage={setPage}
            onLogin={handleLogin}
            user={user}
          />
        );
    }
  };

  const hasSidebar =
    !!user && !courseId && page !== "home" && page !== "courses";

  return (
    <>
      <GlobalStyles />
      <div style={{ minHeight: "100vh", background: theme.colors.bg }}>
        <Navbar
          page={page}
          setPage={setPage}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
        <div style={{ display: "flex" }}>
          {hasSidebar && (
            <Sidebar role={user.role} page={page} setPage={setPage} />
          )}
          <main style={{ flex: 1, minWidth: 0 }}>{renderContent()}</main>
        </div>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </>
  );
};

export default Home;

