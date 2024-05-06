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
  visibility: {
    publico: Boolean,
    uam: Boolean,
    posgrados: Boolean,
    pregrados: Boolean,
    ingenieria: Boolean,
    salud: Boolean,
    estudiosSociales: Boolean
  },
  placesLeft: Number,
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    rating: { type: Number, min: 1, max: 5 }
  }]
});

module.exports = mongoose.model("Event", EventSchema);
