const {
  preview,
  previewUrl,
  downloadFile,
  convertToRawUrl,
} = require("./lib/preview");
const {
  getConfig,
  setConfig,
  showConfig,
  deleteConfig,
} = require("./lib/config");
const {
  createServer,
  preCacheTemplates,
  clearCache,
  getCacheInfo,
  CACHE_DIR,
  VERSION_FILE,
  CREATE_PAGE_CACHE_FILE,
} = require("./lib/server");

module.exports = {
  // 预览功能
  preview,
  previewUrl,
  downloadFile,
  convertToRawUrl,

  // 配置功能
  getConfig,
  setConfig,
  showConfig,
  deleteConfig,

  // 服务器功能
  createServer,

  // 缓存功能
  preCacheTemplates,
  clearCache,
  getCacheInfo,
  CACHE_DIR,
  VERSION_FILE,
  CREATE_PAGE_CACHE_FILE,
};
