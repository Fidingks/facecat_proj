from facecat import *
import sqlite3
from . import Strategy

#绘制买卖档
#view:视图
#paint:绘图对象
#clipRect:区域
def drawControlPanel(view, paint, strategy, clipRect):
	paint.drawText("编辑策略", "rgb(175,196,228)", "Default,18", 45,  10)
	if strategy == []:
		x = view.size.cx
	else:
		print(strategy)
		drawFont = "Default,14"
		# paint.drawText((strategy[2].upper()), "rgb(175,196,228)", drawFont, 5,  22 + 20 )
		if strategy[4] == 0:
			strategy_info = ["监控资产","策略类型","创建时间","策略摘要","涨破：","跌破：","通知冷却","通知等级","通知次数"]
			for i in range(0, len(strategy_info)):
				paint.drawText(strategy_info[i], "rgb(175,196,228)", drawFont, 5,  30 + 40 * i )
		# for i in range(0, len(strategy)):
		# 	paint.drawText(str(strategy[i]), "rgb(175,196,228)", drawFont, 5,  22 + 20 * i)
