
const express = require("express");
const { createTask, getTasks, modifyTasks, deleteTasks } = require("../controllers/task.controller");

const router = express.Router();

router.get("/", getTasks )
router.post("/", createTask )
router.put("/:id", modifyTasks )
router.delete("/:id", deleteTasks)

module.exports = router