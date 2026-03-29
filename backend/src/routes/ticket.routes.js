const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  getTicket,
  createTicket,
  deleteTicketController,
  getMyTicketsController,
  getAllTicketsController,
  assignTicketController,
  addTicketMessageController,
  getTicketMessagesController,
  closeTicketController,
} = require("../controllers/ticket.controller");

const router = express.Router();

router.get("/my", authMiddleware, roleMiddleware("user"), getMyTicketsController);
router.get("/", authMiddleware, roleMiddleware("agent"), getAllTicketsController);
router.get("/:id", authMiddleware, getTicket);

router.post("/", authMiddleware, roleMiddleware("user"), createTicket);


router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("agent"),
  deleteTicketController
);

router.patch(
  "/:id/assign",
  authMiddleware,
  roleMiddleware("agent"),
  assignTicketController
);

router.get(
  "/:id/messages",
  authMiddleware,
  getTicketMessagesController
);

router.post(
  "/:id/messages",
  authMiddleware,
  addTicketMessageController
);


router.patch("/:id/close", authMiddleware, closeTicketController);

module.exports = router;