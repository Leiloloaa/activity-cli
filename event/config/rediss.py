import redis
from pathlib import Path
from configobj import ConfigObj

# x = r.zrange('commonBusiness:anchor_rank_daily_members:20016:202402:ME:20240111:6149795',0,-1,withscores=True)

# for data in x:
#     print(data[0],data[1])

# a= r.zrange('24_constellation_guard_activity_vj_rank_ME',0,-1,withscores=False,score_cast_func=float)
# print(a)


def get_redis_config(product=1):
    '''
    获取项目redis配置信息
    :param product:
    :return:
    '''



class Conect_redis():

    def __init__(self,redisinfo):
        self.redisinfo = redisinfo
        self.conn = Conect_redis.__getConnect(self.redisinfo)

    @staticmethod
    def __getConnect(db_info):
        '''静态方法，从连接池中取出连接'''
        try:
            pool = redis.ConnectionPool(host=db_info['host'], password=db_info['pw'], port=db_info['port'])
            conn = redis.Redis(connection_pool=pool)
            # print('1')
            return conn
        except Exception as a:
            print("redis连接异常：%s" % a)

    def get_zset_zrange(self,args):
        '''
        正序展示榜单数据
        :param args:lsit, 0 key 1 start 2 end
        :return: list,key,value 两两组合
        '''
        datas = self.conn.zrange(name=args[0],start=int(args[1]),end=int(args[2]),withscores=True)
        for data in datas:
            print(data[0].decode(),data[1])
        return datas

    def get_zset_zrevrange(self,args):
        '''
                倒序展示榜单数据
                :param args:lsit, 0 key 1 start 2 end
                :return: list,key,value 两两组合
                '''
        datas = self.conn.zrange(name=args[0], start=int(args[1]), end=int(args[2]), withscores=True)
        for data in datas:
            print(data[0].decode(), data[1])
        return datas

    def get_zset_zrangebyscore(self,args):
        '''
        筛选zset积分范围，正序展示
        :param args: key，初始分，结束分
        :return: list,符合分数段的key
        '''
        datas = self.conn.zrangebyscore(args[0], args[1], args[2])
        for i in datas:
            print(i.decode())
        return datas

    def zadd_zset(self,keys,data):
        '''
        zset 添加数据
        :param args: keys:str , data:dict,key,value
        :return:
        '''

        self.conn.zadd(name=keys,mapping=data)

    def test(self):
        datas = self.conn.zadd('commonBusiness:anchor_rank_daily:20016:202402:ME:20240112',{'19223331':100})
        # print(type(datas))
        print(datas)
        # for i in datas:
        #     print(i)

    def get_keys(self,keys):
        return self.conn.keys(keys)

    def deletekeys(self,key):
        self.conn.delete(key)

    def get_hash(self,key):
        return self.conn.hgetall(key)

if __name__=="__main__":
    parentpath = Path.cwd().parent
    ini_path = Path.joinpath(parentpath, 'config/congif.ini')
    confs = ConfigObj(str(ini_path), encoding='utf-8')
    redisinfo = {}
    # redisinfo['host'] = confs['chatchill_redis']['host']
    # redisinfo['port'] = int(confs['chatchill_redis']['port'])
    # redisinfo['pw'] = confs['chatchill_redis']['pw']
    # print(redisinfo)
    '''redis-cli -h voko-test-01-internal.redis.voko.media -p 6379 -a '5a$G9nMH22%9g5FGWuSS'''
    '''redis-cli -h audio-activity-test-internal.redis.aliyun.waka.media -p 6379 -a 5PgWGoD7SkHoEDUvEn'''

    #chtachill
    # redisinfo ={'host':'audio-activity-test-internal.redis.aliyun.waka.media','pw':'5PgWGoD7SkHoEDUvEn','port':'6379'}
    redisinfo_yoho = {'host':'audio-activity-test-internal.redis.aliyun.waka.media','pw':'5PgWGoD7SkHoEDUvEn','port':'6379'}

    start = Conect_redis(redisinfo_yoho)
    # start.
    start.get_zset_zrange(['commonBusiness:anchor_rank_daily:20016:202402:ME:20240112',0,-1])
    start.get_zset_zrangebyscore(['commonBusiness:anchor_rank_daily:20016:202402:ME:20240112',100,2000])
    start.test()