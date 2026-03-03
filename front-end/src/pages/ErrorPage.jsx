// src/pages/ErrorPage.jsx
import { motion } from "framer-motion";
import { Link, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-cream font-['Noto_Serif']">
      <div className="flex flex-col grow">
        {/* Main Content */}
        <main className="flex items-center justify-center flex-1 px-4 py-10">
          <div className="flex flex-col max-w-[960px] w-full items-center">
            {/* 404 Visual with Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative w-full max-w-[500px] aspect-[4/3] rounded-xl overflow-hidden shadow-sm bg-gradient-to-br from-[#228B22]/5 to-transparent flex items-center justify-center mb-8"
              style={{
                backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuB3tG-5mYWfMbsUu7F4_x7YHxZNiAGGYMp1DRNKtXmvglLCjOAk263BzsOfjDv22Iuwp_Wn3OK0hwJn-iB-VIfRgkd5qdPtVJ9ZZ_WuauKsNLZP5Nb_jgQnlGgu5KWyj_lQln7mG6qtGl1YDbFZoHZqHg80TVtPhdzjCKUO9XznrYcLhQsnHnBR7SWs0adjNEHkYkMva4J7qwbK69p4Sq5P-9vJLMJpSEHGpKXNbPGOkThKh0wDMEzcoKzllw04XxMWz9eYu0Y-9u-G")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]"></div>
              <span className="relative text-[120px] font-light opacity-10 select-none">
                404
              </span>
            </motion.div>

            {/* Error Message Section */}
            <div className="flex flex-col items-center gap-4 text-center">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col gap-2"
              >
                <h2 className="text-3xl font-bold leading-tight tracking-tight text-[#0d1b11] md:text-4xl">
                  Page Not Found
                </h2>
                <p className="text-[#4c9a5f] text-sm font-normal uppercase tracking-[0.2em] font-sans">
                  The path is hidden in mist
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-[#0d1b11]/70 text-base md:text-lg leading-relaxed max-w-[540px] px-4 font-sans"
              >
                We're sorry, but the page you are looking for doesn't exist or
                has been moved. Take a moment to breathe and let us guide you
                back to safety.
              </motion.p>
            </div>

            {/* Actions */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col justify-center w-full gap-4 px-4 mt-8 sm:flex-row"
            >
              <Link
                to="/"
                className="flex min-w-[180px] items-center justify-center rounded-lg h-12 px-6 bg-[#228B22] text-white text-sm font-bold uppercase tracking-widest hover:shadow-lg hover:shadow-[#228B22]/20 transition-all"
              >
                Return to Home
              </Link>
              <button
                onClick={() => window.history.back()}
                className="flex min-w-[180px] items-center justify-center rounded-lg h-12 px-6 border border-[#228B22]/30 bg-transparent text-[#0d1b11] text-sm font-bold uppercase tracking-widest hover:bg-[#228B22]/5 transition-all"
              >
                Previous Page
              </button>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ErrorPage;
