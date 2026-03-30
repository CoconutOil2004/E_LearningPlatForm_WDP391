import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import PayoutService from "../../../services/api/PayoutService";
import { pageVariants } from "../../../utils/helpers";

const PendingPayoutsPage = () => {
  const toast = useToast();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    fetchPendingPayouts();
  }, []);

  const fetchPendingPayouts = async () => {
    setLoading(true);
    try {
      const res = await PayoutService.getPendingPayouts();
      if (res.success) {
        setPayouts(res.data || []);
      }
    } catch (error) {
      console.error("Fetch pending payouts error:", error);
      toast.error("Failed to load pending payouts");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (payoutId) => {
    if (!transactionId.trim()) {
      toast.error("Please enter transaction ID");
      return;
    }

    setActionLoading(payoutId);
    try {
      const res = await PayoutService.approvePayout(payoutId, {
        transactionId: transactionId.trim(),
      });

      if (res.success) {
        setModalOpen(false);
        setSelectedPayout(null);
        setTransactionId("");
        fetchPendingPayouts();
      }
    } catch (error) {
      console.error("Approve payout error:", error);
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
      const res = await PayoutService.rejectPayout(rejectModal, {
        reason: rejectReason.trim(),
      });

      if (res.success) {
        setRejectModal(null);
        setRejectReason("");
        fetchPendingPayouts();
      }
    } catch (error) {
      console.error("Reject payout error:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
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
            Pending <span className="gradient-text">Payouts</span>
          </h1>
          <p className="text-muted">Review and approve instructor payout requests</p>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 rounded-full border-primary/30 border-t-primary animate-spin" />
          </div>
        ) : payouts.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center bg-white border border-gray-200 border-dashed rounded-3xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 text-primary">
              <Icon name="check-circle" size={40} />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-heading">
              No Pending Payouts
            </h2>
            <p className="text-muted">All payout requests have been reviewed.</p>
          </div>
        ) : (
          /* Payouts List */
          <div className="space-y-4">
            {payouts.map((payout, i) => {
              const instructor = payout.instructorId;
              const requestDate = new Date(payout.createdAt).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              );

              return (
                <motion.div
                  key={payout._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-6">
                    {/* Left: Instructor Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {instructor?.avatarURL ? (
                          <img
                            src={instructor.avatarURL}
                            alt={instructor.fullname}
                            className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {(instructor?.fullname || instructor?.email || "?")[0].toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-bold text-heading">
                            {instructor?.fullname || instructor?.email || "Unknown"}
                          </h3>
                          <p className="text-sm text-muted">{instructor?.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pl-15">
                        <div>
                          <p className="text-xs text-muted mb-1">Requested Amount</p>
                          <p className="text-lg font-bold text-heading">
                            {formatCurrency(payout.requestedAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted mb-1">Instructor Receives</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(payout.actualAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted mb-1">Payment Method</p>
                          <p className="text-sm font-medium text-heading capitalize">
                            {payout.paymentMethod.replace("_", " ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted mb-1">Request Date</p>
                          <p className="text-sm font-medium text-heading">
                            {requestDate}
                          </p>
                        </div>
                      </div>

                      {payout.notes && (
                        <div className="mt-3 pl-15">
                          <p className="text-xs text-muted mb-1">Notes</p>
                          <p className="text-sm text-heading">{payout.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPayout(payout);
                          setModalOpen(true);
                        }}
                        disabled={actionLoading === payout._id}
                        className="px-4 py-2 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {actionLoading === payout._id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Icon name="check" size={16} />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => setRejectModal(payout._id)}
                        disabled={actionLoading === payout._id}
                        className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Icon name="x" size={16} />
                        Reject
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPayout(payout);
                          setModalOpen(true);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <Icon name="eye" size={16} />
                        Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {modalOpen && selectedPayout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-heading">Payout Details</h3>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setSelectedPayout(null);
                  setTransactionId("");
                }}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            {/* Instructor Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-heading mb-3">Instructor Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Name</span>
                  <span className="font-medium">
                    {selectedPayout.instructorId?.fullname}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Email</span>
                  <span className="font-medium">
                    {selectedPayout.instructorId?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-heading mb-3">Payment Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Method</span>
                  <span className="font-medium capitalize">
                    {selectedPayout.paymentMethod.replace("_", " ")}
                  </span>
                </div>
                {selectedPayout.paymentMethod === "bank_transfer" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted">Bank</span>
                      <span className="font-medium">
                        {selectedPayout.paymentDetails?.bankName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Account Number</span>
                      <span className="font-medium">
                        {selectedPayout.paymentDetails?.accountNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Account Name</span>
                      <span className="font-medium">
                        {selectedPayout.paymentDetails?.accountName}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Amount Breakdown */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-heading mb-3">Amount Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Requested Amount</span>
                  <span className="font-bold">
                    {formatCurrency(selectedPayout.requestedAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Transaction Fee (2%)</span>
                  <span className="font-bold text-red-600">
                    - {formatCurrency(selectedPayout.transactionFee)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-heading">
                      Instructor Receives
                    </span>
                    <span className="text-xl font-black text-green-600">
                      {formatCurrency(selectedPayout.actualAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction ID Input */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-heading mb-2">
                Transaction ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter bank transaction ID or reference number"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setSelectedPayout(null);
                  setTransactionId("");
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(selectedPayout._id)}
                disabled={actionLoading === selectedPayout._id || !transactionId.trim()}
                className="flex-1 px-4 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === selectedPayout._id
                  ? "Approving..."
                  : "Approve Payout"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-heading mb-4">Reject Payout</h3>
            <p className="text-muted mb-4">
              Please provide a reason for rejecting this payout request:
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

export default PendingPayoutsPage;
