import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import PayoutService from "../../../services/api/PayoutService";
import { pageVariants } from "../../../utils/helpers";

const PaymentSettingsManagementPage = () => {
  const toast = useToast();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, [filter]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { isVerified: filter === "verified" } : {};
      const res = await PayoutService.getAllPaymentSettings(params);
      if (res.success) {
        setSettings(res.data || []);
      }
    } catch (error) {
      console.error("Fetch settings error:", error);
      toast.error("Failed to load payment settings");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (instructorId, isVerified) => {
    setActionLoading(instructorId);
    try {
      const res = await PayoutService.verifyPaymentSettings(instructorId, {
        isVerified,
      });

      if (res.success) {
        toast.success(
          `Payment settings ${isVerified ? "verified" : "unverified"} successfully`
        );
        fetchSettings();
        setSelectedSetting(null);
      }
    } catch (error) {
      console.error("Verify settings error:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const getVerificationBadge = (isVerified) => {
    return isVerified ? (
      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border bg-green-100 text-green-700 border-green-200">
        Verified
      </span>
    ) : (
      <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border bg-yellow-100 text-yellow-700 border-yellow-200">
        Unverified
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
            Payment <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-muted">Verify instructor payment settings</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {["all", "verified", "unverified"].map((status) => (
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
        ) : settings.length === 0 ? (
          /* Empty State */
          <div className="py-20 text-center bg-white border border-gray-200 border-dashed rounded-3xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 text-primary">
              <Icon name="credit-card" size={40} />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-heading">
              No Payment Settings Found
            </h2>
            <p className="text-muted">No payment settings match the selected filter.</p>
          </div>
        ) : (
          /* Settings List */
          <div className="space-y-4">
            {settings.map((setting, i) => {
              const instructor = setting.instructorId;
              const isComplete =
                (setting.preferredMethod === "bank_transfer" &&
                  setting.bankDetails?.bankName &&
                  setting.bankDetails?.accountNumber &&
                  setting.bankDetails?.accountName) ||
                (setting.preferredMethod === "paypal" && setting.paypalEmail) ||
                (setting.preferredMethod === "momo" && setting.momoPhone) ||
                (setting.preferredMethod === "stripe" && setting.stripeAccountId);

              return (
                <motion.div
                  key={setting._id}
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
                        <div className="ml-auto">
                          {getVerificationBadge(setting.isVerified)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-15">
                        <div>
                          <p className="text-xs text-muted mb-1">Payment Method</p>
                          <p className="text-sm font-bold text-heading capitalize">
                            {setting.preferredMethod?.replace("_", " ") || "Not Set"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted mb-1">Status</p>
                          <p
                            className={`text-sm font-bold ${
                              isComplete ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {isComplete ? "Complete" : "Incomplete"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted mb-1">Last Updated</p>
                          <p className="text-sm font-medium text-heading">
                            {new Date(setting.updatedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      {setting.isVerified && setting.verifiedAt && (
                        <div className="mt-3 pl-15 text-sm text-green-600">
                          Verified on{" "}
                          {new Date(setting.verifiedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {setting.verifiedBy && ` by ${setting.verifiedBy.fullname}`}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedSetting(setting)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <Icon name="eye" size={16} />
                        View
                      </button>
                      {!setting.isVerified && isComplete && (
                        <button
                          onClick={() =>
                            handleVerify(setting.instructorId._id, true)
                          }
                          disabled={actionLoading === setting.instructorId._id}
                          className="px-4 py-2 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {actionLoading === setting.instructorId._id ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Icon name="check" size={16} />
                          )}
                          Verify
                        </button>
                      )}
                      {setting.isVerified && (
                        <button
                          onClick={() =>
                            handleVerify(setting.instructorId._id, false)
                          }
                          disabled={actionLoading === setting.instructorId._id}
                          className="px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Icon name="x" size={16} />
                          Unverify
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

      {/* Detail Modal */}
      {selectedSetting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-heading">
                Payment Settings Details
              </h3>
              <button
                onClick={() => setSelectedSetting(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            {/* Instructor Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-heading mb-3">Instructor</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Name</span>
                  <span className="font-medium">
                    {selectedSetting.instructorId?.fullname}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Email</span>
                  <span className="font-medium">
                    {selectedSetting.instructorId?.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-heading mb-3">Payment Method</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Preferred Method</span>
                  <span className="font-medium capitalize">
                    {selectedSetting.preferredMethod?.replace("_", " ") || "Not Set"}
                  </span>
                </div>

                {selectedSetting.preferredMethod === "bank_transfer" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted">Bank Name</span>
                      <span className="font-medium">
                        {selectedSetting.bankDetails?.bankName || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Account Number</span>
                      <span className="font-medium">
                        {selectedSetting.bankDetails?.accountNumber || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Account Name</span>
                      <span className="font-medium">
                        {selectedSetting.bankDetails?.accountName || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Branch</span>
                      <span className="font-medium">
                        {selectedSetting.bankDetails?.branch || "-"}
                      </span>
                    </div>
                  </>
                )}

                {selectedSetting.preferredMethod === "paypal" && (
                  <div className="flex justify-between">
                    <span className="text-muted">PayPal Email</span>
                    <span className="font-medium">
                      {selectedSetting.paypalEmail || "-"}
                    </span>
                  </div>
                )}

                {selectedSetting.preferredMethod === "momo" && (
                  <div className="flex justify-between">
                    <span className="text-muted">Momo Phone</span>
                    <span className="font-medium">
                      {selectedSetting.momoPhone || "-"}
                    </span>
                  </div>
                )}

                {selectedSetting.preferredMethod === "stripe" && (
                  <div className="flex justify-between">
                    <span className="text-muted">Stripe Account ID</span>
                    <span className="font-medium">
                      {selectedSetting.stripeAccountId || "-"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-bold text-heading mb-3">Verification</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Status</span>
                  {getVerificationBadge(selectedSetting.isVerified)}
                </div>
                {selectedSetting.isVerified && selectedSetting.verifiedAt && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted">Verified At</span>
                      <span className="font-medium">
                        {new Date(selectedSetting.verifiedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    {selectedSetting.verifiedBy && (
                      <div className="flex justify-between">
                        <span className="text-muted">Verified By</span>
                        <span className="font-medium">
                          {selectedSetting.verifiedBy.fullname}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default PaymentSettingsManagementPage;
