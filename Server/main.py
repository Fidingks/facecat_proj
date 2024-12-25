import threading
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
import json
import requests
import time
from contextlib import asynccontextmanager
import sqlite3
from typing import Dict
import datetime
import asyncio
import websockets
import uvicorn
import json
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
                print(f"Here Error: {e}")
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
            cursor.execute("SELECT * FROM strategy WHERE active = ?", (1,))
            database_symbols = cursor.fetchall()
            if not result:
                raise HTTPException(status_code=404, detail="Strategy record not found")
            total_notify_times = result[10]
            notified_times = result[11]
            print(f"notified_times:{notified_times}")
            active = 1
            if total_notify_times - 1 == notified_times:
                active = 0
                if database_symbols.count(result[2]) == 1 and ws_client.subscribed_streams.count(result[2]) == 1:
                    print("取消订阅")
                    ws_client.unsubscribe(result[2])
                
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
            cursor.execute("SELECT * FROM strategy WHERE active = ?", (1,))
            strategies = cursor.fetchall()
            ws_client.strategies = strategies
            db_connection.commit()  # 提交事务
            return {"detail": f"Update Strategy {strategy_id} notify status successfully "}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        
    def send_wechat_notice(self, content): # 发送通知到微信
        url = "http://120.48.136.60:8080/api/sendtxtmsg"
        payload = {
            "wxid": "wxid_6uj28bul7xqc22",
            "content": content,
            "atlist": []
            }
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            print("通知成功")
        else:
            print("通知失败")
    def process(self, callbackData):
        # 检查是否是目标事件
        if "e" not in callbackData or callbackData["e"] != "avgPrice":
            return
        elif "result" in callbackData:
            print(callbackData)
        callback_symbol = callbackData["s"]
        price = float(callbackData["w"])
        
        for strategy in self.strategies:
            strategy_type = strategy[4]
            if strategy_type != 0:  # 只处理价格破位策略
                continue
            
            strategy_symbol = strategy[2].lower()
            if callback_symbol.lower() != strategy_symbol:  # 检查是否是匹配的代币
                continue
            
            # 解析策略数据
            strategy_data = json.loads(strategy[5])
            up_over = float(strategy_data["up_over"])
            down_under = float(strategy_data["down_under"])
            strategy_id = strategy[1]
            last_notify_time = strategy[9]
            notify_interval_time = strategy[8] * 60
            notified_times = strategy[11]
            total_notify_times = strategy[10]

            # 打印调试信息
            print(f"标的 {callback_symbol} 当前价格 {price:.2f} 涨破价格 {up_over} 跌破价格 {down_under} "
                  f"通知间隔 {time.time() - last_notify_time}")

            # 检查通知条件
            if time.time() - last_notify_time < notify_interval_time:
                continue  # 冷却时间未到
            
            if notified_times >= total_notify_times:
                continue  # 已达通知次数上限

            # 符合条件时进行通知
            formatted_time = datetime.datetime.fromtimestamp(time.time()).strftime("%H:%M")
            if price > up_over:
                self.notify_once(strategy_id)
                self.send_wechat_notice(f"{formatted_time}\n{callback_symbol} 🚀涨破{up_over}\n当前：{price}$")
                
            elif price < down_under:
                self.notify_once(strategy_id)
                self.send_wechat_notice(f"{formatted_time}\n{callback_symbol} ⬇️跌破{down_under}\n当前：{price}$")
                

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
                "params": [f"{stream}@avgPrice"],
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
# 创建 FastAPI 实例并传入 lifespan
app = FastAPI(lifespan=lifespan)

# 用于管理连接的 WebSocket 客户端
connected_clients = set()
'''
{
  "action": "get_strategy",
  "data": {
    "strategy_id": "12345"
  }
}
'''
'''
{
  "action": "response",
  "status": "success",
  "data": {
    "strategy_id": "12345",
    "symbol": "BTCUSDT",
    "strategy_type": 1
  }
}
'''
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # 接受 WebSocket 连接
    await websocket.accept()
    connected_clients.add(websocket)
    client_info = websocket.client
    print(client_info.host)  # 输出客户端 IP 地址
    print(client_info.port)  # 输出客户端端口号
    print("Client connected")

    
    try:
        while True:
            # 接收消息
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # 处理消息
            print(f"接到客户端的消息{message}")
            response = await handle_message(message)
            
            # 将响应发送回客户端
            await websocket.send_text(json.dumps(response))
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
        print("Client disconnected")
    

