# web-preview-cli

一个用于从 Git 仓库下载网页并启动本地服务器预览的 CLI 工具。

## 功能特性

- 🚀 从 Git 仓库快速下载网页
- 🌐 自动启动本地 HTTP 服务器
- 🔗 自动打开浏览器预览
- 📁 支持目录列表浏览
- 🧹 退出时自动清理临时文件
- ⚙️ 支持配置文件存储默认仓库

## 安装

### 全局安装

```bash
npm install -g web-preview-cli
```

### 本地安装

```bash
cd web-preview-cli
npm install
npm link
```

## 使用方法

### 快速开始

```bash
# 指定仓库地址启动预览
webp -r https://github.com/user/web-page.git

# 使用简写
webp start -r https://github.com/user/web-page.git
```

### 配置默认仓库

```bash
# 设置默认仓库地址
webp config -s https://github.com/user/web-page.git

# 设置默认仓库和分支
webp config -s https://github.com/user/web-page.git -b main

# 查看当前配置
webp config -v

# 删除配置
webp config -d
```

配置设置后，直接运行 `webp` 即可启动预览。

### 命令选项

```bash
webp [start] [options]

选项:
  -r, --repo <repo>     Git 仓库地址
  -b, --branch <branch> 分支名 (默认: main)
  -p, --port <port>     服务器端口 (默认: 3000)
  --no-open             不自动打开浏览器
  -V, --version         显示版本号
  -h, --help            显示帮助信息
```

### 示例

```bash
# 使用默认配置启动
webp

# 指定仓库启动
webp -r https://github.com/user/repo.git

# 指定分支和端口
webp -r https://github.com/user/repo.git -b develop -p 8080

# 不自动打开浏览器
webp -r https://github.com/user/repo.git --no-open
```

## 工作流程

1. 从指定的 Git 仓库克隆代码（浅克隆，只下载最新提交）
2. 自动检测网页目录（支持 `dist`、`build`、`public` 等常见目录）
3. 启动本地 HTTP 服务器
4. 自动在浏览器中打开网页
5. 按 `Ctrl+C` 停止服务器并自动清理临时文件

## 支持的目录结构

工具会自动检测以下目录作为网页根目录：

- 根目录 `/`
- `dist/` - 构建输出目录
- `build/` - 构建输出目录
- `public/` - 公共文件目录
- `www/` - 网页目录
- `docs/` - 文档目录
- `site/` - 站点目录
- `src/` - 源码目录

## 配置文件

配置文件保存在用户主目录下：`~/.web-preview-cli-config.json`

```json
{
  "repository": "https://github.com/user/repo.git",
  "branch": "main"
}
```

## 注意事项

- 需要确保已安装 Node.js (>=14.0.0)
- 需要确保已安装 git
- 需要有网络连接访问远程仓库
- 临时文件会在程序退出时自动清理

## API 使用

也可以作为模块在代码中使用：

```javascript
const { preview, createServer } = require('web-preview-cli');

// 启动预览
await preview({
  repository: 'https://github.com/user/repo.git',
  branch: 'main',
  port: 3000,
  autoOpen: true
});

// 或者只启动服务器
const server = await createServer('/path/to/web/root', 3000);
```

## License

MIT
