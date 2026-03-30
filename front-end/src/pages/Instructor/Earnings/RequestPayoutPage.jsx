import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../../../components/ui";
import { useToast } from "../../../contexts/ToastContext";
import InstructorEarningService from "../../../services/api/InstructorEarningService";
import PayoutService from "../../../services/api/PayoutService";
import { pageVariants } from "../../../utils/helpers";

const RequestPayoutPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, settingsRes] = await Promise.all([
        InstructorEarningService.getEarningSummary(),
        PayoutService.getPaymentSettings(),
      ]);

      if (summaryRes.success) {
        setSummary(summaryRes.data);
      }

      if (settingsRes.success) {
        setPaymentSettings(settingsRes.data);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
      toast.error("Failed to load data");
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

  const calculateFee = (amount) => {
    return Math.round(amount * 0.02); // 2% fee
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestAmount = Number(amount);

    // Validation
    if (!requestAmount || requestAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (requestAmount < 500000) {
      toast.error("Minimum payout amount is 500,000 VND");
      return;
    }

    if (requestAmount > (summary?.availableBalance || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    if (!paymentSettings || !isPaymentSettingsComplete()) {
      toast.error("Please complete your payment settings first");
      navigate("/instructor/earnings/settings");
      return;
    }

    setSubmitting(true);
    try {
      const res = await PayoutService.requestPayout({
        amount: requestAmount,
        notes: notes.trim(),
      });

      if (res.success) {
        navigate("/instructor/earnings/payout-history");
      }
    } catch (error) {
      console.error("Request payout error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const isPaymentSettingsComplete = () => {
    if (!paymentSettings) return false;

    const method = paymentSettings.preferredMethod;

    if (method === "bank_transfer") {
      return !!(
        paymentSettings.bankDetails?.bankName &&
        paymentSettings.bankDetails?.accountNumber &&
        paymentSettings.bankDetails?.accountName
      );
    } else if (method === "paypal") {
      return !!paymentSettings.paypalEmail;
    } else if (method === "stripe") {
      return !!paymentSettings.stripeAccountId;
    } else if (method === "momo") {
      return !!paymentSettings.momoPhone;
    }

    return false;
  };

  const getPaymentMethodDisplay = () => {
    if (!paymentSettings) return "Not set";

    const method = paymentSettings.preferredMethod;
    const labels = {
      bank_transfer: "Bank Transfer",
      paypal: "PayPal",
      stripe: "Stripe",
      momo: "Momo",
    };

    return labels[method] || method;
  };

  const getPaymentDetailsDisplay = () => {
    if (!paymentSettings) return null;

    const method = paymentSettings.preferredMethod;

    if (method === "bank_transfer") {
      const { bankName, accountNumber, accountName } =
        paymentSettings.bankDetails || {};
      return (
        <div className="text-sm text-muted">
          <div>{bankName}</div>
          <div>{accountNumber}</div>
          <div>{accountName}</div>
        </div>
      );
    } else if (method === "paypal") {
      return <div className="text-sm text-muted">{paymentSettings.paypalEmail}</div>;
    } else if (method === "momo") {
      return <div className="text-sm text-muted">{paymentSettings.momoPhone}</div>;
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 rounded-full border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  const requestAmount = Number(amount) || 0;
  const fee = calculateFee(requestAmount);
  const actualAmount = requestAmount - fee;

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
            Request <span className="gradient-text">Payout</span>
          </h1>
          <p className="text-muted">Withdraw your available earnings</p>
        </div>

        {/* Available Balance Card */}
        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 mb-2">Available Balance</p>
              <h2 className="text-4xl font-black">
                {formatCurrency(summary?.availableBalance || 0)}
              </h2>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Icon name="dollar-sign" size={32} />
            </div>
          </div>
        </div>

        {/* Payment Settings Warning */}
        {!isPaymentSettingsComplete() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Icon name="alert-triangle" size={20} className="text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-yellow-800 mb-1">
                Payment Settings Incomplete
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                Please complete your payment settings before requesting a payout.
              </p>
              <button
                onClick={() => navigate("/instructor/earnings/settings")}
                className="text-sm font-bold text-yellow-800 hover:underline"
              >
                Go to Payment Settings →
              </button>
            </div>
          </div>
        )}

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8">
          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-heading mb-2">
              Payout Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (min: 500,000 VND)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                min="500000"
                max={summary?.availableBalance || 0}
                step="1000"
                required
              />
              <button
                type="button"
                onClick={() => setAmount(String(summary?.availableBalance || 0))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-primary hover:underline"
              >
                Max
              </button>
            </div>
            <p className="text-xs text-muted mt-2">
              Minimum: 500,000 VND | Available: {formatCurrency(summary?.availableBalance || 0)}
            </p>
          </div>

          {/* Fee Breakdown */}
          {requestAmount > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted">Requested Amount</span>
                <span className="text-sm font-bold text-heading">
                  {formatCurrency(requestAmount)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted">Transaction Fee (2%)</span>
                <span className="text-sm font-bold text-red-600">
                  - {formatCurrency(fee)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-heading">You Will Receive</span>
                  <span className="text-lg font-black text-green-600">
                    {formatCurrency(actualAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-heading mb-2">
              Payment Method
            </label>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-heading">
                  {getPaymentMethodDisplay()}
                </span>
                <button
                  type="button"
                  onClick={() => navigate("/instructor/earnings/settings")}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Change
                </button>
              </div>
              {getPaymentDetailsDisplay()}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-heading mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for this payout request..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              submitting ||
              !isPaymentSettingsComplete() ||
              requestAmount < 500000 ||
              requestAmount > (summary?.availableBalance || 0)
            }
            className="w-full px-6 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Icon name="check" size={20} />
                Submit Payout Request
              </>
            )}
          </button>

          <p className="text-xs text-center text-muted mt-4">
            Your request will be reviewed by admin. Processing time: 1-3 business days.
          </p>
        </form>
      </div>
    </motion.div>
  );
};

export default RequestPayoutPage;
