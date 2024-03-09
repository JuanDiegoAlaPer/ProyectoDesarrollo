const express = require("express");
const AuthController = require("../controllers/auth");

const api = express.Router();


api.post("/register", AuthController.register);
api.post("/login", AuthController.login);
api.post("/refresh_access_token", AuthController.refreshAccessToken);
<<<<<<< HEAD
api.get("/role", AuthController.getRol);
=======
/* api.get("/:departamento", AuthController.consultaDepartamento); */

>>>>>>> 9411a55e6881b74c8a26f023a0c3cc39d0540ab2

module.exports = api;
