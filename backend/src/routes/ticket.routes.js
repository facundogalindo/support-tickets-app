const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  getTicket,
  createTicket,
  updateTicketStatusController,
  deleteTicketController,
  getMyTicketsController,
  getAllTicketsController,
  assignTicketController,
} = require("../controllers/ticket.controller");

const router = express.Router();

router.get("/my", authMiddleware, roleMiddleware("user"), getMyTicketsController);
router.get("/", authMiddleware, roleMiddleware("agent"), getAllTicketsController);
router.get("/:id", authMiddleware, getTicket);

router.post("/", authMiddleware, roleMiddleware("user"), createTicket);
router.patch("/:id/status", authMiddleware, roleMiddleware("agent"), updateTicketStatusController);
router.delete("/:id", authMiddleware, roleMiddleware("agent"), deleteTicketController);

router.patch("/:id/assign",authMiddleware,roleMiddleware("agent"),assignTicketController);

module.exports = router;