import threading
from fastapi import FastAPI, HTTPException
import json
import requests
import time
from contextlib import asynccontextmanager
from pydantic import BaseModel
import sqlite3
from typing import Dict
import datetime
import asyncio
import websockets
import uvicorn
DATABASE = "../MoToo/data/user.db"
notify_info = []

class BinanceWebSocketClient:
    def __init__(self,):
        # self.url = "wss://156.232.10.79/ws"
        self.url = "ws://156.232.10.79:8000/ws"
        self.strategies = []
        self.connection = None
        self.subscribed_streams = []
        self.id_counter = 1001
        self.loop = asyncio.new_event_loop()
        self.thread = None

    def start(self):
        """Start the WebSocket connection in a new thread."""
        print("连接到bianance")
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()
        # 等待连接建立
        time.sleep(1)

    def _run(self):
        """Run the WebSocket connection in the asyncio loop."""
        asyncio.set_event_loop(self.loop)
        self.loop.run_until_complete(self.connect())
        self.loop.run_forever()

    async def connect(self):
        """Connect to Binance WebSocket and start handling messages."""
        try:
            self.connection = await websockets.connect(self.url)
            print("Connected to Binance WebSocket")
            asyncio.create_task(self.handle_messages())
        except Exception as e:
            print(f"Connection error: {e}")

    async def handle_messages(self):
        while True:
            try:
                message = await self.connection.recv()
                data = json.loads(message)
                self.process(data) 
            except websockets.ConnectionClosed:
                print("Connection closed, attempting to reconnect...")
                break
            except Exception as e:
                print(f"Error: {e}")
                break
    def update_strategies(self):
        # 更新策略池
        try:
            cursor = db_connection.cursor()
            query = "SELECT * FROM strategy WHERE active = ?"
            cursor.execute(query, (1,))
            results = cursor.fetchall()
            symbols = []
            for result in results:
                symbols.append(result["symbol"])
            print(f"数据库中激活的标的{symbols}")
            print(f"订阅的标的{self.subscribed_streams}")
            if results:
                return self.subscribed_streams, symbols, results
            else:
                raise HTTPException(status_code=404, detail="Strategy record not found")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    def notify_once(self, strategy_id):
        try:
            cursor = db_connection.cursor()
            # 检查 strategy_id 是否存在
            cursor.execute("SELECT * FROM strategy WHERE strategy_id = ?", (strategy_id,))
            result = cursor.fetchone()
            if not result:
                raise HTTPException(status_code=404, detail="Strategy record not found")
            total_notify_times = result["total_notify_times"]
            notified_times = result["notified_times"]
            print(f"notified_times:{notified_times}")
            active = 1
            if total_notify_times - 1 == notified_times:
                active = 0
            # 更新 active 字段
            update_query = """
                UPDATE strategy
                SET active = ?, 
                    last_notify_time = strftime('%s', 'now'),
                    notified_times = notified_times + 1
                WHERE strategy_id = ?
            """
            cursor.execute(update_query, (active, strategy_id))
            query = "SELECT * FROM strategy WHERE active = 1"
            update_data = cursor.execute(query)
            print(update_data)
            db_connection.commit()  # 提交事务
            return {"detail": f"Update Strategy {strategy_id} notify status successfully "}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    def process(self, callbackData):
        if "e" in callbackData and callbackData["e"] == "avgPrice":
            callbackSymbol = callbackData["s"]
            price = float(callbackData["w"])
            print(f"标的{callbackSymbol} 回调价格{price}")
            # for item in self.strategies:
            #     print(f"标的{callbackSymbol} 回调价格{price} 涨破价格{json.loads(item["strategy"])["up_over"]} 通知间隔{time.time() - item["last_notify_time"]}")
            #     if item["strategy_type"] == 0: # 价格破位策略
            #         if callbackSymbol.lower() == item["symbol"]: # 与传来的数据匹配
            #             # 检查是否满足通知条件
            #             if time.time() - item["last_notify_time"] > item["notify_interval_time"] * 60: # 冷却时间
            #                 if item["total_notify_times"] > item["notified_times"]:
            #                     dt_object = datetime.datetime.fromtimestamp(time.time()) 
            #                     formatted_time = dt_object.strftime("%H:%M")
            #                     up_over = float(json.loads(item["strategy"])["up_over"])
            #                     down_under = float(json.loads(item["strategy"])["down_under"])
            #                     if price > up_over:
            #                         print("涨破")
            #                         # notify.send_wechat_notice(f"{formatted_time}\n{symbol} 🚀涨破{up_over}\n当前：{price:.2f}$")
            #                         request = self.notify_once(item["strategy_id"])
            #                     elif price < down_under:
            #                         print("跌破")
            #                         # notify.send_wechat_notice(f"{formatted_time}\n{symbol} ⬇️跌破{down_under}\n当前：{price:.2f}$") 
            #                         request = self.notify_once(item["strategy_id"])
            #             else:
            #                 # print("通知时间不满足")
            #                 pass

        elif "result" in callbackData:
            print(callbackData)
            # 处理数据库
            # strategies = db_operate.get_strategies("FWnPy6eH9Y5DbPjui8ojCdwz5gv6WqzSK3hFc5ouct6C")
            # for strategy in strategies:
            #     if strategy[10] == 1:
            #         self.strategies.append([strategy[2],strategy[1], strategy[4], strategy[5]]) # symbol id, type, strategy

    def subscribe(self, stream):
        """Subscribe to specified streams."""
        if stream not in self.subscribed_streams:
            self.subscribed_streams.append(stream)
            message = {
                "method": "SUBSCRIBE",
                "params": [f"{stream}@avgPrice"],
                "id": self.id_counter
            }
            # 确保连接已建立
            if self.connection:
                asyncio.run_coroutine_threadsafe(self.connection.send(json.dumps(message)), self.loop)
                print(f"Subscribed to {stream}@avgPrice")
                self.id_counter += 1
            else:
                print("WebSocket connection not established")

    def unsubscribe(self, stream):
        """Unsubscribe from specified streams."""
        
        if stream in self.subscribed_streams:
            self.subscribed_streams.remove(stream)
            message = {
                "method": "UNSUBSCRIBE",
                "params": [stream],
                "id": self.id_counter
            }
            # 确保连接已建立
            if self.connection:
                asyncio.run_coroutine_threadsafe(self.connection.send(json.dumps(message)), self.loop)
                print(f"Unsubscribed from {stream}")
                self.id_counter += 1
            else:
                print("WebSocket connection not established")
                    
    def lsit_subscription(self):
        """Unsubscribe from specified streams."""
        message = {
        "method": "LIST_SUBSCRIPTIONS",
        "id": self.id_counter
        }
        # 确保连接已建立
        if self.connection:
            asyncio.run_coroutine_threadsafe(self.connection.send(json.dumps(message)), self.loop)
            print(f"list all subscriptions")
            self.id_counter += 1
        else:
            print("WebSocket connection not established")

    def stop(self):
        """Stop the WebSocket connection and close the loop."""
        if self.loop.is_running():
            self.loop.call_soon_threadsafe(self.loop.stop)
        if self.thread.is_alive():
            self.thread.join()
        print("WebSocket connection stopped")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 应用启动时执行
    yield
    # 应用关闭时执行
    db_connection.close()
    print("Database connection closed")
