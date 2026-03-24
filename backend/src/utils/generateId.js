const generateId = (tickets) => {
  if (tickets.length === 0) {
    return 1;
  }

  return tickets[tickets.length - 1].id + 1;
};

module.exports = generateId;