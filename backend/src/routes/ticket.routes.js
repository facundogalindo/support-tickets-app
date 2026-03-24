const express = require("express");
const {
  getTickets,
  getTicket,
  createTicket,
} = require("../controllers/ticket.controller");

const router = express.Router();

router.get("/", getTickets);
router.get("/:id", getTicket);
router.post("/", createTicket);

module.exports = router;