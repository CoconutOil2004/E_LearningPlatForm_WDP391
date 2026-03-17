/**
 * AnonymousLayout
 * Layout for public pages: Header + main content + Footer
 * DOES NOT contain ToastContainer (mounted at App level)
 */
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import Footer from "../components/home/Footer/FooterElearning";
import Header from "../components/home/Header/HeaderElearning";

const AnonymousLayout = () => {
  const location = useLocation();
  const learnXPaths = [
    "/",
    "/signin",
    "/signup",
    "/forgot-password",
    "/verify-otp",
  ];
  const isLearnXPage = learnXPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen overscroll-none">
      {!isLearnXPage && <Header />}
      <main className="flex-grow min-h-[60vh]">
        <ScrollRestoration />
        <Outlet />
      </main>
      {!isLearnXPage && <Footer />}
    </div>
  );
};

export default AnonymousLayout;
