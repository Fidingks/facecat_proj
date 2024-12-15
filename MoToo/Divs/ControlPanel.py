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
		paint.drawText((strategy[2].upper()), "rgb(175,196,228)", drawFont, 5,  22 + 20 )
		if strategy[4] == 0:
			paint.drawText("策略类型", "rgb(175,196,228)", drawFont, 5,  22 + 40 )
			paint.drawText("价格破位", "rgb(175,196,228)", drawFont, 75,  22 + 40 )
		# for i in range(0, len(strategy)):
		# 	paint.drawText(str(strategy[i]), "rgb(175,196,228)", drawFont, 5,  22 + 20 * i)
