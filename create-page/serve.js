const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execPromise = promisify(exec);

const PORT = 3000;

// 项目目录
const PROJECT_DIR = path.dirname(__dirname);
const EVENT_DIR = path.join(PROJECT_DIR, "event");
const PYTHON_VENV_DIR = path.join(EVENT_DIR, "myenv");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

/**
 * 获取 Python 环境路径
 */
function getPythonEnvPaths() {
  const isWindows = process.platform === "win32";
  return {
    eventDir: EVENT_DIR,
    venvDir: PYTHON_VENV_DIR,
    pythonPath: isWindows
      ? path.join(PYTHON_VENV_DIR, "Scripts", "python.exe")
      : path.join(PYTHON_VENV_DIR, "bin", "python3"),
    scriptPath: path.join(EVENT_DIR, "add_activity.py"),
  };
}

/**
 * 检查 Python 环境是否就绪
 */
function isPythonEnvReady() {
  if (!fs.existsSync(EVENT_DIR)) return false;
  if (!fs.existsSync(PYTHON_VENV_DIR)) return false;

  const isWindows = process.platform === "win32";
  const pythonPath = isWindows
    ? path.join(PYTHON_VENV_DIR, "Scripts", "python.exe")
    : path.join(PYTHON_VENV_DIR, "bin", "python3");

  return fs.existsSync(pythonPath);
}

/**
 * 处理 /toPythonText API - 上传文案到 Python 脚本
 */
async function handleToPythonText(req, res) {
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

      console.log("收到活动信息:", JSON.stringify(data));

      // 数据校验
      if (!data.id || !data.name || !data.textUrl) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            data: {
              code: 0,
              message:
                "参数错误，活动ID(id)、项目名称(name)和飞书文档链接(textUrl)不能为空",
            },
          })
        );
      }

      // 检查活动ID是否为数字
      if (isNaN(parseInt(data.id))) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            data: {
              code: 0,
              message: "活动ID必须是数字",
            },
          })
        );
      }

      // 检查 Python 环境是否就绪
      if (!isPythonEnvReady()) {
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            data: {
              code: 0,
              message:
                "Python 环境未准备好，请先在 event 目录运行 python3 -m venv myenv && source myenv/bin/activate && pip install -r requirements.txt",
            },
          })
        );
      }

      // 获取 Python 环境路径
      const { eventDir, pythonPath, scriptPath } = getPythonEnvPaths();

      console.log(`Python 环境目录: ${eventDir}`);
      console.log(`Python 脚本路径: ${scriptPath}`);

      // 检查路径是否存在
      if (!fs.existsSync(scriptPath)) {
        console.error(`错误: Python脚本不存在 ${scriptPath}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            data: {
              code: 0,
              message: "Python脚本文件不存在",
              error: `找不到文件: ${scriptPath}`,
            },
          })
        );
      }

      if (!fs.existsSync(pythonPath)) {
        console.error(`错误: Python 解释器不存在 ${pythonPath}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            data: {
              code: 0,
              message: "Python 解释器不存在",
              error: `找不到文件: ${pythonPath}`,
            },
          })
        );
      }

      // 使用 Python 解释器直接执行脚本
      const parentDir = path.dirname(eventDir);
      const isWindows = process.platform === "win32";
      const pythonPathEnv = isWindows
        ? `set PYTHONPATH=${eventDir} &&`
        : `PYTHONPATH="${eventDir}"`;
      // 传递 projectName 给 Python 脚本以选择正确的平台脚本
      const projectName = data.projectName || "Yoho";
      const command = `cd "${parentDir}" && ${pythonPathEnv} "${pythonPath}" "${scriptPath}" ${data.id} "${data.name}" "${data.textUrl}" "${projectName}"`;

      console.log(`执行命令: ${command}`);

      // 使用 child_process.exec 执行Shell命令
      const { stdout, stderr } = await execPromise(command, {
        maxBuffer: 1024 * 1024, // 增加缓冲区大小到1MB
      });

      console.log("Python脚本执行完成");
      console.log("标准输出:", stdout);

      if (stderr && !stderr.includes("WARNING:")) {
        console.error("标准错误:", stderr);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            data: {
              code: 0,
              message: "处理失败，请查看日志",
              error: stderr,
            },
          })
        );
      }

      // 检查输出是否包含成功信息
      const success =
        stdout.includes("成功添加活动") && stdout.includes("文案上传完成");

      if (success) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            data: {
              code: 1,
              message: "活动添加成功，文案已上传",
              result: stdout,
            },
          })
        );
      } else {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            data: {
              code: 0,
              message: "处理过程中出现问题",
              result: stdout,
            },
          })
        );
      }
    } catch (error) {
      console.error("执行Python脚本出错:", error);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          data: {
            code: 0,
            message: "系统错误",
            error: error.message,
          },
        })
      );
    }
  });
}

const server = http.createServer(async (req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);

  // 处理 /toPythonText API
  if (urlPath === "/toPythonText") {
    await handleToPythonText(req, res);
    return;
  }

  // 静态文件服务
  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(__dirname, filePath);

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404);
        res.end("404 Not Found");
      } else {
        res.writeHead(500);
        res.end("500 Server Error");
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}\n`);
  console.log("Press Ctrl+C to stop\n");
});
