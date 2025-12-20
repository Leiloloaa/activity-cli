const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const open = require("open");
const https = require("https");
const http = require("http");
const { createServer, findIndexFile, CREATE_PAGE_CACHE_FILE, waitForCache } = require("./server");

// 临时目录名称
const TEMP_DIR_NAME = ".web-preview-temp";

/**
 * 将 GitHub blob URL 转换为 raw URL
 * @param {string} url - GitHub URL
 * @returns {string} - raw URL
 */
function convertToRawUrl(url) {
  // https://github.com/user/repo/blob/branch/path/file.html
  // -> https://raw.githubusercontent.com/user/repo/branch/path/file.html
  if (url.includes("github.com") && url.includes("/blob/")) {
    return url
      .replace("github.com", "raw.githubusercontent.com")
      .replace("/blob/", "/");
  }
  return url;
}

/**
 * 从 URL 下载文件
 * @param {string} url - 文件 URL
 * @param {string} destPath - 目标路径
 * @returns {Promise<void>}
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const rawUrl = convertToRawUrl(url);
    const protocol = rawUrl.startsWith("https") ? https : http;

    const request = protocol.get(rawUrl, (response) => {
      // 处理重定向
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`下载失败，状态码: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on("finish", () => {
        fileStream.close();
        resolve();
      });

      fileStream.on("error", (err) => {
        fs.unlink(destPath, () => {}); // 删除不完整的文件
        reject(err);
      });
    });

    request.on("error", reject);
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error("下载超时"));
    });
  });
}

/**
 * 从 URL 获取文件名
 * @param {string} url
 * @returns {string}
 */
function getFileNameFromUrl(url) {
  const urlPath = new URL(url).pathname;
  const fileName = path.basename(urlPath);
  return fileName || "index.html";
}

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

/**
 * 从 URL 下载单个 HTML 文件并预览
 * @param {object} options
 * @param {string} options.url - HTML 文件的 URL
 * @param {number} options.port - 服务器端口
 * @param {boolean} options.autoOpen - 是否自动打开浏览器
 */
async function previewUrl(options) {
  const { url, port = 3000, autoOpen = true } = options;

  let server = null;
  let usedTempDir = false;
  const tempDir = path.join(process.cwd(), TEMP_DIR_NAME);

  // 清理函数
  const cleanup = () => {
    if (server) {
      server.close();
    }
    // 只有使用了临时目录才需要清理
    if (usedTempDir) {
      console.log(chalk.yellow("\n\n🧹 正在清理临时文件..."));
      cleanupTempDir(tempDir);
      console.log(chalk.green("✓ 临时文件已清理"));
    } else {
      console.log(chalk.gray("\n\n👋 再见"));
    }
  };

  // 注册退出处理
  const handleExit = () => {
    cleanup();
    process.exit(0);
  };

  process.on("SIGINT", handleExit);
  process.on("SIGTERM", handleExit);

  try {
    // 等待缓存准备完成（如果正在缓存的话）
    await waitForCache();

    // 重新检查缓存文件是否存在（等待后可能已经准备好了）
    const cacheFileExists = CREATE_PAGE_CACHE_FILE && 
                            fs.existsSync(CREATE_PAGE_CACHE_FILE) && 
                            url.includes("create-page/index.html");

    if (cacheFileExists) {
      // 使用缓存模式：直接从缓存目录读取 HTML，不创建临时文件
      server = await createServer(process.cwd(), port, { 
        indexFilePath: CREATE_PAGE_CACHE_FILE 
      });
    } else {
      // 非缓存模式：下载到临时目录
      usedTempDir = true;
      cleanupTempDir(tempDir);
      fs.mkdirSync(tempDir, { recursive: true });

      const fileName = getFileNameFromUrl(url);
      const destPath = path.join(tempDir, fileName);

      await showLoading("正在下载 HTML 文件...", downloadFile(url, destPath));

      server = await createServer(tempDir, port);
    }

    const localUrl = `http://localhost:${port}`;

    console.log(chalk.green(`\n🌐 运行地址: ${chalk.bold.underline(localUrl)}`));
    console.log(chalk.gray("按 Ctrl+C 退出\n"));

    // 自动打开浏览器
    if (autoOpen) {
      await open(localUrl);
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
  previewUrl,
  downloadFile,
  convertToRawUrl,
};
