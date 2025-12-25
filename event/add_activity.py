#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
接收Node.js传来的活动信息，更新activity_config.py文件
并自动上传文案到相应平台
"""

import sys
import re
import os
import traceback
import subprocess
from pathlib import Path

def check_environment():
    """检查环境是否正确设置"""
    try:
        # 检查Python版本
        print(f"Python版本: {sys.version}")
        print(f"Python路径: {sys.executable}")
        
        # 检查是否为虚拟环境的Python解释器路径
        is_venv = 'myenv' in sys.executable
        if is_venv:
            # 如果Python解释器路径中包含myenv，则认为是在虚拟环境中
            print(f"检测到虚拟环境Python: {sys.executable}")
            # 如果VIRTUAL_ENV环境变量未设置，手动设置
            if 'VIRTUAL_ENV' not in os.environ:
                venv_path = os.path.dirname(os.path.dirname(sys.executable))
                os.environ['VIRTUAL_ENV'] = venv_path
                print(f"手动设置VIRTUAL_ENV: {venv_path}")
        else:
            # 检查环境变量
            venv = os.environ.get('VIRTUAL_ENV')
            if venv:
                print(f"使用虚拟环境: {venv}")
            else:
                print("警告: 未检测到虚拟环境")
            
        # 检查当前工作目录
        print(f"当前工作目录: {os.getcwd()}")
        
        # 确保event目录存在
        if not os.path.exists('event'):
            print(f"错误: 找不到event目录，请确保在正确的目录中运行脚本")
            return False
            
        return True
    except Exception as e:
        print(f"环境检查出错: {str(e)}")
        return False

def extract_doc_id(feishu_url):
    """从飞书文档URL中提取文档ID"""
    print(f"正在提取文档ID，URL: {feishu_url}")
    
    # 尝试使用正则表达式提取文档ID
    patterns = [
        r'https?://.*?/(?:wiki|docs|file)/([A-Za-z0-9]+\?.*)',  # 统一匹配飞书各种格式的URL，将文档ID和查询参数作为一个整体捕获
    ]
    
    for pattern in patterns:
        match = re.search(pattern, feishu_url)
        if match and match.groups() and len(match.groups()) > 0:
            doc_id = match.group(1)
            print(f"使用正则表达式 '{pattern}' 提取到文档ID: {doc_id}")
            return doc_id
    
    # 如果无法使用正则表达式提取，尝试使用URL的最后一部分
    parts = feishu_url.split('/')
    if len(parts) > 0:
        doc_id = parts[-1].split('?')[0]  # 移除查询参数
        if doc_id:
            print(f"使用URL分割提取到文档ID: {doc_id}")
            return doc_id
    
    # 如果还是无法提取，则返回整个URL
    print(f"无法提取文档ID，将使用完整URL: {feishu_url}")
    return feishu_url

def update_activity_config(activity_id, activity_name, feishu_url, project_name="Yoho"):
    """更新activity_config.py文件，添加新的活动配置"""
    config_path = os.path.join("event", "config", "activity_config.py")
    
    # 检查文件是否存在
    if not os.path.exists(config_path):
        print(f"错误: 找不到配置文件 {config_path}")
        print(f"当前工作目录: {os.getcwd()}")
        print(f"文件列表: {os.listdir('event/config') if os.path.exists('event/config') else '目录不存在'}")
        return False
    
    try:
        # 读取配置文件内容
        with open(config_path, "r", encoding="utf-8") as f:
            content = f.read()
            print(f"成功读取配置文件，大小: {len(content)} 字节")
        
        # 提取文档ID
        doc_id = extract_doc_id(feishu_url)
        print(f"从URL提取的文档ID: {doc_id}")
        
        # 根据 project_name 确定平台
        # Yoho, Hiyoo -> Chatchill
        # SoulStar -> SoulStar (dopalive)
        # DramaBit -> DramaBit
        platform_map = {
            "Yoho": "Chatchill",
            "Hiyoo": "Chatchill",
            "SoulStar": "SoulStar",
            "DramaBit": "DramaBit",
        }
        platform = platform_map.get(project_name, "Chatchill")
        print(f"活动平台: {platform} (项目: {project_name})")
        
        # 构建新的活动配置项
        new_activity = f'    {activity_id}: ("{activity_name}", "{doc_id}"),'
        print(f"新活动配置项: {new_activity}")
        
        # 使用简单的字符串操作来添加新活动
        # 查找ACTIVITY_CONFIG字典的开始和结束位置
        config_start = content.find("ACTIVITY_CONFIG = {")
        if config_start == -1:
            print("错误: 无法在配置文件中找到ACTIVITY_CONFIG字典的开始")
            return False
            
        config_end = content.find("}", config_start)
        if config_end == -1:
            print("错误: 无法在配置文件中找到ACTIVITY_CONFIG字典的结束")
            return False
        
        print(f"找到配置字典位置: {config_start} 到 {config_end}")
        
        # 提取现有配置内容
        config_content = content[config_start + len("ACTIVITY_CONFIG = {"):config_end]
        print(f"提取的配置内容长度: {len(config_content)} 字节")
        
        # 检查活动ID是否已存在
        id_pattern = rf"{activity_id}\s*:"
        id_exists = re.search(id_pattern, config_content) is not None
        
        if id_exists:
            print(f"活动ID {activity_id} 已存在，将替换现有配置")
            # 使用正则表达式替换已存在的活动配置行
            pattern = rf"{activity_id}\s*:\s*\([^)]+\),"
            updated_config = re.sub(pattern, new_activity, config_content)
        else:
            print(f"活动ID {activity_id} 不存在，将添加新配置")
            # 根据平台确定插入位置
            platform_marker = f"# {platform}平台活动"
            if platform_marker in config_content:
                print(f"在{platform}平台部分添加")
                insert_pos = config_content.find(platform_marker) + len(platform_marker)
                updated_config = config_content[:insert_pos] + "\n" + new_activity + config_content[insert_pos:]
            else:
                # 如果没有对应平台标记，添加到末尾
                print(f"没有找到{platform}标记，添加到末尾")
                updated_config = config_content.strip() + f"\n    # {platform}平台活动\n{new_activity}\n"
        
        # 构建更新后的完整内容
        updated_content = content[:config_start + len("ACTIVITY_CONFIG = {")] + updated_config + content[config_end:]
        
        # 保存更新后的内容
        with open(config_path, "w", encoding="utf-8") as f:
            f.write(updated_content)
            print(f"成功写入更新后的配置文件，大小: {len(updated_content)} 字节")
        
        # 设置DEFAULT_ACTIVITY_ID
        try:
            default_pattern = r'DEFAULT_ACTIVITY_ID\s*=\s*\d+'
            if re.search(default_pattern, content):
                updated_content = re.sub(
                    default_pattern,
                    f"DEFAULT_ACTIVITY_ID = {activity_id}",
                    updated_content
                )
                with open(config_path, "w", encoding="utf-8") as f:
                    f.write(updated_content)
                    print(f"成功更新DEFAULT_ACTIVITY_ID为 {activity_id}")
                
                # 额外验证DEFAULT_ACTIVITY_ID是否被正确更新
                with open(config_path, "r", encoding="utf-8") as f:
                    verify_content = f.read()
                
                if f"DEFAULT_ACTIVITY_ID = {activity_id}" in verify_content:
                    print(f"验证成功: DEFAULT_ACTIVITY_ID已正确更新为 {activity_id}")
                else:
                    print(f"警告: DEFAULT_ACTIVITY_ID可能未正确更新")
                    # 尝试直接添加DEFAULT_ACTIVITY_ID定义
                    if "DEFAULT_ACTIVITY_ID =" not in verify_content:
                        insert_pos = verify_content.find("# 平台类型")
                        if insert_pos != -1:
                            updated_verify_content = verify_content[:insert_pos] + f"\n# 默认使用的活动ID\nDEFAULT_ACTIVITY_ID = {activity_id}\n\n" + verify_content[insert_pos:]
                            with open(config_path, "w", encoding="utf-8") as f:
                                f.write(updated_verify_content)
                                print(f"已添加DEFAULT_ACTIVITY_ID定义，值为 {activity_id}")
            else:
                print("警告: 未找到DEFAULT_ACTIVITY_ID设置，添加新的设置")
                # 尝试在PLATFORM_TYPE之前添加DEFAULT_ACTIVITY_ID
                platform_pos = updated_content.find("# 平台类型")
                if platform_pos != -1:
                    updated_content = updated_content[:platform_pos] + f"\n# 默认使用的活动ID\nDEFAULT_ACTIVITY_ID = {activity_id}\n\n" + updated_content[platform_pos:]
                    with open(config_path, "w", encoding="utf-8") as f:
                        f.write(updated_content)
                        print(f"成功添加DEFAULT_ACTIVITY_ID设置，值为 {activity_id}")
        except Exception as sub_e:
            print(f"更新DEFAULT_ACTIVITY_ID时出错: {str(sub_e)}")
            # 继续执行，不要因为这个错误终止整个操作
        
        print(f"成功添加活动: {activity_id} - {activity_name}")
        return True
    
    except Exception as e:
        print(f"更新配置文件时出错: {str(e)}")
        traceback_info = traceback.format_exc()
        print(f"错误详细信息:\n{traceback_info}")
        return False
    
def run_upload_script(activity_id):
    """调用文案上传脚本的实际功能，而不是启动交互式菜单"""
    try:
        # 设置调试模式
        DEBUG_MODE = False
        
        # 设置默认活动ID
        print(f"调用文案上传脚本，活动ID: {activity_id}")
        
        # 导入配置模块
        import config.activity_config
        import config.get_token

        # 设置默认活动ID
        print(f"正在将活动ID {activity_id} 设置为DEFAULT_ACTIVITY_ID")
        config.activity_config.DEFAULT_ACTIVITY_ID = activity_id
        
        # 此函数已弃用，请使用 run_upload_fallback
        print("警告: run_upload_script 已弃用，请使用 run_upload_fallback")
        
        # 使用默认的 Yoho 模块路径
        upload_module_path = "getdata.check_event_gift_copywriter"
        print(f"上传模块路径: {upload_module_path}")
        
        try:
            upload_module = __import__(upload_module_path, fromlist=["start_check"])
            print(f"成功导入上传模块: {upload_module}")
            
            if hasattr(upload_module, "start_check"):
                start_check_func = getattr(upload_module, "start_check")
                print(f"找到start_check函数: {start_check_func}")
                
                # 获取飞书文档ID
                activity_id_str = str(activity_id)
                print(f"查找活动ID {activity_id_str} 的配置信息")
                
                # 确保活动配置中的键类型匹配
                activity_config_dict = config.activity_config.ACTIVITY_CONFIG
                
                # 调试输出
                if DEBUG_MODE:
                    print("\n----- 调试信息 -----")
                    print(f"活动ID (字符串): {activity_id_str}")
                    print(f"活动ID (整数): {int(activity_id)}")
                    print(f"活动配置字典类型: {type(activity_config_dict)}")
                    print(f"活动配置字典键类型: {[type(k) for k in list(activity_config_dict.keys())[:5]]}")
                    print(f"活动配置字典键: {list(activity_config_dict.keys())}")
                    print(f"DEFAULT_ACTIVITY_ID: {config.activity_config.DEFAULT_ACTIVITY_ID}")
                    print(f"字符串键 {activity_id_str} 是否在字典中: {activity_id_str in activity_config_dict}")
                    print(f"整数键 {int(activity_id)} 是否在字典中: {int(activity_id) in activity_config_dict}")
                    
                    # 打印字典详情
                    print("\n活动配置字典内容:")
                    for k, v in activity_config_dict.items():
                        print(f"  键: {k} (类型: {type(k)}), 值: {v}")
                    
                    # 尝试直接访问不同形式的键
                    try:
                        print(f"\n直接访问 activity_config_dict[{activity_id_str}]: {activity_config_dict[activity_id_str]}")
                    except KeyError:
                        print(f"无法直接访问 activity_config_dict[{activity_id_str}], KeyError")
                    
                    try:
                        activity_id_int = int(activity_id)
                        print(f"直接访问 activity_config_dict[{activity_id_int}]: {activity_config_dict[activity_id_int]}")
                    except KeyError:
                        print(f"无法直接访问 activity_config_dict[{activity_id_int}], KeyError")
                    
                    # 输出活动配置文件内容
                    import inspect
                    config_file = inspect.getfile(config.activity_config)
                    print(f"\n配置文件路径: {config_file}")
                    with open(config_file, "r", encoding="utf-8") as f:
                        content = f.read()
                        print(f"配置文件中关于DEFAULT_ACTIVITY_ID的行:")
                        for line in content.split("\n"):
                            if "DEFAULT_ACTIVITY_ID" in line:
                                print(f"  {line}")
                        
                        print(f"\n配置文件中的ACTIVITY_CONFIG部分:")
                        in_config = False
                        for line in content.split("\n"):
                            if "ACTIVITY_CONFIG = {" in line:
                                in_config = True
                                print(f"  {line}")
                            elif in_config and "}" in line:
                                print(f"  {line}")
                                in_config = False
                            elif in_config:
                                print(f"  {line}")
                    print("----- 调试信息结束 -----\n")
                    
                    # 在调试模式下设置断点的模拟
                    input("按Enter键继续执行...")
                
                if activity_id_str in activity_config_dict:
                    # 字符串键匹配
                    activity_name, feishu_doc_id = activity_config_dict[activity_id_str]
                    print(f"通过字符串键 {activity_id_str} 找到活动")
                elif int(activity_id) in activity_config_dict:
                    # 整数键匹配
                    activity_name, feishu_doc_id = activity_config_dict[int(activity_id)]
                    print(f"通过整数键 {int(activity_id)} 找到活动")
                else:
                    print(f"错误: 活动ID {activity_id} 在配置中不存在")
                    print(f"可用活动IDs: {list(activity_config_dict.keys())}")
                    return False
                
                print(f"找到活动: {activity_id} - {activity_name}")
                print(f"飞书文档ID: {feishu_doc_id}")
                
                # 调用start_check函数
                print(f"开始执行上传...调用start_check({activity_id}, {feishu_doc_id}, ...)")
                start_check_func(
                    activity_id=activity_id,  # 确保传递原始活动ID，不要重新从配置中读取
                    feishu_doc_id=feishu_doc_id,
                    even=config.activity_config.ENVIRONMENT,
                    pushimg=config.activity_config.PUSH_IMAGE_FLAG
                )
                print("上传执行完成")
                return True
            else:
                print(f"错误: 上传模块中没有start_check函数")
                print("尝试使用备用方法...")
                return run_upload_fallback(activity_id)
        except (ImportError, AttributeError) as e:
            print(f"导入或调用上传模块时出错: {str(e)}")
            print("尝试使用备用方法...")
            return run_upload_fallback(activity_id)
    except Exception as e:
        print(f"执行上传过程中出错: {str(e)}")
        traceback_info = traceback.format_exc()
        print(f"错误详细信息:\n{traceback_info}")
        
        print("尝试使用备用方法...")
        return run_upload_fallback(activity_id)

def run_upload_fallback(activity_id, project_name="Yoho"):
    """使用子进程方式运行上传脚本作为备用方案"""
    try:
        print(f"尝试使用子进程方式上传活动 {activity_id} 的文案...")
        print(f"项目平台: {project_name}")
        
        # 构建执行环境
        env = os.environ.copy()
        
        # 获取当前工作目录
        current_dir = os.getcwd()
        print(f"当前工作目录: {current_dir}")
        
        # 如果当前目录不是event，则切换到event目录
        event_dir = Path(current_dir)
        if event_dir.name != "event":
            event_dir = event_dir / "event"
            if not event_dir.exists():
                print(f"错误: 找不到event目录 {event_dir}")
                return False
        
        print(f"活动目录: {event_dir}")
        
        # 根据 project_name 选择正确的脚本路径
        # Yoho -> check_event_gift_copywriter.py (Waka平台)
        # Hiyoo -> chatchill/check_gift_copywriter.py (Chatchill平台)
        # SoulStar -> soulstar/check_gift_copywriter.py (dopalive平台)
        # DramaBit -> 暂用 check_event_gift_copywriter.py
        script_map = {
            "Yoho": event_dir / "getdata" / "check_event_gift_copywriter.py",
            "Hiyoo": event_dir / "getdata" / "chatchill" / "check_gift_copywriter.py",
            "SoulStar": event_dir / "getdata" / "soulstar" / "check_gift_copywriter.py",
            "DramaBit": event_dir / "getdata" / "check_event_gift_copywriter.py",
        }
        
        script_path = script_map.get(project_name)
        if not script_path:
            print(f"警告: 未知的项目平台 {project_name}，使用默认 chatchill 脚本")
            script_path = event_dir / "getdata" / "chatchill" / "check_gift_copywriter.py"
        
        if not script_path.exists():
            print(f"错误: 找不到上传脚本 {script_path}")
            return False
            
        print(f"找到上传脚本: {script_path}")
        
        # 构建命令
        # 使用当前Python解释器运行脚本
        python_exec = sys.executable
        command = [python_exec, str(script_path), "--activity_id", str(activity_id), "--force_reload"]
        
        print(f"执行命令: {' '.join(command)}")
        
        # 在event目录中运行
        result = subprocess.run(
            command,
            cwd=str(event_dir),
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # 输出执行结果
        print(f"命令执行状态码: {result.returncode}")
        print(f"标准输出:\n{result.stdout}")
        
        if result.stderr:
            print(f"标准错误:\n{result.stderr}")
        
        return result.returncode == 0
    except Exception as e:
        print(f"执行备用上传方法时出错: {str(e)}")
        traceback_info = traceback.format_exc()
        print(f"错误详细信息:\n{traceback_info}")
        return False

def main():
    """主函数"""
    # 检查环境
    print("开始环境检查...")
    if not check_environment():
        print("环境检查失败，无法继续执行")
        return False
        
    # 检查命令行参数
    if len(sys.argv) < 4:
        print("用法: python add_activity.py <活动ID> <活动名称> <飞书文档URL> [项目名称]")
        print(f"收到的参数: {sys.argv}")
        return False
    
    activity_id = sys.argv[1]
    activity_name = sys.argv[2]
    feishu_url = sys.argv[3]
    # 第四个参数是项目名称，用于选择正确的上传脚本
    project_name = sys.argv[4] if len(sys.argv) > 4 else "Yoho"
    print(f"飞书链接获取 '{feishu_url}'")
    
    print(f"接收到参数：ID=[{activity_id}], 名称=[{activity_name}], URL=[{feishu_url}], 项目=[{project_name}]")
    
    # 验证活动ID是否为数字
    try:
        int(activity_id)
    except ValueError:
        print(f"错误: 活动ID必须是数字，收到的是 '{activity_id}'")
        return False
    
    # 更新配置文件
    if not update_activity_config(activity_id, activity_name, feishu_url, project_name):
        return False
    
    # 运行上传脚本，传递项目名称
    print("开始上传文案...")
    if run_upload_fallback(activity_id, project_name):
        print("文案上传完成")
        return True
    else:
        print("文案上传失败")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 