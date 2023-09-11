const router = require("express").Router();
const { body } = require("express-validator");
const adminControler = require("../controllers/admin.controller");
const constantNotify = require("../Utils/contanstNotify");
const { verifyToken } = require("../middlewares/init_jwt");

module.exports = (app) => {
  router.post(
    "/register",
    [
      body("name", constantNotify.NOT_EMPTY).notEmpty(),
      body("email", constantNotify.NOT_EMPTY).notEmpty(),
      body("password", constantNotify.NOT_EMPTY).notEmpty(),
      body("password", constantNotify.VALIDATE_PASSWORD).isLength({ min: 8 }),
      body("email", constantNotify.NOT_EMPTY).notEmpty(),
    ],
    verifyToken,
    adminControler.register,
  );
  router.post(
    "/login",
    [
      body("email", constantNotify.EMAIL_NOTEMPTY).notEmpty(),
      body("password", constantNotify.PASSWORD_NOTEMPTY).notEmpty(),
      body("password", constantNotify.VALIDATE_PASSWORD).isLength({ min: 8 }),
    ],
    adminControler.login,
  );
  router.get("/getall", verifyToken, adminControler.getAll);
  router.get("/getbyid/:id", verifyToken, adminControler.getById);
  router.put("/update/:id", verifyToken, adminControler.update);
  router.delete("/delete/:id", verifyToken, adminControler.delete);
  router.put("/active/:id", verifyToken, adminControler.active);
  router.put("/change-password/:id", adminControler.changePassword);

  app.use("/api/v1/admin", router);
};
