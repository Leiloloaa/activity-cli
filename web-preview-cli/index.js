const { preview } = require("./lib/preview");
const {
  getConfig,
  setConfig,
  showConfig,
  deleteConfig,
} = require("./lib/config");
const { createServer } = require("./lib/server");

module.exports = {
  preview,
  getConfig,
  setConfig,
  showConfig,
  deleteConfig,
  createServer,
};
