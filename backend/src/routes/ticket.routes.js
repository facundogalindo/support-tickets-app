const express = require("express");
const {
  getTickets,
  getTicket,
  createTicket,
  updateTicketStatusController,
} = require("../controllers/ticket.controller");
const router = express.Router();

router.get("/", getTickets);
router.get("/:id", getTicket);
router.post("/", createTicket);
router.patch("/:id/status", updateTicketStatusController);

module.exports = router;