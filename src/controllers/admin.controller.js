require("dotenv").config();
const { validationResult } = require("express-validator");
const db = require("../models/connectDb");
const regex = require("../Utils/regex");
const Admin = require("../models/admin.model");
const jwtDecode = require("jwt-decode");
const { signAccesToken, signRefreshToken } = require("../middlewares/init_jwt");
const JWT = require("jsonwebtoken");
const constantNotify = require("../Utils/contanstNotify");
const bcrypt = require("bcrypt");
const tableAdmin = "tbl_admin";
const adminService = require("../services/admin.service");

// Register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send({
        result: false,
        error: errors.array(),
      });
    }
    const { name, email, phoneNumber, password, active } = req.body;
    // Validate Email
    if (!regex.regexEmail.test(email)) {
      return res.send({
        result: false,
        error: [
          {
            param: "email",
            msg: constantNotify.VALIDATE_EMAIL,
          },
        ],
      });
    }

    // Validate Password
    if (!regex.regexPass.test(password)) {
      return res.send({
        result: false,
        error: [
          {
            param: "password",
            msg: constantNotify.VALIDATE_PASSWORD,
          },
        ],
      });
    }

    db.query(
      `SELECT email FROM ${tableAdmin} WHERE email = "${email}"`,
      async (err, dataRes) => {
        if (err) {
          return res.send({
            result: false,
            error: [{ msg: constantNotify.ERROR }],
          });
        }

        if (dataRes.length !== 0) {
          return res.send({
            result: false,
            error: [{ msg: `Email ${constantNotify.ALREADY_EXIST}` }],
          });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPass = await bcrypt.hash(password, salt);

        const admin = new Admin({
          name,
          email,
          phoneNumber,
          password: hashPass,
          active: active == "true" ? true : false,
          created_at: Date.now(),
        });
        delete admin.refresh_token;
        delete admin.updated_at;

        adminService.register(admin, (err, res_) => {
          if (err) {
            return res.send({
              result: false,
              error: [err],
            });
          }
          admin.id = res_;
          return res.send({
            result: true,
            data: {
              msg: constantNotify.ADD_DATA_SUCCESS,
              newData: admin,
            },
          });
        });
      },
    );
  } catch (error) {
    return res.send({
      result: false,
      error: [{ msg: constantNotify.ERROR }],
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send({
        result: false,
        errors: errors.array(),
      });
    }
    const { email, password } = req.body;

    if (!email || !password) {
      return res.send({
        result: false,
        error: [{ msg: constantNotify.NOT_AUTH }],
      });
    }

    // Validate Email
    if (!regex.regexEmail.test(email)) {
      return res.send({
        result: false,
        error: [
          {
            param: "email",
            msg: constantNotify.VALIDATE_EMAIL,
          },
        ],
      });
    }

    // Validate Password
    if (!regex.regexPass.test(password)) {
      return res.send({
        result: false,
        error: [
          {
            param: "password",
            msg: constantNotify.VALIDATE_PASSWORD,
          },
        ],
      });
    }

    db.query(
      `SELECT active FROM ${tableAdmin} WHERE email = "${email}"`,
      (err, dataRes) => {
        if (err) {
          return res.send({
            result: false,
            error: [err],
          });
        }
        if (dataRes.length === 0) {
          return res.send({
            result: false,
            error: [{ msg: `User ${constantNotify.NOT_EXITS}` }],
          });
        }

        if (dataRes.length !== 0) {
          if (dataRes[0]?.active == 0) {
            return res.send({
              result: false,
              error: [{ msg: `User ${constantNotify.NOT_ACTIVE}` }],
            });
          }

          adminService.login(email, password, (err, res_) => {
            if (err) {
              return res.send({
                result: false,
                msg: [err],
              });
            }
            return res.send({
              result: true,
              data: res_,
            });
          });
        }
      },
    );
  } catch (error) {
    return res.send({
      result: false,
      error: [{ msg: constantNotify.ERROR }],
    });
  }
};

