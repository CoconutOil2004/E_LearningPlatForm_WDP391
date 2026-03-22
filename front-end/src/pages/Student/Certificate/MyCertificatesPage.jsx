import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import PaymentService from "../../../services/api/PaymentService";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

const MyCertificatesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PaymentService.getMyCourses()
      .then((data) => {
        // Filter only courses that are 100% completed
        const completedCourses = (data || []).filter(
          (e) => e.progress === 100 || e.completed,
        );
        setCertificates(completedCourses);
      })
      .catch(() => toast.error("Failed to load your certificates"))
      .finally(() => setLoading(false));
  }, [toast]);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-gray-50/50"
    >
      <div className="max-w-6xl px-6 py-10 mx-auto">
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-6 mb-10 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h1 className="mb-4 text-5xl font-black leading-none tracking-tighter md:text-6xl text-heading">
              My <span className="gradient-text">Certificates</span>
            </h1>
            <p className="text-muted">
              {certificates.length > 0
                ? `You have earned ${certificates.length} certificate${certificates.length > 1 ? "s" : ""}!`
                : "Complete courses to earn your certificates."}
            </p>
          </motion.div>
        </div>
        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="p-6 bg-white border border-gray-100 shadow-sm rounded-3xl animate-pulse"
              >
                <div className="w-16 h-16 mb-4 bg-gray-200 rounded-full" />
                <div className="w-3/4 h-5 mb-3 bg-gray-200 rounded-full" />
                <div className="w-1/2 h-4 mb-6 bg-gray-200 rounded-full" />
                <div className="w-full h-10 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : certificates.length === 0 ? (
          /* Empty State */
          <div className="py-24 text-center bg-white border border-gray-200 border-dashed rounded-3xl">
            <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 text-primary">
              <Icon name="award" size={48} />
            </div>
            <h2 className="mb-3 text-2xl font-black text-heading">
              No Certificates Yet
            </h2>
            <p className="max-w-sm mx-auto mb-8 text-muted">
              You haven't completed any courses yet. Finish your training
              programs to unlock and download your certificates.
            </p>
            <button
              onClick={() => navigate(ROUTES.MY_COURSES)}
              className="px-8 py-3 text-sm font-bold text-white transition-all shadow-lg bg-primary hover:bg-primary-dark rounded-xl shadow-primary/30"
            >
              Go to My Learning
            </button>
          </div>
        ) : (
          /* Certificates Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((item, i) => {
              const { course } = item;
              const completedDate = new Date(
                item.lastUpdated || Date.now(),
              ).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              });

              return (
                <motion.div
                  key={item.enrollmentId || i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="group relative bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 transition-transform rounded-bl-full bg-primary/5 -z-10 group-hover:scale-110" />
                  <div className="absolute transition-colors top-6 right-6 text-primary/10 group-hover:text-primary/20">
                    <Icon name="award" size={48} />
                  </div>

                  <div className="flex flex-col h-full">
                    {/* Course Info */}
                    <div className="z-10 mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                          Completed
                        </span>
                      </div>
                      <h3 className="pr-12 mb-2 text-lg font-bold leading-snug text-gray-900 line-clamp-2">
                        {course?.title}
                      </h3>
                      <p className="mb-1 text-sm text-gray-500">
                        Instructor:{" "}
                        <span className="font-medium text-gray-700">
                          {course?.instructor?.fullname ||
                            course?.instructor?.email ||
                            "Lead Instructor"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Icon name="calendar" size={14} /> Issued:{" "}
                        {completedDate}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 mt-auto border-t border-gray-50">
                      <button
                        onClick={() =>
                          navigate(`/student/certificate/${course._id}`)
                        }
                        className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
                      >
                        <Icon name="eye" size={18} />
                        View Certificate
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MyCertificatesPage;
