import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import PayoutService from "../../../services/api/PayoutService";
import { pageVariants } from "../../../utils/helpers";

const PayoutStatisticsPage = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const res = await PayoutService.getPayoutStatistics();
      if (res.success) {
        setStatistics(res.data);
      }
    } catch (error) {
      console.error("Fetch statistics error:", error);
      toast.error("Failed to load statistics");
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
            Payout <span className="gradient-text">Statistics</span>
          </h1>
          <p className="text-muted">Overview of all payout requests and transactions</p>
        </div>

        {/* Overall Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Icon name="file-text" size={24} className="text-blue-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted mb-1">
              Total Requests
            </h3>
            <p className="text-2xl font-black text-heading">
              {statistics?.overall?.totalRequests || 0}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Icon name="dollar-sign" size={24} className="text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted mb-1">
              Total Amount Requested
            </h3>
            <p className="text-2xl font-black text-heading">
              {formatCurrency(statistics?.overall?.totalAmount || 0)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Icon name="check-circle" size={24} className="text-green-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted mb-1">
              Total Paid Out
            </h3>
            <p className="text-2xl font-black text-green-600">
              {formatCurrency(statistics?.overall?.totalPaidOut || 0)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Icon name="trending-up" size={24} className="text-orange-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted mb-1">
              Total Fees Collected
            </h3>
            <p className="text-2xl font-black text-orange-600">
              {formatCurrency(statistics?.overall?.totalFees || 0)}
            </p>
          </motion.div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pending */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-yellow-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Icon name="clock" size={20} className="text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-heading">Pending</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted">Count</span>
                <span className="font-bold text-heading">
                  {statistics?.pending?.count || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Total Amount</span>
                <span className="font-bold text-yellow-600">
                  {formatCurrency(statistics?.pending?.totalAmount || 0)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Processing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl p-6 border border-blue-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Icon name="loader" size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-heading">Processing</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted">Count</span>
                <span className="font-bold text-heading">
                  {statistics?.processing?.count || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Total Amount</span>
                <span className="font-bold text-blue-600">
                  {formatCurrency(statistics?.processing?.totalAmount || 0)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Completed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-6 border border-green-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Icon name="check-circle" size={20} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-heading">Completed</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted">Count</span>
                <span className="font-bold text-heading">
                  {statistics?.completed?.count || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Requested</span>
                <span className="font-bold text-heading">
                  {formatCurrency(statistics?.completed?.totalAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Paid Out</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(statistics?.completed?.totalActualAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Fees</span>
                <span className="font-bold text-orange-600">
                  {formatCurrency(statistics?.completed?.totalFees || 0)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Rejected */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl p-6 border border-red-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Icon name="x-circle" size={20} className="text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-heading">Rejected</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted">Count</span>
                <span className="font-bold text-heading">
                  {statistics?.rejected?.count || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Total Amount</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(statistics?.rejected?.totalAmount || 0)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Cancelled */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl p-6 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Icon name="slash" size={20} className="text-gray-600" />
              </div>
              <h3 className="text-lg font-bold text-heading">Cancelled</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted">Count</span>
                <span className="font-bold text-heading">
                  {statistics?.cancelled?.count || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Total Amount</span>
                <span className="font-bold text-gray-600">
                  {formatCurrency(statistics?.cancelled?.totalAmount || 0)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PayoutStatisticsPage;
