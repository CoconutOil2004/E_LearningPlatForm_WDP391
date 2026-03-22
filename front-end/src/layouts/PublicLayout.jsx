import { Outlet, ScrollRestoration } from "react-router-dom";
import Footer from "../components/home/Footer/FooterElearning";
import Header from "../components/home/Header/HeaderElearning";

const PublicLayout = ({ hideHeaderFooter = false }) => {
  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "var(--bg-page)", fontFamily: "var(--font-body)" }}
    >
      <ScrollRestoration />
      {!hideHeaderFooter && <Header />}
      <main className="flex-grow min-h-[60vh]">
        <Outlet />
      </main>
      {<Footer />}
    </div>
  );
};

export default PublicLayout;
