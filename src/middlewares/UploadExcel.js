const multer = require("multer");
const path = require("path");
const fs = require("fs");
// Đường dẫn lưu File
const dirExcel = "./uploads/excel/";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check folder upload is created ?
    if (!fs.existsSync(dirExcel)) {
      fs.mkdirSync(dirExcel, { recursive: true });
    }

    cb(null, `${dirExcel}`);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "_" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const uploadExcel = multer({
  storage: storage,
  limits: { fieldSize: 10 * 1024 * 1024 },
});

module.exports = uploadExcel;
