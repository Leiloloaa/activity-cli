import time
import json
import  random
import  requests
import argparse
import importlib
import os
import sys
import shutil
from pathlib import Path
from configobj import ConfigObj
from config.get_token import start
from loguru import logger
from jsonpath import jsonpath
import re

# 确保能正确加载当前项目的模块
current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
project_root = os.path.dirname(current_dir)
sys.path.insert(0, project_root)
logger.info(f"添加项目根目录到系统路径: {project_root}")

# 确保配置文件是最新的
def ensure_current_config():
    """
    确保使用项目根目录下的最新配置文件
    """
    try:
        # 获取当前项目的配置文件路径
        project_config_path = os.path.join(project_root, 'event', 'config', 'activity_config.py')
        # 获取我们的工作目录中的配置文件路径
        working_config_path = os.path.join(current_dir, 'config', 'activity_config.py')
        
        logger.info(f"项目中的配置文件: {project_config_path}")
        logger.info(f"工作目录中的配置文件: {working_config_path}")
        
        # 检查文件是否存在
        if os.path.exists(project_config_path):
            # 读取项目中的配置文件内容
            with open(project_config_path, 'r', encoding='utf-8') as f:
                project_config = f.read()
                logger.info(f"项目配置文件大小: {len(project_config)} 字节")
                
            # 确保配置文件在我们的模块搜索路径中
            if os.path.exists(working_config_path):
                # 备份当前配置
                backup_path = f"{working_config_path}.bak"
                shutil.copy2(working_config_path, backup_path)
                logger.info(f"备份工作目录配置文件到: {backup_path}")
                
                # 读取当前配置内容
                with open(working_config_path, 'r', encoding='utf-8') as f:
                    current_config = f.read()
                    logger.info(f"当前工作配置文件大小: {len(current_config)} 字节")
                
                # 如果内容不同，则更新
                if project_config != current_config:
                    logger.info("配置文件内容不同，更新工作目录配置文件")
                    with open(working_config_path, 'w', encoding='utf-8') as f:
                        f.write(project_config)
                    logger.info("配置文件已更新")
                else:
                    logger.info("配置文件内容相同，无需更新")
            else:
                # 如果工作目录中没有配置文件，则创建
                os.makedirs(os.path.dirname(working_config_path), exist_ok=True)
                with open(working_config_path, 'w', encoding='utf-8') as f:
                    f.write(project_config)
                logger.info(f"复制项目配置文件到工作目录: {working_config_path}")
                
            return True
        else:
            logger.error(f"项目配置文件不存在: {project_config_path}")
            return False
    except Exception as e:
        logger.error(f"确保配置文件时出错: {str(e)}")
        return False

# 首先确保配置文件是最新的
ensure_current_config()

# 导入config模块
import config.activity_config
DEFAULT_IMAGE_NUMS = config.activity_config.DEFAULT_IMAGE_NUMS

def get_tenant_access_token(App_id,App_Secret):
    '''
    获取飞书token
    :return:
    '''
    url = r'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal'
    header = {'Content-Type':'application/json; charset=utf-8'}
    data= {'app_id':App_id,'app_secret':App_Secret}
    r = requests.post(url=url,headers=header,json=data).json()
    # print(r)
    token = jsonpath(r,'$..tenant_access_token')
    print(token)
    return token

def get_wiki_sheet_obj_token(wikitoken):
    '''
    获取知识库sheet文档唯一标识
    https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa
    :return: str
    '''
    try:
        # 添加时间戳参数避免缓存
        timestamp = int(time.time() * 1000)
        url = r'https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node?token={}&t={}'.format(wikitoken, timestamp)
        r = requests.get(url=url,headers=header).json()
        
        # 检查API响应是否成功
        if 'code' in r and r['code'] != 0:
            logger.error(f"获取飞书文档token失败，API返回错误: {r}")
            return None
            
        obj_token = jsonpath(r,'$..obj_token')
        
        # 检查是否获取到了有效的obj_token
        if not obj_token or not isinstance(obj_token, list) or len(obj_token) == 0:
            logger.error(f"无法从API响应中获取obj_token: {r}")
            return None
            
        logger.info("--wikisheet:{},obj_token:{}--".format(wikitoken,obj_token[0]))
        return obj_token[0]
    except Exception as e:
        logger.error(f"获取飞书文档token时发生异常: {str(e)}")
        return None

