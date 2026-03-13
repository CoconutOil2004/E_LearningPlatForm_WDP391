const qs = require("qs");
const crypto = require("crypto");
const moment = require("moment");

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  keys.forEach((key) => {
    sorted[key] = obj[key];
  });

  return sorted;
}

exports.createPaymentUrl = ({ amount, orderId, ipAddr, orderInfo }) => {
  const createDate = moment().format("YYYYMMDDHHmmss");

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: process.env.VNP_TMN_CODE,
    vnp_Locale: "vn",
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: process.env.VNP_RETURN_URL,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  vnp_Params = sortObject(vnp_Params);

  const signData = qs.stringify(vnp_Params, { encode: false });

  const secureHash = crypto
    .createHmac("sha512", process.env.VNP_HASH_SECRET)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  vnp_Params.vnp_SecureHash = secureHash;

  return (
    process.env.VNP_URL + "?" + qs.stringify(vnp_Params, { encode: false })
  );
};

/**
 * Verify the return URL / IPN from VNPay.
 * Strips vnp_SecureHash (and vnp_SecureHashType if present) before re-computing the HMAC,
 * then compares with the hash VNPay sent back.
 *
 * @param {object} query  – req.query from the callback route
 * @returns {{ isVerified, isSuccess, orderId, responseCode, transactionNo }}
 */
exports.verifyReturnUrl = (query) => {
  const params = { ...query };

  const receivedHash = params["vnp_SecureHash"];
  delete params["vnp_SecureHash"];
  if (params["vnp_SecureHashType"]) delete params["vnp_SecureHashType"];

  const sorted = sortObject(params);
  const signData = qs.stringify(sorted, { encode: false });

  const expectedHash = crypto
    .createHmac("sha512", process.env.VNP_HASH_SECRET)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  return {
    isVerified: expectedHash === receivedHash,
    isSuccess: params["vnp_ResponseCode"] === "00",
    orderId: params["vnp_TxnRef"], // payment._id string
    responseCode: params["vnp_ResponseCode"],
    transactionNo: params["vnp_TransactionNo"] || null,
  };
};
