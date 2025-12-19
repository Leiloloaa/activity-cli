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
 * 随机打乱数组
 */
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * 处理提测信息，修改 data.info 属性
 */
const handleInfo = (data) => {
  const map = {
    Yoho: {
      test: "https://activity-h5-test.yoho.media",
      master: "https://activity-h5.yoho.media",
    },
    Hiyoo: {
      test: "https://activity-h5-test.chatchill.media/activity-vite",
      master: "https://activity-h5.chatchill.media/activity-vite",
    },
    SoulStar: {
      test: "https://activity-h5-test.dopalive.com",
      master: "https://activity-h5.dopalive.com",
    },
    DramaBit: {
      test: "https://activity-h5-test.miniepisode.com",
      master: "https://activity-h5.miniepisode.com",
    },
  };

  const projectName = data.projectName || "Yoho";
  const opNum = parseInt(data.opNum) || 1;
  const hotNum = parseInt(data.hotNum) || 1;
  const isOp = data.op === "true" || data.op === true;
  const isHot = data.hot === "true" || data.hot === true;

  const test = `${map[projectName].test}/act_v_${data.catalog}_${data.name}`;
  const master = `${map[projectName].master}/act_v_${data.catalog}_${data.name}`;

  // 生成 OP 链接
  const opTextLinks = [];
  const opMasterLinks = [];
  if (isOp) {
    for (let i = 1; i <= opNum; i++) {
      const suffix = opNum === 1 ? "" : i;
      opTextLinks.push(`${test}_op${suffix}/index.html?lang=&key=`);
      opMasterLinks.push(`${master}_op${suffix}/index.html?lang=&key=`);
    }
  }

  // 生成 HOT 链接
  const hotTextLinks = [];
  const hotMasterLinks = [];
  if (isHot) {
    for (let i = 1; i <= hotNum; i++) {
      const suffix = hotNum === 1 ? "" : i;
      hotTextLinks.push(`${test}_op_hot${suffix}/index.html?lang=&key=`);
      hotMasterLinks.push(`${master}_op_hot${suffix}/index.html?lang=&key=`);
    }
  }

  const text = `🌰活动提测: ${data.url || ""}
Figma: ${data.figma || ""}
活动🆔: ${data.id || ""}
活动链接(测试):
${test}/index.html?lang=&key=
${isOp ? opTextLinks.join("\n") : "--"}
${isHot ? hotTextLinks.join("\n") : "--"}
活动链接(正式):
${master}/index.html?lang=EG&key=
${isOp ? opMasterLinks.join("\n") : "--"}
${isHot ? hotMasterLinks.join("\n") : "--"}
前端: ${shuffleArray(["@Stone", "@阿田", "@玄策"])}
后端: ${shuffleArray(["@待续", "@紫红", "@单丛"])}
测试: ${shuffleArray(["@隆多", "@保罗"])}`;

  data.info = text.replace(/--\n/g, "");
  data.activityUrl = `${master}/index.html?lang=&key=`;
};

/**
 * 生成 config.ts 内容
 * @param {Object} config - 配置对象
 * @param {Object} options - 可选配置
 * @param {boolean} options.includeInfo - 是否包含提测信息，默认 true
 */
