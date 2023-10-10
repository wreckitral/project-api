const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  progress: [
    {
      type: String,
      default: "pending",
    },
  ],
  image: {
    filename: String,
    contentType: String,
    metadata: mongoose.Schema.Types.ObjectId
  }
}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
