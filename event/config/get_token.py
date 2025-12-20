import time
import re
import requests
import requests_cache
from configobj import ConfigObj
from loguru import logger
from pathlib import Path

# 设置请求缓存
# 确保缓存文件在event目录下生成
cache_path = Path(__file__).parent.parent / 'token_cache'
requests_cache.install_cache(str(cache_path), expire_after=3600)  # 缓存1小时

def get_token_from_api(user, pw, venv=0):
    """
    通过API方式获取token，避免验证码
    """
    if venv == 0:
        base_url = "https://dashboard-test.waka.media"
    else:
        base_url = "https://dashboard.waka.media"
    
    auth_url = f"{base_url}/api/auth/token"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4515.159 Safari/537.36',
        'Content-Type': 'application/json'
    }
    data = {
        "username": user,
        "password": pw
    }
    
    try:
        response = requests.post(auth_url, headers=headers, json=data)
        if response.status_code == 200:
            token_data = response.json()
            if 'token' in token_data:
                return token_data['token']
    except Exception as e:
        logger.error(f"获取token失败: {str(e)}")
    return None

def start(venv=0):
    '''
    获取cookie
    :param venv: 环境信息，0 测试环境  1 正式环境
    :return:
    '''
    parentpath = Path.cwd()
    
    # 尝试多个可能的配置文件路径
    possible_paths = [
        Path.joinpath(parentpath, 'config/congif.ini'),
        Path.joinpath(parentpath, '../config/congif.ini'),
        Path.joinpath(parentpath, '../../config/congif.ini'),
        Path('event/config/congif.ini'),
        Path('/Users/atian/Desktop/yoho-activity-h5/event/config/congif.ini'),
        Path('/Users/stone/Desktop/work/yoho-activity-h5/event/config/congif.ini')
    ]
    
    ini_path = None
    for path in possible_paths:
        if path.exists():
            ini_path = path
            logger.info(f"找到配置文件: {path}")
            break
    
    if ini_path is None:
        logger.error("找不到配置文件，使用默认cookies")
        return "default_cookies_value_for_testing"
    
    try:
        confs = ConfigObj(str(ini_path), encoding='utf-8')
        
        # 检查配置文件中是否有必要的键
        if venv == 0:
            # 测试环境
            if 'test' in confs:
                if 'cookies' in confs['test']:
                    logger.info("---测试环境直接返回存储的cookies---")
                    return confs['test']['cookies']
                elif 'username' in confs['test'] and 'password' in confs['test']:
                    token = get_token_from_api(confs['test']['username'], confs['test']['password'], venv)
                    if token:
                        cookies = f"token={token}"
                        # 更新配置文件
                        confs['test']['cookies'] = cookies
                        confs.write()
                        return cookies
            elif 'test_chatchill' in confs and 'cookies' in confs['test_chatchill']:
                logger.info("---测试环境直接返回chatchill存储的cookies---")
                return confs['test_chatchill']['cookies']
        else:
            # 正式环境
            if 'release' in confs:
                if 'cookies' in confs['release']:
                    logger.info("---正式环境直接返回存储的cookies---")
                    return confs['release']['cookies']
                elif 'username' in confs['release'] and 'password' in confs['release']:
                    token = get_token_from_api(confs['release']['username'], confs['release']['password'], venv)
                    if token:
                        cookies = f"token={token}"
                        # 更新配置文件
                        confs['release']['cookies'] = cookies
                        confs.write()
                        return cookies
            elif 'release_chatchill' in confs and 'cookies' in confs['release_chatchill']:
                logger.info("---正式环境直接返回chatchill存储的cookies---")
                return confs['release_chatchill']['cookies']
        
        logger.error("配置文件中找不到必要的配置信息")
        return "default_cookies_value"
        
    except Exception as e:
        logger.error(f"读取配置文件出错: {str(e)}，使用默认cookies")
        return "default_cookies_value_due_to_error"

if __name__ == "__main__":
    print(start())