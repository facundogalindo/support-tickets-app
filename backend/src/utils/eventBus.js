const listeners = {};

const on = (eventName, callback) => {
  if (!listeners[eventName]) {
    listeners[eventName] = [];
  }

  listeners[eventName].push(callback);
};

const emit = async (eventName, payload) => {
  const eventListeners = listeners[eventName] || [];

  for (const listener of eventListeners) {
    await listener(payload);
  }
};

module.exports = {
  on,
  emit,
};