const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Đường dẫn lưu hình ảnh
const dirImage = "./uploads/avatar/images";
const dirThumb = "./uploads/avatar/thumb";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(dirImage) && !fs.existsSync(dirThumb)) {
      fs.mkdirSync(dirImage, { recursive: true });
      fs.mkdirSync(dirThumb, { recursive: true });
    }

    if (!fs.existsSync(dirImage) && fs.existsSync(dirThumb)) {
      fs.mkdirSync(dirImage, { recursive: true });
    }

    if (fs.existsSync(dirImage) && !fs.existsSync(dirThumb)) {
      fs.mkdirSync(dirThumb, { recursive: true });
    }

    let math = ["image/png", "image/jpeg", "image/jpg"];
    if (math.indexOf(file.mimetype) === -1) {
      let errorMess = `The file <strong>${file.originalname}</strong> is invalid. Only allowed to upload image jpeg or png.`;
      return cb(errorMess, null);
    }

    cb(null, dirImage);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() +
      new Date().getTime() +
      new Date().getDate() +
      new Date().getMonth();
    cb(
      null,
      file.fieldname + "_" + uniqueSuffix + path.extname(file.originalname),
    );
  },
});

const uploadAvatar = multer({
  storage: storage,
  limits: { fieldSize: 2 * 1024 * 1024 },
});

module.exports = uploadAvatar;
