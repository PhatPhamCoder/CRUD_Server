const db = require("../models/connectDb");
const tableAdmin = "tbl_admin";
const tableRole = "tbl_role";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { signAccesToken, signRefreshToken } = require("../middlewares/init_jwt");
const constantNotify = require("../Utils/contanstNotify");

// register
exports.register = async (data, result) => {
  try {
    const query = `INSERT INTO ${tableAdmin} SET ?`;
    db.query(query, data, (err, dataRes) => {
      if (err) {
        return result({ msg: constantNotify.ERROR }, null);
      }

      return result(null, dataRes.insertId);
    });
  } catch (error) {
    return result({ msg: constantNotify.ERROR }, null);
  }
};

// Login
exports.login = async (email, password, result) => {
  try {
    db.getConnection((err, conn) => {
      if (err) {
        return result({ msg: constantNotify.DB_ERROR }, null);
      }
      conn.query(
        `SELECT id,name,active,password FROM ${tableAdmin} WHERE email = ?`,
        email,
        async (err, dataRes) => {
          try {
            if (err) {
              return result({
                param: email,
                msg: constantNotify.EMAIL_NOTFOUND,
              });
            }
            if (dataRes[0].active !== 1) {
              return result({
                param: "active",
                msg: constantNotify.NOT_ACTIVE,
              });
            }

            const passwordCompare = await bcrypt.compare(
              password,
              dataRes[0].password,
            );

            if (!passwordCompare) {
              return result(
                {
                  param: "password",
                  msg: constantNotify.PASS_FAILD,
                },
                null,
              );
            }

            const data = {
              userId: dataRes[0].id,
              name: dataRes[0].name,
            };

            /**Create AccessToken and RefreshToken */
            const _token = await signAccesToken(data);
            const _refreshToken = await signRefreshToken(data);

            /**update RefreshToken at DB */
            const updateToken = `UPDATE ${tableAdmin} SET refresh_token = ? WHERE id = ?`;
            conn.query(
              updateToken,
              [_refreshToken, dataRes[0].id],
              (err, dataRes_) => {
                if (err) {
                  return result({ msg: constantNotify.ERROR }, null);
                }
                return result(null, {
                  userId: dataRes[0].id,
                  accessToken: _token,
                  refreshToken: _refreshToken,
                });
              },
            );
          } catch (error) {
            return result({ msg: constantNotify.ERROR }, null);
          }
        },
      );
      conn.release();
    });
  } catch (error) {
    return result({ msg: constantNotify.ERROR }, null);
  }
};

// getAll
exports.getAll = async (offset, limit, keyword, result) => {
  try {
    const orderBy = `ORDER BY id DESC LIMIT ${offset},${limit}`;
    const selectCount = `SELECT COUNT(*) FROM ${tableAdmin}`;
    const selectData = `${tableAdmin}.id,${tableAdmin}.name,${tableAdmin}.email,${tableAdmin}.phoneNumber,${tableAdmin}.active,${tableAdmin}.created_at`;
    let query = `SELECT ${selectData},(${selectCount}) as total FROM ${tableAdmin} ${orderBy}`;

    if (keyword) {
      const where = `WHERE ${tableAdmin}.phoneNumber LIKE "%${keyword}%" OR ${tableAdmin}.name LIKE "%${keyword}%"`;
      query = `SELECT ${selectData},(${selectCount} ${where}) as total FROM ${tableAdmin} ${where} ORDER BY ${tableAdmin}.id DESC LIMIT ${offset},${limit}`;
    }

    db.query(query, (err, dataRes) => {
      if (err) {
        return result({ msg: constantNotify.ERROR }, null);
      }

      return result(null, dataRes);
    });
  } catch (error) {
    return result({ msg: constantNotify.ERROR }, null);
  }
};

// GetById
exports.getById = async (id, result) => {
  try {
    const query = `SELECT id,email,name,phoneNumber,active FROM ${tableAdmin} WHERE id = ?`;
    db.query(query, id, (err, dataRes) => {
      if (err) {
        return result({ msg: constantNotify.ERROR }, null);
      }

      return result(null, dataRes);
    });
  } catch (error) {
    return result({ msg: constantNotify.ERROR }, null);
  }
};

