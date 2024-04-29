const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  phone: String,
  role: String,
  active: Boolean,
  program: String,
  faculty: String,
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  Qualified: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
});

module.exports = mongoose.model("User", UserSchema);
