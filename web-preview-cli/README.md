# Activity Web CLI (actweb)

一个用于快速创建活动页面的命令行工具，支持从 GitHub 下载模板、本地预览、智能缓存等功能。

## 安装

```bash
# 全局安装
npm install -g web-preview-cli

# 或从本地安装
npm install -g ./web-preview-cli-1.0.0.tgz
```

## 命令

### `actweb create`

启动 Activity 创建工具，打开一个表单页面用于创建活动项目。

```bash
actweb create
actweb create -p 8080        # 指定端口
actweb create --no-open      # 不自动打开浏览器
```

**功能：**
- 从 GitHub 下载创建表单页面
- 填写表单后点击 "Down Template" 下载项目模板
- 自动生成 `config.ts` 配置文件
- 支持下载 `activity`、`activity_op`、`activity_op_hot` 目录

### `actweb cache`

管理模板缓存。

```bash
actweb cache           # 查看缓存状态
actweb cache -v        # 查看缓存状态（同上）
actweb cache -r        # 强制刷新缓存
actweb cache -c        # 清除缓存
```

**输出示例：**
```
📁 缓存目录: /Users/xxx/.actweb-cache
📌 缓存版本: a1b2c3d
✓ 已缓存的项目:
  yoho: activity, activity_op, activity_op_hot
  hiyoo: activity, activity_op, activity_op_hot
  soulstar: activity, activity_op, activity_op_hot
  dramebit: activity, activity_op, activity_op_hot
```

### `actweb url <htmlUrl>`

从指定 URL 下载 HTML 文件并本地预览。

```bash
actweb url https://example.com/page.html
actweb url https://github.com/user/repo/blob/main/index.html
```

### `actweb start`

从 Git 仓库下载网页并启动预览服务器。

```bash
actweb start -r https://github.com/user/repo
actweb start -r https://github.com/user/repo -b develop
```

### `actweb update` (别名: `actweb u`)

从 GitHub 下载最新源码并自动更新 CLI。

```bash
actweb update       # 检查并更新到最新版本
actweb u            # 简写形式
actweb update -f    # 强制更新
```

**更新流程：**
1. 从 GitHub 下载 `web-preview-cli` 最新源码到临时目录
2. 在临时目录执行 `npm pack` 打包
3. 执行 `npm install -g` 全局安装
4. 清理临时文件

**输出示例：**
```
🔄 检查更新...

临时目录: /tmp/actweb-update-1234567890
📥 下载最新源码...
✓ 源码下载完成
📦 打包中...
✓ 打包完成: web-preview-cli-1.0.0.tgz
🚀 安装更新...
✓ 安装完成

✅ 更新成功！
运行 'actweb --version' 查看新版本
```

### `actweb config`

管理配置。

```bash
actweb config              # 查看当前配置
actweb config -s <repo>    # 设置默认仓库
actweb config -b <branch>  # 设置默认分支
actweb config -d           # 删除配置
```

## 缓存机制

### 智能缓存

为了加快模板下载速度，工具实现了智能缓存机制：

1. **预缓存**：运行 `actweb create` 时，后台自动预下载所有项目模板和创建页面 HTML
2. **版本控制**：通过 GitHub commit SHA 检测模板更新
3. **自动更新**：检测到远程模板更新时，自动刷新缓存
4. **进度显示**：下载时实时显示下载进度

缓存内容包括：
- 所有项目模板（yoho, hiyoo, soulstar, dramebit）
- Activity 创建页面 HTML（`create-page/index.html`）

### 下载进度显示

缓存下载时会实时显示下载进度：

```
🚀 检查模板缓存...
  检测到模板更新，将刷新缓存
  下载模板中... (7/12)
✓ 模板预缓存完成
```

### 缓存目录结构

```
~/.actweb-cache/
├── .version              # 版本标识（commit SHA）
├── yoho/
│   ├── activity/         # 主活动模板
│   ├── activity_op/      # OP 模板
│   └── activity_op_hot/  # HOT 模板
├── hiyoo/
│   └── ...
├── soulstar/
│   └── ...
└── dramebit/
    └── ...
```

### 缓存工作流程

```
启动 actweb create
       ↓
  获取远程版本 (commit SHA)
       ↓
  对比本地 .version 文件
       ↓
┌─────────────────────────┐
│  版本一致?              │
├───────┬─────────────────┤
│  是   │       否        │
│   ↓   │        ↓        │
│ 使用  │  清除旧缓存      │
│ 缓存  │       ↓         │
│       │  重新下载模板    │
│       │       ↓         │
│       │  保存新版本      │
└───────┴─────────────────┘
```

