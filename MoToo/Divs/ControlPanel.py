from facecat import *

#绘制买卖档
#view:视图
#paint:绘图对象
#clipRect:区域
def drawControlPanel(view, paint, clipRect):
	drawFont = "Default,14"
	paint.drawText("编辑策略", "rgb(175,196,228)", drawFont, 5,  10)
	