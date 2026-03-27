const express = require("express");
const cors = require("cors");
const ticketRoutes = require("./routes/ticket.routes");
const authRoutes = require("./routes/auth.routes");
const app = express();
const authMiddleware = require("./middlewares/auth.middleware");
const roleMiddleware = require("./middlewares/role.middleware");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API nueva");
});
app.use("/auth", authRoutes);
app.use("/tickets", ticketRoutes);

module.exports = app;

app.get("/profile", authMiddleware, (req, res) => {
  res.json(req.user);
});
app.get("/agent-only", authMiddleware, roleMiddleware("agent"), (req, res) => {
  res.json({ message: "Ruta solo para agentes" });
});