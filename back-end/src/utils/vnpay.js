const qs = require("qs");
const crypto = require("crypto");
const moment = require("moment");

// 1. VNPAY SORT FUNCTION: Sorts and encodes URI components accurately
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    // VNPAY requires encoding and replacing spaces (%20) with plus signs (+)
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
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
  
  // Since sortObject above ALREADY ENCODED, we set encode: false here
  const signData = qs.stringify(vnp_Params, { encode: false });

  const secureHash = crypto
    .createHmac("sha512", process.env.VNP_HASH_SECRET)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  vnp_Params.vnp_SecureHash = secureHash;
  
  // IMPORTANT NOTE: Change encode: true to encode: false to avoid double-encoding
  const finalUrl =
    process.env.VNP_URL + "?" + qs.stringify(vnp_Params, { encode: false });
    
  return finalUrl;
};

exports.verifyReturnUrl = (query) => {
  const params = { ...query };

  const receivedHash = params["vnp_SecureHash"];
  delete params["vnp_SecureHash"];
  if (params["vnp_SecureHashType"]) delete params["vnp_SecureHashType"];

  // Express req.query is automatically decoded, so we must use sortObject to re-encode from scratch
  const sorted = sortObject(params);
  const signData = qs.stringify(sorted, { encode: false });

  const expectedHash = crypto
    .createHmac("sha512", process.env.VNP_HASH_SECRET)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  return {
    isVerified: expectedHash === receivedHash,
    isSuccess: params["vnp_ResponseCode"] === "00",
    orderId: params["vnp_TxnRef"],
    responseCode: params["vnp_ResponseCode"],
    transactionNo: params["vnp_TransactionNo"] || null,
  };
};