const express = require("express");
const EventController = require("../controllers/event");
const middleware_authentication = require("../middlewares/authenticated");

const api = express.Router();

api.get("/:id", EventController.getEvent);
api.get("/", EventController.getEvents);
api.post(
  "/event",
  [middleware_authentication.ensureAuth],
  EventController.createEvent
);
api.patch(
  "/:id",
  [middleware_authentication.ensureAuth],
  EventController.updateEvent
);
api.delete(
  "/:id",
  [middleware_authentication.ensureAuth],
  EventController.deleteEvent
);

module.exports = api;
