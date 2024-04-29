const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Event = require("../models/event");
const mongoose = require("mongoose");
const { ObjectId } = require('mongoose').Types;

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

const addEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { eventId } = req.body;
    if (!ObjectId.isValid(eventId)) {
      return res.status(400).send({ msg: "ID de evento no válido" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({ msg: "Usuario no encontrado" });
    }

    if (user.events.includes(eventId)) {
      return res.status(400).send({ msg: "El evento ya está en la lista del usuario" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $push: { events: eventId } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send({ msg: "Usuario no encontrado" });
    }

    const event = await Event.findByIdAndUpdate(
      eventId,
      { $inc: { placesLeft: -1 } }, 
      { new: true }
    );

    if (!event) {
      return res.status(404).send({ msg: "Evento no encontrado" });
    }

    res.status(200).send({ msg: "Evento agregado correctamente al usuario" });
    
  } catch (error) {
    console.error("Error al agregar evento al usuario:", error);
    res.status(500).send({ msg: "Error interno del servidor" });
  }
};

const removeEvent = async (req, res) => {
  try {
    const { userId, eventId } = req.params;
    
    if (!ObjectId.isValid(eventId)) {
      return res.status(400).send({ msg: "ID de evento no válido" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { events: eventId } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send({ msg: "Usuario no encontrado" });
    }

    const event = await Event.findByIdAndUpdate(
      eventId,
      { $inc: { placesLeft: 1 } },
      { new: true }
    );

    if (!event) {
      return res.status(404).send({ msg: "Evento no encontrado" });
    }
    
    res.status(200).send({ msg: "Evento eliminado correctamente del usuario" });
    
  } catch (error) {
    console.error("Error al eliminar evento del usuario:", error);
    res.status(500).send({ msg: "Error interno del servidor" });
  }
};

const getUsersByEventId = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!ObjectId.isValid(eventId)) {
      return res.status(400).send({ msg: "ID de evento no válido" });
    }

    const users = await User.find({ events: eventId });

    res.status(200).send(users);
  } catch (error) {
    console.error("Error al obtener usuarios por ID de evento:", error);
    res.status(500).send({ msg: "Error interno del servidor" });
  }
};


module.exports = {
  getMe,
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  addEvent,
  removeEvent,
  getUsersByEventId,
};
