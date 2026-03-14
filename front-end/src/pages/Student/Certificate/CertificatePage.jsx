import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import PaymentService from "../../../services/api/PaymentService";
import useAuthStore from "../../../store/slices/authStore";
import { ROUTES } from "../../../utils/constants";
import { pageVariants } from "../../../utils/helpers";

const CertificatePage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuthStore();
  const printRef = useRef(null);

  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    PaymentService.getMyCourses()
      .then((data) => {
        const found = data?.find((e) => e.course?._id === courseId);
        if (!found) {
          toast.error("Course not found or not enrolled.");
          navigate(ROUTES.MY_COURSES);
          return;
        }
        if (found.progress !== 100 && !found.completed) {
          toast.warning("You must complete this course to view the certificate.");
          navigate(ROUTES.MY_COURSES);
          return;
        }
        setEnrollment(found);
      })
      .catch(() => {
        toast.error("Failed to load certificate data");
        navigate(ROUTES.MY_COURSES);
      })
      .finally(() => setLoading(false));
  }, [courseId, navigate, toast]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 rounded-full border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!enrollment) return null;

  const { course } = enrollment;
  const instructorName =
    course?.instructor?.fullname ||
    course?.instructorId?.fullname ||
    "Lead Instructor";
  const completedDate = new Date(enrollment.lastUpdated || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen py-12 bg-gray-50 print:bg-white print:py-0 print:min-h-0"
    >
      <div className="max-w-5xl px-6 mx-auto">

        {/* Actions Bar (Hidden on print) */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <button
            onClick={() => navigate(ROUTES.MY_CERTIFICATES)}
            className="flex items-center gap-2 px-4 py-2 font-medium transition-colors bg-white border border-gray-200 text-muted hover:text-heading hover:bg-gray-50 rounded-xl"
          >
            <Icon name="arrow-left" size={16} />
            Back to Certificates
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 font-bold text-white transition-all shadow-lg rounded-xl"
            style={{ background: "var(--gradient-brand)", boxShadow: "var(--shadow-lg)" }}
          >
            <Icon name="download" size={18} />
            Download PDF
          </button>
        </div>

        {/* Certificate Container */}
        <div className="flex justify-center print:block print:m-0">
          <div
            ref={printRef}
            className="relative w-[900px] h-[636px] bg-white shadow-2xl overflow-hidden print:w-[100%] print:h-auto print:shadow-none print:break-inside-avoid print:bg-white"
            style={{ WebkitPrintColorAdjust: "exact", colorAdjust: "exact" }}
          >
            {/* Background Decorations */}
            <div className="absolute inset-0 border-[20px] border-double border-gray-100" />
            <div className="absolute inset-[24px] border border-primary/20" />

            <div className="absolute top-0 left-0 w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl opacity-60" />
            <div className="absolute bottom-0 right-0 w-96 h-96 translate-x-1/3 translate-y-1/3 rounded-full bg-secondary/10 blur-3xl opacity-60" />

            {/* Corner Patterns */}
            <svg className="absolute top-8 left-8 w-16 h-16 text-primary/20" viewBox="0 0 100 100" fill="currentColor">
              <path d="M0 0 L50 0 L0 50 Z M100 0 L50 0 L100 50 Z M0 100 L0 50 L50 100 Z" />
            </svg>
            <svg className="absolute bottom-8 right-8 w-16 h-16 text-primary/20 rotate-180" viewBox="0 0 100 100" fill="currentColor">
              <path d="M0 0 L50 0 L0 50 Z M100 0 L50 0 L100 50 Z M0 100 L0 50 L50 100 Z" />
            </svg>

            {/* Content Area */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full px-20 text-center">

              <div className="mb-6">
                <div 
                  className="flex items-center justify-center w-16 h-16 mx-auto mb-2 rounded-xl text-white"
                  style={{ background: "var(--gradient-brand)", boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.3)" }}
                >
                  <Icon name="award" size={32} />
                </div>
                <h2 className="text-[14px] font-bold tracking-[0.2em] text-primary uppercase">EduFlow Platform</h2>
              </div>

              <h1 className="mb-2 font-serif text-[56px] font-bold text-gray-900 leading-none tracking-tight">
                Certificate of Completion
              </h1>

              <p className="mb-8 text-lg italic text-gray-500">
                This certifies that
              </p>

              <h3 className="mb-6 font-serif text-[42px] font-medium text-primary border-b border-gray-200 px-12 pb-2 inline-block">
                {user?.fullname || "Student Name"}
              </h3>

              <p className="max-w-2xl mb-8 text-lg font-medium leading-relaxed text-gray-600">
                has successfully passed all requirements and is awarded this certificate for the comprehensive completion of the course:
              </p>

              <h4 className="max-w-3xl mb-12 text-3xl font-black leading-snug tracking-tight text-gray-900">
                "{course?.title}"
              </h4>

              {/* Signatures Row */}
              <div className="flex items-end justify-between w-full px-12 mt-auto mb-16">
                <div className="text-center w-48">
                  <div className="text-xl font-medium text-gray-800 border-b border-gray-300 pb-2 mb-2">
                    {completedDate}
                  </div>
                  <p className="text-[13px] font-bold tracking-wider text-gray-400 uppercase">Date Earned</p>
                </div>

                <div className="flex flex-col items-center w-32">
                  <div className="flex items-center justify-center w-20 h-20 border-[3px] border-primary rounded-full bg-white relative">
                    <div className="absolute inset-2 border border-dashed border-primary/50 rounded-full" />
                    <Icon name="check-circle" size={32} color="var(--color-primary)" />
                  </div>
                </div>

                <div className="text-center w-48">
                  <div className="text-[22px] font-serif italic text-gray-800 border-b border-gray-300 pb-2 mb-2">
                    {instructorName}
                  </div>
                  <p className="text-[13px] font-bold tracking-wider text-gray-400 uppercase">Course Instructor</p>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default CertificatePage;