async def handle_message(message):
    """处理客户端发来的 WebSocket 消息"""
    action = message.get("action")
    data = message.get("data", {})
    if action == "get_all_strategy":
        results = get_all_strategy()
        return {"action": "get_all_strategy", "status": "success", "message": str(results)}
    elif action == "start_strategy":
        result = start_strategy(data)
        # await connected_clients[0].send_text(json.dumps({"action": "notify", "status": "success", "message": str(1111)}))
        return {"action": "start_strategy", "status": "success", "message": result}
    elif action == "add_strategy":
        if add_strategy(data):
            return {"action": "add_strategy", "status": "success", "message": str(get_all_strategy())}
    elif action == "update_strategy":
        message = update_strategy(data)
        return {"action": "update_strategy", "status": "success", "message": message}
    elif action == "delete_strategy":
        if delete_strategy(data):
            return {"action": "update_strategy", "status": "success", "message": {}}
    else:
        return {"action": "response", "status": "error", "message": "Unknown action"}
    

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
def get_all_strategy():
    try:
        cursor = db_connection.cursor()
        query = "SELECT * FROM strategy"
        cursor.execute(query,)
        result = cursor.fetchall()
        if result:
            return json.dumps(result)
        else:
            raise HTTPException(status_code=404, detail="Strategy record not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

#提交策略更改

@app.post("/update-strategy/")
def update_strategy(request):
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
        print(request)
        cursor.execute("SELECT * FROM strategy WHERE strategy_id = ?", (request["strategy_id"],))
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
                request["symbol"],
                request["strategy_type"],
                request["strategy"],
                request["strategy_abstract"],
                request["notify_level"],
                request["notify_interval_time"],
                request["total_notify_times"],
                0,
                request["strategy_id"],
            ),
        )
        db_connection.commit()  # 提交事务
        return {"detail": "Strategy record updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


def start_strategy(request):
    """
    修改策略的 active 状态
    参数: 
        - strategy_id: 策略ID
        - active: 状态 (0 - 停止, 1 - 激活)
    """
    try:
        cursor = db_connection.cursor()

        # 检查 strategy_id 是否存在
        cursor.execute("SELECT * FROM strategy WHERE strategy_id = ?", (request["strategy_id"],))
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
        cursor.execute(update_query, (request["active"], request["strategy_id"]))
        db_connection.commit()  # 提交事务

        cursor.execute("SELECT * FROM strategy WHERE active = ?", (1,))
        database_symbols = []
        strategies = cursor.fetchall()
        for item in strategies:
            database_symbols.append(item[2])

        subcirbed_symbols = ws_client.subscribed_streams

        if request["active"] == 1:
            if subcirbed_symbols.count(result[2]) == 1: # 2表示symbol
                print("已经订阅该标的")
                pass
            else:
                print("没有订阅的标的，订阅")
                ws_client.subscribe(result[2])
            
        elif request["active"] == 0: # active 字段
            if database_symbols.count(result[1]) == 1 and subcirbed_symbols.count(result[2]) == 1:
                print("取消订阅")
                ws_client.unsubscribe(result[1])
            else:
                print("无需取消订阅")
        ws_client.strategies = strategies
        status = "activated" if request["active"] == 1 else "stopped"
        return {"detail": f"Strategy {request["strategy_id"]} successfully {status}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# 修改密码


def delete_strategy(request):
    """
    删除指定策略
    参数:
        - strategy_id: 需要删除的策略ID
    """
    try:
        cursor = db_connection.cursor()
        # 检查 strategy_id 是否存在
        cursor.execute("SELECT * FROM strategy WHERE strategy_id = ?", (request["strategy_id"],))
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Strategy record not found")
        # 删除记录
        cursor.execute("DELETE FROM strategy WHERE strategy_id = ?", (request["strategy_id"],))
        db_connection.commit()
        return True
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# 添加策略
def add_strategy(request):
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
                request["symbol"],
                request["wallet"],
                request["strategy_type"],
                request["strategy"],
                request["strategy_abstract"],
                request["notify_level"],
                request["notify_interval_time"],
                request["total_notify_times"],
            ),
        )
        db_connection.commit()
        return True
    
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
        symbol =  result[2]
        print(symbol)
        if symbol not in ws_client.subscribed_streams:
            print(ws_client.subscribed_streams)
            ws_client.subscribe(symbol)
            time.sleep(0.5)

def start_websocket_client():
    asyncio.run(task())

if __name__ == "__main__":
    websocket_thread = threading.Thread(target=start_websocket_client, daemon=True)
    websocket_thread.start()
    uvicorn.run(app, host="0.0.0.0", port=8002)
