import requests
import sys
import re
from pathlib import Path
from configobj import ConfigObj
from jsonpath import jsonpath

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


def get_wiki_sheet_obj_token(wikitoken,token):
    '''
    获取知识库sheet文档唯一标识
    https://open.feishu.cn/document/server-docs/docs/wiki-v2/wiki-qa
    :return: str
    '''
    url = r'https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node?token={}'.format(wikitoken)

    header = {'Content-Type': 'application/json; charset=utf-8',
              'Authorization': 'Bearer {}'.format(token[0])}

    r = requests.get(url=url,headers=header).json()
    obj_token = jsonpath(r,'$..obj_token')
    return obj_token[0] if obj_token else None

def get_wiki_content(obj_token, token):
    url = f'https://open.feishu.cn/open-apis/docx/v1/documents/{obj_token}/raw_content'
    header = {'Content-Type': 'application/json; charset=utf-8',
              'Authorization': 'Bearer {}'.format(token[0])}
    r = requests.get(url=url, headers=header)
    if r.status_code == 200:
        data = r.json()
        # 这里只简单输出全部内容
        print("飞书知识库文档内容原始数据：\n")
        print(data)
        # 你可以根据 data['data']['content'] 或其他字段进一步提取纯文本
        return data
    else:
        print(f"获取知识库内容失败: {r.status_code} {r.text}")
        return None

def extract_doc_id(feishu_url):
    match = re.search(r'/wiki?/([a-zA-Z0-9]+)', feishu_url)
    if match:
        return match.group(1)
    else:
        print("无法从链接中提取文档ID")
        sys.exit(1)
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python getFeishuActivityTime.py <飞书文档链接>")
        sys.exit(1)
    feishu_doc_url = sys.argv[1]
    feishu_token_path = Path.joinpath(Path.cwd(), 'config/congif.ini')
    confs = ConfigObj(str(feishu_token_path), encoding='utf-8')
    App_id = confs['feishu']['App_id']
    App_Secret = confs['feishu']['App_Secret']
    token = get_tenant_access_token(App_id, App_Secret)
    doc_id = extract_doc_id(feishu_doc_url)
    obj_token = get_wiki_sheet_obj_token(doc_id, token)
    if obj_token:
        wiki_content = get_wiki_content(obj_token, token)
        # 你可以在这里进一步处理 wiki_content，提取纯文本
    else:
        print("无法获取飞书文档 obj_token") 