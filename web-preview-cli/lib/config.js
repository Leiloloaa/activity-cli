const fs = require("fs");
const path = require("path");
const os = require("os");
const chalk = require("chalk");

// 配置文件路径
const CONFIG_FILE = path.join(os.homedir(), ".web-preview-cli-config.json");

/**
 * 获取配置
 * @returns {Promise<object|null>}
 */
async function getConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf8");
      return JSON.parse(content);
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * 设置配置
 * @param {object} config
 * @returns {Promise<boolean>}
 */
async function setConfig(config) {
  try {
    const existingConfig = (await getConfig()) || {};
    const newConfig = { ...existingConfig, ...config };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error(chalk.red("保存配置失败:"), error.message);
    return false;
  }
}

/**
 * 显示配置
 */
async function showConfig() {
  const config = await getConfig();

  if (!config) {
    console.log(chalk.yellow("\n未找到配置文件"));
    console.log(chalk.gray('使用 "actweb config -s <仓库地址>" 设置默认仓库'));
    return;
  }

  console.log(chalk.cyan("\n当前配置:"));
  console.log(chalk.gray("─".repeat(40)));
  console.log(`  仓库地址: ${chalk.green(config.repository || "未设置")}`);
  console.log(`  默认分支: ${chalk.green(config.branch || "main")}`);
  console.log(chalk.gray("─".repeat(40)));
  console.log(chalk.gray(`配置文件位置: ${CONFIG_FILE}`));
}

/**
 * 删除配置
 */
async function deleteConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
      console.log(chalk.green("✓ 配置已删除"));
    } else {
      console.log(chalk.yellow("配置文件不存在"));
    }
  } catch (error) {
    console.error(chalk.red("删除配置失败:"), error.message);
  }
}

module.exports = {
  getConfig,
  setConfig,
  showConfig,
  deleteConfig,
  CONFIG_FILE,
};
