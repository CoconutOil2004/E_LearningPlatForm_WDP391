import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import InstructorEarningService from "../../../services/api/InstructorEarningService";
import { pageVariants } from "../../../utils/helpers";

const EarningsDashboard = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, earningsRes] = await Promise.all([
        InstructorEarningService.getEarningSummary(),
        InstructorEarningService.getMyEarnings({
          status: filter === "all" ? undefined : filter,
          limit: 10,
        }),
      ]);

      if (summaryRes.success) {
        setSummary(summaryRes.data);
      }

      if (earningsRes.success) {
        setEarnings(earningsRes.data || []);
      }
    } catch (error) {
      console.error("Fetch earnings error:", error);
      toast.error("Failed to load earnings data");
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
      available: "bg-green-100 text-green-700 border-green-200",
      paid: "bg-blue-100 text-blue-700 border-blue-200",
    };

    const labels = {
      pending: "Pending",
      available: "Available",
      paid: "Paid",
    };

    return (
      <span
        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${styles[status] || ""}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 rounded-full border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

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
            My <span className="gradient-text">Earnings</span>
          </h1>
          <p className="text-muted">Track your income and request payouts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Icon name="dollar-sign" size={24} className="text-blue-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted mb-1">
              Total Earned
            </h3>
            <p className="text-2xl font-black text-heading">
              {formatCurrency(summary?.totalEarned || 0)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Icon name="check-circle" size={24} className="text-green-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted mb-1">
              Available Balance
            </h3>
            <p className="text-2xl font-black text-green-600">
              {formatCurrency(summary?.availableBalance || 0)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Icon name="clock" size={24} className="text-yellow-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted mb-1">
              Pending Balance
            </h3>
            <p className="text-2xl font-black text-yellow-600">
              {formatCurrency(summary?.pendingBalance || 0)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Icon name="trending-up" size={24} className="text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted mb-1">Paid Out</h3>
            <p className="text-2xl font-black text-purple-600">
              {formatCurrency(summary?.paidOut || 0)}
            </p>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => navigate("/instructor/earnings/payout")}
            disabled={(summary?.availableBalance || 0) < 500000}
            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Icon name="download" size={20} />
            Request Payout
          </button>
          <button
            onClick={() => navigate("/instructor/earnings/by-course")}
            className="px-6 py-3 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 flex items-center gap-2"
          >
            <Icon name="bar-chart-2" size={20} />
            View by Course
          </button>
          <button
            onClick={() => navigate("/instructor/earnings/settings")}
            className="px-6 py-3 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 flex items-center gap-2"
          >
            <Icon name="settings" size={20} />
            Payment Settings
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {["all", "available", "pending", "paid"].map((status) => (
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
          ))}
        </div>

        {/* Recent Earnings */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-heading">Recent Earnings</h2>
          </div>

          {earnings.length === 0 ? (
            <div className="py-20 text-center">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 text-gray-400">
                <Icon name="dollar-sign" size={40} />
              </div>
              <h3 className="text-xl font-bold text-heading mb-2">
                No Earnings Yet
              </h3>
              <p className="text-muted">
                Start selling courses to earn money!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                      Course
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">
                      Available Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {earnings.map((earning) => (
                    <tr
                      key={earning._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-muted">
                        {new Date(earning.earnedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-heading max-w-xs truncate">
                          {earning.courseId?.title || "Unknown Course"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {earning.studentId?.fullname || earning.studentId?.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-green-600">
                          {formatCurrency(earning.instructorAmount)}
                        </div>
                        <div className="text-xs text-muted">
                          from {formatCurrency(earning.coursePrice)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(earning.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {earning.status === "pending"
                          ? new Date(earning.availableAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {earnings.length > 0 && (
            <div className="p-6 border-t border-gray-200 text-center">
              <button
                onClick={() => navigate("/instructor/earnings/all")}
                className="text-primary font-bold hover:underline"
              >
                View All Earnings →
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EarningsDashboard;
