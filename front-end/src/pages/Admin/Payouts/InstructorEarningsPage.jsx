import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import InstructorEarningService from "../../../services/api/InstructorEarningService";
import { pageVariants } from "../../../utils/helpers";

const InstructorEarningsPage = () => {
  const toast = useToast();
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  useEffect(() => {
    fetchEarnings();
  }, [filter]);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const res = await InstructorEarningService.getAllInstructorEarnings(params);
      if (res.success) {
        setEarnings(res.data || []);
      }
    } catch (error) {
      console.error("Fetch earnings error:", error);
      toast.error("Failed to load earnings");
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

    return (
      <span
        className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${styles[status] || ""}`}
      >
        {status}
      </span>
    );
  };

  const groupByInstructor = () => {
    const grouped = {};
    earnings.forEach((earning) => {
      const instructorId = earning.instructorId?._id;
      if (!instructorId) return;

      if (!grouped[instructorId]) {
        grouped[instructorId] = {
          instructor: earning.instructorId,
          totalEarnings: 0,
          availableAmount: 0,
          pendingAmount: 0,
          paidAmount: 0,
          count: 0,
        };
      }

      grouped[instructorId].totalEarnings += earning.instructorAmount;
      grouped[instructorId].count += 1;

      if (earning.status === "available") {
        grouped[instructorId].availableAmount += earning.instructorAmount;
      } else if (earning.status === "pending") {
        grouped[instructorId].pendingAmount += earning.instructorAmount;
      } else if (earning.status === "paid") {
        grouped[instructorId].paidAmount += earning.instructorAmount;
      }
    });

    return Object.values(grouped);
  };

  const instructorGroups = groupByInstructor();

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
            Instructor <span className="gradient-text">Earnings</span>
          </h1>
          <p className="text-muted">View all instructor earnings and balances</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {["all", "pending", "available", "paid"].map((status) => (
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

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 rounded-full border-primary/30 border-t-primary animate-spin" />
          </div>
        ) : instructorGroups.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center bg-white border border-gray-200 border-dashed rounded-3xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 text-primary">
              <Icon name="dollar-sign" size={40} />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-heading">
              No Earnings Found
            </h2>
            <p className="text-muted">No instructor earnings match the selected filter.</p>
          </div>
        ) : (
          /* Instructor Groups */
          <div className="space-y-4">
            {instructorGroups.map((group, i) => {
              const instructor = group.instructor;

              return (
                <motion.div
                  key={instructor._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between gap-6">
                    {/* Left: Instructor Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
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

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-muted mb-1">Total Earnings</p>
                          <p className="text-lg font-bold text-heading">
                            {formatCurrency(group.totalEarnings)}
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3">
                          <p className="text-xs text-muted mb-1">Available</p>
                          <p className="text-lg font-bold text-green-600">
                            {formatCurrency(group.availableAmount)}
                          </p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-3">
                          <p className="text-xs text-muted mb-1">Pending</p>
                          <p className="text-lg font-bold text-yellow-600">
                            {formatCurrency(group.pendingAmount)}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3">
                          <p className="text-xs text-muted mb-1">Paid Out</p>
                          <p className="text-lg font-bold text-blue-600">
                            {formatCurrency(group.paidAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-muted">
                        {group.count} earning{group.count !== 1 ? "s" : ""}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedInstructor(instructor._id)}
                        className="px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <Icon name="eye" size={16} />
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedInstructor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-heading">Earning Details</h3>
              <button
                onClick={() => setSelectedInstructor(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            {/* Earnings Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                      Course
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {earnings
                    .filter((e) => e.instructorId?._id === selectedInstructor)
                    .map((earning) => (
                      <tr key={earning._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-heading">
                          {earning.courseId?.title || "Unknown Course"}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-heading">
                          {formatCurrency(earning.instructorAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted">
                          {new Date(earning.earnedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(earning.status)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default InstructorEarningsPage;
