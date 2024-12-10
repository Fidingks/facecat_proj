import json
import sqlite3
import logging
import threading
import time
import datetime
import asyncio
import requests
import notify
import os
from data import db_operate
# 仅示例化一个对象，该对象从数据库获取策略，接受数据时自动处理完
# 从数据库拿激活的策略 实例化成对象
# 服务器的数据 是一个个Json
current_directory = os.getcwd()
DB_PATH = f'{current_directory}/data/user.db' 
print(DB_PATH)
class PriceMonitor:
    def __init__(self):
        self.symbols = [] # 监控对象
        self.strategies = [] 
        self.over = "" # 涨破价位触发通知
        self.below = "" # 跌破价位触发通知
        self.notify_level = "" # 通知的等级
        self.total_times = "" # 该策略通知的总次数
        self.current_times = 0 # 自创建以来通知的次数
        self.calmdown_time = "" # 通知冷却时间
        self.last_notification_time = 0 # 记录上次通知时间
        # logging.info(f"{symbol}监控启动,通知冷却时间{calmdown_time}s，价格涨破{self.over}$ 跌破{self.below}触发警报")
        
    def count_changePercent(self, close, open):
        priceChange = close - open
        changePercent = priceChange * 100 / open
        return changePercent

    def monitor(self, pricedata):
        open = float(pricedata["k"]["o"])
        close = float(pricedata["k"]["c"])
        dt_object = datetime.datetime.fromtimestamp(time.time())
        formatted_time = dt_object.strftime("%H:%M")
        print(f"{formatted_time} {self.symbol} Price: {close}")
        if (time.time() - self.last_notification_time > self.calmdown_time) and self.current_times < self.total_times :
            if close > self.over:
                notify.send_wechat_notice(f"{formatted_time}\n{self.symbol} 🚀涨破{self.over}\n当前：{close:.2f}$")
            elif close < self.below:
                notify.send_wechat_notice(f"{formatted_time}\n{self.symbol} ⬇️跌破{self.below}\n当前：{close:.2f}$") 
            self.last_notification_time = time.time()
            self.current_times += 1

    def process(self, data):
        if "e" in data and data["e"] == "avgPrice":
            print(data)
            symbol = data["s"]
            price = float(data["w"])
            for strategy in self.strategies:
                if strategy[2] == 0: # 价格破位策略
                    if symbol.lower() == strategy[0]: # 与传来的数据匹配
                        # 检查是否满足通知条件
                        with sqlite3.connect(DB_PATH) as db:
                            cursor = db.execute("SELECT * FROM strategy WHERE strategy_id = ?", (strategy[1],))
                            result = cursor.fetchone()  
                            if time.time() - result[8] > result[7]: 
                                if price > float(json.loads(strategy[3])["up_over"]):
                                    print("涨破")
                                    # notify.send_wechat_notice(f"{formatted_time}\n{self.symbol} 🚀涨破{self.over}\n当前：{close:.2f}$")
                                    db.execute('''
                                    UPDATE strategy
                                    SET last_notify_time = ?
                                    WHERE strategy_id = ?
                                    ''', (time.time(), strategy[1]))
                                    db.commit()
                                    print("更新数据库时间")
                                elif price < float(json.loads(strategy[3])["down_under"]):
                                    print("跌破")
                                    # notify.send_wechat_notice(f"{formatted_time}\n{self.symbol} ⬇️跌破{self.below}\n当前：{close:.2f}$") 
                                    db.execute('''
                                    UPDATE strategy
                                    SET last_notify_time = ?
                                    WHERE strategy_id = ?
                                    ''', (time.time(), strategy[1]))
                                    db.commit()
                                    print("更新数据库时间")
                                else:
                                    print("价格不满足条件")
                            else:
                                print("通知时间不满足")

        elif "result" in data:
            print(data)
            # 处理数据库
            strategies = db_operate.get_strategies("FWnPy6eH9Y5DbPjui8ojCdwz5gv6WqzSK3hFc5ouct6C")
            for strategy in strategies:
                if strategy[10] == 1:
                    self.strategies.append([strategy[2],strategy[1], strategy[4], strategy[5]]) # symbol id, type, strategy


