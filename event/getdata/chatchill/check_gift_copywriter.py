import time
import json
import  random
import  requests
import argparse
import re
from pathlib import Path
from configobj import ConfigObj
from config.get_token import start
from loguru import logger
from jsonpath import jsonpath
from config.activity_config import (
    ENVIRONMENT, 
    PUSH_IMAGE_FLAG, 
    ACTIVITY_CONFIG, 
    DEFAULT_ACTIVITY_ID,
    DEFAULT_IMAGE_NUMS,
    PLATFORM_TYPE
)

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
    url = r'https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node?token={}'.format(wikitoken)
    r = requests.get(url=url,headers=header).json()
    obj_token = jsonpath(r,'$..obj_token')
    logger.info("--wikisheet:{},obj_token:{}--".format(wikitoken,obj_token))
    return obj_token[0]

def get_excel_header(sheet):
    '''
    获取sheet元数据信息
    :param sheet: sheetid
    :return:list，列数、行数、sheetid  [[13, 262, '182c2d'，title], [56, 212, 'odlKYU']]
    '''
    url = r'https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/{}/metainfo'.format(sheet)
    r = requests.get(url=url, headers=header).json()
    result = jsonpath(r,'$..sheets[*].columnCount,rowCount,sheetId,title')
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
    url1 = r'https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/{}/values/{}!A1:{}1'.format(sheet,sheetid,colnum[cols_rows[0]-1])
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
    if even == 0:
        url_test = r'https://dashboard-test.chatchill.media/activity-platform/api/activity/platform/activity/data/configActivityCopyWriting'
    else:
        url_test = r'https://dashboard.chatchill.media/activity-platform/api/activity/platform/activity/data/configActivityCopyWriting'
    # url_test = r'https://dashboard.chatchill.media/activity-platform/api/activity/platform/activity/data/configActivityCopyWriting'
    datas = []
    for i in range(len(exceldata)):
        datas.append({"index":i+1,'content':exceldata[i]})
    # print(datas)
    logger.info("--文案排序整理后内容：{}--".format(datas))
    content = {'list':datas}
    content1 = json.dumps(content)
    data = {'activityId': activityId, 'operator': 'longduo@micous.com', 'count': count, 'area': area, 'data': datas,'content':content1}
    r = requests.post(url=url_test,headers=dashboard_headers,json=data)
    # print(r.request.headers)
    # print(r.text)
    logger.info('---文案上传接口返回：{}---'.format(r.text))
    codes = jsonpath(r.json(), '$..status')[0]
    # print(type(codes))
    if codes != 1:
        logger.error("--- 请确认 {} 大区文案未上传成功 (code -7  活动id 不存在，code 10 关键字包含yoho)---".format(area))

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
        # if 'IN' in i or '印度' in i:
        #     area_dic['IN'] = title.index(i)
        #     areas.append('IN')
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
        if 'MY' in i or 'MALAYSIA' in i or '马来' in i:
            area_dic['MY'] = title.index(i)
            areas.append('MY')
        if 'IT' in i or '意' in i:
            area_dic['IT'] = title.index(i)
            areas.append('IT')
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
    url = r'https://dashboard.chatchill.media/v2/viewsites/gifts/'
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
    if even == 0:
        url_test = r'https://dashboard-test.chatchill.media/activity-platform/api/activity/platform/rule/addAndEditRulePage'
    else:
        pass
        # url_test = r'https://dashboard.chatchill.media/activity-platform/api/activity/platform/rule/addAndEditRulePage'
    #wakam/149611ff9af1d087ebaf6663a25872b8
    image_list = ['149611ff9af1d087ebaf6663a25872b8','17de9bc7d5d039362da5e3fbaef53a29','619ff6c368777994bb3811c65a42bae3','95a564f41ed16a0bcc098812392bdb09','6033403b0083c5f906e859a0d45f7849','12d77ddb2f90708a19f786492314f86b','c7cc29caaf99010f4669b60148a740f8','4fbf87f60d801e7bdbe1bb316f208b5e','274fdbcc0a397a5d3b647410c192ba9f','529f738d63baff5cc60e4f5b5233f1f2','ea301cf5d41ab6ba80f65617b97e4f02','1592632a0bee60467c5cdddcb5839182']
    datas = [{"index":image_list.index(i)+1,"image":r'wakam/{}'.format(i)} for i in image_list[0:nums]]
    content = {'list': datas}
    content1 = json.dumps(content)
    data = {'activityId': activityId, 'operator': 'longduo@micous.com', 'activityName': '', 'country': area, 'content':content1}
    logger.info("--规则奖励页上传信息：{}--".format(data))
    logger.info('--活动：{} {} 大区 {} 开始上传规则奖励图--'.format(activityId,area, ['正式环境' if even else '测试环境'][0]))
    r = requests.post(url=url_test,json=data,headers=dashboard_headers)
    codes = jsonpath(r.json(), '$..status')[0]
    logger.info("--图片上传返回：{}".format(r.json()))
    if codes != 1:
        logger.error("--- 请确认 {} 大区图片未上传成功 ---".format(area))