// Change password
exports.changePassword = async (id, data, result) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(data, salt);

    const query = `UPDATE ${tableAdmin} SET password = ? WHERE id = ?`;
    db.query(query, [hashPass, id], (err, dataRes) => {
      if (err) {
        return result({ msg: constantNotify.ERROR }, null);
      }

      return result(null, dataRes);
    });
  } catch (error) {
    return result({ msg: constantNotify.ERROR }, null);
  }
};

// Update
exports.update = async (id, data, result) => {
  try {
    const query = `UPDATE ${tableAdmin} SET name=?,email=?,phoneNumber=?,updated_at=? WHERE id =?`;
    db.query(
      query,
      [data.name, data.email, data.phoneNumber, data.updated_at, id],
      (err, dataRes) => {
        if (err) {
          return result({ msg: constantNotify.ERROR }, null);
        }

        if (dataRes.affectedRows === 0) {
          return result({ msg: `ID ${constantNotify.NOT_EXITS}` }, null);
        }

        return result(null, dataRes);
      },
    );
  } catch (error) {
    return result({ msg: constantNotify.ERROR }, null);
  }
};

// Delete
exports.delete = async (id, result) => {
  try {
    const query = `DELETE FROM ${tableAdmin} WHERE id = ?`;

    db.query(query, id, (err, dataRes) => {
      if (err) {
        return result({ msg: constantNotify.ERROR }, null);
      }

      return result(null, dataRes);
    });
  } catch (error) {
    return result({ msg: constantNotify.ERROR }, null);
  }
};

// acitve
exports.active = async (id, data, result) => {
  try {
    const query = `UPDATE ${tableAdmin} SET active = ${data} WHERE id = ${id}`;
    db.query(query, (err, dataRes) => {
      if (err) {
        return result({ msg: constantNotify.ERROR }, null);
      }
      if (dataRes.affectedRows === 0) {
        return result({ msg: `ID ${constantNotify.NOT_EXITS}` }, null);
      }
      return result(null, dataRes);
    });
  } catch (error) {
    return result({ msg: constantNotify.ERROR }, null);
  }
};

// refreshToken
exports.refreshToken = async (userId, resfreshToken, result) => {
  try {
    db.getConnection((err, conn) => {
      if (err) {
        return result({ msg: constantNotify.DB_ERROR }, null);
      }
      const query = `SELECT * FROM tbl_admin WHERE refresh_token LIKE "%${resfreshToken}%" AND id = ${userId}`;
      conn.query(query, async (err, dataRes) => {
        if (err) {
          result({ msg: constantNotify.ERROR }, null);
        }
        if (dataRes.length === 0) {
          const query = `UPDATE ${tableAdmin} SET refresh_token=0 WHERE id = ${userId}`;
          conn.query(query, async (err, dataRes_) => {
            if (err) {
              result({ msg: constantNotify.ERROR }, null);
              return;
            }
          });
        }
        if (dataRes.length > 0) {
          await jwt.sign(
            resfreshToken,
            constantNotify.REFRESH_TOKEN,
            async (err, dataVerify) => {
              if (err) {
                result({ msg: constantNotify.ERROR }, null);
              }
              const accessToken = await jwt.sign(
                { userId },
                constantNotify.ACCESS_TOKEN,
                {
                  expiresIn: constantNotify.TOKEN_TIME_LIFE,
                },
              );

              const refreshToken = await jwt.sign(
                { userId },
                constantNotify.REFRESH_TOKEN,
                { expiresIn: constantNotify.REFRESH_TOKEN_TIME_LIFE },
              );

              const query = `UPDATE tbl_admin SET refresh_token = ? WHERE id=?`;
              conn.query(query, [refreshToken, userId], (err, dataRes__) => {
                if (err) {
                  result({ msg: constantNotify.ERROR }, null);
                }
              });
              result(null, { accessToken, refreshToken });
            },
          );
        }
      });
      conn.release();
    });
  } catch (error) {
    result({ msg: constantNotify.ERROR }, null);
  }
};
