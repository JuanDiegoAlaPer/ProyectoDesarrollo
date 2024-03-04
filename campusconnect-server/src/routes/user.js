const express = require("express");
const multiparty = require("connect-multiparty");
const UserController = require("../controllers/user");
const middleware_authentication = require("../middlewares/authenticated");

const fs = require("fs");

const uploadDir = "./uploads/users/avatar";

// Verificar si el directorio existe, si no, crearlo
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const md_upload = multiparty({ uploadDir: "./uploads/users/avatar" });
const api = express.Router();

/* Sólo los usuarios registrados pueden acceder a las rutas */
api.get("/me", [middleware_authentication.ensureAuth], UserController.getMe);
api.get("/", [middleware_authentication.ensureAuth], UserController.getUsers);
api.get("/:id", [middleware_authentication.ensureAuth], UserController.getUser);
api.post(
  "/user",
  [middleware_authentication.ensureAuth, md_upload],
  UserController.createUser
);
api.patch(
  "/:id",
  [middleware_authentication.ensureAuth, md_upload],
  UserController.updateUser
);
api.delete(
  "/:id",
  [middleware_authentication.ensureAuth],
  UserController.deleteUser
);

module.exports = api;
