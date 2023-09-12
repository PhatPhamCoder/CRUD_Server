require("dotenv").config();
const { validationResult } = require("express-validator");
const db = require("../models/connectDb");
const regex = require("../Utils/regex");
const Admin = require("../models/admin.model");
const jwtDecode = require("jwt-decode");
const { signAccesToken, signRefreshToken } = require("../middlewares/init_jwt");
const JWT = require("jsonwebtoken");
const XLSX = require("xlsx");
const fs = require("fs");
const sharp = require("sharp");
const path = require("path");
const __basedir = path.resolve();
const constantNotify = require("../Utils/contanstNotify");
const bcrypt = require("bcrypt");
const tableAdmin = "tbl_admin";
const adminService = require("../services/admin.service");

var directoryPath = path.join(__basedir, "/uploads/avatar/images/");
var directoryThumb = path.join(__basedir, "/uploads/avatar/thumb/");

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
    console.log({ name, email, phoneNumber, password, active });
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
    if (!req.file) {
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
          delete admin.avatar;
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
    }
    if (req.file) {
      const maxSize = 2 * 1024 * 1024;
      if (req.file.size < maxSize) {
        const fileName = req.file.filename;
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

            sharp(req?.file?.path)
              .resize({ width: 150, height: 150 })
              .toFile(`uploads/avatar/thumb/` + fileName, async (err) => {
                if (err) {
                  if (fs.existsSync(directoryPath + fileName)) {
                    await fs.unlinkSync(directoryPath + fileName);
                  }

                  return res.send({
                    result: false,
                    error: [{ msg: constantNotify.ERROR }],
                  });
                }

                const admin = new Admin({
                  name,
                  email,
                  phoneNumber,
                  avatar: fileName,
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
              });
          },
        );
      } else {
        if (
          fs.existsSync(directoryPath + req.file.filename) &&
          fs.existsSync(directoryThumb + req.file.filename)
        ) {
          await fs.unlinkSync(directoryPath + req.file.filename);
          await fs.unlinkSync(directoryThumb + req.file.filename);
        }
        if (
          fs.existsSync(directoryPath + req.file.filename) &&
          !fs.existsSync(directoryThumb + req.file.filename)
        ) {
          await fs.unlinkSync(directoryPath + req.file.filename);
        }

        if (
          !fs.existsSync(directoryPath + req.file.filename) &&
          fs.existsSync(directoryThumb + req.file.filename)
        ) {
          await fs.unlinkSync(directoryPath + req.file.filename);
        }

        return res.send({
          result: false,
          error: [{ msg: constantNotify.VALIDATE_FILE_SIZE }],
        });
      }
    }
  } catch (error) {
    if (req.file) {
      if (
        fs.existsSync(directoryPath + req.file.filename) &&
        fs.existsSync(directoryThumb + req.file.filename)
      ) {
        await fs.unlinkSync(directoryPath + req.file.filename);
        await fs.unlinkSync(directoryThumb + req.file.filename);
      }
      if (
        fs.existsSync(directoryPath + req.file.filename) &&
        !fs.existsSync(directoryThumb + req.file.filename)
      ) {
        await fs.unlinkSync(directoryPath + req.file.filename);
      }

      if (
        !fs.existsSync(directoryPath + req.file.filename) &&
        fs.existsSync(directoryThumb + req.file.filename)
      ) {
        await fs.unlinkSync(directoryPath + req.file.filename);
      }
    }
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
                  subject: "[OPTECH] CẢNH BÁO ĐĂNG NHẬP BẤT THƯỜNG",
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
    const { name, email, phoneNumber, active } = req.body;

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
            error: [{ msg: `Email ${constantNotify.ALREADY_EXIST}` }],
          });
        }

        const admin = new Admin({
          name,
          email,
          phoneNumber,
          active,
          updated_at: Date.now(),
        });
        delete admin.created_at;
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
      `SELECT id,email,avatar FROM ${tableAdmin} WHERE id = ${id}`,
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

        adminService.delete(id, async (err, res_) => {
          if (err) {
            return res.send({
              result: false,
              error: [err],
            });
          }

          const directoryPath = path.join(__basedir, "/uploads/avatar/images/");
          const directoryThumb = path.join(__basedir, "/uploads/avatar/thumb/");

          if (
            fs.existsSync(directoryPath + dataRes[0]?.avatar) &&
            fs.existsSync(directoryThumb + dataRes[0]?.avatar)
          ) {
            await fs.unlinkSync(directoryPath + dataRes[0]?.avatar);
            await fs.unlinkSync(directoryThumb + dataRes[0]?.avatar);
          }
          if (
            fs.existsSync(directoryPath + dataRes[0]?.avatar) &&
            !fs.existsSync(directoryThumb + dataRes[0]?.avatar)
          ) {
            await fs.unlinkSync(directoryPath + dataRes[0]?.avatar);
          }

          if (
            !fs.existsSync(directoryPath + dataRes[0]?.avatar) &&
            fs.existsSync(directoryThumb + dataRes[0]?.avatar)
          ) {
            await fs.unlinkSync(directoryPath + dataRes[0]?.avatar);
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

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const id = req.params.id;
    const { currentPassword, newPassword } = req.body;
    // Validate currentPassword
    if (!regex.regexPass.test(currentPassword)) {
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

    // Validate newPassword
    if (!regex.regexPass.test(newPassword)) {
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
      `SELECT password FROM ${tableAdmin} WHERE id = ${id}`,
      async (err, dataRes) => {
        if (err) {
          return res.send({
            result: false,
          });
        }

        if (dataRes.length === 0) {
          return res.send({
            result: false,
            error: [{ msg: `ID ${constantNotify.NOT_EXITS}` }],
          });
        }

        const passwordCompare = await bcrypt.compare(
          currentPassword,
          dataRes[0]?.password,
        );

        if (!passwordCompare) {
          return res.send({
            result: false,
            error: [{ msg: `Current Password ${constantNotify.IS_WRONG}` }],
          });
        }

        adminService.changePassword(id, newPassword, (err, res_) => {
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
      },
    );
  } catch (error) {
    console.error(error);
    return res.send({
      result: false,
      error: [{ msg: constantNotify.ERROR }],
    });
  }
};

// Export excel
exports.exportExcel = async (req, res) => {
  try {
    adminService.exportExcel((err, res_) => {
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

// import excel
exports.importExcel = async (req, res) => {
  try {
    const fileName = req.file.filename;
    const workBook = XLSX.readFile(req?.file?.path);
    const workSheet = workBook.Sheets[workBook.SheetNames[0]];
    const dataExcel = XLSX.utils.sheet_to_json(workSheet);
    if (dataExcel?.length > 1000) {
      return res.send({
        result: false,
        error: [{ msg: constantNotify.DATALIMIT1000 }],
      });
    }
    const queryPromse = [];
    dataExcel?.forEach((item, index) => {
      queryPromse.push(
        new Promise((resolve, reject) => {
          const query = `SELECT email FROM ${tableAdmin} WHERE email = "${item["email"]}"`;
          db.query(query, (err, dataRes) => {
            if (err) {
              reject(err);
            }
            resolve({ dataRes, index: ++index });
          });
        }),
      );
    });
    await Promise.all(queryPromse)
      .then((data) => {
        const dataSame = [];
        data?.forEach((item) => {
          if (item.dataRes?.length > 0) {
            dataSame.push(item.index);
          }
        });
        return dataSame;
      })
      .then(async (data) => {
        const directoryExcel = __basedir + "/uploads/excel/";
        if (data.length > 0) {
          if (fs.existsSync(directoryExcel + fileName)) {
            await fs.unlinkSync(directoryExcel + fileName);
          }
          return res.send({
            result: false,
            error: [{ msg: `Tài khoản Admin STT ${data.join()} đã tồn tại` }],
          });
        }

        const dataAdmin = dataExcel?.map((item) => {
          const password = item["password"];
          const salt = bcrypt.genSaltSync(10);
          const hashPassword = bcrypt.hashSync(password, salt);
          return {
            name: item["name"],
            password: hashPassword,
            phoneNumber: item["phoneNumber"],
            email: item["email"],
            active: item["active"],
            created_at: Date.now(),
          };
        });

        adminService.importExcel(dataAdmin, (err, res_) => {
          if (err) {
            return res.send({
              result: false,
              error: [err],
            });
          }

          return res.send({
            result: true,
            data: {
              msg: constantNotify.ADD_DATA_SUCCESS,
              newData: dataAdmin,
            },
          });
        });
      });
  } catch (error) {
    return res.send({
      result: false,
      error: [{ msg: constantNotify.ERROR }],
    });
  }
};

// Delete Avatar
exports.deleteAvatar = async (req, res) => {
  try {
    const id = req.params.id;
    adminService.deleteAvatar(id, (err, res_) => {
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
  } catch (error) {
    return res.send({
      result: false,
      error: [{ msg: constantNotify.ERROR }],
    });
  }
};

// Update Avatar
exports.updateAvatar = async (req, res) => {
  try {
    const id = req.params.id;
    const fileName = req.file.filename;
    const maxsize = 2 * 1024 * 1024;
    if (req.file.size < maxsize) {
      db.query(
        `SELECT avatar FROM ${tableAdmin} WHERE id = ${id}`,
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
          sharp(req?.file?.path)
            .resize({ width: 150, height: 150 })
            .toFile(`uploads/avatar/thumb/` + fileName, async (err) => {
              if (err) {
                if (fs.existsSync(directoryPath + fileName)) {
                  await fs.unlinkSync(directoryPath + fileName);
                }

                return res.send({
                  result: false,
                  error: [{ msg: constantNotify.ERROR }],
                });
              }
              const admin = new Admin({
                avatar: fileName,
                updated_at: Date.now(),
              });
              delete admin.name;
              delete admin.phoneNumber;
              delete admin.password;
              delete admin.refresh_token;
              delete admin.active;
              delete admin.email;
              delete admin.created_at;

              adminService.updateAvatar(id, admin, async (err, res_) => {
                if (err) {
                  return res.send({
                    result: false,
                    error: [err],
                  });
                }

                if (
                  fs.existsSync(directoryPath + dataRes[0]?.avatar) &&
                  fs.existsSync(directoryThumb + dataRes[0]?.avatar)
                ) {
                  await fs.unlinkSync(directoryPath + dataRes[0]?.avatar);
                  await fs.unlinkSync(directoryThumb + dataRes[0]?.avatar);
                }
                if (
                  fs.existsSync(directoryPath + dataRes[0]?.avatar) &&
                  !fs.existsSync(directoryThumb + dataRes[0]?.avatar)
                ) {
                  await fs.unlinkSync(directoryPath + dataRes[0]?.avatar);
                }

                if (
                  !fs.existsSync(directoryPath + dataRes[0]?.avatar) &&
                  fs.existsSync(directoryThumb + dataRes[0]?.avatar)
                ) {
                  await fs.unlinkSync(directoryPath + dataRes[0]?.avatar);
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
            });
        },
      );
    } else {
      if (
        fs.existsSync(directoryPath + req.file.filename) &&
        fs.existsSync(directoryThumb + req.file.filename)
      ) {
        await fs.unlinkSync(directoryPath + req.file.filename);
        await fs.unlinkSync(directoryThumb + req.file.filename);
      }
      if (
        fs.existsSync(directoryPath + req.file.filename) &&
        !fs.existsSync(directoryThumb + req.file.filename)
      ) {
        await fs.unlinkSync(directoryPath + req.file.filename);
      }

      if (
        !fs.existsSync(directoryPath + req.file.filename) &&
        fs.existsSync(directoryThumb + req.file.filename)
      ) {
        await fs.unlinkSync(directoryPath + req.file.filename);
      }

      return res.send({
        result: false,
        error: [{ msg: constantNotify.VALIDATE_FILE_SIZE }],
      });
    }
  } catch (error) {
    if (
      fs.existsSync(directoryPath + req.file.filename) &&
      fs.existsSync(directoryThumb + req.file.filename)
    ) {
      await fs.unlinkSync(directoryPath + req.file.filename);
      await fs.unlinkSync(directoryThumb + req.file.filename);
    }
    if (
      fs.existsSync(directoryPath + req.file.filename) &&
      !fs.existsSync(directoryThumb + req.file.filename)
    ) {
      await fs.unlinkSync(directoryPath + req.file.filename);
    }

    if (
      !fs.existsSync(directoryPath + req.file.filename) &&
      fs.existsSync(directoryThumb + req.file.filename)
    ) {
      await fs.unlinkSync(directoryPath + req.file.filename);
    }
    return res.send({
      result: false,
      error: [{ msg: constantNotify.ERROR }],
    });
  }
};
