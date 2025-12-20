#!/bin/bash

# 脚本标题
echo "=========================================="
echo "     活动文案上传环境初始化和启动脚本     "
echo "=========================================="

# 定义颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # 无颜色

# 检查 Python 是否已安装
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}错误: Python3 未安装，请先安装 Python3${NC}"
    exit 1
fi

# 获取脚本所在目录的绝对路径
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 检查虚拟环境是否存在
if [ ! -d "myenv" ]; then
    echo -e "${YELLOW}虚拟环境不存在，正在创建...${NC}"
    python3 -m venv myenv
    if [ $? -ne 0 ]; then
        echo -e "${RED}创建虚拟环境失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}虚拟环境创建成功${NC}"
    
    # 激活虚拟环境
    if [ "$(uname)" == "Darwin" ] || [ "$(uname)" == "Linux" ]; then
        echo "激活虚拟环境 (Unix/Mac OS)"
        source myenv/bin/activate
    elif [ "$(expr substr $(uname -s) 1 5)" == "MINGW" ] || [ "$(expr substr $(uname -s) 1 5)" == "MSYS" ]; then
        echo "激活虚拟环境 (Windows)"
        source myenv/Scripts/activate
    else
        echo -e "${RED}无法识别的操作系统，请手动激活虚拟环境${NC}"
        exit 1
    fi
    
    # 检查是否成功激活虚拟环境
    if [ $? -ne 0 ]; then
        echo -e "${RED}激活虚拟环境失败${NC}"
        exit 1
    fi
    
    # 更新pip和setuptools
    echo -e "${YELLOW}正在更新pip和setuptools...${NC}"
    pip install --upgrade pip setuptools wheel
    if [ $? -ne 0 ]; then
        echo -e "${RED}更新pip和setuptools失败${NC}"
        exit 1
    fi
    
    # 安装依赖
    echo -e "${YELLOW}正在安装/更新依赖...${NC}"
    pip install -e . || pip install -e . --no-deps
    if [ $? -ne 0 ]; then
        echo -e "${RED}安装依赖失败，尝试逐个安装依赖${NC}"
        
        # 从requirements.txt中逐行读取并安装依赖
        while read -r requirement; do
            # 跳过空行和注释
            if [[ -z "$requirement" || "$requirement" == \#* ]]; then
                continue
            fi
            
            echo -e "${YELLOW}正在安装: $requirement${NC}"
            pip install "$requirement"
        done < requirements.txt
    fi
    
    echo -e "${GREEN}依赖安装成功${NC}"
    echo -e "${GREEN}环境初始化完成！${NC}"
    echo ""
else
    echo -e "${GREEN}使用已有的虚拟环境${NC}"
    
    # 激活虚拟环境
    if [ "$(uname)" == "Darwin" ] || [ "$(uname)" == "Linux" ]; then
        echo "激活虚拟环境 (Unix/Mac OS)"
        source myenv/bin/activate
    elif [ "$(expr substr $(uname -s) 1 5)" == "MINGW" ] || [ "$(expr substr $(uname -s) 1 5)" == "MSYS" ]; then
        echo "激活虚拟环境 (Windows)"
        source myenv/Scripts/activate
    else
        echo -e "${RED}无法识别的操作系统，请手动激活虚拟环境${NC}"
        exit 1
    fi
    
    # 检查是否成功激活虚拟环境
    if [ $? -ne 0 ]; then
        echo -e "${RED}激活虚拟环境失败${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}环境已激活，开始运行上传脚本${NC}"
fi

# 运行上传脚本
echo -e "${YELLOW}启动活动文案上传工具...${NC}"
python run_upload.py

# 如果脚本结束，确保退出虚拟环境
deactivate 