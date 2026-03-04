import { Link } from "react-router-dom";
import { Icon } from "../../ui";
import { ROUTES } from "../../../utils/constants";

const LINKS = [
  {
    title: "Learn",
    items: [
      { label: "Browse Courses", to: ROUTES.COURSES },
      { label: "Categories", to: ROUTES.COURSES },
      { label: "About", to: ROUTES.ABOUT },
    ],
  },
  {
    title: "Teach",
    items: [
      { label: "Become Instructor", to: ROUTES.REGISTER },
      { label: "Teaching Center", to: ROUTES.HOME },
    ],
  },
  {
    title: "Company",
    items: [
      { label: "About Us", to: ROUTES.ABOUT },
      { label: "Contact", to: ROUTES.CONTACT },
      { label: "Privacy Policy", to: ROUTES.HOME },
    ],
  },
];

const Footer = () => (
  <footer className="bg-[var(--text-heading)] text-white mt-20">
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Icon name="book" size={18} color="white" />
            </div>
            <span className="font-black text-xl text-white">EduFlow</span>
          </div>
          <p className="text-disabled text-sm leading-relaxed">
            The world's leading online learning platform. Learn from the best instructors worldwide.
          </p>
        </div>

        {/* Link columns */}
        {LINKS.map((col) => (
          <div key={col.title}>
            <h4 className="font-bold text-white mb-4">{col.title}</h4>
            {col.items.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="block text-sm text-disabled hover:text-white mb-2 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="border-t border-border/20 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-muted text-sm">© {new Date().getFullYear()} EduFlow. All rights reserved.</p>
        <div className="flex gap-4 text-muted text-sm">
          <Link to={ROUTES.HOME} className="hover:text-white transition-colors">Terms</Link>
          <Link to={ROUTES.HOME} className="hover:text-white transition-colors">Privacy</Link>
          <Link to={ROUTES.HOME} className="hover:text-white transition-colors">Cookies</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