def get_excel_header(sheet):
    '''
    获取sheet元数据信息
    :param sheet: sheetid
    :return:list，列数、行数、sheetid  [[13, 262, '182c2d'，title], [56, 212, 'odlKYU']]
    '''
    url = r'https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/{}/metainfo'.format(sheet)
    r = requests.get(url=url, headers=header).json()
    result = jsonpath(r,'$..sheets[*].columnCount,rowCount,sheetId,title')
    
    # 检查result是否为有效列表
    if result is False or not isinstance(result, list) or len(result) == 0:
        logger.error(f"获取Excel头信息失败，API返回结果无效: {r}")
        return []
        
    # 正常处理列表数据
    result = [result[i:i+4] for i in range(0,len(result),4)]
    return result

def get_pagegift_sheetid(sheet):
    '''
    获取文档中，文案和礼物表格信息，列，行，sheetid，title
    :param sheet:
    :return: dic
    '''
    page_gift = get_excel_header(sheet)
    result = {}
    for i in page_gift:
        i[-1] = i[-1].upper()
    for i in page_gift:
        for j in i:
            if 'PAGE' in str(j) and 'EVENT' in str(j):
                result['page'] = i
            elif 'GIFT' in str(j):
                result['gift'] = i
    logger.info('---获取文档title 信息：{}'.format(result))
    return  result



def get_excel_desc(sheet,sheetid):
    '''
    获取表格列数、行数
    :param sheet:
    :param sheetid:
    :return: list,列数、行数
    '''
    cols = 0
    rows = 0
    excel_header = get_excel_header(sheet)   #list
    for i in excel_header:
        if sheetid in i:
            cols = i[0]
            rows = i[1]
            break
    return [cols,rows]

def get_excel_title(sheet,sheetid):
    '''
    获取对应sheet表格 title
    :param sheet:
    :param sheetid:
    :return: list
    '''
    colnum = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
    cols_rows = get_excel_desc(sheet,sheetid)
    # print(cols_rows)
    # 添加时间戳参数避免缓存
    timestamp = int(time.time() * 1000)
    url1 = r'https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/{}/values/{}!A1:{}1?t={}'.format(sheet,sheetid,colnum[cols_rows[0]-1], timestamp)
    r = requests.get(url=url1,headers=header).json()
    logger.info("--Excel:{}/{} 表头请求结果：{}--".format(sheet,sheetid,r))
    result = jsonpath(r,'$..msg')
    if result[0] != 'success':
        return False
    titles = jsonpath(r,'$..values')
    title = [i.upper() for i in titles[0][0] if i]
    logger.info("--获取文案title:{}--".format(title))
    return title

def get_area_index(title):
    '''
        根据表头信息匹配大区
        :param title:
        :return:
    '''
    area_dic = {}
    for i in title:
        if 'XM' in i or 'EG' in i or '中东' in i or 'AR' in i:
            area_dic['XM'] = title.index(i)
        if 'IN' in i or '印度' in i:
            area_dic['IN'] = title.index(i)
        if 'PK' in i or '巴' in i:
            area_dic['PK'] = title.index(i)
        if 'FR' in i or '法' in i:
            area_dic['FR'] = title.index(i)
        if 'TR' in i or '土' in i:
            area_dic['TR'] = title.index(i)
        if 'IT' in i or '意' in i:
            area_dic['IT'] = title.index(i)
        if 'BD' in i or '孟' in i:
            area_dic['BD'] = title.index(i)
        if 'ID' in i or '尼' in i:
            area_dic['ID'] = title.index(i)
        if 'TW' in i or '台' in i or 'CN' in i or 'CHIN' in i:
            area_dic['TW'] = title.index(i)
        if 'MY' in i or 'MALAYSIA' in i or '马来' in i:
            area_dic['MY'] = title.index(i)
        if 'VN' in i or '越南' in i:
            area_dic['VN'] = title.index(i)
    return area_dic

