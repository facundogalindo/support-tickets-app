const express = require("express");
const cors = require("cors");
const ticketRoutes = require("./routes/ticket.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API nueva");
});

app.use("/tickets", ticketRoutes);

module.exports = app;