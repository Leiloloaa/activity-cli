#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
活动配置文件
存储活动ID，环境设置，飞书文档ID等参数
"""

# 环境设置 0: 测试环境, 1: 正式环境
ENVIRONMENT = 0

# 是否上传规则奖励页面 0: 不上传, 1: 上传
PUSH_IMAGE_FLAG = 0

# 活动配置列表 {活动ID: (活动名称, 飞书文档ID)}
ACTIVITY_CONFIG = {
    # Waka平台活动
    10672: ("annualCeremony25", "IUR1wRCE2iGmDFkRBk4cSsBLn8e"),
    10670: ("annualCeremony25", "GvyqwwOLtib3qjkjBX2cDditnpE"),
    10653: ("anniversaryGame25", "GD1Lw2Y1LiGxAjk3KZbcUQr7n2v"),
    10650: ("luckyGift ", "GU4OwxnRbizqdaknmpfcBN1KnAf?sheet=182c2d"),
    10641: ("public/clashTwoCities929", "DKxnwexDOiOamskmX1Icv9HTnNd?sheet=182c2d"),
    10632: ("nationalDay2025", "UucywMONKijUJHkdmoRcSRxonsh?sheet=cbiEI0"),
    10123: ("monthList25", "JM4kwigybiOQeTkHw1ucl5kZnPb?sheet=6cc437"),
        10621: ("victoryDayTR", "U6N3wCRe9iYiQCkohQFcqKtHn9g?sheet=182c2d"),
    10620: ("gamePKStar", "U8jxwE8nKi3ro7kM3QKcptKLnjb?sheet=5b908d"),
    10614: ("footballPk", "GcXewC1bdiDlPekKqHRcJW95nBh?sheet=182c2d"),
    10606: ("summerCarnival", "NL8NwNBMSiLWnlkw1vmcQRKinug"),
                            10613: ("knightPrincess", "S1TvwKWaNixHyCk9T3ZcXQIfnT6"),
    10611: ("luckyNewStar", "MxSCwmMoniQpiPkvGY7cFXmvn0e?sheet=07129a"),
                            10602: ("anchorActiveList", "IS1HwE39KiQx9FkcvDsczG0Tnlg"),
    10595: ("midYear2025", "D9pSwj9fNi6eIekmCpychKvqnhf"),
    10592: ("eid202505", "YETuwyXdPi7NdTkHbo0cGGdLn5d"),
    # 注意：所有活动ID必须为整数类型，不要使用字符串类型的活动ID
    10585: ("烂漫爱恋", "R5KTwmvL1inn7fkIA7acqXpwn3c"),
    10425: ("新秒榜", "HBHEw6ka3iJRfGkwktccGTlbnUc"),
    10583: ("测试活动", "123456"),
    10572: ("国家主权和儿童节", "PucrwAYFbiNNA2kuFSkcV1pAnCd"),
    10576: ("孟加拉新年", "B84twv0eIikBFrkvbg1cGI3ynsk"),
    10559: ("摩天大楼", "Fkwsw0XZuilNf1kowAGcI75mnBf"),
    10268: ("greedy cat周榜", "DF6swmwQOi2KA8kbyTCctkGPnxh"),
    10584: ("心动盲盒", "YUu4wo9DWiGoDtkPBYWc5hRsnzg"),
    1000: ("固定文案", "FUz0wfnMni3eBUkGgYBcdtcvnNb"),
    10582: ("宝石商人", "Wjf1wqo0wiRcAIkW7khcTEpSnvf"),
    10588: ("ataDay", "SOQ3w6vB9iVYjdkJ0sMcTTCjnwg"),
    10599: ("新封神榜", "Q7hBwgoh9iZC2FkPKnHcqLjInRd"),
    10602: ("tr主播榜", "QV04wo5X5iNXoSkDhV1czOjqnMg"),
    10609: ("足球活动", "BZs4wBU6CidluzkyUotcQfqlnNf?sheet=9e2117"),
    10613: ("骑士与公主", "S1TvwKWaNixHyCk9T3ZcXQIfnT6?sheet=de619d"),
    
    # Chatchill平台活动
    20141: ("desertRace", "HweswP4thiGfjrkaM1EcyjXJnCc"),
    20134: ("anniversaryReport", "K72NwB3U0ipnedkewCBcCmC5n2e"),
    20120: ("soulmate", "WOANwz16HiOwZGkiTf8czHlpnKJ"),
    20111: ("RoomTreasureBox", "Mu7vwfQINiI0Cak7bt7cJT6hnWf"),
    20101: ("摩天大楼", "OQM0wUkx1iOp9rkbB7EcPZ6rnUh"),
    20096: ("斋月主活动", "BJ4HwEHbjiVfB1kYQDvcE2xmn7f"),
    20098: ("斋月经验值", "VzGmw0eUcitxxRkIFOSc00GJnXb"),
    20099: ("斋月在一起", "FJyBwOk6WiuFoAklo0jct8jFn4e"),
    20104: ("海盗宝藏", "Yorrwpel9iSsGSkc69zctaW3nye"),
    20105: ("守护之星", "VZ9CwADQWioLyzkkdeHctUtcnwe"),
    20115: ("年度盛典kingqueen", "IJQiwxw4GimmKXkZkJjcP5dvnCb"),
    20118: ("年度盛典主会场", "RjDXwQIASiI9l9kd6WRcVUKjnJg"),
    20113: ("宰牲节", "CQ3swQfzxiwbEWkyqr8cVicdnzm"),
    20114: ("年中公会", "YvzKw1rWlidDd4kGHIycIcxEnHe"),
    20116: ("年中exp", "LdxZwlADNibozvkwKgIcaVflnjb"),
    20117: ("全球旅行", "VzptwIUm6iDXq8kRTSgclw5rnTg"),
    20121: ("封神榜", "EGd5wYX9DiWFPMkscgQcAO7Snff"),
    20133: ("荣誉之战", "https://micoworld.feishu.cn/wiki/TQ30wtknPiU4GakwHovcpkIVnvc?sheet=3b85ec"),

    10616: ("DvmYwzVdoiOt3AkJ9L8cZEmfn9c", "DvmYwzVdoiOt3AkJ9L8cZEmfn9c"),

    10616: ("007", "https://micoworld.feishu.cn/wiki/DvmYwzVdoiOt3AkJ9L8cZEmfn9c"),

    10628: ("足球PK优化", "https://micoworld.feishu.cn/wiki/GI91wboiQimyzfkuHyqc271Bnve"),

    10630: ("越南国庆节", "https://micoworld.feishu.cn/wiki/XCk4wMKvqiiPYRk55gzcYZuQn0l?sheet=182c2d"),

    10123: ("月榜", "https://micoworld.feishu.cn/wiki/JM4kwigybiOQeTkHw1ucl5kZnPb?sheet=6cc437"),

    10633: ("vn每周封神榜", "https://micoworld.feishu.cn/wiki/Yq6xwWlYuiLEgukwvdNcyMjdnuc?sheet=UcQwXZ"),

    10643: ("火箭PK活动", "https://micoworld.feishu.cn/wiki/Kd7Mw0RePiUL0mkOuAgcU2I3nag?sheet=3303f0"),

    20149: ("王国冲突", "https://micoworld.feishu.cn/wiki/KyjDwHEUviXwXlkohbCcUa7gnBh?sheet=337049"),

    20153: ("hiyoo年度开幕式", "https://micoworld.feishu.cn/wiki/FY7gw21VBiFgGGkz0vRcXMMlnmI?sheet=6823aa"),

    10678: ("年度经验翻倍", "https://micoworld.feishu.cn/wiki/JqugwoqveiV10AkOTj2cdiQGnNg?sheet=355ac8"),

    50019: ("1v1pk", "SjgowvgNPivYK1kzKbfcdhwZnqc"),
}

# 默认使用的活动ID
DEFAULT_ACTIVITY_ID = 50019

# 图片上传数量
DEFAULT_IMAGE_NUMS = 8

# 平台类型 waka:0, chatchill:1
PLATFORM_TYPE = 2