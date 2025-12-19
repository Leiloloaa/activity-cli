const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const open = require("open");
const { createServer, findIndexFile } = require("./server");

// 临时目录名称
const TEMP_DIR_NAME = ".web-preview-temp";

/**
 * 显示 loading 动画
 * @param {string} message
 * @param {Promise} promise
 * @returns {Promise}
 */
function showLoading(message, promise) {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let frameIndex = 0;
  let interval;

  const startLoading = () => {
    interval = setInterval(() => {
      process.stdout.write(
        `\r${chalk.blue(frames[frameIndex])} ${chalk.blue(message)}`
      );
      frameIndex = (frameIndex + 1) % frames.length;
    }, 100);
  };

  const stopLoading = () => {
    if (interval) {
      clearInterval(interval);
      process.stdout.write(
        "\r" + " ".repeat(process.stdout.columns || 80) + "\r"
      );
    }
  };

  startLoading();

  return promise
    .then((result) => {
      stopLoading();
      return result;
    })
    .catch((error) => {
      stopLoading();
      throw error;
    });
}

/**
 * 清理临时目录
 * @param {string} tempDir
 */
function cleanupTempDir(tempDir) {
  try {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  } catch (error) {
    // 忽略清理错误
  }
}

/**
 * 主预览函数
 * @param {object} options
 * @param {string} options.repository - Git 仓库地址
 * @param {string} options.branch - 分支名
 * @param {number} options.port - 服务器端口
 * @param {boolean} options.autoOpen - 是否自动打开浏览器
 */
async function preview(options) {
  const { repository, branch = "main", port = 3000, autoOpen = true } = options;

  // 临时目录
  const tempDir = path.join(process.cwd(), TEMP_DIR_NAME);
  let server = null;

  // 清理函数
  const cleanup = () => {
    console.log(chalk.yellow("\n\n🧹 正在清理..."));
    if (server) {
      server.close();
    }
    cleanupTempDir(tempDir);
    console.log(chalk.green("✓ 清理完成"));
  };

  // 注册退出处理
  const handleExit = () => {
    cleanup();
    process.exit(0);
  };

  process.on("SIGINT", handleExit);
  process.on("SIGTERM", handleExit);

  try {
    console.log(chalk.cyan("\n🚀 Web Preview CLI\n"));
    console.log(chalk.gray("─".repeat(50)));
    console.log(`  仓库: ${chalk.green(repository)}`);
    console.log(`  分支: ${chalk.green(branch)}`);
    console.log(`  端口: ${chalk.green(port)}`);
    console.log(chalk.gray("─".repeat(50)));

    // 清理可能存在的临时目录
    cleanupTempDir(tempDir);

    // 克隆仓库
    const git = simpleGit();
    await showLoading(
      "正在下载网页...",
      git
        .clone(repository, tempDir, ["--branch", branch, "--depth", "1"])
        .catch(async (error) => {
          if (error.message.includes("branch")) {
            console.log(
              chalk.yellow(`\n分支 ${branch} 不存在，尝试使用默认分支...`)
            );
            return git.clone(repository, tempDir, ["--depth", "1"]);
          }
          throw error;
        })
    );

    console.log(chalk.green("✓ 下载完成！\n"));

    // 查找 index.html 的位置
    let webRoot = tempDir;

    // 常见的网页目录结构
    const possibleDirs = [
      "", // 根目录
      "dist", // 构建输出
      "build", // 构建输出
      "public", // 公共文件
      "www", // 网页目录
      "docs", // 文档目录
      "site", // 站点目录
      "src", // 源码目录
    ];

    for (const dir of possibleDirs) {
      const testDir = dir ? path.join(tempDir, dir) : tempDir;
      if (fs.existsSync(testDir) && findIndexFile(testDir)) {
        webRoot = testDir;
        if (dir) {
          console.log(chalk.gray(`📂 检测到网页目录: ${dir}/`));
        }
        break;
      }
    }

    // 启动服务器
    server = await createServer(webRoot, port);

    const localUrl = `http://localhost:${port}`;

    console.log(chalk.green("✓ 服务器已启动！\n"));
    console.log(chalk.cyan("🌐 访问地址:"));
    console.log(`   ${chalk.bold.underline(localUrl)}\n`);
    console.log(chalk.gray("按 Ctrl+C 停止服务器并清理临时文件\n"));

    // 自动打开浏览器
    if (autoOpen) {
      await open(localUrl);
      console.log(chalk.green("✓ 已在浏览器中打开\n"));
    }

    // 保持进程运行
    await new Promise(() => {});
  } catch (error) {
    cleanup();
    throw error;
  }
}

module.exports = {
  preview,
};
