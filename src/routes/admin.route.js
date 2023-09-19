const router = require("express").Router();
const { body } = require("express-validator");
const adminControler = require("../controllers/admin.controller");
const constantNotify = require("../Utils/contanstNotify");
const { verifyToken } = require("../middlewares/init_jwt");
const uploadExcel = require("../middlewares/UploadExcel");
const uploadAvatar = require("../middlewares/uploadAvatar");

module.exports = (app) => {
  router.post(
    "/register",
    uploadAvatar.single("avatar"),
    [
      body("name", constantNotify.NOT_EMPTY).notEmpty(),
      body("email", constantNotify.NOT_EMPTY).notEmpty(),
      body("password", constantNotify.NOT_EMPTY).notEmpty(),
      body("password", constantNotify.VALIDATE_PASSWORD).isLength({ min: 8 }),
      body("email", constantNotify.NOT_EMPTY).notEmpty(),
    ],
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
  router.put(
    "/change-password/:id",
    verifyToken,
    adminControler.changePassword,
  );
  router.post("/refresh-token", adminControler.refreshToken);
  router.get("/export-excel", adminControler.exportExcel);
  router.post(
    "/import-excel",
    uploadExcel.single("import-excel"),
    adminControler.importExcel,
  );

  router.put(
    "/update-avatar/:id",
    uploadAvatar.single("avatar"),
    adminControler.updateAvatar,
  );

  router.put("/delete-avatar/:id", verifyToken, adminControler.deleteAvatar);
  router.post("/delete-select", verifyToken, adminControler.deleteSelect);

  app.use("/api/v1/admin", router);
};
