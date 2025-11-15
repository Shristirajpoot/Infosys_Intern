const express = require("express");
const { sendMessage, getMessages} = require("../controllers/message.controller.js");
const protectRoute = require("../middleware/protectRoute.js");

const router = express.Router();

router.post("/send/:id", protectRoute, sendMessage);
// THIS IS THE LINE YOU NEED TO ADD
router.get("/:id", protectRoute, getMessages); 

module.exports = router;