ws_client = BinanceWebSocketClient()
ws_client.start()
db_connection = sqlite3.connect(DATABASE, check_same_thread=False)
db_connection.row_factory = sqlite3.Row
# 创建 FastAPI 实例并传入 lifespan
app = FastAPI(lifespan=lifespan)

# GET 接口：使用查询参数获取记录
@app.get("/get-by-strategy_id/{strategy_id}")
def read_strategy(strategy_id: str):
    try:
        cursor = db_connection.cursor()
        query = "SELECT * FROM strategy WHERE strategy_id = ?"
        cursor.execute(query, (strategy_id,))
        result = cursor.fetchone()
        if result:
            return dict(result)
        else:
            raise HTTPException(status_code=404, detail="Strategy record not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# 根据钱包获取策略
@app.get("/get-strategy-by-wallet/{wallet}")
def read_strategy(wallet: str):
    try:
        cursor = db_connection.cursor()
        query = "SELECT * FROM strategy WHERE wallet = ?"
        cursor.execute(query, (wallet,))
        result = cursor.fetchall()
        if result:
            return (result)
        else:
            raise HTTPException(status_code=404, detail="Strategy record not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# 根据激活状态获取策略
@app.get("/get-strategy-by-active/{active}")
def read_strategy(active: int):
    try:
        cursor = db_connection.cursor()
        query = "SELECT * FROM strategy WHERE active = ?"
        cursor.execute(query, (active,))
        result = cursor.fetchall()
        if result:
            return (result)
        else:
            raise HTTPException(status_code=404, detail="Strategy record not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# 获取全部策略
@app.get("/get-all-strategy/")
def read_strategy():
    try:
        cursor = db_connection.cursor()
        query = "SELECT * FROM strategy"
        cursor.execute(query,)
        result = cursor.fetchall()
        if result:
            return (result)
        else:
            raise HTTPException(status_code=404, detail="Strategy record not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

#提交策略更改
class UpdateStrategyRequest(BaseModel):
    symbol: str
    strategy_id: str
    strategy_type: int
    strategy: str
    strategy_abstract: str
    notify_level: int
    notify_interval_time: int
    total_notify_times: int
@app.post("/update-strategy/")
def update_strategy(request: UpdateStrategyRequest):
    """
    更新策略信息接口
    参数:
        - strategy_id: 策略 ID (路径参数)
        - request: JSON 请求体，包含需要更新的字段
    返回:
        - 成功或失败的消息
    """
    try:
        cursor = db_connection.cursor()
        # 检查 strategy_id 是否存在
        cursor.execute("SELECT * FROM strategy WHERE strategy_id = ?", (request.strategy_id,))
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Strategy record not found")
        update_query = """
            UPDATE strategy
            SET symbol = ?, 
                strategy_type = ?, 
                strategy = ?, 
                strategy_abstract = ?, 
                notify_level = ?, 
                notify_interval_time = ?, 
                total_notify_times = ?, 
                notified_times = ?,
                edit_time = strftime('%s', 'now')  -- 更新时间戳
            WHERE strategy_id = ?
        """
        cursor.execute(
            update_query,
            (
                request.symbol,
                request.strategy_type,
                request.strategy,
                request.strategy_abstract,
                request.notify_level,
                request.notify_interval_time,
                request.total_notify_times,
                0,
                request.strategy_id,
            ),
        )
        db_connection.commit()  # 提交事务
        return {"detail": "Strategy record updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

class UpdateActiveRequest(BaseModel):
    strategy_id: str
    active: int  # 0: 停止, 1: 激活
@app.post("/update-active/")
def update_active(request: UpdateActiveRequest):
    """
    修改策略的 active 状态
    参数: 
        - strategy_id: 策略ID
        - active: 状态 (0 - 停止, 1 - 激活)
    """
    try:
        cursor = db_connection.cursor()

        cursor.execute("SELECT * FROM strategy WHERE active = ?", (1,))
        database_symbols = []
        strategies = cursor.fetchall()
        for item in strategies:
            database_symbols.append(item["symbol"])

        # 检查 strategy_id 是否存在
        cursor.execute("SELECT * FROM strategy WHERE strategy_id = ?", (request.strategy_id,))
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Strategy record not found")
        # 更新 active 字段
        update_query = """
            UPDATE strategy
            SET active = ?, 
                edit_time = strftime('%s', 'now')  -- 更新时间戳
            WHERE strategy_id = ?
        """
        cursor.execute(update_query, (request.active, request.strategy_id))
        db_connection.commit()  # 提交事务

        subcirbed_symbols = ws_client.subscribed_streams

        print(f"subcirbed_symbols{subcirbed_symbols}, \ndatabase_symbols{database_symbols}")
        if request.active == 1:
            if subcirbed_symbols.count(result["symbol"]) == 1:
                print("已经订阅该标的")
                pass
            else:
                print("没有订阅的标的，订阅")
                ws_client.subscribe(result["symbol"])

        elif request.active == 0:
            if database_symbols.count(result["symbol"]) == 1 and subcirbed_symbols.count(result["symbol"]) == 1:
                print("取消订阅")
                ws_client.unsubscribe(result["symbol"])
            else:
                print("无需取消订阅")
        
        status = "activated" if request.active == 1 else "stopped"
        return {"detail": f"Strategy {request.strategy_id} successfully {status}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# 修改密码

# 删除策略接口
class DeleteStrategyRequest(BaseModel):
    strategy_id: str
@app.post("/delete-strategy/")
def delete_strategy(request: DeleteStrategyRequest):
    """
    删除指定策略
    参数:
        - strategy_id: 需要删除的策略ID
    """
    try:
        cursor = db_connection.cursor()
        # 检查 strategy_id 是否存在
        cursor.execute("SELECT * FROM strategy WHERE strategy_id = ?", (request.strategy_id,))
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Strategy record not found")
        # 删除记录
        cursor.execute("DELETE FROM strategy WHERE strategy_id = ?", (request.strategy_id,))
        db_connection.commit()
        return {"detail": request.strategy_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
class AddStrategyRequest(BaseModel):
    symbol: str
    wallet: str
    strategy_type: int
    strategy: str
    strategy_abstract: str
    notify_level: int
    notify_interval_time: int
    total_notify_times: int
# 添加策略
@app.post("/add-strategy/")
def add_strategy(request: AddStrategyRequest):
    """
    添加新策略
    参数:
        - symbol
        - wallet
        - strategy_type
        - strategy
        - strategy_abstract
        - notify_level
        - notify_interval_time
        - total_notify_times
    """
    try:
        cursor = db_connection.cursor()

        # 插入新记录
        insert_query = """
        INSERT INTO strategy (
            strategy_id, symbol, wallet, strategy_type, strategy, strategy_abstract,
            notify_level, notify_interval_time, total_notify_times, add_time, edit_time, active
        ) VALUES (
            strftime('%s', 'now') || CAST(RANDOM() % 10000 AS TEXT), ?, ?, ?, ?, ?, ?, ?, ?, strftime('%s', 'now'), 0, 0
        )
        """
        cursor.execute(
            insert_query,
            (
                request.symbol,
                request.wallet,
                request.strategy_type,
                request.strategy,
                request.strategy_abstract,
                request.notify_level,
                request.notify_interval_time,
                request.total_notify_times,
            ),
        )
        db_connection.commit()

        return {"detail": "New strategy successfully added"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
# 建立双向通信通道
async def task():
    cursor = db_connection.cursor()
    query = "SELECT * FROM strategy WHERE active = ?"
    cursor.execute(query, (1,))
    results = cursor.fetchall()
    ws_client.strategies = results
    print(len(results))
    for result in results:
        symbol =  result["symbol"]
        print(symbol)
        if symbol not in ws_client.subscribed_streams:
            print(ws_client.subscribed_streams)
            ws_client.subscribe(symbol)
            time.sleep(1)

def start_websocket_client():
    asyncio.run(task())

if __name__ == "__main__":
    websocket_thread = threading.Thread(target=start_websocket_client, daemon=True)
    websocket_thread.start()
    uvicorn.run(app, host="0.0.0.0", port=8000)