def get_excel_data(activityId,obj_token,sheetid,even,imagnums = DEFAULT_IMAGE_NUMS,pushimg = 0):
    '''
        获取飞书知识库中excel内容并提交至管理后台
        :param activityId: 活动id
        :param sheet: excelid
        :param sheetid:
        :param even: 环境，0  测试  1 线上
        :return:
    '''
    # 记录接收到的活动ID
    logger.info(f'--get_excel_data函数收到的活动ID: {activityId} (类型: {type(activityId)})--')
    
    # 确保类型一致性
    activity_id_str = str(activityId)
    try:
        activity_id_int = int(activity_id_str)
        logger.info(f'--活动ID转换为整数: {activity_id_int}--')
    except (ValueError, TypeError):
        activity_id_int = None
        logger.warning(f'--活动ID无法转换为整数: {activity_id_str}--')
    
    # 使用字符串形式进行后续处理
    activityId = activity_id_str
    logger.info(f'--将在get_excel_data中使用活动ID: {activityId}--')
    
    colnum = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U','V', 'W', 'X', 'Y', 'Z']
    # obj_token = get_wiki_sheet_obj_token(sheet)
    #
    # sheet_desc = get_pagegift_sheetid(obj_token)
    title = get_excel_title(obj_token,sheetid)
    areas = get_area_index(title)
    logger.info("--大区对应列信息：{}--".format(areas))
    cols_rows = get_excel_desc(obj_token, sheetid)
    for i in areas.keys():
        rownum = colnum[areas[i]]
        url = r'https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/{}/values/{}!{}1:{}{}'.format(obj_token,sheetid,rownum,rownum,cols_rows[1])
        r = requests.get(url=url,headers=header).json()
        result = jsonpath(r,'$..values')[0]
        result = [i[0] for i in result]
        # print(result)
        for j in result[::-1]:
            if j:
                break
            else:
                result.pop()
        # print(result)
        result = ["".join(jsonpath(i, '$..text')) if isinstance(i, list) else i for i in result]
        if i == 'XM':
            are = 'ME'
        else:
            are = i
        logger.info("--获取文案内容：{}--".format(result))
        countlist = len(result)
        logger.info('--活动：{} {} 开始上传{}大区文案--'.format(activityId, ['正式环境' if even else '测试环境'][0], are))
        send_text_dashboard(activityId=activityId,count=countlist,area=are,exceldata=result,even=even)
        time.sleep(1)
    if even ==0 or (even ==1 and pushimg ==1):
        logger.info("----开始上传规则奖励图----")
        if 'XM' in areas.keys():
            push_activity_image(activityId=activityId, area='ME', even=even, nums=imagnums)
        elif 'TR' in areas.keys():
            push_activity_image(activityId=activityId, area='TR', even=even, nums=imagnums)
        elif 'IN' in areas.keys():
            push_activity_image(activityId=activityId, area='IN', even=even, nums=imagnums)
        elif 'TW' in areas.keys():
            push_activity_image(activityId=activityId, area='TW', even=even, nums=imagnums)
        else:
            push_activity_image(activityId=activityId, area=list(areas.keys())[0], even=even, nums=imagnums)

