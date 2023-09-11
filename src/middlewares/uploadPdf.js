const multer = require("multer");
const path = require("path");
const fs = require("fs");
// Đường dẫn lưu file
const dirDocument = "./uploads/document/";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check folder upload is created ?
    if (!fs.existsSync(dirDocument)) {
      fs.mkdirSync(dirDocument, { recursive: true });
    }

    cb(null, `${dirDocument}`);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "_" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "_" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const uploadPDF = multer({
  storage: storage,
  limits: { fieldSize: 20 * 1024 * 1024 },
});

module.exports = uploadPDF;
