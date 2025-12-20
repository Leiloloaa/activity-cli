import requests
import sys
import re
from pathlib import Path
from configobj import ConfigObj
from jsonpath import jsonpath
import datetime
import json
from config.get_token import start

import os
import importlib

# 延迟导入配置，确保每次使用最新的配置
def get_config():
    """获取最新的配置"""
    # 强制重新加载配置模块
    if 'config.activity_config' in sys.modules:
        importlib.reload(sys.modules['config.activity_config'])
    
    # 导入配置
    import config.activity_config as config
    return config

def get_activity_time_dashboard(activity_id_str):
    url_test = r'https://dashboard.chatchill.media/activity-dashboard/dashboard/key/activity/list?pageIndex=1&pageSize=20&activityId={}&status='.format(activity_id_str)
    data = {'activityId': activity_id_str, 'pageIndex': '1', 'pageSize': 20 }
    # 环境设置
    even = 1
    # print(even)
    dashboard_cookies = start(even)
    dashboard_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36",
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7,ja;q=0.6",
        "Cookie": dashboard_cookies,
        "x-usernam":"longduo@micous.com",
        "sec-ch-ua-platform": "Windows",
        'operator':'longduo@micous.com'
    }
    r = requests.get(url=url_test,headers=dashboard_headers,json=data)
    resp_json = r.json()
    # 提取 startTime 和 area
    result = []
    for item in resp_json.get('data', {}).get('list', []):
        start_time = item.get('startTime')
        end_time = item.get('endTime')
        operator = item.get('operator')
        activityDesc= item.get('activityDesc')
        activityLink = item.get('activityLink')
        activityType = item.get('activityType')
        if start_time:
            # 处理 ISO 格式时间字符串
            try:
                dt = datetime.datetime.strptime(start_time[:10], "%Y-%m-%d")
                start_time_fmt = dt.strftime("%Y-%m-%d")
            except Exception:
                start_time_fmt = start_time[:10]
        else:
            start_time_fmt = None
        if end_time:
            try:
                dt_end = datetime.datetime.strptime(end_time[:10], "%Y-%m-%d")
                end_time_fmt = dt_end.strftime("%Y-%m-%d")
            except Exception:
                end_time_fmt = end_time[:10]
        else:
            end_time_fmt = None
        result.append({
            'startTime': start_time_fmt,
            'endTime': end_time_fmt,
            'area': item.get('area'),
            'operator': operator,
            'activityDesc': activityDesc,
            'activityLink': activityLink,
            'activityType': activityType
        })
    return result

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
        # print(f"错误：找不到配置文件 {config_path}")
        return False
    
    try:
        # 读取原始配置文件
        with open(config_path, "r", encoding="utf-8") as f:
            content = f.read()
            # print(f"读取配置文件: {config_path}, 大小: {len(content)} 字节")
        
        # 使用更可靠的正则表达式替换配置值
        pattern = re.compile(rf"^{key}\s*=\s*.*$", re.MULTILINE)
        matches = pattern.findall(content)
        if matches:
            # print(f"找到原始配置项: {matches[0]}")
            updated_content = pattern.sub(f"{key} = {value}", content)
            
            # 写入更新后的配置
            with open(config_path, "w", encoding="utf-8") as f:
                f.write(updated_content)
                # print(f"配置已更新: {key} = {value}")
            
            # 强制重新加载配置模块
            if 'config.activity_config' in sys.modules:
                importlib.reload(sys.modules['config.activity_config'])
            
            # 验证更改是否生效
            config = get_config()
            config_value = getattr(config, key)
            # print(f"更新后实际配置值: {config_value}")
            
            if config_value != value:
                # print(f"警告：配置未正确更新，期望值 {value}，实际值 {config_value}")
                return False
            
            return True
        else:
            # print(f"错误：找不到配置项 {key}")
            return False
    except Exception as e:
        # print(f"更新配置时出错: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        # print("用法: python getActivityTime.py <activity_id>")
        sys.exit(1)
    activity_id_str = str(sys.argv[1])
     # 获取最新配置
    config = get_config()
    update_config("PLATFORM_TYPE", 0)
    data = get_activity_time_dashboard(activity_id_str)
    print(json.dumps(data, ensure_ascii=False))