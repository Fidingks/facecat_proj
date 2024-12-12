from facecat import *
import sqlite3
from . import Strategy
#绘制买卖档
#view:视图
#paint:绘图对象
#clipRect:区域
def drawControlPanel(view, paint, clipRect):
	drawFont = "Default,14"
	paint.drawText("编辑策略", "rgb(175,196,228)", drawFont, 5,  10)

def AddStrategyToAll(view, firstTouch, firstPoint, secondTouch, secondPoint, clicks):
	print("添加一个策略")
	conn = sqlite3.connect('data/user.db')
	cur = conn.cursor()
	cur.execute('''
	INSERT INTO strategy (wallet,strategy_id, symbol, strategy_type, strategy, strategy_abstract, add_time) 
	VALUES ( ?, ?, ?, ?, ?, ?, ?)
	''', ("FWnPy6eH9Y5DbPjui8ojCdwz5gv6WqzSK3hFc5ouct6C","sdssavdgre452", "btcusdt", 0, '{"up_over":"92000","down_under":"88000"}',"涨破100,跌破50", time.time()))
	# 提交更改并关闭连接
	conn.commit()
	cursor = cur.execute("SELECT * FROM strategy WHERE strategy_id = ?",("sdssavdgre452",))
	result = cursor.fetchall() 
	cur.close()
	conn.close()
	strategyDiv = Strategy.StrategyDiv()
	strategyDiv.strategy = result