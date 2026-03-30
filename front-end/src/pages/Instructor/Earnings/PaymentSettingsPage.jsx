import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import PayoutService from "../../../services/api/PayoutService";
import { pageVariants } from "../../../utils/helpers";

const PaymentSettingsPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    preferredMethod: "bank_transfer",
    minimumPayout: 500000,
    bankDetails: {
      bankName: "",
      accountNumber: "",
      accountName: "",
      branch: "",
    },
    paypalEmail: "",
    momoPhone: "",
    autoPayoutEnabled: false,
    autoPayoutThreshold: 5000000,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await PayoutService.getPaymentSettings();
      if (res.success && res.data) {
        setSettings(res.data);
        setFormData({
          preferredMethod: res.data.preferredMethod || "bank_transfer",
          minimumPayout: res.data.minimumPayout || 500000,
          bankDetails: res.data.bankDetails || {
            bankName: "",
            accountNumber: "",
            accountName: "",
            branch: "",
          },
          paypalEmail: res.data.paypalEmail || "",
          momoPhone: res.data.momoPhone || "",
          autoPayoutEnabled: res.data.autoPayoutEnabled || false,
          autoPayoutThreshold: res.data.autoPayoutThreshold || 5000000,
        });
      }
    } catch (error) {
      console.error("Fetch settings error:", error);
      toast.error("Failed to load payment settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.preferredMethod === "bank_transfer") {
      if (
        !formData.bankDetails.bankName ||
        !formData.bankDetails.accountNumber ||
        !formData.bankDetails.accountName
      ) {
        toast.error("Please fill in all required bank details");
        return;
      }
    } else if (formData.preferredMethod === "paypal") {
      if (!formData.paypalEmail) {
        toast.error("Please enter your PayPal email");
        return;
      }
    } else if (formData.preferredMethod === "momo") {
      if (!formData.momoPhone) {
        toast.error("Please enter your Momo phone number");
        return;
      }
    }

    setSaving(true);
    try {
      const res = await PayoutService.updatePaymentSettings(formData);
      if (res.success) {
        setSettings(res.data);
      }
    } catch (error) {
      console.error("Update settings error:", error);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/instructor/earnings")}
            className="flex items-center gap-2 text-muted hover:text-heading mb-4"
          >
            <Icon name="arrow-left" size={20} />
            Back to Earnings
          </button>
          <h1 className="text-4xl font-black text-heading mb-2">
            Payment <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-muted">Configure how you receive your earnings</p>
        </div>

        {/* Verification Status */}
        {settings && (
          <div
            className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${
              settings.isVerified
                ? "bg-green-50 border border-green-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}
          >
            <Icon
              name={settings.isVerified ? "check-circle" : "alert-circle"}
              size={20}
              className={settings.isVerified ? "text-green-600" : "text-yellow-600"}
            />
            <div className="flex-1">
              <h3
                className={`font-bold ${settings.isVerified ? "text-green-800" : "text-yellow-800"}`}
              >
                {settings.isVerified ? "Verified" : "Pending Verification"}
              </h3>
              <p
                className={`text-sm ${settings.isVerified ? "text-green-700" : "text-yellow-700"}`}
              >
                {settings.isVerified
                  ? "Your payment settings have been verified by admin"
                  : "Your payment settings are pending admin verification"}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method Selection */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-heading mb-4">Payment Method</h2>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "bank_transfer", label: "Bank Transfer", icon: "credit-card" },
                { value: "paypal", label: "PayPal", icon: "dollar-sign" },
                { value: "momo", label: "Momo", icon: "smartphone" },
                { value: "stripe", label: "Stripe", icon: "zap" },
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, preferredMethod: method.value })
                  }
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.preferredMethod === method.value
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon
                    name={method.icon}
                    size={24}
                    className={
                      formData.preferredMethod === method.value
                        ? "text-primary mb-2"
                        : "text-gray-400 mb-2"
                    }
                  />
                  <div
                    className={`font-bold ${formData.preferredMethod === method.value ? "text-primary" : "text-heading"}`}
                  >
                    {method.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bank Transfer Details */}
          {formData.preferredMethod === "bank_transfer" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-heading mb-4">
                Bank Account Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-heading mb-2">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.bankName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: {
                          ...formData.bankDetails,
                          bankName: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., Vietcombank, BIDV, Techcombank"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-heading mb-2">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: {
                          ...formData.bankDetails,
                          accountNumber: e.target.value,
                        },
                      })
                    }
                    placeholder="Enter your account number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-heading mb-2">
                    Account Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: {
                          ...formData.bankDetails,
                          accountName: e.target.value.toUpperCase(),
                        },
                      })
                    }
                    placeholder="NGUYEN VAN A"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-heading mb-2">
                    Branch (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.branch}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankDetails: {
                          ...formData.bankDetails,
                          branch: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g., Ho Chi Minh City"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PayPal Details */}
          {formData.preferredMethod === "paypal" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-heading mb-4">PayPal Details</h2>

              <div>
                <label className="block text-sm font-bold text-heading mb-2">
                  PayPal Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.paypalEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, paypalEmail: e.target.value })
                  }
                  placeholder="your-email@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>
          )}

          {/* Momo Details */}
          {formData.preferredMethod === "momo" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-heading mb-4">Momo Details</h2>

              <div>
                <label className="block text-sm font-bold text-heading mb-2">
                  Momo Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.momoPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, momoPhone: e.target.value })
                  }
                  placeholder="0912345678"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>
          )}

          {/* Payout Preferences */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-heading mb-4">
              Payout Preferences
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-heading mb-2">
                  Minimum Payout Amount
                </label>
                <input
                  type="number"
                  value={formData.minimumPayout}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimumPayout: Number(e.target.value),
                    })
                  }
                  min="100000"
                  step="100000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-xs text-muted mt-2">
                  Minimum: 100,000 VND | Current: {formatCurrency(formData.minimumPayout)} VND
                </p>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <h3 className="font-bold text-heading mb-1">Auto Payout</h3>
                  <p className="text-sm text-muted">
                    Automatically request payout when balance reaches threshold
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoPayoutEnabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        autoPayoutEnabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {formData.autoPayoutEnabled && (
                <div>
                  <label className="block text-sm font-bold text-heading mb-2">
                    Auto Payout Threshold
                  </label>
                  <input
                    type="number"
                    value={formData.autoPayoutThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        autoPayoutThreshold: Number(e.target.value),
                      })
                    }
                    min="500000"
                    step="100000"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-xs text-muted mt-2">
                    Minimum: 500,000 VND | Current: {formatCurrency(formData.autoPayoutThreshold)} VND
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full px-6 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icon name="save" size={20} />
                Save Settings
              </>
            )}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default PaymentSettingsPage;
