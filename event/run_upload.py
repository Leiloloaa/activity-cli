#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
活动文案上传运行脚本
方便用户选择和上传活动文案
"""

import sys
import os
import importlib
import re
from pathlib import Path

# 延迟导入配置，确保每次使用最新的配置
def get_config():
    """获取最新的配置"""
    # 强制重新加载配置模块
    if 'config.activity_config' in sys.modules:
        importlib.reload(sys.modules['config.activity_config'])
    
    # 导入配置
    import config.activity_config as config
    return config

def show_menu():
    """显示活动选择菜单"""
    # 获取最新配置
    config = get_config()
    
    # 平台类型映射
    platform_names = {
        0: "Yoho (Waka)",
        1: "Hiyoo (Chatchill)", 
        2: "SoulStar (dopalive)",
        3: "DramaBit"
    }
    
    # 平台对应的活动ID前缀
    platform_prefixes = {
        0: "1",      # Yoho: 1xxxx
        1: "2",      # Hiyoo: 2xxxx
        2: "5",      # SoulStar: 5xxxx (或 3xxxx)
        3: "4"       # DramaBit: 4xxxx
    }
    
    print("\n===== 活动文案上传工具 =====")
    print(f"当前环境: {'测试环境' if config.ENVIRONMENT == 0 else '正式环境'}")
    print(f"规则奖励图: {'不上传' if config.PUSH_IMAGE_FLAG == 0 else '上传'}")
    print(f"平台类型: {platform_names.get(config.PLATFORM_TYPE, 'Yoho (Waka)')}")
    print("\n可用活动列表:")
    
    platform_prefix = platform_prefixes.get(config.PLATFORM_TYPE, "1")
    
    for activity_id, (activity_name, _) in config.ACTIVITY_CONFIG.items():
        # 根据平台类型筛选活动
        activity_id_str = str(activity_id)
        # SoulStar 同时匹配 3xxxx 和 5xxxx
        if config.PLATFORM_TYPE == 2:
            if activity_id_str.startswith("5") or activity_id_str.startswith("3"):
                print(f"  [{activity_id}] {activity_name}")
        elif activity_id_str.startswith(platform_prefix) or (platform_prefix == "1" and (isinstance(activity_id, int) and activity_id < 20000)):
            print(f"  [{activity_id}] {activity_name}")
    
    print("\n选项:")
    print("  [0] 退出")
    print("  [1] 切换环境")
    print("  [2] 切换规则奖励图上传")
    print("  [3] 切换平台类型")
    print("  [4] 添加新活动配置")
    print("  [活动ID] 选择并上传该活动")
    
    choice = input("\n请输入选择: ")
    return choice

def get_config_path():
    """获取配置文件路径"""
    # 先尝试在当前目录下的config查找
    config_path = os.path.join("config", "activity_config.py")
    if os.path.exists(config_path):
        return config_path
    
    # 再尝试在event/config下查找
    config_path = os.path.join("event", "config", "activity_config.py")
    if os.path.exists(config_path):
        return config_path
    
    # 查找当前文件所在目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    config_path = os.path.join(current_dir, "config", "activity_config.py")
    if os.path.exists(config_path):
        return config_path
    
    # 查找项目根目录
    project_root = os.path.dirname(current_dir)
    config_path = os.path.join(project_root, "event", "config", "activity_config.py")
    if os.path.exists(config_path):
        return config_path
    
    # 如果都找不到，返回一个默认路径
    return os.path.join("config", "activity_config.py")

def update_config(key, value):
    """更新配置文件中的值"""
    # 获取配置文件路径
    config_path = get_config_path()
    
    if not os.path.exists(config_path):
        print(f"错误：找不到配置文件 {config_path}")
        return False
    
    try:
        # 读取原始配置文件
        with open(config_path, "r", encoding="utf-8") as f:
            content = f.read()
            print(f"读取配置文件: {config_path}, 大小: {len(content)} 字节")
        
        # 使用更可靠的正则表达式替换配置值
        pattern = re.compile(rf"^{key}\s*=\s*.*$", re.MULTILINE)
        matches = pattern.findall(content)
        if matches:
            print(f"找到原始配置项: {matches[0]}")
            updated_content = pattern.sub(f"{key} = {value}", content)
            
            # 写入更新后的配置
            with open(config_path, "w", encoding="utf-8") as f:
                f.write(updated_content)
                print(f"配置已更新: {key} = {value}")
            
            # 强制重新加载配置模块
            if 'config.activity_config' in sys.modules:
                importlib.reload(sys.modules['config.activity_config'])
            
            # 验证更改是否生效
            config = get_config()
            config_value = getattr(config, key)
            print(f"更新后实际配置值: {config_value}")
            
            if config_value != value:
                print(f"警告：配置未正确更新，期望值 {value}，实际值 {config_value}")
                return False
            
            return True
        else:
            print(f"错误：找不到配置项 {key}")
            return False
    except Exception as e:
        print(f"更新配置时出错: {e}")
        import traceback
        traceback.print_exc()
        return False

def run_upload(activity_id):
    """运行上传脚本"""
    # 获取最新配置
    config = get_config()
    
    # 确保环境变量正确
    os.environ['PYTHONPATH'] = os.getcwd()
    
    # 确保活动ID设置为默认值
    update_config("DEFAULT_ACTIVITY_ID", activity_id)
    
    # 平台脚本映射
    platform_scripts = {
        0: ("Yoho (Waka)", "getdata/check_event_gift_copywriter.py"),
        1: ("Hiyoo (Chatchill)", "getdata/chatchill/check_gift_copywriter.py"),
        2: ("SoulStar (dopalive)", "getdata/soulstar/check_gift_copywriter.py"),
        3: ("DramaBit", "getdata/check_event_gift_copywriter.py"),  # DramaBit 暂用 Waka 脚本
    }
    
    platform_name, script_path = platform_scripts.get(config.PLATFORM_TYPE, platform_scripts[0])
    print(f"执行 {platform_name} 平台上传脚本，活动ID: {activity_id}")
    os.system(f"python3 {script_path} --activity_id {activity_id} --force_reload")

def add_activity_config():
    """添加新的活动配置"""
    try:
        # 获取用户输入
        activity_id = input("请输入活动ID (纯数字): ").strip()
        activity_name = input("请输入活动名称: ").strip()
        doc_id = input("请输入飞书文档ID: ").strip()
        
        # 验证输入
        if not activity_id.isdigit():
            print("错误：活动ID必须是纯数字")
            return False
            
        activity_id = int(activity_id)
        
        if not activity_name or not doc_id:
            print("错误：活动名称和文档ID不能为空")
            return False
            
        # 获取配置文件路径
        config_path = get_config_path()
        
        if not os.path.exists(config_path):
            print(f"错误：找不到配置文件 {config_path}")
            return False
            
        try:
            # 读取原始配置文件
            with open(config_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # 在ACTIVITY_CONFIG字典中查找最后一个条目
            pattern = re.compile(r"ACTIVITY_CONFIG\s*=\s*{[^}]*}", re.DOTALL)
            match = pattern.search(content)
            
            if not match:
                print("错误：无法在配置文件中找到ACTIVITY_CONFIG")
                return False
                
            # 构建新的活动配置条目
            new_activity = f'    {activity_id}: ("{activity_name}", "{doc_id}"),'
            
            # 在字典的最后一个条目后插入新条目
            dict_content = match.group()
            last_brace_pos = dict_content.rfind("}")
            updated_dict = dict_content[:last_brace_pos] + "\n" + new_activity + "\n" + dict_content[last_brace_pos:]
            
            # 更新配置文件内容
            updated_content = content.replace(dict_content, updated_dict)
            
            # 写入更新后的配置
            with open(config_path, "w", encoding="utf-8") as f:
                f.write(updated_content)
                
            print(f"成功添加新活动配置：[{activity_id}] {activity_name}")
            
            # 强制重新加载配置模块
            if 'config.activity_config' in sys.modules:
                importlib.reload(sys.modules['config.activity_config'])
                
            return True
            
        except Exception as e:
            print(f"添加活动配置时出错: {e}")
            import traceback
            traceback.print_exc()
            return False
            
    except KeyboardInterrupt:
        print("\n取消添加活动配置")
        return False

def main():
    """主函数"""
    while True:
        choice = show_menu()
        
        if choice == "0":
            print("退出程序")
            sys.exit(0)
        elif choice == "1":
            # 获取最新配置
            config = get_config()
            new_env = 1 if config.ENVIRONMENT == 0 else 0
            if update_config("ENVIRONMENT", new_env):
                print(f"环境已切换为: {'正式环境' if new_env == 1 else '测试环境'}")
        elif choice == "2":
            # 获取最新配置
            config = get_config()
            new_flag = 1 if config.PUSH_IMAGE_FLAG == 0 else 0
            if update_config("PUSH_IMAGE_FLAG", new_flag):
                print(f"规则奖励图已设为: {'上传' if new_flag == 1 else '不上传'}")
        elif choice == "3":
            # 获取最新配置
            config = get_config()
            # 循环切换4个平台: 0->1->2->3->0
            new_platform = (config.PLATFORM_TYPE + 1) % 4
            platform_names = {
                0: "Yoho (Waka)",
                1: "Hiyoo (Chatchill)",
                2: "SoulStar (dopalive)",
                3: "DramaBit"
            }
            if update_config("PLATFORM_TYPE", new_platform):
                print(f"平台类型已切换为: {platform_names[new_platform]}")
        elif choice == "4":
            # 添加新活动配置
            add_activity_config()
        else:
            try:
                # 转换活动ID
                activity_id = int(choice)
                
                # 获取最新配置
                config = get_config()
                
                # 检查活动ID是否存在
                activity_id_str = str(activity_id)
                activity_exists = False
                
                if activity_id in config.ACTIVITY_CONFIG:
                    activity_exists = True
                    activity_name = config.ACTIVITY_CONFIG[activity_id][0]
                elif activity_id_str in config.ACTIVITY_CONFIG:
                    activity_exists = True
                    activity_name = config.ACTIVITY_CONFIG[activity_id_str][0]
                
                if activity_exists:
                    if update_config("DEFAULT_ACTIVITY_ID", activity_id):
                        print(f"准备上传活动: {activity_id} - {activity_name}")
                        run_upload(activity_id)
                else:
                    print(f"错误: 活动ID {activity_id} 不存在")
                    # 显示可用活动ID
                    print("可用活动ID:")
                    for aid in config.ACTIVITY_CONFIG.keys():
                        print(f"  {aid}")
            except ValueError:
                print("无效的选择，请重新输入")

if __name__ == "__main__":
    main() 