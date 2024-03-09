const bcrypt = require("bcryptjs");
const Event = require("../models/event");

const getEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ msg: "Evento no encontrado" });
    }
    res.status(200).json(event);
  } catch (error) {
    console.error("Error al obtener evento:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    console.error("Error al obtener eventos:", error);
    res.status(500).json({ msg: "Error del servidor" });
  }
};

const createEvent = async (req, res) => {
  try {
    const eventData = req.body;
    const event = new Event({ ...eventData, active: true });

    const eventStored = await event.save();
    res.status(201).json(eventStored);
  } catch (error) {
    console.error("Error al crear evento:", error);
    res.status(400).json({ msg: "Error al crear el evento" });
  }
};

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const eventData = req.body;

    await Event.findByIdAndUpdate(id, eventData);

    res.status(200).json({ msg: "Evento actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar evento:", error);
    res.status(400).json({ msg: "Error al actualizar el evento" });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.status(200).json({ msg: "Evento eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar evento:", error);
    res.status(400).json({ msg: "Error al eliminar el evento" });
  }
};

module.exports = {
  getEvent,
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
};
