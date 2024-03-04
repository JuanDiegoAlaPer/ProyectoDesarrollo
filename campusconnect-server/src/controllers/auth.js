const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("../utils/jwt");
const axios = require("axios");

const register = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  try {
    // Validar campos requeridos
    if (!email) {
      return res.status(400).send({ msg: "El email es requerido" });
    }
    if (!password) {
      return res.status(400).send({ msg: "La contraseña es requerida" });
    }

    // Generar hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    // Crear un nuevo usuario con los datos obtenidos de la API y la información del formulario
    const newUser = new User({
      firstname,
      lastname,
      email: email.toLowerCase(),
      role: "user",
      active: true,
      password: hashPassword,
    });

    // Guardar el nuevo usuario en la base de datos
    const userStorage = await newUser.save();
    res.status(201).send(userStorage);
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    res.status(400).send({ msg: "Error al crear el usuario" });
  }
};
/* Función que permite iniciar sesión */

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      throw new Error("El email y la contraseña son obligatorios");
    }
    const emailLowerCase = email.toLowerCase();
    const userStore = await User.findOne({ email: emailLowerCase }).exec();
    if (!userStore) {
      throw new Error("El usuario no existe");
    }
    const check = await bcrypt.compare(password, userStore.password);
    if (!check) {
      throw new Error("Contraseña incorrecta");
    }
    if (!userStore.active) {
      throw new Error("Usuario no autorizado o no activo");
    }
    res.status(200).send({
      access: jwt.createAccessToken(userStore),
      refresh: jwt.createRefreshToken(userStore),
    });
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).send({ msg: "Token requerido" });
    }
    const { user_id } = jwt.decoded(token);
    // Buscar el usuario utilizando una promesa
    const userStorage = await User.findOne({ _id: user_id });
    // Generar un nuevo token de acceso
    const accessToken = jwt.createAccessToken(userStorage);
    // Enviar la respuesta
    return res.status(200).send({ accessToken });
  } catch (error) {
    console.error("Error del servidor:", error);
    return res.status(500).send({ msg: "Error del servidor" });
  }
};

module.exports = {
  register,
  login,
  refreshAccessToken,
};