function generateConfigContent(config, options = {}) {
  const { includeInfo = true } = options;
  const projectName = config.projectName || "Yoho";
  const activityPath = `${config.catalog || ""}_${capitalizeFirstLetter(
    config.name
  )}`;

  // 只在主目录中生成 info
  const info = includeInfo
    ? `export const info = \`
${config.info || ""}
\``
    : "";

  const documentLink = `export const documentLink = \`
${config.url || ""}
\``;

  const textLink = `export const textLink = \`
${config.textUrl || ""}
\``;

  const figmaLink = `export const figmaLink = \`
${config.figma || ""}
\``;

  // 根据项目名称配置 OSS 和 Jenkins 地址
  const projectConfigs = {
    Yoho: {
      ossBucket: "yoho-activity-www",
      jenkinsJob: "yoho",
    },
    Hiyoo: {
      ossBucket: "hiyoo-activity-www",
      jenkinsJob: "hiyoo",
    },
    SoulStar: {
      ossBucket: "soulstar-activity-www",
      jenkinsJob: "soulstar",
    },
    DramaBit: {
      ossBucket: "dramebit-activity-www",
      jenkinsJob: "dramebit",
    },
  };

  const currentConfig = projectConfigs[projectName] || projectConfigs.Yoho;

  const ossLink = `export const ossLink = \`
https://oss.console.aliyun.com/bucket/oss-ap-southeast-1/${currentConfig.ossBucket}/object/upload?path=activity%2F${activityPath}%2F
\``;

  const testJenkinsLink = `export const testJenkinsLink = \`
https://jenkins-web.waka.media/job/${currentConfig.jenkinsJob}/job/TestEnv/job/web-activity/job/activity-vite/build?delay=0sec
\``;

  const prodJenkinsLink = `export const prodJenkinsLink = \`
https://jenkins-web.waka.media/job/${currentConfig.jenkinsJob}/job/ProdEnv/job/web-activity/job/activity-vite/build?delay=0sec
\``;

  return `export const config = {
  activityId: ${config.id || 0},
  projectName: '/activity/${activityPath}',
  backgroundColor: '${config.bgc || ""}',
}
${info}
${documentLink}
${textLink}
${figmaLink}
${ossLink}
${testJenkinsLink}
${prodJenkinsLink}
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

      console.log(chalk.cyan(`\n📦 下载模板到: src/page/${catalog}/`));

      // 确保目录存在
      if (!fs.existsSync(srcPageDir)) {
        fs.mkdirSync(srcPageDir, { recursive: true });
      }
      if (!fs.existsSync(catalogDir)) {
        fs.mkdirSync(catalogDir, { recursive: true });
      }

      // 清理已存在的目标目录
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
      }

      // 下载主模板 activity
      await downloadGitHubDir(remotePath, targetDir);

      // 处理提测信息
      handleInfo(data);

      // 生成并写入主目录的 config.ts
      const configPath = path.join(targetDir, "config.ts");
      const configContent = generateConfigContent(data);
      fs.writeFileSync(configPath, configContent, "utf8");
      console.log(chalk.green(`  ✓ ${activityName}`));

      // 记录所有创建的目录
      const createdDirs = [targetDir];

      // 如果 op 为 true，下载 activity_op 目录
      const isOp = data.op === "true" || data.op === true;
      const opNum = parseInt(data.opNum) || 1;

      if (isOp && opNum > 0) {
        const remoteOpPath = `template/${templateDir}/activity_op`;

        // 第一个 OP 目录：从 GitHub 下载
        const firstOpDirName = `${activityName}_op${opNum === 1 ? "" : 1}`;
        const firstOpTargetDir = path.join(catalogDir, firstOpDirName);

        if (fs.existsSync(firstOpTargetDir)) {
          fs.rmSync(firstOpTargetDir, { recursive: true, force: true });
        }

        await downloadGitHubDir(remoteOpPath, firstOpTargetDir);

        // 重写第一个目录的 config.ts
        const firstOpData = { ...data, name: firstOpDirName };
        const firstOpConfigPath = path.join(firstOpTargetDir, "config.ts");
        fs.writeFileSync(
          firstOpConfigPath,
          generateConfigContent(firstOpData, { includeInfo: false }),
          "utf8"
        );
        createdDirs.push(firstOpTargetDir);

        // 收集所有 OP 目录名
        const opDirNames = [firstOpDirName];

        // 其他 OP 目录：本地复制
        for (let i = 2; i <= opNum; i++) {
          const opDirName = `${activityName}_op${i}`;
          const opTargetDir = path.join(catalogDir, opDirName);

          if (fs.existsSync(opTargetDir)) {
            fs.rmSync(opTargetDir, { recursive: true, force: true });
          }

          // 本地复制目录
          fs.cpSync(firstOpTargetDir, opTargetDir, { recursive: true });

          // 重写 config.ts
          const opData = { ...data, name: opDirName };
          const opConfigPath = path.join(opTargetDir, "config.ts");
          fs.writeFileSync(
            opConfigPath,
            generateConfigContent(opData, { includeInfo: false }),
            "utf8"
          );
          createdDirs.push(opTargetDir);
          opDirNames.push(opDirName);
        }

        console.log(chalk.green(`  ✓ ${opDirNames.join(", ")}`));
      }

      // 如果 hot 为 true，下载 activity_op_hot 目录
      const isHot = data.hot === "true" || data.hot === true;
      const hotNum = parseInt(data.hotNum) || 1;

      if (isHot && hotNum > 0) {
        const remoteHotPath = `template/${templateDir}/activity_op_hot`;

        // 第一个 HOT 目录：从 GitHub 下载
        const firstHotDirName = `${activityName}_op_hot${
          hotNum === 1 ? "" : 1
        }`;
        const firstHotTargetDir = path.join(catalogDir, firstHotDirName);

        if (fs.existsSync(firstHotTargetDir)) {
          fs.rmSync(firstHotTargetDir, { recursive: true, force: true });
        }

        try {
          await downloadGitHubDir(remoteHotPath, firstHotTargetDir);

          // 重写第一个目录的 config.ts
          const firstHotData = { ...data, name: firstHotDirName };
          const firstHotConfigPath = path.join(firstHotTargetDir, "config.ts");
          fs.writeFileSync(
            firstHotConfigPath,
            generateConfigContent(firstHotData, { includeInfo: false }),
            "utf8"
          );
          createdDirs.push(firstHotTargetDir);

          // 收集所有 HOT 目录名
          const hotDirNames = [firstHotDirName];

          // 其他 HOT 目录：本地复制
          for (let i = 2; i <= hotNum; i++) {
            const hotDirName = `${activityName}_op_hot${i}`;
            const hotTargetDir = path.join(catalogDir, hotDirName);

            if (fs.existsSync(hotTargetDir)) {
              fs.rmSync(hotTargetDir, { recursive: true, force: true });
            }

            // 本地复制目录
            fs.cpSync(firstHotTargetDir, hotTargetDir, { recursive: true });

            // 重写 config.ts
            const hotData = { ...data, name: hotDirName };
            const hotConfigPath = path.join(hotTargetDir, "config.ts");
            fs.writeFileSync(
              hotConfigPath,
              generateConfigContent(hotData, { includeInfo: false }),
              "utf8"
            );
            createdDirs.push(hotTargetDir);
            hotDirNames.push(hotDirName);
          }

          console.log(chalk.green(`  ✓ ${hotDirNames.join(", ")}`));
        } catch (err) {
          console.log(chalk.yellow(`  ⚠️ activity_op_hot 模板不存在，跳过`));
        }
      }

      console.log(
        chalk.green(`\n✓ 模板下载完成! 共创建 ${createdDirs.length} 个目录\n`)
      );

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          success: true,
          message: `模板已下载到: ${catalogDir}`,
          targetDir: catalogDir,
          createdDirs,
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
