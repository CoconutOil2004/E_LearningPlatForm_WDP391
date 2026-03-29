import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CertificateStatusBadge from "../../../components/student/CertificateStatusBadge";
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

  console.log("Current certificates state:", certificates);
  console.log("Certificates length:", certificates.length);
  console.log("Loading:", loading);

  useEffect(() => {
    // Get all completed courses (approved, pending, rejected)
    PaymentService.getMyCourses()
      .then((data) => {
        console.log("=== MY COURSES DATA ===");
        console.log("Raw data:", data);
        console.log("Data length:", data?.length);
        console.log("First item:", data?.[0]);
        console.log("First item keys:", data?.[0] ? Object.keys(data[0]) : "no data");
        console.log("certificateStatus:", data?.[0]?.certificateStatus);
        
        // Show ALL completed courses (ignore certificateStatus for now)
        const completedCourses = (data || []).filter((e) => e.completed);
        
        console.log("=== FILTERED RESULTS ===");
        console.log("Completed courses:", completedCourses);
        console.log("Count:", completedCourses.length);
        
        setCertificates(completedCourses);
      })
      .catch((error) => {
        console.error("Certificate fetch error:", error);
        toast.error("Failed to load your certificates");
      })
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
              Complete your courses to earn certificates. Once completed, your certificate will be reviewed by an admin.
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
            {certificates.map((enrollment, i) => {
              const course = enrollment.course || enrollment.courseId;
              const status = enrollment.certificateStatus;
              
              console.log(`=== Certificate ${i} ===`);
              console.log("Enrollment:", enrollment);
              console.log("Course title:", course?.title);
              console.log("Certificate status:", status);
              console.log("Status type:", typeof status);
              console.log("Is approved?", status === "approved");
              console.log("Is pending?", status === "pending");
              console.log("Is rejected?", status === "rejected");
              
              const completedDate = new Date(
                enrollment.certificateApprovedAt || enrollment.updatedAt || Date.now(),
              ).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric"
              });

              const isApproved = status === "approved";
              const isPending = status === "pending";
              const isRejected = status === "rejected";

              return (
                <motion.div
                  key={enrollment._id || enrollment.enrollmentId || i}
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
                        <CertificateStatusBadge status={status} />
                      </div>
                      <h3 className="pr-12 mb-2 text-lg font-bold leading-snug text-gray-900 line-clamp-2">
                        {course?.title}
                      </h3>
                      <p className="mb-1 text-sm text-gray-500">
                        Instructor:{" "}
                        <span className="font-medium text-gray-700">
                          {course?.instructorId?.fullname ||
                            course?.instructor?.fullname ||
                            course?.instructorId?.email ||
                            "Lead Instructor"}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Icon name="calendar" size={14} /> 
                        {isApproved ? "Approved: " : isPending ? "Completed: " : "Rejected: "}
                        {completedDate}
                      </p>
                      
                      {/* Rejection reason */}
                      {isRejected && enrollment.certificateRejectionReason && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-lg">
                          <p className="text-xs text-red-600">
                            <span className="font-semibold">Reason: </span>
                            {enrollment.certificateRejectionReason}
                          </p>
                        </div>
                      )}
                      
                      {/* Pending message */}
                      {isPending && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-100 rounded-lg">
                          <p className="text-xs text-yellow-700">
                            Your certificate is awaiting admin approval
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 mt-auto border-t border-gray-50">
                      {isApproved ? (
                        <button
                          onClick={() => {
                            if (!course?._id) {
                              toast.error("Course ID not found");
                              return;
                            }
                            navigate(`/student/certificate/${course._id}`);
                          }}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]"
                        >
                          <Icon name="eye" size={18} />
                          View Certificate
                        </button>
                      ) : isPending ? (
                        <button
                          disabled
                          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-50 border-2 border-gray-200 text-gray-400 font-bold rounded-xl cursor-not-allowed"
                        >
                          <Icon name="clock" size={18} />
                          Pending Approval
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 border-2 border-red-200 text-red-400 font-bold rounded-xl cursor-not-allowed"
                        >
                          <Icon name="x-circle" size={18} />
                          Rejected
                        </button>
                      )}
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
