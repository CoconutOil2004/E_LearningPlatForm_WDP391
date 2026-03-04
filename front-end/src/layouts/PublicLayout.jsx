import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import Header from "../components/home/Header/HeaderElearning";
import Footer from "../components/home/Footer/FooterElearning";
import { ROUTES } from "../utils/constants";

const NO_FOOTER_PATHS = [
  ROUTES.STUDENT_DASHBOARD,
  ROUTES.MY_COURSES,
  ROUTES.WISHLIST,
  ROUTES.PROGRESS,
  ROUTES.STUDENT_PROFILE,
  ROUTES.STUDENT_SETTINGS,
];

const PublicLayout = ({ hideHeaderFooter = false }) => {
  const location = useLocation();
  const hideFooter = NO_FOOTER_PATHS.some((p) => location.pathname.startsWith(p));

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--bg-page)", fontFamily: "var(--font-body)" }}>
      <ScrollRestoration />
      {!hideHeaderFooter && <Header />}
      <main className="flex-grow min-h-[60vh]">
        <Outlet />
      </main>
      {!hideHeaderFooter && !hideFooter && <Footer />}
    </div>
  );
};

export default PublicLayout;
