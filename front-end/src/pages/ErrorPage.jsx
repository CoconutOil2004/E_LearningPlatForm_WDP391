import { Link, useRouteError } from "react-router-dom";
import { motion } from "framer-motion";
import { Btn } from "../components/ui";
import { ROUTES } from "../utils/constants";

const ErrorPage = () => {
  const error = useRouteError();
  const status = error?.status || 404;
  const message = error?.statusText || error?.message || "Page not found";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br bg-gradient-hero px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="text-8xl font-black text-primary/20 mb-2">{status}</div>
        <h1 className="text-2xl font-black text-heading mb-3">Oops! Something went wrong</h1>
        <p className="text-muted mb-8">{message}</p>
        <Link to={ROUTES.HOME}>
          <Btn size="lg">Go Home</Btn>
        </Link>
      </motion.div>
    </div>
  );
};

export default ErrorPage;
