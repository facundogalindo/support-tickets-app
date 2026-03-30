const express = require("express");
const cors = require("cors");
require("./observers/ticketStatusEmailObserver");
const ticketRoutes = require("./routes/ticket.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API nueva");
});

app.use("/auth", authRoutes);
app.use("/tickets", ticketRoutes);


module.exports = app;