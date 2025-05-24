// Mock implementation of Node's net module
const EventEmitter = require('events');

class Socket extends EventEmitter {
  constructor() {
    super();
    this.connecting = false;
    this.destroyed = false;
  }

  connect() {
    this.connecting = true;
    return this;
  }

  write() {
    return true;
  }

  end() {
    this.destroyed = true;
    return this;
  }

  destroy() {
    this.destroyed = true;
    return this;
  }
}

module.exports = {
  Socket,
  createConnection: () => new Socket(),
  createServer: () => new EventEmitter(),
  connect: () => new Socket(),
}; 