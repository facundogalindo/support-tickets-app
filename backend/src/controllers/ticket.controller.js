const getTickets = (req, res) => {
  res.json({ message: "Controller de tickets funcionando" });
};

module.exports = {
  getTickets,
};