# 活动文案和礼物配置管理工具

这是一个用于管理活动文案和礼物配置的工具，通过与飞书 API 交互获取数据，并将数据上传到 Chatchill 平台的管理后台。

## 功能特点

- 支持从飞书文档中获取活动文案和礼物配置信息
- 支持多大区（XM、FR、TW 等）的文案和礼物配置管理
- 自动校验礼物是否已正确配置，包括价格检查
- 可以选择上传规则奖励图片
- 支持测试和生产环境切换

## 环境要求

- Python 3.6+
- 所需第三方库见 requirements.txt

## 安装方法

### 方法一：使用 pip 直接安装

```bash
# 克隆代码库
git clone https://github.com/yourusername/event-tools.git
cd event-tools

# 安装依赖
pip install -r requirements.txt
```

### 方法二：使用 setup.py 安装

```bash
# 克隆代码库
git clone https://github.com/yourusername/event-tools.git
cd event-tools

# 安装包及其依赖
pip install -e .
```

## 配置说明

在运行前，需要配置以下文件：

1. `config/congif.ini` - 配置飞书 API 的 App_id 和 App_Secret
2. `config/activity_config.py` - 配置活动 ID、环境设置和其他参数

配置文件示例：

```ini
# congif.ini
[feishu]
App_id = your_app_id
App_Secret = your_app_secret
```

```python
# activity_config.py
ENVIRONMENT = 0  # 0表示测试环境，1表示正式环境
PUSH_IMAGE_FLAG = 0  # 是否上传规则奖励图片
DEFAULT_ACTIVITY_ID = '20061'  # 默认活动ID
DEFAULT_IMAGE_NUMS = 12  # 默认图片数量
PLATFORM_TYPE = 1  # 平台类型，1表示Chatchill

# 活动配置 {活动ID: (活动名称, 飞书文档ID)}
ACTIVITY_CONFIG = {
    '20061': ('活动名称', 'feishu_doc_id'),
}
```

## 使用方法

```bash
# 进入项目目录
cd event-tools

# 运行主程序
python -m getdata.chatchill.check_gift_copywriter
```

## 目录结构

```
event-tools/
├── config/
│   ├── congif.ini          # 飞书API配置
│   ├── activity_config.py  # 活动配置
│   └── get_token.py        # Token获取模块
├── getdata/
│   └── chatchill/
│       └── check_gift_copywriter.py  # 主程序
├── logs/                   # 日志目录
├── requirements.txt        # 依赖列表
├── setup.py                # 安装脚本
└── README.md               # 项目说明
```

## 日志

日志文件将保存在`logs`目录下，文件名格式为`Hiyoosendtext_YYYY-MM-DD.log`。