def send_text_dashboard(activityId,count,area,exceldata,even):
    '''
        文案上传至管理后台
        :param activityId:
        :param count:
        :param area:
        :param exceldata:
        :param even:
        :return:
        '''
    # 记录接收到的活动ID
    logger.info(f'--send_text_dashboard函数收到的活动ID: {activityId} (类型: {type(activityId)})--')
    
    # 确保类型一致性
    activity_id_str = str(activityId)
    logger.info(f'--将使用字符串形式的活动ID: {activity_id_str}--')
    
    if even == 0:
        url_test = r'https://dashboard-test.waka.media/activity-platform/api/activity/platform/activity/data/configActivityCopyWriting'
    else:
        url_test = r'https://dashboard.waka.media/activity-platform/api/activity/platform/activity/data/configActivityCopyWriting'
    # url_test = r'https://dashboard.waka.media/activity-platform/api/activity/platform/activity/data/configActivityCopyWriting'
    datas = []
    for i in range(len(exceldata)):
        datas.append({"index":i+1,'content':exceldata[i]})
    # print(datas)
    logger.info("--文案排序整理后内容：{}--".format(datas))
    content = {'list':datas}
    content1 = json.dumps(content)
    data = {'activityId': activity_id_str, 'operator': 'longduo@micous.com', 'count': count, 'area': area, 'data': datas,'content':content1}
    r = requests.post(url=url_test,headers=dashboard_headers,json=data)
    # print(r.request.headers)
    # print(r.text)
    logger.info('---文案上传接口返回：{}---'.format(r.text))
    codes = jsonpath(r.json(), '$..status')[0]
    # print(type(codes))
    if codes != 1:
        logger.error("--- 请确认 {} 大区文案未上传成功 ---".format(area))

def get_gifts_title(obj_token,sheetid):
    '''
    获取活动礼物id列表表头（大区）
    :param sheet:
    :param sheetid:
    :return: 大区集合，list，大区对应首列序号，dic
    '''
    # obj_token = get_wiki_sheet_obj_token(sheet)
    url = 'https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/{}/values/{}!{}:{}'.format(obj_token, sheetid, 'A1',
                                                                                              'CC2')  # 获取行1，表头
    r = requests.get(url=url, headers=header).json()
    title = jsonpath(r, '$..values')[0][0]
    area_dic = {}
    areas = []

    title = [str(i).upper() if i else '' for i in title]
    logger.info("--获取礼物列表第一行数据：{}--".format(title))
    for i in title:
        if 'XM' in i or 'EG' in i or '中东' in i or 'AR' in i:
            area_dic['XM'] = title.index(i)
            areas.append('XM')
        if 'IN' in i or '印度' in i:
            area_dic['IN'] = title.index(i)
            areas.append('IN')
        if 'PK' in i or '巴' in i:
            area_dic['PK'] = title.index(i)
            areas.append('PK')
        if 'FR' in i or '法' in i:
            area_dic['FR'] = title.index(i)
            areas.append('FR')
        if 'TR' in i or '土' in i:
            area_dic['TR'] = title.index(i)
            areas.append('TR')
        if 'BD' in i or '孟' in i:
            area_dic['BD'] = title.index(i)
            areas.append('BD')
        if 'ID' in i or '尼' in i:
            area_dic['ID'] = title.index(i)
            areas.append('ID')
        if 'TW' in i or '台' in i or 'CN' in i or 'CHIN' in i:
            area_dic['TW'] = title.index(i)
            areas.append('TW')
        # if 'MY' in i or 'MALAYSIA' in i or '马来' in i:
        #     area_dic['MY'] = title.index(i)
        #     areas.append('MY')
        # if 'IT' in i or '意' in i:
        #     area_dic['IT'] = title.index(i)
        #     areas.append('IT')
        # if 'MY' in i or 'MALAYSIA' in i or '马来' in i:
        #     area_dic['MY'] = title.index(i)
    logger.info("--表格大区列表：{}  表格大区首列序号：{}--".format(areas, area_dic))
    return areas,area_dic


def get_gifts_id2price_colindex(obj_token,sheetid):
    '''
    获取大区礼物ID及价格
    :param sheet:
    :param sheetid:
    :return: list,礼物id列，礼物价格列
    '''
    # obj_token = get_wiki_sheet_obj_token(sheet)
    url2 = 'https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/{}/values/{}!{}:{}'.format(obj_token, sheetid, 'A2','CC2')   # 获取行2,列名
    r1 = requests.get(url=url2, headers=header).json()
    title1 = jsonpath(r1,'$..values')[0][0]
    title1 = [str(i).upper() if i else '' for i in title1]
    giftsid_index= []
    gifts_price = []
    for i in range(len(title1)):
        if 'GIFT_ID' in title1[i] or 'GIFTID' in title1[i]:
            giftsid_index.append(i)
        if  'PRICE' in title1[i] or 'PRIC' in title1[i]:
            gifts_price.append(i)
    #print(list(zip(giftsid_index,gifts_price))[1:])
    return giftsid_index,gifts_price

