import time
import sqlite3
DB_PATH = "data/user.db"
conn = sqlite3.connect('user.db')
cur = conn.cursor()
def insert_user_info(wallet,password,add_time,vip_expire_time):
    try:
        cur.execute('''
        INSERT INTO user_info (wallet,password,add_time,vip_expire_time) 
        VALUES ( ?, ?, ?, ?)
        ''', (wallet,password,add_time,vip_expire_time))

        # 提交更改并关闭连接
        conn.commit()
        cur.close()
        conn.close()
        print("data insert successful")
    except Exception as e:
        print(e)
def get_strategies(wallet):
	with sqlite3.connect(DB_PATH) as db:
		cursor = db.execute("SELECT * FROM strategy WHERE wallet = ?", (wallet,))
		result = cursor.fetchall()  # 获取单行数据
		return result  # 返回查询结果
# insert_user_info("CuYz6ge3ZEgYUYee3BtfAs7aReo4bkB2smKKpaUgwTvq","fdx@2022",time.time(),time.time()+31*24*3600)