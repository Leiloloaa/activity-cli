"""
日志模块
"""

import datetime
import time
from pathlib import Path

import requests
from jsonpath import jsonpath
from loguru import logger


# 幸运大转盘抽奖
def start():
    url = r'https://activity.waka.media/api/activity/lucky/spin/lottery'
    data = {'type': 1, 'count': 1}
    fr_users = ['120175', '120176', '120177', '120178', '120179', '120180', '120181',
                '120182', '120183', '120184', '198250', '157101', '212604']
    # random.sample(FR_users, 1)[0]
    gifs = []
    n = 1
    m = 1
    while m <= 1:
        hearders = {'uid': '19558758', 'activityDid': 'zfTeyLHkbdk5THukDh3GQE3TcldhVrC6',
                    'User-Agent': 'apifox/1.0.0 (https://www.apifox.cn)', 'Host': 'activity-test.waka.media'}
        r = requests.get(url=url, params=data, headers=hearders)
        # print(r.request.url)
        logger.info("--返回参数--：{}".format(r.json()))
        if ': -1' in str(r.json()):
            logger.info("-----------金币不足-------------------")
            return

        gift = jsonpath(r.json(), '$..goodId')
        if gift:
            logger.info("--礼物 gifr：{}".format(gift))
            for i in list(set(gift)):
                if i not in gifs:
                    gifs.append(i)
                    logger.info("--首次抽到奖励：{}".format(gift))
        if len(gifs) == 10:
            logger.info("--全部奖励抽出：{}".format(gifs))
            return

        logger.info("---第 {} 次抽奖,总共耗费金币 {}--------------".format(n, n * 600))
        logger.info("--抽到礼物列表：{}".format(gifs))
        n += 1
        time.sleep(1)
        m += 1


if __name__ == "__main__":
    logspath = Path.joinpath(Path.cwd().parent, 'logs')
    # if not Path.is_dir(logspath):
    #     Path.mkdir(logspath)
    times = datetime.datetime.now().strftime(r'%Y-%m-%d %H:%M:%S')
    # logpath = Path.joinpath(logspath, "{time:YYYY-MM-DD}.log")
    # print(logpath)
    logger.add(logspath, format="{time} {level} {message}", rotation="00:00")
    start()
