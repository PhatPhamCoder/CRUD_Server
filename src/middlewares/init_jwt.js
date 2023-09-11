const JWT = require("jsonwebtoken");
const constantNotify = require("../Utils/contanstNotify");
require("dotenv").config();

const signAccesToken = async (data) => {
  const token = await JWT.sign(data, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.TIME_ACCESS_EXPIRE,
  });

  return token;
};
const signRefreshToken = async (data) => {
  const token = await JWT.sign(data, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.TIME_REFRESH_EXPIRE,
  });

  return token;
};

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers["x-token"];
    // console.log(`Token is ::${token}`);
    if (!token) {
      return res.send({
        result: false,
        error: [{ msg: `ID người dùng ${constantNotify.INVALID}` }],
      });
    }

    if (token) {
      const decodeUser = await JWT.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
      );
      req.user = decodeUser;
      return next();
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(200).send({
        code: 401,
        msg: error.message,
      });
    }
    return res.status(200).send({
      code: 500,
      msg: error,
    });
  }
};

module.exports = { verifyToken, signAccesToken, signRefreshToken };
