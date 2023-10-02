const mongoose = require("mongoose");
const bookSchema = mongoose.Schema(
  {
    name: { type: String },
    price: { type: Number },
    title: { type: String },
    status: { type: String },
    review: { type: String },
    author: { type: String },
    ISBN: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
