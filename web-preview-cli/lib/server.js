const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

// GitHub 仓库配置
const GITHUB_REPO = "Leiloloaa/activity-cli";
const GITHUB_BRANCH = "main";

// MIME 类型映射
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".vue": "text/plain; charset=utf-8",
  ".ts": "text/plain; charset=utf-8",
  ".tsx": "text/plain; charset=utf-8",
  ".jsx": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".less": "text/plain; charset=utf-8",
  ".scss": "text/plain; charset=utf-8",
  ".sass": "text/plain; charset=utf-8",
};

/**
 * 获取 MIME 类型
 * @param {string} filePath
 * @returns {string}
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

/**
 * 查找默认入口文件
 * @param {string} rootDir
 * @returns {string|null}
 */
function findIndexFile(rootDir) {
  const indexFiles = ["index.html", "index.htm", "default.html", "default.htm"];

  for (const file of indexFiles) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      return file;
    }
  }

  return null;
}

/**
 * 从 GitHub API 获取目录内容
 */
function fetchGitHubDir(dirPath) {
  return new Promise((resolve, reject) => {
    const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${dirPath}?ref=${GITHUB_BRANCH}`;
    console.log(chalk.gray(`获取目录: ${dirPath}`));

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
 * 下载单个文件
 */
function downloadGitHubFile(url, destPath) {
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
 * 递归下载目录
 */
async function downloadGitHubDir(remotePath, localPath) {
  const contents = await fetchGitHubDir(remotePath);

  if (!fs.existsSync(localPath)) {
    fs.mkdirSync(localPath, { recursive: true });
  }

  for (const item of contents) {
    const itemLocalPath = path.join(localPath, item.name);

    if (item.type === "dir") {
      await downloadGitHubDir(item.path, itemLocalPath);
    } else if (item.type === "file") {
      console.log(chalk.gray(`  下载: ${item.name}`));
      await downloadGitHubFile(item.download_url, itemLocalPath);
    }
  }
}

/**
 * 首字母大写
 */
function capitalizeFirstLetter(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 生成 config.ts 内容
 */
function generateConfigContent(config) {
  const info = `export const info = \`
${config.info || ""}
\``;

  const documentLink = `export const documentLink = \`
${config.url || ""}
\``;

  const textLink = `export const textLink = \`
${config.textUrl || ""}
\``;

  const figmaLink = `export const figmaLink = \`
${config.figma || ""}
\``;

  const ossLink = `export const ossLink = \`
https://oss.console.aliyun.com/bucket/oss-ap-southeast-1/yoho-activity-www/object/upload?path=activity%2F${
    config.catalog || ""
  }_${capitalizeFirstLetter(config.name)}%2F
\``;

  const yohoTestJenkinsLink = `export const yohoTestJenkinsLink = \`
https://jenkins-web.waka.media/job/yoho/job/TestEnv/job/web-activity/job/activity-vite/build?delay=0sec
\``;

  const yohoProdJenkinsLink = `export const yohoProdJenkinsLink = \`
https://jenkins-web.waka.media/job/yoho/job/ProdEnv/job/web-activity/job/activity-vite/build?delay=0sec
\``;

  const hiyooTestJenkinsLink = `export const hiyooTestJenkinsLink = \`
https://jenkins-web.waka.media/job/hiyoo/job/TestEnv/job/web-activity/job/activity-vite/build?delay=0sec
\``;

  const hiyooProdJenkinsLink = `export const hiyooProdJenkinsLink = \`
https://jenkins-web.waka.media/job/hiyoo/job/ProdEnv/job/web-activity/job/activity-vite/build?delay=0sec
\``;

  return `export const config = {
  activityId: ${config.id || 0},
  projectName: '/activity/${config.catalog || ""}_${capitalizeFirstLetter(
    config.name
  )}',
  backgroundColor: '${config.bgc || ""}',
}
${info}
${documentLink}
${textLink}
${figmaLink}
${ossLink}
${yohoTestJenkinsLink}
${yohoProdJenkinsLink}
${hiyooTestJenkinsLink}
${hiyooProdJenkinsLink}
`;
}

/**
 * 处理 /download-template API
 */
async function handleDownloadTemplate(req, res) {
  // 设置 CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // 解析 POST body
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    try {
      const data = body ? JSON.parse(body) : {};
      const projectName = data.projectName || "Yoho";
      const activityName = data.name || "activity";

      const templateMap = {
        Yoho: "yoho",
        Hiyoo: "hiyoo",
        SoulStar: "soulstar",
        DramaBit: "dramebit",
      };

      const templateDir = templateMap[projectName] || "yoho";
      const remotePath = `template/${templateDir}/activity`;
      const catalog = data.catalog || "202501";

      // 目标目录: ./src/page/{catalog}/{name}
      const srcPageDir = path.resolve(process.cwd(), "src", "page");
      const catalogDir = path.join(srcPageDir, catalog);
      const targetDir = path.join(catalogDir, activityName);

      console.log(chalk.cyan(`\n📦 从 GitHub 下载模板: ${remotePath}`));
      console.log(chalk.gray(`项目名称: ${activityName}`));
      console.log(chalk.gray(`目录分类: ${catalog}`));
      console.log(chalk.gray(`目标目录: ${targetDir}`));

      // 确保 src/page 目录存在
      if (!fs.existsSync(srcPageDir)) {
        fs.mkdirSync(srcPageDir, { recursive: true });
        console.log(chalk.gray(`  创建目录: src/page`));
      }

      // 确保 catalog 目录存在
      if (!fs.existsSync(catalogDir)) {
        fs.mkdirSync(catalogDir, { recursive: true });
        console.log(chalk.gray(`  创建目录: src/page/${catalog}`));
      }

      // 清理已存在的目标目录
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
      }

      // 下载模板
      await downloadGitHubDir(remotePath, targetDir);

      // 生成并写入 config.ts
      const configPath = path.join(targetDir, "config.ts");
      const configContent = generateConfigContent(data);
      fs.writeFileSync(configPath, configContent, "utf8");
      console.log(chalk.gray(`  重写: config.ts`));

      console.log(chalk.green(`✓ 模板下载完成!\n`));

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          message: `模板已下载到: ${targetDir}`,
          targetDir,
        })
      );
    } catch (error) {
      console.error(chalk.red("下载模板失败:"), error.message);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: false,
          message: `下载失败: ${error.message}`,
        })
      );
    }
  });
}

