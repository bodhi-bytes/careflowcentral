const crypto = require('crypto');

/**
 * Generate a secure random password
 * @param {number} length - Length of the password (default: 12)
 * @returns {string} - Generated password
 */
const generateSecurePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length);
    password += charset[randomIndex];
  }
  
  return password;
};

/**
 * Generate a temporary password with expiry
 * @param {number} length - Length of the password (default: 12)
 * @returns {Object} - Password and expiry details
 */
const generateTemporaryPassword = (length = 12) => {
  const password = generateSecurePassword(length);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  
  return {
    password,
    expiresAt,
    isTemporary: true
  };
};

module.exports = {
  generateSecurePassword,
  generateTemporaryPassword
};