// refreshToken
exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    const decodeToken = jwtDecode(
      refreshToken.slice(0, refreshToken.length - 1),
    );
    const userId = decodeToken?.userId;

    await JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err) => {
      if (err) {
        const query = `UPDATE ${tableAdmin} SET refresh_token = 0 WHERE id = ${userId}`;
        db.query(query, (err) => {
          if (err) {
            return res.send({ msg: constantNotify.ERROR }, null);
          }
          db.query(
            `SELECT email FROM ${tableAdmin} WHERE id = ?`,
            userId,
            async (err, data_) => {
              if (err) {
                return res.send({ msg: constantNotify.ERROR }, null);
              }
              if (data_[0]?.email) {
                const nets = networkInterfaces();
                const results = {};

                for (const name of Object.keys(nets)) {
                  for (const net of nets[name]) {
                    const familyV4Value =
                      typeof net.family === "string" ? "IPv4" : 4;
                    if (net.family === familyV4Value && !net.internal) {
                      if (!results[name]) {
                        results[name] = [];
                      }
                      results[name].push(net.address);
                    }
                  }
                }

                const dataSendEmail = {
                  to: data_[0]?.email,
                  text: "Hey user",
                  subject: "[TOEICUNGDUNG] CẢNH BÁO ĐĂNG NHẬP BẤT THƯỜNG",
                  html: `Hi bạn,
                    Chúng tôi nghi ngờ tài khoản của bạn đăng nhập bất thường tại địa chỉ IP: ${
                      results["Wi-Fi"][0] || results["Ethernet"][0]
                    }
                    Bạn vui lòng đăng nhập hệ thống và đổi mật khẩu để bảo vệ tài khoản!
                    `,
                };

                await sendEmail(dataSendEmail);
              }
            },
          );
        });
        return res.send({
          result: false,
          error: [err],
        });
      }

      db.getConnection((err, conn) => {
        if (err) {
          return res.send({
            result: false,
            error: [err],
          });
        }

        conn.query(
          `SELECT id,name,refresh_token FROM tbl_admin WHERE refresh_token LIKE "%${refreshToken}%"`,
          async (err, dataRes) => {
            if (err) {
              return res.send({
                result: false,
                error: [err],
              });
            }
            if (dataRes.length === 0) {
              const query = `UPDATE ${tableAdmin} SET refresh_token = 0 WHERE id = ${userId}?`;
              conn.query(query, (err) => {
                if (err) {
                  return res.send({
                    result: false,
                    error: [{ msg: constantNotify.ERROR }],
                  });
                }
              });
            }

            if (dataRes && dataRes.length > 0) {
              const dataRefresh = {
                userId: dataRes[0].id,
                name: dataRes[0].name,
              };
              const _token = await signAccesToken(dataRefresh);
              const _refreshToken = await signRefreshToken(dataRefresh);

              /**update RefreshToken at DB */
              const updateToken = `UPDATE ${tableAdmin} SET refresh_token = ? WHERE id = ?`;
              conn.query(updateToken, [_refreshToken, userId], (err) => {
                if (err) {
                  return result({ msg: constantNotify.ERROR }, null);
                }
              });
              return res.send({
                result: true,
                newAccessToken: _token,
                newRefreshToken: _refreshToken,
              });
            }
          },
        );
        conn.release();
      });
    });
  } catch (error) {
    return res.send({
      result: false,
      error: [{ msg: constantNotify.ERROR }],
    });
  }
};

// getAll
exports.getAll = async (req, res) => {
  try {
    const offset = req.query.offset || 0;
    const limit = req.query.limit || 10;
    const keyword = req.query.keyword || "";

    adminService.getAll(offset, limit, keyword, (err, res_) => {
      if (err) {
        return res.send({
          result: false,
          error: [err],
        });
      }

      // Calculate TotalPage
      const totalPage = Math.ceil(res_[0]?.total / limit);
      res_.forEach((item) => {
        delete item.total;
      });

      return res.send({
        result: true,
        totalPage: totalPage ? totalPage : 0,
        data: res_,
      });
    });
  } catch (error) {
    return res.send({
      result: false,
      error: [{ msg: constantNotify.ERROR }],
    });
  }
};

