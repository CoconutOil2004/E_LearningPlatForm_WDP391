import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import CertificateService from "../../../services/api/CertificateService";
import { pageVariants } from "../../../utils/helpers";

const PendingCertificatesPage = () => {
  const toast = useToast();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchPendingCertificates = async () => {
    setLoading(true);
    try {
      const res = await CertificateService.getPendingCertificates();
      if (res.success) {
        setCertificates(res.data || []);
      }
    } catch (error) {
      toast.error("Failed to load pending certificates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCertificates();
  }, []);

  const handleApprove = async (enrollmentId) => {
    if (!window.confirm("Are you sure you want to approve this certificate?")) {
      return;
    }

    setActionLoading(enrollmentId);
    try {
      const res = await CertificateService.approveCertificate(enrollmentId);
      if (res.success) {
        fetchPendingCertificates();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve certificate");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    setActionLoading(rejectModal);
    try {
      const res = await CertificateService.rejectCertificate(rejectModal, rejectReason);
      if (res.success) {
        setRejectModal(null);
        setRejectReason("");
        fetchPendingCertificates();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject certificate");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen p-6 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-heading mb-2">
            Pending <span className="gradient-text">Certificates</span>
          </h1>
          <p className="text-muted">
            Review and approve student certificates
          </p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 rounded-full border-primary/30 border-t-primary animate-spin" />
          </div>
        ) : certificates.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center bg-white border border-gray-200 border-dashed rounded-3xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 text-primary">
              <Icon name="award" size={40} />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-heading">
              No Pending Certificates
            </h2>
            <p className="text-muted">
              All certificates have been reviewed.
            </p>
          </div>
        ) : (
          /* Certificates List */
          <div className="space-y-4">
            {certificates.map((item, i) => {
              const student = item.userId;
              const course = item.courseId;
              const completedDate = new Date(item.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              });

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-6">
                    {/* Left: Student & Course Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {student?.avatarURL ? (
                          <img
                            src={student.avatarURL}
                            alt={student.fullname}
                            className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {(student?.fullname || student?.username || "?")[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-heading">
                            {student?.fullname || student?.username || "Unknown Student"}
                          </h3>
                          <p className="text-sm text-muted">{student?.email}</p>
                        </div>
                      </div>

                      <div className="pl-15">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name="book-open" size={16} className="text-primary" />
                          <h4 className="font-bold text-heading">
                            {course?.title || "Unknown Course"}
                          </h4>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted">
                          <span className="flex items-center gap-1">
                            <Icon name="user" size={14} />
                            {course?.instructorId?.fullname || "Unknown Instructor"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="calendar" size={14} />
                            Completed: {completedDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="check-circle" size={14} className="text-green-500" />
                            Progress: {item.progress}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(item._id)}
                        disabled={actionLoading === item._id}
                        className="px-4 py-2 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {actionLoading === item._id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Icon name="check" size={16} />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectModal(item._id)}
                        disabled={actionLoading === item._id}
                        className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Icon name="x" size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-heading mb-4">
              Reject Certificate
            </h3>
            <p className="text-muted mb-4">
              Please provide a reason for rejecting this certificate:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={4}
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal}
                className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === rejectModal ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default PendingCertificatesPage;