def get_area_giftprice_index(sheet,sheetid):
    '''
    获取大区对应礼物ID及价格列序
    :param sheet:
    :param sheetid:
    :return: 大区-礼物id，大区-价格，dic
    '''
    excel_title_index = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA','AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ', 'BA','BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BK', 'BL', 'BM', 'BN', 'BO', 'BP', 'BQ', 'BR', 'BS', 'BT', 'BU', 'BV', 'BW', 'BX', 'BY', 'BZ', 'CA', 'CB','CC', 'CD', 'CE', 'CF', 'CG', 'CH', 'CI', 'CJ', 'CK', 'CL', 'CM', 'CN', 'CO', 'CP', 'CQ', 'CR', 'CS', 'CT', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ']
    areas = get_gifts_title(sheet,sheetid)   # 大区，大区首列序号
    gifts = get_gifts_id2price_colindex(sheet,sheetid)   # 礼物id，礼物价格，list
    logger.info("--处理前礼物ID列序号{}  礼物价格列序号：{}--".format(gifts[0], gifts[1]))
    area_gift = {}
    area_price = {}
    if len(areas[0]) == len(gifts[0]):
        for i in range(len(areas[0])):
            area_gift[areas[0][i]] = gifts[0][i]
            area_price[areas[0][i]] = gifts[1][i]
    else:
        giftid = gifts[0][len(gifts[0])-len(areas[0]):]
        prices = gifts[1][len(gifts[0])-len(areas[0]):]
        for i in range(len(areas[0])):
            area_gift[areas[0][i]] = giftid[i]
            area_price[areas[0][i]] = prices[i]
    logger.info("--大区礼物ID对应列序：{}--".format(area_gift))
    logger.info("--大区礼物价格对应列序：{}--".format(area_price))
    for i in area_gift:
        area_gift[i] = excel_title_index[area_gift[i]]
    for i in area_price:
        area_price[i] = excel_title_index[area_price[i]]
    # print(area_gift, area_price)
    logger.info("--大区礼物ID对应列名：{}--".format(area_gift))
    logger.info("--大区礼物价格对应列名：{}--".format(area_price))
    return area_gift,area_price

def get_giftid_prices(obj_token,sheetid):
    '''
    获取大区对应礼物ID及价格
    :param sheet:
    :param sheetid:
    :return:dic，大区,[id,price]
    '''
    # obj_token = get_wiki_sheet_obj_token(sheet)
    gift_price = get_area_giftprice_index(obj_token,sheetid)
    area_gifts = {}
    for i in gift_price[0].keys():
        col_gift_start = gift_price[0][i]+'3'
        col_gift_end= gift_price[0][i]+'15'
        col_price_start = gift_price[1][i]+'3'
        col_price_end =  gift_price[1][i]+'15'
        # print(col_gift_start,col_gift_end,col_price_start,col_price_end)
        url_id = 'https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/{}/values/{}!{}:{}'.format(obj_token, sheetid, col_gift_start,
                                                                                               col_gift_end)  # 获取列
        # print(url_id)
        url_price = 'https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/{}/values/{}!{}:{}'.format(obj_token, sheetid,
                                                                                                     col_price_start,
                                                                                                     col_price_end)  # 获取列
        r1 = requests.get(url=url_id, headers=header).json()
        gifts = jsonpath(r1, '$..values')[0]
        r2 = requests.get(url=url_price, headers=header).json()
        prices = jsonpath(r2, '$..values')[0]
        l = []
        for j in list(zip(gifts,prices)):
            if j[0][0]:
                l.append(j[0]+j[1])
        area_gifts[i.upper()] = l
    logger.info("--获取礼物配置信息：{}--".format(area_gifts))
    return area_gifts