#### 核心代码示例

```javascript
const { 
  preCacheTemplates,   // 预缓存模板
  preparePythonEnv,    // 准备 Python 环境
  clearCache,          // 清除缓存
  getCacheInfo         // 获取缓存信息
} = require('web-preview-cli');

// 1. 预缓存模板（首次自动下载，后续检查更新）
await preCacheTemplates();
// 输出: ✓ 创建页缓存已准备好
// 输出: ✓ 模板缓存已准备好

// 2. 强制刷新缓存
await preCacheTemplates(true);
// 输出: ⚠️ 检测到远程有变更，重新下载缓存...

// 3. 准备 Python 环境（用于上传文案功能）
await preparePythonEnv();
// 输出: ✓ Python 环境已准备好（使用缓存）

// 4. 强制刷新 Python 环境
await preparePythonEnv(true);
// 输出: 📦 准备 Python 环境...
// 输出: ✓ Python 脚本下载完成
// 输出: ✓ 虚拟环境创建完成
// 输出: ✓ Python 依赖安装完成

// 5. 获取缓存信息
const info = getCacheInfo();
console.log(info);
// {
//   cacheDir: '/Users/xxx/.actweb-cache',
//   exists: true,
//   version: 'abc123...',
//   projects: [
//     { name: 'yoho', templates: ['activity', 'activity_op', 'activity_op_hot'] },
//     ...
//   ]
// }

// 6. 清除所有缓存
clearCache();
// 返回 true 表示清除成功
```

### 特殊情况处理

| 情况           | 处理方式             |
| -------------- | -------------------- |
| 网络错误       | 使用本地缓存         |
| 缓存正在下载中 | 等待下载完成后再使用 |
| 没有缓存       | 从 GitHub 下载       |
| 远程模板更新   | 自动刷新缓存         |

## 下载模板功能

### 支持的项目

- **Yoho**
- **Hiyoo**
- **SoulStar**
- **DramaBit**

### 下载的目录

根据表单选项，可下载以下目录：

| 选项       | 目录                                                   | 数量           |
| ---------- | ------------------------------------------------------ | -------------- |
| 主活动     | `{name}`                                               | 1              |
| Swiper OP  | `{name}_op`, `{name}_op1`, `{name}_op2`...             | 由 opNum 决定  |
| Hot Banner | `{name}_op_hot`, `{name}_op_hot1`, `{name}_op_hot2`... | 由 hotNum 决定 |

### 目标目录

模板会下载到：
```
{当前工作目录}/src/page/{catalog}/{name}/
```

### config.ts 自动生成

每个下载的目录都会自动生成 `config.ts` 文件，包含：

```typescript
export const config = {
  activityId: 123,
  projectName: '/activity/202412_Christmas',
  backgroundColor: '#ff0000',
}

export const info = `...提测信息...`  // 仅主目录包含

export const documentLink = `...需求文档链接...`
export const textLink = `...文案链接...`
export const figmaLink = `...Figma链接...`
export const ossLink = `...OSS上传地址...`
export const testJenkinsLink = `...测试环境Jenkins...`
export const prodJenkinsLink = `...生产环境Jenkins...`
```

## 编程接口

可以作为模块在代码中使用：

```javascript
const {
  // 预览功能
  preview,
  previewUrl,
  downloadFile,
  convertToRawUrl,

  // 配置功能
  getConfig,
  setConfig,
  showConfig,
  deleteConfig,

  // 服务器功能
  createServer,

  // 缓存功能
  preCacheTemplates,
  clearCache,
  getCacheInfo,
  CACHE_DIR,
  VERSION_FILE,
} = require('web-preview-cli');

// 清除缓存
clearCache();

// 获取缓存信息
const info = getCacheInfo();
console.log(info);
// {
//   cacheDir: '/Users/xxx/.actweb-cache',
//   exists: true,
//   version: 'a1b2c3d...',
//   projects: [
//     { name: 'yoho', templates: ['activity', 'activity_op', 'activity_op_hot'] },
//     ...
//   ]
// }

// 预缓存模板
await preCacheTemplates();

// 强制刷新缓存
await preCacheTemplates(true);
```

## 性能优化

| 操作              | 无缓存   | 有缓存 |
| ----------------- | -------- | ------ |
| 下载单个模板      | ~5-10秒  | ~0.1秒 |
| 下载 3 个 OP 模板 | ~15-30秒 | ~0.3秒 |

## License

MIT
