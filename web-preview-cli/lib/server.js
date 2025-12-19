const http = require("http");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

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
 * 创建并启动 HTTP 服务器
 * @param {string} rootDir - 静态文件根目录
 * @param {number} port - 服务器端口
 * @returns {Promise<http.Server>}
 */
function createServer(rootDir, port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // 解析请求 URL
      let urlPath = decodeURIComponent(req.url.split("?")[0]);

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