def check_gift1(obj_token,sheetid):
    '''
     查询礼物是否存在
    :param gitid:
    :return: bools，True/False
    '''
    giftdata = get_giftid_prices(obj_token,sheetid)
    keys = list(giftdata.keys())
    url = r'https://dashboard.waka.media/v2/viewsites/gifts/'
    for key in keys:
        if key not in ['MY','IT']:
            for ids in giftdata[key]:
                datas = {
                    'page': 1,
                    'page_size': 20,
                    'region': str(key).upper(),
                    'id': str(ids[0])
                }
                r = requests.get(url=url, params=datas, headers=dashboard_headers)
                result = r.json()
                # logger.info('--查询礼物结果：{}'.format(str(result)))
                GiftFeatures = jsonpath(result, '$..gift_id,price')

                if jsonpath(result, '$.count')[0]:
                    if str(GiftFeatures[0]) == str(ids[0]):
                        try:
                            assert str(ids[1]) == str(GiftFeatures[1])
                        except Exception as msg:
                            logger.error(
                                "--{}大区礼物 {} 价格与预期不一致；预期：{}--实际：{}".format(
                                    key, ids[0], ids[1], GiftFeatures[1]))
                        else:
                            logger.info("--{}大区礼物 {} 已经配置,图片地址{}".format(
                                key, ids[0],
                                jsonpath(result, '$..material_cover')[0]))
                else:
                    logger.error("--{}大区礼物 {} 未配置！！！".format(key, ids[0]))

def push_activity_image(activityId,area,even,nums = DEFAULT_IMAGE_NUMS):
    '''
    上传规则奖励图片
    :param activityId:
    :param area:
    :param even:
    :param nums:
    :return:
    '''
    # 记录接收到的活动ID
    logger.info(f'--push_activity_image函数收到的活动ID: {activityId} (类型: {type(activityId)})--')
    
    # 确保类型一致性
    activity_id_str = str(activityId)
    logger.info(f'--将使用字符串形式的活动ID: {activity_id_str}--')
    
    if even == 0:
        url_test = r'https://dashboard-test.waka.media/activity-platform/api/activity/platform/rule/addAndEditRulePage'
    else:
        pass
        # url_test = r'https://dashboard.waka.media/activity-platform/api/activity/platform/rule/addAndEditRulePage'
    #wakam/149611ff9af1d087ebaf6663a25872b8
    image_list = ['149611ff9af1d087ebaf6663a25872b8','17de9bc7d5d039362da5e3fbaef53a29','619ff6c368777994bb3811c65a42bae3','95a564f41ed16a0bcc098812392bdb09','6033403b0083c5f906e859a0d45f7849','12d77ddb2f90708a19f786492314f86b','c7cc29caaf99010f4669b60148a740f8','4fbf87f60d801e7bdbe1bb316f208b5e','274fdbcc0a397a5d3b647410c192ba9f','529f738d63baff5cc60e4f5b5233f1f2','ea301cf5d41ab6ba80f65617b97e4f02','1592632a0bee60467c5cdddcb5839182']
    datas = [{"index":image_list.index(i)+1,"image":r'wakam/{}'.format(i)} for i in image_list[0:nums]]
    content = {'list': datas}
    content1 = json.dumps(content)
    data = {'activityId': activity_id_str, 'operator': 'longduo@micous.com', 'activityName': '', 'country': area, 'content':content1}
    logger.info("--规则奖励页上传信息：{}--".format(data))
    logger.info('--活动：{} {} 大区 {} 开始上传规则奖励图--'.format(activityId,area, ['正式环境' if even else '测试环境'][0]))
    r = requests.post(url=url_test,json=data,headers=dashboard_headers)
    codes = jsonpath(r.json(), '$..status')[0]
    logger.info("--图片上传返回：{}".format(r.json()))
    if codes != 1:
        logger.error("--- 请确认 {} 大区图片未上传成功 ---".format(area))