/**
 * 创建并启动 HTTP 服务器
 * @param {string} rootDir - 静态文件根目录
 * @param {number} port - 服务器端口
 * @returns {Promise<http.Server>}
 */
function createServer(rootDir, port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      // 解析请求 URL
      let urlPath = decodeURIComponent(req.url.split("?")[0]);

      // 处理 API 请求
      if (urlPath === "/download-template") {
        await handleDownloadTemplate(req, res);
        return;
      }

      // 处理根路径
      if (urlPath === "/") {
        const indexFile = findIndexFile(rootDir);
        if (indexFile) {
          urlPath = "/" + indexFile;
        } else {
          // 如果没有 index.html，显示目录列表
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(generateDirectoryListing(rootDir, "/"));
          return;
        }
      }

      // 构建文件路径
      const filePath = path.join(rootDir, urlPath);

      // 安全检查：防止目录遍历攻击
      if (!filePath.startsWith(rootDir)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      // 检查文件是否存在
      fs.stat(filePath, (err, stats) => {
        if (err) {
          res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
          res.end(`<h1>404 Not Found</h1><p>${urlPath}</p>`);
          return;
        }

        // 如果是目录
        if (stats.isDirectory()) {
          const dirIndexFile = findIndexFile(filePath);
          if (dirIndexFile) {
            // 重定向到目录的 index 文件
            const redirectUrl = urlPath.endsWith("/")
              ? urlPath + dirIndexFile
              : urlPath + "/" + dirIndexFile;
            res.writeHead(302, { Location: redirectUrl });
            res.end();
          } else {
            // 显示目录列表
            res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            res.end(generateDirectoryListing(filePath, urlPath));
          }
          return;
        }

        // 读取并返回文件
        const mimeType = getMimeType(filePath);
        fs.readFile(filePath, (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end("Internal Server Error");
            return;
          }

          res.writeHead(200, {
            "Content-Type": mimeType,
            "Cache-Control": "no-cache",
          });
          res.end(content);
        });
      });
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        reject(new Error(`端口 ${port} 已被占用，请尝试其他端口`));
      } else {
        reject(err);
      }
    });

    server.listen(port, () => {
      resolve(server);
    });
  });
}

/**
 * 生成目录列表 HTML
 * @param {string} dirPath
 * @param {string} urlPath
 * @returns {string}
 */
function generateDirectoryListing(dirPath, urlPath) {
  const files = fs.readdirSync(dirPath);

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>目录列表 - ${urlPath}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      color: #333;
      border-bottom: 2px solid #4CAF50;
      padding-bottom: 10px;
    }
    .file-list {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .file-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
      text-decoration: none;
      color: #333;
      transition: background 0.2s;
    }
    .file-item:hover {
      background: #f9f9f9;
    }
    .file-item:last-child {
      border-bottom: none;
    }
    .icon {
      margin-right: 12px;
      font-size: 20px;
    }
    .dir { color: #FFC107; }
    .file { color: #2196F3; }
    .name { flex: 1; }
  </style>
</head>
<body>
  <h1>📁 ${urlPath}</h1>
  <div class="file-list">
`;

  // 添加返回上级目录链接
  if (urlPath !== "/") {
    const parentPath = path.dirname(urlPath);
    html += `
    <a class="file-item" href="${parentPath === "/" ? "/" : parentPath}">
      <span class="icon dir">📁</span>
      <span class="name">..</span>
    </a>`;
  }

  // 排序：目录在前，文件在后
  const sortedFiles = files.sort((a, b) => {
    const aIsDir = fs.statSync(path.join(dirPath, a)).isDirectory();
    const bIsDir = fs.statSync(path.join(dirPath, b)).isDirectory();
    if (aIsDir && !bIsDir) return -1;
    if (!aIsDir && bIsDir) return 1;
    return a.localeCompare(b);
  });

  for (const file of sortedFiles) {
    // 跳过隐藏文件
    if (file.startsWith(".")) continue;

    const filePath = path.join(dirPath, file);
    const isDir = fs.statSync(filePath).isDirectory();
    const icon = isDir ? "📁" : "📄";
    const iconClass = isDir ? "dir" : "file";
    const href = urlPath.endsWith("/") ? urlPath + file : urlPath + "/" + file;

    html += `
    <a class="file-item" href="${href}">
      <span class="icon ${iconClass}">${icon}</span>
      <span class="name">${file}${isDir ? "/" : ""}</span>
    </a>`;
  }

  html += `
  </div>
</body>
</html>`;

  return html;
}

module.exports = {
  createServer,
  findIndexFile,
};
