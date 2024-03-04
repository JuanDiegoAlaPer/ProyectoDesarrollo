const bcrypt = require("bcryptjs");
const User = require("../models/user");

const getMe = async (req, res) => {
  try {
    const { user_id } = req.user;
    const response = await User.findById(user_id);
    if (!response) {
      return res.status(400).send({ msg: "No se ha encontrado usuario" });
    }
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
};

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await User.findById(id);
    if (!response) {
      return res.status(400).send({ msg: "No se ha encontrado usuario" });
    }
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
};

const getUsers = async (req, res) => {
  try {
    const { active } = req.query;
    let response = null;

    if (active === undefined) {
      response = await User.find();
    } else {
      response = await User.find({ active });
    }
    res.status(200).send(response);
  } catch (error) {
    res.status(500).send({ msg: "Error del servidor" });
  }
};

const createUser = async (req, res) => {
  try {
    const userData = req.body;
    const user = new User({ ...userData, active: false });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    user.password = hashedPassword;

    const userStored = await user.save();
    res.status(201).send(userStored);
  } catch (error) {
    res.status(400).send({ msg: "Error al crear el usuario" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userData = req.body;

    if (userData.password) {
      const salt = bcrypt.genSaltSync(10);
      const hashPassword = bcrypt.hashSync(userData.password, salt);
      userData.password = hashPassword;
    } else {
      delete userData.password;
    }

    

    await User.findByIdAndUpdate({ _id: id }, userData);

    res.status(200).send({ msg: "Actualización correcta" });
  } catch (error) {
    res.status(400).send({ msg: "Error al actualizar el usuario" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).send({ msg: "Usuario eliminado" });
  } catch (error) {
    res.status(400).send({ msg: "Error al eliminar el usuario" });
  }
};


module.exports = {
  getMe,
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
