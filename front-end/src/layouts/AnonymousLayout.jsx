/**
 * AnonymousLayout
 * Layout cho các trang public: Header + main content + Footer
 * KHÔNG chứa ToastContainer (đã mount ở App level)
 */
import React from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "../components/home/Header/Header";
import Footer from "../components/home/Footer/Footer";

const AnonymousLayout = () => {
  return (
    <div className="flex flex-col min-h-screen overscroll-none">
      <Header />
      <main className="flex-grow min-h-[60vh]">
        <ScrollRestoration />
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AnonymousLayout;
