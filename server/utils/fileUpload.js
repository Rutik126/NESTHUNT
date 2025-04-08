const fs = require('fs');
const path = require('path');

const ensureUploadsDir = (subfolder = '') => {
  const uploadsPath = path.join(__dirname, '../uploads', subfolder);
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  return uploadsPath;
};

module.exports = { ensureUploadsDir };