import time
import re
import requests
import ddddocr
from configobj import ConfigObj
from loguru import logger
from pathlib import Path

def get_vercode(venv):
    """
    获取验证码地址，并进行存储识别
    :param venv: 0  test  1 线上
    :return: 验证码及图片标识
    """
    if venv ==0:
        logger.info("--获取测试环境验证码地址及图片---")
        vercode_url = r'https://dashboard-test.chatchill.media/admin/login/?next=/admin/'
        image_urls = r'https://dashboard-test.chatchill.media/captcha/image/'
    else:
        logger.info("--获取线上环境验证码地址及图片---")
        vercode_url = r'https://dashboard.chatchill.media/admin/login/?next=/admin/'
        image_urls = r'https://dashboard.chatchill.media/captcha/image/'

    headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4515.159 Safari/537.36'}
    r= requests.get(url=vercode_url,headers=headers)
    image = re.findall(r'name="captcha_0" value="(.{40})',r.text)[0]
    logger.info("--验证码标识：{}".format(image))
    # image_url = r'https://dashboard-test.waka.media/captcha/image/'+image
    image_url = image_urls +image
    print(image_url)
    image_r = requests.get(url=image_url).content
    name_time = int(time.time())
    a = Path.cwd()
    print('aaa:{}'.format(a))
    b = Path.joinpath(a, '/data/ver/')
    print(b)
    parent_path = Path.cwd().parent.parent
    save_path = Path.joinpath(parent_path, 'data/ver/')
    print(save_path,type(save_path))
    save_name =str(save_path)+r'\\'+str(name_time)+'.jpg'
    print(save_name)
    with open(save_name+str(name_time)+'.jpg','wb') as f:
        logger.info("--存储验证码：{}.jpg".format(name_time))
        f.write(image_r)
    ocr = ddddocr.DdddOcr()
    with open(save_name+str(name_time)+'.jpg','rb') as f:
        images = f.read()
    res = ocr.classification(images)
    if len(res)<4:
        logger.info("--验证码自动识别错误：{}---".format(res))
        return get_vercode(venv=venv)
    else:
        logger.info("验证码解析：{}，验证码图片路径：{}".format(res,image))
        return res,image

def get_cookies(user,pw,venv):
    """
    获取用户cookies
    :param user:
    :param pw:
    :param venv: 环境标识，0-->test  1-->release
    :return:
    """
    if venv ==0:
        logger.info("--尝试登录测试环境---")
        cookies_url = r'https://dashboard-test.chatchill.media/admin/login/?next=/admin/'
    else:
        logger.info("--尝试登录线上环境---")
        cookies_url = r'https://dashboard.chatchill.media/admin/login/?next=/'

    code = get_vercode(venv)
    print(code)
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4515.159 Safari/537.36'}
    data={"username": user,"password": pw,'captcha_0':code[1],"captcha_1":code[0]}
    # print(data)
    # s= requests.session()
    r = requests.post(url=cookies_url, headers=headers,data=data,allow_redirects=False)
    a= r.cookies
    print(a)
    cook = requests.utils.dict_from_cookiejar(a)
    logger.info("登录参数:{}".format(cook))
    if 'sessionid' in cook:
        cookies = ["{}={}".format(i, cook[i]) for i in cook]
        easycookies = ";".join(cookies)
        logger.info("cookies :{}".format(easycookies))
        return easycookies
    else:
        time.sleep(1)
        logger.info("验证码识别错误，登录失败：{}".format(cook))
        return get_cookies(user, pw,venv=venv)

def start(venv=0):
    '''
    获取cookie
    :param venv: 环境信息，0 测试环境  1 正式环境
    :return:
    '''
    # ini_path = r'../congif.ini'
    parentpath = Path.cwd()
    # print(parentpath)
    ini_path = Path.joinpath(parentpath.parent.parent,'config/congif.ini')
    # print(ini_path)
    # print(type(ini_path))
    confs = ConfigObj(str(ini_path),encoding='utf-8')
    if venv == 0:
        times = int(confs['test_chatchill']['times'])
        now = int(time.time())
        if now-times >=172800:
            username =confs['test_chatchill']['user']
            password = confs['test_chatchill']['pw']
            result = get_cookies(user=username,pw=password,venv=venv)
            confs['test_chatchill']['times'] = now
            confs['test_chatchill']['cookies'] = result
            confs.write()
            return result
        else:
            logger.info("---测试环境cookies生成间隔小于2天--")
            logger.info("---返回cookies为：{} ---".format(confs['test_chatchill']['cookies']))
            return confs['test_chatchill']['cookies']
    else:
        times = int(confs['release_chatchill']['times'])
        now = int(time.time())
        if now - times >= 172800:
            username = confs['release_chatchill']['user']
            password = confs['release_chatchill']['pw']
            result = get_cookies(user=username, pw=password,venv=venv)
            confs['release_chatchill']['times'] = now
            confs['release_chatchill']['cookies'] = result
            confs.write()
            return result
        else:
            logger.info("---线上环境cookies生成间隔小于2天--")
            logger.info("---返回cookies为：{} ---".format(confs['release_chatchill']['cookies']))
            return confs['release_chatchill']['cookies']

if __name__ == "__main__":
    # print(get_cookies(user=username,pw=password))
    print(start())