// getByID
exports.getById = async (req, res) => {
  try {
    const id = req.params.id;
    adminService.getById(id, (err, res_) => {
      if (err) {
        return res.send({
          result: false,
          error: [err],
        });
      }
      return res.send({
        result: true,
        data: res_,
      });
    });
  } catch (error) {
    return res.send({
      result: false,
      error: [{ msg: constantNotify.ERROR }],
    });
  }
};

// Update
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, email, phoneNumber } = req.body;

    // Validate Email
    if (!regex.regexEmail.test(email)) {
      return res.send({
        result: false,
        error: [
          {
            param: "email",
            msg: constantNotify.VALIDATE_EMAIL,
          },
        ],
      });
    }

    // Validate Phone
    if (!regex.regexPhone.test(phoneNumber)) {
      return res.send({
        result: false,
        error: [
          {
            param: "phoneNumber",
            msg: constantNotify.VALIDATE_PHONE_NUMBER,
          },
        ],
      });
    }

    db.query(
      `SELECT id,email FROM ${tableAdmin} WHERE email = "${email}"`,
      async (err, dataRes) => {
        if (err) {
          return res.send({
            result: false,
            error: [{ msg: constantNotify.ERROR }],
          });
        }

        if (dataRes.length !== 0 && id != dataRes[0]?.id) {
          return res.send({
            result: false,
            errpr: [{ msg: `Email ${constantNotify.ALREADY_EXIST}` }],
          });
        }

        const admin = new Admin({
          name,
          email,
          phoneNumber,
          updated_at: Date.now(),
        });
        delete admin.created_at;
        delete admin.active;
        delete admin.password;
        delete admin.refresh_token;
        adminService.update(id, admin, (err, res_) => {
          if (err) {
            return res.send({
              result: false,
              error: [err],
            });
          }
          admin.id = id;
          return res.send({
            result: true,
            data: {
              msg: constantNotify.UPDATE_DATA_SUCCESS,
              newData: admin,
            },
          });
        });
      },
    );
  } catch (error) {
    return res.send({
      result: false,
      error: [{ msg: constantNotify.ERROR }],
    });
  }
};

// delete
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    db.query(
      `SELECT id,email FROM ${tableAdmin} WHERE id = ${id}`,
      (err, dataRes) => {
        if (err) {
          return res.send({
            result: false,
            error: [{ msg: constantNotify.ERROR }],
          });
        }

        if (dataRes.length === 0) {
          return res.send({
            result: false,
            error: [{ msg: `ID ${constantNotify.NOT_EXITS}` }],
          });
        }

        adminService.delete(id, (err, res_) => {
          if (err) {
            return res.send({
              result: false,
              error: [err],
            });
          }

          return res.send({
            result: true,
            data: { msg: constantNotify.DELETE_DATA_SUCCESS },
          });
        });
      },
    );
  } catch (error) {
    return res.send({
      result: false,
      error: [{ msg: constantNotify.ERROR }],
    });
  }
};

// active
exports.active = async (req, res) => {
  try {
    const id = req.params.id;
    const active = req.body.active;
    adminService.active(id, active, (err, res_) => {
      if (err) {
        return res.send({
          result: false,
          error: [err],
        });
      }
      if (err) {
        return res.send({
          result: false,
          error: [err],
        });
      }
      return res.send({
        result: true,
        data: { msg: constantNotify.UPDATE_DATA_SUCCESS },
      });
    });
  } catch (error) {
    return res.send({
      result: false,
      error: [{ msg: constantNotify.ERROR }],
    });
  }
};
