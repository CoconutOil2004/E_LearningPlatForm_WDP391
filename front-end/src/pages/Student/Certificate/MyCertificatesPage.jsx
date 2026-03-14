import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import PaymentService from "../../../services/api/PaymentService";
import { ROUTES } from "../../../utils/constants";
import { formatDurationClock, pageVariants } from "../../../utils/helpers";

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
          (e) => e.progress === 100 || e.completed
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
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl shadow-lg shadow-primary/20 text-white" style={{ background: "var(--gradient-brand)" }}>
               <Icon name="award" size={24} />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-heading">
              My Certificates
            </h1>
          </div>
          <p className="text-muted ml-15 pl-1">
            {certificates.length > 0
              ? `You have earned ${certificates.length} certificate${certificates.length > 1 ? "s" : ""}!`
              : "Complete courses to earn your certificates."}
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
             {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse">
                   <div className="w-16 h-16 bg-gray-200 rounded-full mb-4" />
                   <div className="w-3/4 h-5 bg-gray-200 rounded-full mb-3" />
                   <div className="w-1/2 h-4 bg-gray-200 rounded-full mb-6" />
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
            <p className="mb-8 text-muted max-w-sm mx-auto">
              You haven't completed any courses yet. Finish your training programs to unlock and download your certificates.
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
                const completedDate = new Date(item.lastUpdated || Date.now()).toLocaleDateString('en-US', {
                   month: 'long',
                   day: 'numeric',
                   year: 'numeric'
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
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                     <div className="absolute top-6 right-6 text-primary/10 group-hover:text-primary/20 transition-colors">
                        <Icon name="award" size={48} />
                     </div>

                     <div className="flex flex-col h-full">
                        {/* Course Info */}
                        <div className="mb-6 z-10">
                           <div className="flex items-center gap-2 mb-3">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                                 Completed
                              </span>
                           </div>
                           <h3 className="text-lg font-bold leading-snug text-gray-900 mb-2 line-clamp-2 pr-12">
                              {course?.title}
                           </h3>
                           <p className="text-sm text-gray-500 mb-1">
                              Instructor: <span className="font-medium text-gray-700">{course?.instructor?.fullname || course?.instructor?.email || "Lead Instructor"}</span>
                           </p>
                           <p className="text-xs text-gray-400 flex items-center gap-1.5">
                              <Icon name="calendar" size={14} /> Issued: {completedDate}
                           </p>
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-4 border-t border-gray-50">
                           <button
                              onClick={() => navigate(`/student/certificate/${course._id}`)}
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
