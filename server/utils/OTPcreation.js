const crypto = require('crypto');

const SERVER_HMAC_KEY = process.env.OTP_HMAC_KEY || 'swagats_hmac_key';

const generateOTP = () => {
    return String(crypto.randomInt(100000, 999999));
}

const hmacotp = (otp, context = "") => {
    return crypto
        .createHmac("sha256", SERVER_HMAC_KEY)
        .update(`${otp}|${context}`)
        .digest("hex");
};

const timingSafeEqualHex = (a, b) => {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex"); 

  if (ab.length !== bb.length) return false;

  return crypto.timingSafeEqual(ab, bb);
}

module.exports = {generateOTP, hmacotp, timingSafeEqualHex};