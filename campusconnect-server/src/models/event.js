const mongoose = require("mongoose");

const EventSchema = mongoose.Schema({
  evenTitle: String,
  eventSubtitle: String,
  eventDescription: String,
  date_at: Date,
  date: {
    month: String,
    day: String,
  },
  category: String,
  place: String,
  active: Boolean,
  image: String,
  capacity: Number,
});

module.exports = mongoose.model("Event", EventSchema);
