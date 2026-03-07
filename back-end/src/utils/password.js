/**
 * Tạo mật khẩu ngẫu nhiên
 * @param {number} length - Độ dài mật khẩu (mặc định 10)
 * @returns {string}
 */
const generateRandomPassword = (length = 10) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

module.exports = { generateRandomPassword };