def start_check(activity_id, feishu_doc_id, even, pushimg):
    '''
    启动检查和上传流程
    :param activity_id: 活动id
    :param feishu_doc_id: 表格id，可以是文档ID或完整URL
    :param even: 环境信息
    :param pushimg: 是否上传规则奖励页面
    :return:
    '''
    # 记录接收到的活动ID
    logger.info(f'--start_check函数收到的活动ID: {activity_id} (类型: {type(activity_id)})--')
    
    # 确保活动ID的类型处理一致
    activity_id_str = str(activity_id)
    activity_id_int = None
    try:
        activity_id_int = int(activity_id)
        logger.info(f'--活动ID转换为整数: {activity_id_int}--')
    except (ValueError, TypeError):
        logger.warning(f'--活动ID无法转换为整数，保持原始形式: {activity_id}--')
    
    # 处理飞书文档ID/URL和sheet参数
    sheet_id = None
    if "http" in feishu_doc_id or "?" in feishu_doc_id:
        # 从URL中提取sheet参数和文档ID
        patterns = {
            'sheet': r'sheet=([^&\s]+)',  # sheet参数
            'wiki': r'https?://.*?/wiki/([A-Za-z0-9]+)',  # 飞书wiki格式URL
            'docs': r'https?://.*?/docs/([A-Za-z0-9]+)',  # 标准飞书文档URL
            'file': r'https?://.*?/file/([A-Za-z0-9]+)',  # 另一种可能的格式
        }
        
        # 提取sheet ID
        sheet_match = re.search(patterns['sheet'], feishu_doc_id)
        if sheet_match:
            sheet_id = sheet_match.group(1)
            logger.info(f'--从URL提取sheet ID: {sheet_id}--')
        
        # 提取文档ID
        doc_id = None
        # 如果是完整URL，使用patterns中的模式匹配
        if "http" in feishu_doc_id:
            for pattern_key in ['wiki', 'docs', 'file']:
                match = re.search(patterns[pattern_key], feishu_doc_id)
                if match and match.groups():
                    doc_id = match.group(1)
                    logger.info(f'--从{pattern_key}格式URL提取文档ID: {doc_id}--')
                    break
        else:
            # 如果不是完整URL，直接提取问号前的部分作为文档ID
            doc_id = feishu_doc_id.split('?')[0]
            logger.info(f'--从简单格式提取文档ID: {doc_id}--')
        
        if doc_id:
            feishu_doc_id = doc_id
    
    # 获取文档token
    obj_token = get_wiki_sheet_obj_token(feishu_doc_id)
    
    # 检查obj_token是否有效
    if obj_token is None:
        logger.error(f'获取文档token失败，请检查文档ID是否正确: {feishu_doc_id}')
        return
        
    # 如果没有从URL提取到sheet_id，则获取sheet_desc
    if not sheet_id:
        sheet_desc = get_pagegift_sheetid(obj_token)
        
        # 检查sheet_desc是否有效
        if not sheet_desc:
            logger.error('无法获取文档信息，请检查文档ID是否正确')
            return
            
        # 检查是否有页面文案表格
        if 'page' not in sheet_desc:
            logger.error('文档缺少页面文案表格')
            return
            
        # 使用sheet_desc中的sheetid
        sheet_id = sheet_desc['page'][2]
        
    logger.info('---------------------开始上传文案---------------')
    get_excel_data(activity_id, obj_token=obj_token, sheetid=sheet_id, even=even, pushimg=pushimg)

