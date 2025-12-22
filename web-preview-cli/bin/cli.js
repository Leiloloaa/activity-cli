#!/usr/bin/env node

const { program } = require("commander");
const { preview, previewUrl } = require("../lib/preview");
const {
  getConfig,
  setConfig,
  showConfig,
  deleteConfig,
} = require("../lib/config");
const { preCacheTemplates, CACHE_DIR } = require("../lib/server");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const os = require("os");
const https = require("https");
const { exec } = require("child_process");
const { promisify } = require("util");

const execPromise = promisify(exec);

// GitHub 仓库配置
const GITHUB_REPO = "Leiloloaa/activity-cli";
const GITHUB_BRANCH = "main";
const CLI_DIR_NAME = "web-preview-cli";

// Activity 创建页面的默认 URL
const ACTIVITY_CREATE_URL =
  "https://github.com/Leiloloaa/activity-cli/blob/main/create-page/index.html";

// 从 package.json 读取版本号
const packageJson = require("../package.json");

program
  .name("act")
  .description(
    "Activity Web CLI - 从 git 仓库或 URL 下载网页并启动本地服务器预览"
  )
  .version(packageJson.version);

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
              '提示: 使用 "act config -s <仓库地址>" 设置默认仓库，或使用 "-r" 参数指定'
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
  .description("启动 Activity 创建工具")
  .option("-u, --url <url>", "HTML 文件的 URL (默认: activity-cli 创建页面)")
  .option("-p, --port <port>", "服务器端口 (默认: 3000)", "3000")
  .option("--no-open", "不自动打开浏览器")
  .action(async (options) => {
    const { preCacheTemplates } = require("../lib/server");
    try {
      const url = options.url || ACTIVITY_CREATE_URL;

      console.log(chalk.cyan("\n📦 Activity 创建工具"));

      // 预缓存模板和 HTML 文件
      await preCacheTemplates();

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

// 缓存管理命令
program
  .command("cache")
  .description("管理模板缓存")
  .option("-r, --refresh", "强制刷新缓存（从远程重新下载）")
  .option("-c, --clear", "清除缓存")
  .option("-v, --view", "查看缓存状态")
  .action(async (options) => {
    if (options.clear) {
      if (fs.existsSync(CACHE_DIR)) {
        fs.rmSync(CACHE_DIR, { recursive: true, force: true });
        console.log(chalk.green("✓ 缓存已清除"));
      } else {
        console.log(chalk.gray("缓存目录不存在"));
      }
    } else if (options.refresh) {
      console.log(chalk.cyan("正在强制刷新缓存..."));
      await preCacheTemplates(true); // 传入 true 强制刷新
    } else {
      // 默认查看缓存状态
      console.log(chalk.cyan("\n📁 缓存目录:"), CACHE_DIR);

      // 显示版本信息
      const versionFile = require("path").join(CACHE_DIR, ".version");
      if (fs.existsSync(versionFile)) {
        const version = fs.readFileSync(versionFile, "utf8").trim();
        console.log(chalk.gray(`📌 缓存版本: ${version.substring(0, 7)}`));
      }

      if (fs.existsSync(CACHE_DIR)) {
        const items = fs.readdirSync(CACHE_DIR);
        const projects = items.filter((p) => {
          const projectDir = require("path").join(CACHE_DIR, p);
          return fs.statSync(projectDir).isDirectory();
        });

        if (projects.length > 0) {
          console.log(chalk.green("✓ 已缓存的项目:"));
          projects.forEach((p) => {
            const projectDir = require("path").join(CACHE_DIR, p);
            const templates = fs.readdirSync(projectDir);
            console.log(chalk.gray(`  ${p}: ${templates.join(", ")}`));
          });
        } else {
          console.log(chalk.yellow("缓存为空"));
        }
      } else {
        console.log(
          chalk.yellow("缓存目录不存在，运行 'act create' 时会自动创建")
        );
      }
      console.log(chalk.gray("\n提示: 使用 'act cache -r' 强制刷新缓存"));
    }
  });

// 自更新命令
program
  .command("update")
  .alias("u")
  .description("从 GitHub 下载最新源码并更新 CLI")
  .option("-f, --force", "强制更新，不检查版本")
  .action(async (options) => {
    try {
      console.log(chalk.cyan("\n🔄 检查更新...\n"));

      // 创建临时目录
      const tempDir = path.join(os.tmpdir(), `act-update-${Date.now()}`);
      const cliTempDir = path.join(tempDir, CLI_DIR_NAME);

      console.log(chalk.gray(`临时目录: ${tempDir}`));

      // 确保临时目录存在
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // 下载 web-preview-cli 目录
      console.log(chalk.cyan("📥 下载最新源码..."));
      await downloadGitHubDirForUpdate(`${CLI_DIR_NAME}`, cliTempDir);
      console.log(chalk.green("✓ 源码下载完成"));

      // 在临时目录中执行 npm pack
      console.log(chalk.cyan("📦 打包中..."));
      const { stdout: packOutput } = await execPromise("npm pack", {
        cwd: cliTempDir,
      });
      const tgzFile = packOutput.trim().split("\n").pop();
      const tgzPath = path.join(cliTempDir, tgzFile);
      console.log(chalk.green(`✓ 打包完成: ${tgzFile}`));

      // 全局安装
      console.log(chalk.cyan("🚀 安装更新..."));
      try {
        await execPromise(`npm install -g "${tgzPath}"`, {
          cwd: cliTempDir,
        });
        console.log(chalk.green("✓ 安装完成"));
      } catch (installError) {
        // 如果全局安装失败，可能需要 sudo
        console.log(chalk.yellow("⚠️ 全局安装失败，尝试使用 sudo..."));
        console.log(chalk.gray("请输入密码授权安装:"));
        await execPromise(`sudo npm install -g "${tgzPath}"`, {
          cwd: cliTempDir,
        });
        console.log(chalk.green("✓ 安装完成"));
      }

      // 清理临时目录
      console.log(chalk.gray("清理临时文件..."));
      fs.rmSync(tempDir, { recursive: true, force: true });

      console.log(chalk.green("\n✅ 更新成功！"));
      console.log(chalk.gray("运行 'act --version' 查看新版本"));
    } catch (error) {
      console.error(chalk.red("\n❌ 更新失败:"), error.message);
      process.exit(1);
    }
  });

/**
 * 从 GitHub API 获取目录内容（用于更新）
 */
function fetchGitHubDirForUpdate(dirPath) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${dirPath}?ref=${GITHUB_BRANCH}`;

    const options = {
      headers: {
        "User-Agent": "activity-cli",
        Accept: "application/vnd.github.v3+json",
      },
    };

    https
      .get(apiUrl, options, (response) => {
        let data = "";
        response.on("data", (chunk) => (data += chunk));
        response.on("end", () => {
          if (response.statusCode === 200) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`GitHub API 错误: ${response.statusCode}`));
          }
        });
      })
      .on("error", reject);
  });
}

/**
 * 下载单个文件（用于更新）
 */
function downloadFileForUpdate(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https
      .get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          https
            .get(response.headers.location, (redirectResponse) => {
              redirectResponse.pipe(file);
              file.on("finish", () => {
                file.close();
                resolve();
              });
            })
            .on("error", reject);
        } else {
          response.pipe(file);
          file.on("finish", () => {
            file.close();
            resolve();
          });
        }
      })
      .on("error", reject);
  });
}

/**
 * 递归下载目录（用于更新）
 */
async function downloadGitHubDirForUpdate(remotePath, localPath) {
  const contents = await fetchGitHubDirForUpdate(remotePath);

  if (!fs.existsSync(localPath)) {
    fs.mkdirSync(localPath, { recursive: true });
  }

  for (const item of contents) {
    const itemLocalPath = path.join(localPath, item.name);

    if (item.type === "dir") {
      await downloadGitHubDirForUpdate(item.path, itemLocalPath);
    } else if (item.type === "file") {
      await downloadFileForUpdate(item.download_url, itemLocalPath);
    }
  }
}

program.parse();
