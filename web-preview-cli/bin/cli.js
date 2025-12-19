#!/usr/bin/env node

const { program } = require("commander");
const { preview, previewUrl } = require("../lib/preview");
const {
  getConfig,
  setConfig,
  showConfig,
  deleteConfig,
} = require("../lib/config");
const chalk = require("chalk");

// Activity 创建页面的默认 URL
const ACTIVITY_CREATE_URL =
  "https://github.com/Leiloloaa/activity-cli/blob/main/create-page/index.html";

program
  .name("actweb")
  .description("Activity Web CLI - 从 git 仓库或 URL 下载网页并启动本地服务器预览")
  .version("1.0.0");

// 配置命令
program
  .command("config")
  .description("设置或查看配置")
  .option("-s, --set <repo>", "设置默认仓库地址")
  .option("-b, --branch <branch>", "设置默认分支")
  .option("-v, --view", "查看当前配置")
  .option("-d, --delete", "删除配置")
  .action(async (options) => {
    if (options.set) {
      const success = await setConfig({
        repository: options.set,
        branch: options.branch || "main",
      });
      if (success) {
        console.log(chalk.green("\n✓ 配置已保存！"));
        await showConfig();
      }
    } else if (options.view) {
      await showConfig();
    } else if (options.delete) {
      await deleteConfig();
    } else {
      await showConfig();
    }
  });

// 启动预览命令（默认命令）
program
  .command("start", { isDefault: true })
  .description("下载网页并启动预览服务器")
  .option("-r, --repo <repo>", "Git 仓库地址")
  .option("-b, --branch <branch>", "分支名 (默认: main)")
  .option("-p, --port <port>", "服务器端口 (默认: 3000)", "3000")
  .option("--no-open", "不自动打开浏览器")
  .action(async (options) => {
    try {
      // 获取配置
      const config = await getConfig();

      // 确定仓库地址
      let repository = options.repo;
      if (!repository) {
        if (config && config.repository) {
          repository = config.repository;
        } else {
          console.error(chalk.red("错误: 未指定仓库地址"));
          console.log(
            chalk.yellow(
              '提示: 使用 "actweb config -s <仓库地址>" 设置默认仓库，或使用 "-r" 参数指定'
            )
          );
          process.exit(1);
        }
      }

      // 确定分支
      let branch = options.branch;
      if (!branch) {
        branch = config?.branch || "main";
      }

      await preview({
        repository,
        branch,
        port: parseInt(options.port, 10),
        autoOpen: options.open,
      });
    } catch (error) {
      console.error(chalk.red("错误:"), error.message);
      process.exit(1);
    }
  });

// 创建活动命令 - 下载远程 HTML 文件并运行
program
  .command("create")
  .description("启动 Activity 创建工具（从 GitHub 下载 HTML 并运行）")
  .option("-u, --url <url>", "HTML 文件的 URL (默认: activity-cli 创建页面)")
  .option("-p, --port <port>", "服务器端口 (默认: 3000)", "3000")
  .option("--no-open", "不自动打开浏览器")
  .action(async (options) => {
    try {
      const url = options.url || ACTIVITY_CREATE_URL;

      console.log(chalk.cyan("\n📦 Activity 创建工具"));
      console.log(chalk.gray("将从远程下载 HTML 文件到本地临时目录运行"));
      console.log(chalk.gray("退出时会自动清理临时文件\n"));

      await previewUrl({
        url,
        port: parseInt(options.port, 10),
        autoOpen: options.open,
      });
    } catch (error) {
      console.error(chalk.red("错误:"), error.message);
      process.exit(1);
    }
  });

// URL 预览命令 - 通用的 URL 下载预览
program
  .command("url <htmlUrl>")
  .description("从 URL 下载单个 HTML 文件并预览")
  .option("-p, --port <port>", "服务器端口 (默认: 3000)", "3000")
  .option("--no-open", "不自动打开浏览器")
  .action(async (htmlUrl, options) => {
    try {
      await previewUrl({
        url: htmlUrl,
        port: parseInt(options.port, 10),
        autoOpen: options.open,
      });
    } catch (error) {
      console.error(chalk.red("错误:"), error.message);
      process.exit(1);
    }
  });

program.parse();
