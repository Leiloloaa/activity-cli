#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
from pathlib import Path
from loguru import logger
from configobj import ConfigObj
import importlib.util

# 确保日志目录存在
def ensure_log_dir():
    log_path = Path.joinpath(Path.cwd(), 'logs')
    if not os.path.exists(log_path):
        os.makedirs(log_path)
    return log_path

# 检查配置文件是否存在
def check_config_files():
    config_path = Path.joinpath(Path.cwd(), 'config/congif.ini')
    if not os.path.exists(config_path):
        logger.error("配置文件不存在: {}".format(config_path))
        print(f"错误: 配置文件不存在 {config_path}")
        return False
    
    config_module_path = Path.joinpath(Path.cwd(), 'config/activity_config.py')
    if not os.path.exists(config_module_path):
        logger.error("活动配置文件不存在: {}".format(config_module_path))
        print(f"错误: 活动配置文件不存在 {config_module_path}")
        return False
    
    return True

# 导入并执行检查脚本
def run_check_script():
    try:
        # 动态导入模块
        if Path('getdata/chatchill/check_gift_copywriter.py').exists():
            module_path = 'getdata.chatchill.check_gift_copywriter'
        elif Path('getdata/check_event_gift_copywriter.py').exists():
            module_path = 'getdata.check_event_gift_copywriter'
        else:
            logger.error("找不到检查脚本文件")
            print("错误: 找不到检查脚本文件")
            return False
        
        # 调用模块中的main函数
        module = importlib.import_module(module_path)
        # module的main函数在__name__ == '__main__'块中，需要手动执行其中的逻辑
        print(f"开始执行 {module_path} 中的检查逻辑...")
        
        # 获取活动配置信息
        spec = importlib.util.find_spec('config.activity_config')
        activity_config = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(activity_config)
        
        # 打印可用活动
        print("\n可用活动列表:")
        print("-" * 50)
        for act_id, (act_name, _) in activity_config.ACTIVITY_CONFIG.items():
            print(f"活动ID: {act_id} - 活动名称: {act_name}")
        print("-" * 50)
        
        # 确认环境设置
        env_name = "测试环境" if activity_config.ENVIRONMENT == 0 else "正式环境"
        print(f"\n当前环境设置: {env_name}")
        print(f"上传规则奖励图片: {'是' if activity_config.PUSH_IMAGE_FLAG == 1 else '否'}")
        
        # 确认是否继续
        confirm = input("\n是否继续执行? (y/n): ")
        if confirm.lower() != 'y':
            print("操作已取消")
            return False
        
        # 执行脚本主逻辑
        return module_path
        
    except Exception as e:
        logger.error(f"执行脚本时发生错误: {str(e)}")
        print(f"执行脚本时发生错误: {str(e)}")
        return False

if __name__ == "__main__":
    # 初始化
    print("=" * 50)
    print("活动文案和礼物配置管理工具")
    print("=" * 50)
    
    # 确保日志目录存在
    log_dir = ensure_log_dir()
    logger.add(f"{log_dir}/run_log_{{time:YYYY-MM-DD}}.log", rotation="00:00")
    
    # 检查配置文件
    if not check_config_files():
        sys.exit(1)
    
    # 运行检查脚本
    module_path = run_check_script()
    if module_path:
        print(f"\n导入模块路径: {module_path}")
        print("请确认以上信息后，使用以下命令运行脚本:")
        print(f"\npython -m {module_path}")
        
        # 询问是否直接运行
        run_now = input("\n是否立即运行? (y/n): ")
        if run_now.lower() == 'y':
            os.system(f"python -m {module_path}")
            print("\n执行完成!")
        else:
            print("\n您可以稍后手动运行上述命令")
    else:
        sys.exit(1) 