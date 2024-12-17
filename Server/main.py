import fastapi
from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
from pydantic import BaseModel
import sqlite3
from typing import Dict
import uvicorn
DATABASE = "../MoToo/data/user.db"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 应用启动时执行
    db_connection = sqlite3.connect(DATABASE, check_same_thread=False)
    db_connection.row_factory = sqlite3.Row  # 结果返回为字典格式
    app.state.db_connection = db_connection
    print("Database connection opened")
    yield
    # 应用关闭时执行
    db_connection.close()
    print("Database connection closed")

# 创建 FastAPI 实例并传入 lifespan
app = FastAPI(lifespan=lifespan)

# 查询函数，复用全局数据库连接
def get_strategy_by_id(db_connection: sqlite3.Connection, strategy_id: str) -> Dict:
    try:
        cursor = db_connection.cursor()
        query = "SELECT * FROM strategy WHERE strategy_id = ?"
        cursor.execute(query, (strategy_id,))
        result = cursor.fetchone()
        if result:
            return dict(result)
        else:
            return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
def get_strategy_by_wallet(db_connection: sqlite3.Connection, wallet: str) -> Dict:
    try:
        cursor = db_connection.cursor()
        query = "SELECT * FROM strategy WHERE strategy_id = ?"
        cursor.execute(query, (wallet,))
        result = cursor.all()
        if result:
            return dict(result)
        else:
            return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
# GET 接口：使用查询参数获取记录
@app.get("/get-by-strategy_id/{strategy_id}")
def read_strategy(strategy_id: str):
    db_connection = app.state.db_connection
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
    db_connection = app.state.db_connection
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
    
# 获取全部策略
@app.get("/get-all-strategy/")
def read_strategy():
    db_connection = app.state.db_connection
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
# Pydantic 模型：定义客户端提交的 JSON 数据格式
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
    db_connection = app.state.db_connection
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
# 启动策略

# Pydantic 模型：定义请求体格式
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
    db_connection = app.state.db_connection
    try:
        cursor = db_connection.cursor()

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
        status = "activated" if request.active == 1 else "stopped"
        return {"detail": f"Strategy {request.strategy_id} successfully {status}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# 修改密码

# 修改用户信息
class DeleteStrategyRequest(BaseModel):
    strategy_id: str
# 删除策略
@app.post("/delete-strategy/")
def delete_strategy(request: DeleteStrategyRequest):
    """
    删除指定策略
    参数:
        - strategy_id: 需要删除的策略ID
    """
    db_connection = app.state.db_connection
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
    请求示例: POST /add-strategy/
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
    db_connection = app.state.db_connection
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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
