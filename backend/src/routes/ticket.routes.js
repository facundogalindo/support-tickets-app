const express = require("express");
const {
  getTickets,
  getTicket,
} = require("../controllers/ticket.controller");

const router = express.Router();

router.get("/", getTickets);
router.get("/:id", getTicket);

module.exports = router;