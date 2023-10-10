const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");

router.get("/projects", projectController.getAllProject);

module.exports = router;