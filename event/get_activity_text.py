import time
import json
import  random
import  requests
from pathlib import Path
from configobj import ConfigObj
from event.config.get_token import start
from loguru import logger
from jsonpath import jsonpath

'''
上传活动文案
'''
def get_tenant_access_token(App_id,App_Secret):
    '''
    获取飞书token
    :return:
    '''
    url = r'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal'
    header = {'Content-Type':'application/json; charset=utf-8'}
    data= {'app_id':App_id,'app_secret':App_Secret}
    r = requests.post(url=url,headers=header,json=data).json()
    token = jsonpath(r,'$..tenant_access_token')
    logger.info("--token:{}".format(token))
    return token

def get_wiki_sheet_obj_token(wikitoken):
    '''
    获取知识库sheet文档唯一标识
    https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa
    :return: str
    '''
    url = r'https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node?token={}'.format(wikitoken)
    r = requests.get(url=url,headers=header).json()
    logger.info("--转换文档标识返回：{}-".format(r))
    obj_token = jsonpath(r,'$..obj_token')
    logger.info("--wikisheet:{},obj_token:{}--".format(wikitoken,obj_token))
    return obj_token[0]

def get_excel_header(sheet):
    '''
    获取sheet元数据信息
    :param sheet: sheetid
    :return:list，列数、行数、sheetid  [[13, 262, '182c2d'], [56, 212, 'odlKYU']]
    '''
    url = r'https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/{}/metainfo'.format(sheet)
    r = requests.get(url=url, headers=header).json()
    result = jsonpath(r,'$..sheets[*].columnCount,rowCount,sheetId')
    result = [result[i:i+3] for i in range(0,len(result),3)]
    return result

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
    url1 = r'https://open.feishu.cn/open-apis/sheets/v2/spreadsheets/{}/values/{}!A1:{}1'.format(sheet,sheetid,colnum[cols_rows[0]-1])
    r = requests.get(url=url1,headers=header).json()
    logger.info("--Excel:{}/{} 表头请求结果：{}--".format(sheet,sheetid,r))
    result = jsonpath(r,'$..msg')
    if result[0] != 'success':
        return False
    titles = jsonpath(r,'$..values')
    title = [str(i).upper() if i else '' for i in titles[0][0]]
    logger.info("--获取title:{}--".format(title))
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
        if  'TW' in i or '台' in i or 'CN' in i or 'CHIN' in i:
            area_dic['TW'] = title.index(i)
        if 'MY' in i or 'MALAYSIA' in i or '马来' in i:
            area_dic['MY'] = title.index(i)
    return area_dic

def get_excel_data(activityId,sheet,sheetid,even,imagnums = 8):
    '''
        获取飞书知识库中excel内容并提交至管理后台
        :param activityId: 活动id
        :param sheet: excelid
        :param sheetid:
        :param even: 环境，0  测试  1 线上
        imagnums    规则奖励图片数量
        :return:
    '''
    colnum = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U','V', 'W', 'X', 'Y', 'Z']
    obj_token = get_wiki_sheet_obj_token(sheet)
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
        for j in result[::-1]:
            if j:
                break
            else:
                result.pop()
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

    # 上传规则奖励图
    logger.info("----开始上传规则奖励图----")
    if 'XM' in areas.keys():
        push_activity_image(activityId=activityId,area='ME',even=even,nums=imagnums)
    elif 'TR' in areas.keys():
        push_activity_image(activityId=activityId,area='TR',even=even,nums=imagnums)
    elif 'IN' in areas.keys():
        push_activity_image(activityId=activityId,area='IN',even=even,nums=imagnums)
    elif 'TW' in areas.keys():
        push_activity_image(activityId=activityId,area='TW',even=even,nums=imagnums)
    else:
        push_activity_image(activityId=activityId, area=list(areas.keys())[0], even=even,nums=imagnums)

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
        url_test = r'https://dashboard-test.waka.media/activity-platform/api/activity/platform/activity/data/configActivityCopyWriting'
    else:
        url_test = r'https://dashboard.waka.media/activity-platform/api/activity/platform/activity/data/configActivityCopyWriting'
    # url_test = r'https://dashboard.waka.media/activity-platform/api/activity/platform/activity/data/configActivityCopyWriting'
    datas = []
    for i in range(len(exceldata)):
        datas.append({"index":i+1,'content':exceldata[i]})
    logger.info("--文案排序整理后内容：{}--".format(datas))
    content = {'list':datas}
    content1 = json.dumps(content)
    data = {'activityId': activityId, 'operator': 'longduo@micous.com', 'count': count, 'area': area, 'data': datas,'content':content1}
    r = requests.post(url=url_test,headers=dashboard_headers,json=data)

    logger.info('---文案上传接口返回：{}---'.format(r.text))
    codes = jsonpath(r.json(), '$..status')[0]

    if codes != 1:
        logger.error("--- 请确认 {} 大区文案未上传成功 ---".format(area))