def start_check(activityId,sheet,even,pushimg):
    '''

    :param activityId: 活动id
    :param sheet: 表格id，可以是文档ID或完整URL
    :param even: 环境信息
    :param pushimg: 是否上传规则奖励页面
    :return:
    '''
    # 添加日志记录接收到的活动ID
    logger.info(f'--start_check函数收到的活动ID: {activityId}--')
    
    # 确保活动ID是字符串类型
    if not isinstance(activityId, str):
        activityId = str(activityId)
        logger.info(f'--将活动ID转换为字符串: {activityId}--')
    
    # 处理飞书文档ID/URL和sheet参数
    sheet_id = None
    if "http" in sheet or "?" in sheet:
        # 从URL中提取sheet参数和文档ID
        patterns = {
            'sheet': r'sheet=([^&\s]+)',  # sheet参数
            'wiki': r'https?://.*?/wiki/([A-Za-z0-9]+)',  # 飞书wiki格式URL
            'docs': r'https?://.*?/docs/([A-Za-z0-9]+)',  # 标准飞书文档URL
            'file': r'https?://.*?/file/([A-Za-z0-9]+)',  # 另一种可能的格式
        }
        
        # 提取sheet ID
        sheet_match = re.search(patterns['sheet'], sheet)
        if sheet_match:
            sheet_id = sheet_match.group(1)
            logger.info(f'--从URL提取sheet ID: {sheet_id}--')
        
        # 提取文档ID
        doc_id = None
        # 如果是完整URL，使用patterns中的模式匹配
        if "http" in sheet:
            for pattern_key in ['wiki', 'docs', 'file']:
                match = re.search(patterns[pattern_key], sheet)
                if match and match.groups():
                    doc_id = match.group(1)
                    logger.info(f'--从{pattern_key}格式URL提取文档ID: {doc_id}--')
                    break
        else:
            # 如果不是完整URL，直接提取问号前的部分作为文档ID
            doc_id = sheet.split('?')[0]
            logger.info(f'--从简单格式提取文档ID: {doc_id}--')
        
        if doc_id:
            sheet = doc_id
    
    obj_token = get_wiki_sheet_obj_token(sheet)
    
    # 检查obj_token是否有效
    if obj_token is None:
        logger.error(f'获取文档token失败，请检查文档ID是否正确: {sheet}')
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
    else:
        # 如果从URL提取到了sheet_id，仍然需要获取sheet_desc用于礼物检查
        sheet_desc = get_pagegift_sheetid(obj_token)
        
        # 检查sheet_desc是否有效
        if not sheet_desc:
            logger.error('无法获取文档信息，请检查文档ID是否正确')
            return
        
    logger.info('---------------------开始上传文案---------------')
    get_excel_data(activityId,obj_token = obj_token,sheetid=sheet_id,even=even,pushimg=pushimg)
    if even ==1:
        logger.info('---------------------开始校验礼物---------------')
        check_gift1(obj_token,sheetid=sheet_desc['gift'][2])


