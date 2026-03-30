import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import PayoutService from "../../../services/api/PayoutService";
import { pageVariants } from "../../../utils/helpers";

const AllPayoutsPage = () => {
  const toast = useToast();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchPayouts();
  }, [filter]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const res = await PayoutService.getAllPayouts(params);
      if (res.success) {
        setPayouts(res.data || []);
      }
    } catch (error) {
      console.error("Fetch payouts error:", error);
      toast.error("Failed to load payouts");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      processing: "bg-blue-100 text-blue-700 border-blue-200",
      completed: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
      cancelled: "bg-gray-100 text-gray-700 border-gray-200",
    };

    return (
      <span
        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${styles[status] || ""}`}
      >
        {status}
      </span>
    );
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
            All <span className="gradient-text">Payouts</span>
          </h1>
          <p className="text-muted">View and manage all payout requests</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {["all", "pending", "processing", "completed", "rejected", "cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${
                  filter === status
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
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
              <Icon name="dollar-sign" size={40} />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-heading">
              No Payouts Found
            </h2>
            <p className="text-muted">No payouts match the selected filter.</p>
          </div>
        ) : (
          /* Payouts Table */
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Approved By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Transaction ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payouts.map((payout) => {
                    const instructor = payout.instructorId;
                    const requestDate = new Date(
                      payout.createdAt
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <tr
                        key={payout._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {instructor?.avatarURL ? (
                              <img
                                src={instructor.avatarURL}
                                alt={instructor.fullname}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                {(instructor?.fullname || instructor?.email || "?")[0].toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-heading">
                                {instructor?.fullname || instructor?.email}
                              </div>
                              <div className="text-sm text-muted">
                                {instructor?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-heading">
                            {formatCurrency(payout.requestedAmount)}
                          </div>
                          <div className="text-xs text-green-600">
                            Receive: {formatCurrency(payout.actualAmount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted capitalize">
                          {payout.paymentMethod.replace("_", " ")}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted">
                          {requestDate}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(payout.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted">
                          {payout.approvedBy?.fullname || "-"}
                          {payout.approvedAt && (
                            <div className="text-xs text-gray-400">
                              {new Date(payout.approvedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted">
                          {payout.transactionId || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AllPayoutsPage;