def push_activity_image(activityId,area,even,nums = 8):
    if even == 0:
        url_test = r'https://dashboard-test.waka.media/activity-platform/api/activity/platform/rule/addAndEditRulePage'
    else:
        url_test = r'https://dashboard.waka.media/activity-platform/api/activity/platform/rule/addAndEditRulePage'
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


if __name__ == '__main__':

    logspath = Path.joinpath(Path.cwd().parent, 'logs')
    logger.add(r'%s/Yohosendtext_{time:YYYY-MM-DD}.log' % logspath,
               rotation="00:00")
    feishu_token_path = Path.joinpath(Path.cwd().parent,'config/congif.ini')
    confs = ConfigObj(str(feishu_token_path),encoding='utf-8')
    App_id = confs['feishu']['App_id']
    App_Secret = confs['feishu']['App_Secret']
    token = get_tenant_access_token(App_id,App_Secret)
    # 飞书请求头
    header = {'Content-Type': 'application/json; charset=utf-8',
              'Authorization': 'Bearer {}'.format(token[0])}

    ###### 设置环境 0 测试，1 正式
    even = 1
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
    # get_excel_data(activityId='10489', sheet='K30nwUcMXivHLgkbgKicIDE1nCf', sheetid='18ae7c',even=even)  #主播公会挑战
    # get_excel_data(activityId='10495', sheet='BaxHwMlYmiQNPIkolEjcyRfrnDX', sheetid='4bd186', even=even,imagnums=2)   #象神节
    # get_excel_data(activityId='10478', sheet='AloUwmHDaiIjsEkJXuIcNEh8nDb', sheetid='53WKAa', even=even)
    # get_excel_data(activityId='10482', sheet='QipTwXdTUiLFOKkqJbdcVRKWnWd', sheetid='182c2d', even=even)   # 缤纷美食家
    # get_excel_data(activityId='10487', sheet='PONAw1hThiwFVdkY1Lycsls0nJb', sheetid='182c2d', even=even)   # 夏日大作战
    get_excel_data(activityId='10627', sheet='Sr7dw0cCLiJRoak70MIck36ankf', sheetid='Y1UlpG', even=even)  # 印巴独立
    # get_excel_data(activityId='10490', sheet='SFiwwOWzJismFVk3i18cycvKnFr', sheetid='182c2d', even=even)  # 沙特国庆
    # push_activity_image(10489,'TW',0,3)
    # send_text_dashboard(activityId='10417',count=20,area='VN',exceldata=['ID', 'GIFT DOUBLE EXP', 'Hitung mundur sebelum event dimulai', 'Hitung mundur sebelum event berakhir', 'Selesai', 'Peraturan', 'Reward', 'Semua hak interpretasi acara adalah milik platform', 'Kembali', 'Kamu dapat menerima poin EXP tambahan jika mengirimkan gift event.', 'List Penerima', 'List Pengirim', 'Segera Hadir', 'Kosong', 'Hari', 'Hari', None, None, None, None])
    '''
obj_token  RPOVsLn4dhXj2StoyWWc4fAXnld
 # get_tenant_access_token()
    # get_wiki_sheet_obj_token('Drj9wQqjYignLyk0rxXceAQZnMA')
    # get_excel_data()
    # get_excel_header('RPOVsLn4dhXj2StoyWWc4fAXnld')
    # get_excel_desc('RPOVsLn4dhXj2StoyWWc4fAXnld','182c2d')
    # get_excel_title('RPOVsLn4dhXj2StoyWWc4fAXnld','182c2d')
    # get_area_index(['NOTE', 'CN', 'EN', 'XM 中东', 'TR 土耳其', 'FR 法国', 'IT 意大利', 'IN 印度', 'PK 巴基斯坦', 'TW', 'ID 印尼', 'BD 孟加拉'])
    '''