if __name__ == '__main__':
    # 解析命令行参数
    parser = argparse.ArgumentParser(description='上传活动文案和检查礼物配置')
    parser.add_argument('--activity_id', type=str, help='要处理的活动ID')
    parser.add_argument('--force_reload', action='store_true', help='强制重新加载配置文件')
    args = parser.parse_args()

    logspath = Path.joinpath(Path.cwd().parent.parent, 'logs')
    # print(logspath)
    logger.add(r'%s/Hiyoosendtext_{time:YYYY-MM-DD}.log' % logspath,
               rotation="00:00")
    
    # 修改读取配置文件的方式，增加错误处理和多个可能的路径位置
    try:
        # 尝试多个可能的配置文件路径
        possible_paths = [
            Path.joinpath(Path.cwd().parent.parent, 'config/congif.ini'),  # 原来的路径
            Path.joinpath(Path.cwd(), 'config/congif.ini'),  # 当前目录下
            Path.joinpath(Path.cwd(), '../config/congif.ini'),  # 上一级目录
            Path.joinpath(Path.cwd(), '../../config/congif.ini'),  # 上两级目录
            Path('event/config/congif.ini'),  # 相对于项目根目录
            Path('/Users/atian/Desktop/yoho-activity-h5/event/config/congif.ini')  # 绝对路径
        ]
        
        feishu_token_path = None
        for path in possible_paths:
            if path.exists():
                feishu_token_path = path
                logger.info(f"找到配置文件: {path}")
                break
        
        if feishu_token_path is None:
            logger.error("找不到配置文件，请检查路径")
            # 打印当前工作目录和可能的路径，帮助调试
            logger.error(f"当前工作目录: {Path.cwd()}")
            logger.error(f"尝试过的路径: {[str(p) for p in possible_paths]}")
            raise FileNotFoundError("找不到配置文件")
        
        confs = ConfigObj(str(feishu_token_path), encoding='utf-8')
        logger.info(f"配置文件内容键: {list(confs.keys())}")
        
        if 'feishu' in confs:
            App_id = confs['feishu']['App_id']
            App_Secret = confs['feishu']['App_Secret']
            token = get_tenant_access_token(App_id, App_Secret)
            header = {'Content-Type': 'application/json; charset=utf-8',
                      'Authorization': 'Bearer {}'.format(token[0])}
        else:
            logger.error(f"配置文件中找不到'feishu'配置，使用默认空令牌")
            logger.error(f"配置文件内容键: {list(confs.keys())}")
            header = {'Content-Type': 'application/json; charset=utf-8',
                      'Authorization': 'Bearer '}
    except Exception as e:
        logger.error(f"读取飞书配置失败: {str(e)}，使用默认空令牌")
        header = {'Content-Type': 'application/json; charset=utf-8',
                  'Authorization': 'Bearer '}

    ###### 设置环境 0 测试，1 正式
    even = ENVIRONMENT
    dashboard_cookies = start(even)
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
    flag = PUSH_IMAGE_FLAG

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
    
    # 确保活动ID为整数
    if isinstance(activity_id, str):
        activity_id = int(activity_id)
        
    # 检查活动ID是否以2开头（Chatchill平台）
    is_chatchill = str(activity_id).startswith('2') or activity_id >= 20000
    logger.info(f'--该活动ID是否属于Chatchill平台: {is_chatchill}--')
    
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
        exit(1)
    
    # 调用处理函数
    start_check(
        activityId=activity_id,
        sheet=feishu_doc_id,
        even=even,
        pushimg=flag
    )