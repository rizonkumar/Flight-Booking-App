const Queue = require("bull");
const ServerConfig = require("./server-config");

const emailQueue = new Queue("email-queue", {
  redis: {
    host: ServerConfig.REDIS_HOST,
    port: ServerConfig.REDIS_PORT,
  },
});

module.exports = emailQueue;
