from facecat import *

# 绘制控制面板组件
def onPaintAddButton(button, paint, clipRect):
	if button == paint.touchDownView:
		if button.pushedColor != "none":
			paint.fillRoundRect(button.pushedColor, 0, 0, button.size.cx, button.size.cy, button.cornerRadius)
		else:
			if button.backColor != "none":
				paint.fillRoundRect(button.backColor, 0, 0, button.size.cx, button.size.cy, button.cornerRadius)
	#鼠标悬停
	elif button == paint.touchMoveView:
		if button.hoveredColor != "none":
			paint.fillRoundRect(button.hoveredColor, 0, 0, button.size.cx, button.size.cy, button.cornerRadius)
		else:
			if button.backColor != "none":
				paint.fillRoundRect(button.backColor, 0, 0, button.size.cx, button.size.cy, button.cornerRadius)
	#常规情况
	elif button.backColor != "none":
		paint.fillRoundRect(button.backColor, 0, 0, button.size.cx, button.size.cy, button.cornerRadius)
	#绘制文字
	if button.textColor != "none" and len(button.text) > 0:
		tSize = paint.textSize(button.text, button.font)
		paint.drawText(button.text, button.textColor, button.font, (button.size.cx - tSize.cx) / 2, (button.size.cy  - tSize.cy) / 2)
	#绘制边线
	if button.borderColor != "none":
		paint.drawRoundRect(button.borderColor, button.borderWidth, 0, 0, 0, button.size.cx, button.size.cy, button.cornerRadius)
