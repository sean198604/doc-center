const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_EXTS = ['pdf','doc','docx','xls','xlsx','ppt','pptx','zip','rar','jpg','jpeg','png'];
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 200 * 1024 * 1024;
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const ts  = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    cb(null, `${ts}_${rand}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (ALLOWED_EXTS.includes(ext)) cb(null, true);
  else cb(new Error(`不支持的文件类型: ${ext}`), false);
};

module.exports = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });
