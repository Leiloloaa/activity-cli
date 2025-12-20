import pymysql
from configobj import ConfigObj
from pathlib import Path
from loguru import  logger



def get_mysql_config(ven =1):
    '''
    获取数据库配置
    :param ven:   1  yoho  2 chat chill
    :return: dict mysql_info
    '''
    if ven ==1:
        parentpath = Path.cwd().parent
        ini_path = Path.joinpath(parentpath, 'config/congif.ini')
        confs = ConfigObj(str(ini_path), encoding='utf-8')
        host = confs['test_mysql']['host']
        port = int(confs['test_mysql']['port'])
        user = confs['test_mysql']['user']
        pw = confs['test_mysql']['pw']
        db = confs['test_mysql']['data']
        charset = confs['test_mysql']['charset']
    if ven ==2:
        parentpath = Path.cwd().parent.parent
        ini_path = Path.joinpath(parentpath, 'config/congif.ini')
        confs = ConfigObj(str(ini_path), encoding='utf-8')
        host = confs['test_mysql_chatchill']['host']
        port = int(confs['test_mysql_chatchill']['port'])
        user = confs['test_mysql_chatchill']['user']
        pw = confs['test_mysql_chatchill']['pw']
        db = confs['test_mysql_chatchill']['data']
        charset = confs['test_mysql_chatchill']['charset']

    mysql_info = {"host": host,
                  "port": port,
                  "user": user,
                  "passwd": pw,
                  "db": db,
                  "charset": charset}
    return mysql_info


class MysqlUtil():
    '''
    mysql数据库相关操作
    连接数据库信息：mysql_info
    创建游标：mysql_execute
    查询某个字段对应的字符串：mysql_getstring
    查询一组数据：mysql_getrows
    关闭mysql连接：mysql_close
    '''
    def __init__(self,ven=1):
        mysql_info = get_mysql_config(ven)
        self.db_info = mysql_info
        u'''连接池方式'''
        self.conn = MysqlUtil.__getConnect(self.db_info)

    @staticmethod
    def __getConnect(db_info):
        '''静态方法，从连接池中取出连接'''
        try:
            conn = pymysql.connect(host=db_info['host'],
                                   port=db_info['port'],
                                   user=db_info['user'],
                                   passwd=db_info['passwd'],
                                   db=db_info['db'],
                                   charset=db_info['charset'])
            return conn
        except Exception as a:
            print("数据库连接异常：%s"%a)

    def mysql_execute(self, sql):
        '''执行sql语句'''
        cur = self.conn.cursor()
        try:
            cur.execute(sql)
        except Exception as a:
            self.conn.rollback()         # sql执行异常后回滚
            print("执行SQL语句出现异常：%s"%a)
        else:
            cur.close()
            self.conn.commit()          # sql无异常时提交

    def mysql_getrows(self, sql):
        ''' 返回查询结果'''
        cur = self.conn.cursor()
        try:
            cur.execute(sql)
        except Exception as a:
            print("执行SQL语句出现异常：%s"%a)
        else:
            rows = cur.fetchall()
            cur.close()
            return rows

    def mysql_getstring(self, sql):
        '''查询某个字段的对应值'''
        rows = self.mysql_getrows(sql)
        if rows != None:
            for row in rows:
                for i in row:
                    return i

    def mysql_close(self):
        ''' 关闭 close mysql'''
        try:
            self.conn.close()
        except Exception as a:
            print("数据库关闭时异常：%s"%a)





# MySQLdb.connect()     建立数据库连接
# cur = conn.cursor()    #通过获取到的数据库连接conn下的cursor()方法来创建游标。
# cur.execute()    #过游标cur 操作execute()方法可以写入纯sql语句。通过execute()方法中写如sql语句来对数据进行操作。
# cur.close()     # cur.close() 关闭游标
# conn.commit()   # conn.commit()方法在提交事物，在向数据库插入(或update)一条数据时必须要有这个方法，否则数据不会被真正的插入。
# conn.rollback() # 发生错误时候回滚
# conn.close()     # Conn.close()关闭数据库连接


'''最终结果：{'1068': 1026, '1670488746': 2060, '1675244334': 811, '1671436703': 3024, '1067': 978, '1672812337': 728, '1676542279': 848, '32': 391, '1818103481': 7, '1005': 110, '1818103483': 13, '1818103480': 4}

2023-03-22 13:18:42.778 | INFO     | __main__:<module>:47 
- ---最终概率：{'1068': 0.1026, '1670488746': 0.206, '1675244334': 0.0811, '1671436703': 0.3024, '1067': 0.0978, '1672812337': 0.0728, '1676542279': 0.0848, '32': 0.0391, '1818103481': 0.0007, '1005': 0.011, '1818103483': 0.0013, '1818103480': 0.0004}---'''