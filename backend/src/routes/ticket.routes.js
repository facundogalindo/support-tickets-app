const express = require("express");
const {
  getTickets,
  getTicket,
  createTicket,
  updateTicketStatusController,
  deleteTicketController,
} = require("../controllers/ticket.controller");
const router = express.Router();

router.get("/", getTickets);
router.get("/:id", getTicket);
router.post("/", createTicket);
router.patch("/:id/status", updateTicketStatusController);
router.delete("/:id", deleteTicketController);
module.exports = router;