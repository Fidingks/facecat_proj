import fastapi
from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager
import sqlite3
from typing import Dict

DATABASE = "user.db"
app = FastAPI()
db_connection = sqlite3.connect(DATABASE)
cursor = db_connection.cursor()
query = "SELECT * FROM strategy WHERE active = ?"
cursor.execute(query, (1,))
result = cursor.fetchall()
print(result)
# 使用 asynccontextmanager 实现 lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 应用启动时执行
    db_connection = sqlite3.connect(DATABASE)
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
def get_strategy_by_id(db_connection: sqlite3.Connection, strategy_id: int) -> Dict:
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

# GET 接口：使用查询参数获取记录
@app.get("/get-strategy/")
def read_strategy(strategy_id: int):
    """
    查询 strategy_id 对应的记录
    请求示例: /get-strategy/?strategy_id=123456
    """
    db_connection = app.state.db_connection
    strategy_data = get_strategy_by_id(db_connection, strategy_id)
    if not strategy_data:
        raise HTTPException(status_code=404, detail="Strategy record not found")
    
    return {"data": strategy_data}


# 获取全部策略

#提交策略更改

# 启动策略

# 停止策略

# 修改密码

# 修改用户信息

# 删除策略

# 添加策略

# 建立双向通信通道