require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const multer = require("multer");
const morgan = require("morgan");
const { GridFsStorage } = require("multer-gridfs-storage");
const crypto = require("crypto");
const path = require("path");
const Project = require("./models/Project");

const app = express();
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

app.use(express.json());
app.use(morgan("tiny"));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cors());

console.log(process.env.NODE_ENV);

mongoose.connect(MONGO_URI, {
  socketTimeoutMS: 30000,
  connectTimeoutMS: 30000,
});

const conn = mongoose.connection;
console.log("Connected to MongoDB");

let gfs;

conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("projects");
});

const storage = new GridFsStorage({
  url: MONGO_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = file.originalname;
      const fileInfo = {
        filename: filename,
        bucketName: "projects",
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer({ storage });

app.post("/project/upload", upload.single("file"), async (req, res) => {
  const { title, desc, progress } = req.body;
  const { file } = req;

  console.log(file);

  if (!title || !desc || !progress)
    return res.status(400).json({ msg: "Provide project details" });

  const filename =
    crypto.randomBytes(16).toString("hex") + path.extname(file.originalname);

  const newProject = new Project({
    title,
    desc,
    progress,
    image: {
      filename,
      contentType: file.mimetype,
      metadata: file.id,
    },
  });

  await newProject.save();

  return res.status(201).json({ msg: "Project is saved" });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