if __name__ == '__main__':

    # 解析命令行参数
    parser = argparse.ArgumentParser(description='上传活动文案和检查礼物配置')
    parser.add_argument('--activity_id', type=str, help='要处理的活动ID')
    parser.add_argument('--force_reload', action='store_true', help='强制重新加载配置文件')
    args = parser.parse_args()

    # 先打印当前工作目录和系统路径，方便调试
    logger.info(f"当前工作目录: {os.getcwd()}")
    logger.info(f"系统路径前5项: {sys.path[:5]}")
    
    logspath = Path.joinpath(Path.cwd(), 'logs')
    # print(logspath)
    logger.add(r'%s/Yohosendtext_{time:YYYY-MM-DD}.log' % logspath,
               rotation="00:00")
    feishu_token_path = Path.joinpath(Path.cwd(), 'config/congif.ini')
    confs = ConfigObj(str(feishu_token_path),encoding='utf-8')
    App_id = confs['feishu']['App_id']
    App_Secret = confs['feishu']['App_Secret']
    token = get_tenant_access_token(App_id,App_Secret)
    header = {'Content-Type': 'application/json; charset=utf-8',
              'Authorization': 'Bearer {}'.format(token[0]),
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'}

    # 确保使用项目根目录的配置文件
    try:
        # 强制更新配置模块路径
        if 'config.activity_config' in sys.modules:
            logger.info("移除已加载的配置模块")
            del sys.modules['config.activity_config']
        
        # 强制复制项目根目录的配置文件
        ensure_current_config()
        
        # 重新导入配置模块
        logger.info('强制重新加载配置模块...')
        import config.activity_config
        
        # 如果指定了强制重新加载，再次重新加载
        if args.force_reload:
            logger.info('--强制重新加载配置文件--')
            importlib.reload(config.activity_config)
    except Exception as e:
        logger.error(f"导入配置模块出错: {str(e)}")
    
    # 获取配置文件路径，以便确认使用的是哪个文件
    import inspect
    config_file = inspect.getfile(config.activity_config)
    logger.info(f"加载的活动配置文件路径: {config_file}")
    
    # 直接读取配置文件的内容，确认配置内容
    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            content = f.read()
            logger.info(f"配置文件大小: {len(content)} 字节")
    except Exception as e:
        logger.error(f"读取配置文件出错: {str(e)}")
    
    # 从配置模块中获取变量值
    ENVIRONMENT = config.activity_config.ENVIRONMENT
    PUSH_IMAGE_FLAG = config.activity_config.PUSH_IMAGE_FLAG
    ACTIVITY_CONFIG = config.activity_config.ACTIVITY_CONFIG
    DEFAULT_ACTIVITY_ID = config.activity_config.DEFAULT_ACTIVITY_ID
    DEFAULT_IMAGE_NUMS = config.activity_config.DEFAULT_IMAGE_NUMS
    PLATFORM_TYPE = config.activity_config.PLATFORM_TYPE
    
    # 环境设置
    even = ENVIRONMENT
    dashboard_cookies = start(even)
    flag = PUSH_IMAGE_FLAG
    logger.info('---开始上传 {} 文案---'.format(['正式环境' if even else '测试环境'][0]))
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
    
    # 优先使用命令行参数指定的活动ID
    activity_id = None
    if args.activity_id:
        activity_id_str = args.activity_id
        logger.info(f'--使用命令行指定的活动ID: {activity_id_str}--')
        try:
            activity_id_int = int(activity_id_str)
            activity_id = activity_id_int
        except ValueError:
            logger.warning(f"活动ID必须是数字: {activity_id_str}，尝试使用字符串形式")
            activity_id = activity_id_str
    else:
        # 使用默认活动ID
        activity_id = DEFAULT_ACTIVITY_ID
        logger.info(f'--使用默认活动ID: {activity_id}--')
    
    # 检查活动ID是否在配置中，并获取飞书文档ID
    activity_str = str(activity_id)
    activity_int = None
    try:
        activity_int = int(activity_id)
    except (ValueError, TypeError):
        logger.warning(f"活动ID无法转换为整数: {activity_id}")
    
    # 检查活动ID是否在配置中(首先尝试字符串形式，然后是整数形式)
    if activity_str in ACTIVITY_CONFIG:
        activity_name, feishu_doc_id = ACTIVITY_CONFIG[activity_str]
        logger.info(f'--使用字符串键匹配到活动: {activity_str} - {activity_name}--')
    elif activity_int is not None and activity_int in ACTIVITY_CONFIG:
        activity_name, feishu_doc_id = ACTIVITY_CONFIG[activity_int]
        logger.info(f'--使用整数键匹配到活动: {activity_int} - {activity_name}--')
    else:
        logger.error(f'--活动ID {activity_id} 未在配置文件中定义--')
        # 打印可用的活动ID列表
        available_ids = list(ACTIVITY_CONFIG.keys())
        logger.info(f'--可用的活动ID有: {available_ids}--')
        sys.exit(1)
    
    # 调用处理函数
    start_check(
        activity_id=activity_id,
        feishu_doc_id=feishu_doc_id,
        even=even,
        pushimg=flag
    )