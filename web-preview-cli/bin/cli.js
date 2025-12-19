#!/usr/bin/env node

const { program } = require("commander");
const { preview } = require("../lib/preview");
const {
  getConfig,
  setConfig,
  showConfig,
  deleteConfig,
} = require("../lib/config");
const chalk = require("chalk");

program
  .name("webp")
  .description("从 git 仓库下载网页并启动本地服务器预览")
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
              '提示: 使用 "webp config -s <仓库地址>" 设置默认仓库，或使用 "-r" 参数指定'
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

program.parse();
