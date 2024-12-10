from facecat import * 

def ChangeLocation(views, x):
    # 每个按钮的宽度、高度和间隔
    button_width = 200
    button_height = 300
    spacing = 10

    # 计算每行能够放下多少个按钮
    buttons_per_row = (x ) // (button_width + 20) + 1
    # 初始化布局坐标
    row = 0  # 当前行
    col = 0  # 当前列
    for view in views:
        # 计算当前按钮的位置
        button_x = col * (button_width + spacing) + spacing
        button_y = row * (button_height + spacing) + spacing

        # 设置按钮的坐标
        view.location = FCPoint(button_x, button_y)

        # 计算下一按钮的位置
        col += 1
        if col >= buttons_per_row:  # 如果当前列数超出每行按钮数，换到下一行
            col = 0
            row += 1
#图层
class StrategyDiv(FCView):
    def __init__(self):
        super().__init__()
        self.strategy = {}
        self.viewType = "div" #类型
        self.onClick = editStrategy
def onPaintDiv(view, paint, clipRect):
    print("ok")

def onPaintDivBorder(view, paint, clipRect):
    print("ok")
#获取价格数据
def getPriceColor(price, comparePrice):
	if price != 0:
		if price > comparePrice:
			return "rgb(255,82,82)"
		elif price < comparePrice:
			return "rgb(46,255,50)"
	return "rgb(190,190,235)"

def change_color(view, firstTouch, firstPoint, secondTouch, secondPoint, clicks):
	view._backColor = "rgb(255, 0, 0)"
	print(1)
      
def AddStrategyButton(view, firstTouch, firstPoint, secondTouch, secondPoint, clicks):
      print("添加一个策略块")

#绘制买卖档
#view:视图
#paint:绘图对象
#clipRect:区域
def drawControlPanel(view, paint, latestDataStr, clipRect):
	drawFont = "Default,14"
	paint.drawText("标的", "rgb(175,196,228)", drawFont, 5,  10)
	paint.drawText("现价", "rgb(175,196,228)", drawFont, 5, 35)
	paint.drawText("总额", "rgb(175,196,228)", drawFont, 5, 60)
	paint.drawText("策略类型", "rgb(175,196,228)", drawFont, 5, 85)
	paint.drawText("编辑策略", "rgb(175,196,228)", drawFont, 110, 10)
	paint.drawText("通知等级", "rgb(175,196,228)", drawFont, 110, 35)
	paint.drawText("通知冷却", "rgb(175,196,228)", drawFont, 110, 60)
	paint.drawText("最低", "rgb(175,196,228)", drawFont, 110, 85)

def clickType(view, firstTouch, firstPoint, secondTouch, secondPoint, clicks):
	print(1)
	
def addStrategyType(view, strategy_type):
    comboBox =  FCComboBox()
    comboBox.viewName = "strategy_type"
    addViewToParent(comboBox, view)
    comboBox.size = FCSize(100, 20)
    comboBox.location = FCPoint(90, 32)
    for c in range(0, 2):
        menuItem = FCMenuItem()
        if c == 0:
            menuItem.text = "价格破位"
        if c == 1:
            menuItem.text = "幅度破位"
        addMenuItem(menuItem, comboBox)
    if strategy_type == 0:
        comboBox.text = "价格破位"
    if strategy_type == 1:
        comboBox.text = "幅度破位"
    comboBox.onClick = clickType

def clickEditStraButton(view, firstTouch, firstPoint, secondTouch, secondPoint, clicks):
      print(f"弹出编辑策略窗口{view.viewName}")

def addEditStraButton(view, strategy_type):
    button =  FCButton()
    button.viewName = "strategy_type"
    addViewToParent(button, view)
    button.size = FCSize(60, 20)
    button.location = FCPoint(50,270)
    button.text = "编辑"
    if strategy_type == 0:
        button.viewName = "button0"
        pass
    if strategy_type == 1:
        button.viewName = "button1"
        pass
    button.onClick = clickEditStraButton

def addDeleteButton(view):
    button =  FCButton()
    button.viewName = "strategy_type"
    addViewToParent(button, view)
    button.size = FCSize(15, 15)
    button.location = FCPoint(190,13)
    button.text = "X"
    button.viewName = "deletebutton"

    button.onClick = clickEditStraButton
def AddStartButton(view):
    button =  FCButton()
    button.viewName = "start"
    addViewToParent(button, view)
    button.size = FCSize(60, 20)
    button.location = FCPoint(130,270)
    button.text = "启动"
    button.viewName = "deletebutton"

    button.onClick = clickEditStraButton
strategy = ["600000.SH",1, "涨破 920 跌破 880", 0, 10, 5]
def drawStrategies(view, paint, clipRect):
    top_x = 10
    top_y = 10
    s_DivWidth = 200
    s_DivHeight = 300

    gap = 10
    nums = 10
    drawFont = "Default,14"
    cx_view = view.size.cx
    cy_view = view.size.cy
    paint.drawRoundRect("rgb(255,255,255)", 1, 0, top_x, top_y, top_x + s_DivWidth, top_y + s_DivHeight, 10)
    paint.drawText(strategy[0], "rgb(175,196,228)", drawFont, 55,  12)
    paint.drawText("当前价格", "rgb(175,196,228)", drawFont, 14,  30)
    paint.drawText("9.88", "rgb(255,82,82)", drawFont, 80,  30)
    paint.drawText("策略类型", "rgb(175,196,228)", drawFont, 14,  70)
    paint.drawText(str(strategy[1]), "rgb(255,82,82)", drawFont, 80,  70)
    paint.drawText("策略摘要", "rgb(175,196,228)", drawFont, 14,  110)
    paint.drawText(strategy[2], "rgb(255,82,82)", drawFont, 80,  110)
    paint.drawText("通知等级", "rgb(175,196,228)", drawFont, 14,  150)
    paint.drawText(str(strategy[3]), "rgb(255,82,82)", drawFont, 80,  150)
    paint.drawText("通知冷却", "rgb(175,196,228)", drawFont, 14,  190)
    paint.drawText(str(strategy[4]) + "分钟", "rgb(255,82,82)", drawFont, 80,  190)
    paint.drawText("通知次数", "rgb(175,196,228)", drawFont, 14,  230)
    paint.drawText( f"{2}/" + str(strategy[5]), "rgb(255,82,82)", drawFont, 80,  230)
    addEditStraButton(view, strategy[1])
    AddStartButton(view)
    addDeleteButton(view)
	# paint.drawRect("rgb(255,255,255)", 1, 0, 10, 10, 160, 210)
	# for num in range(0, nums):
		
	#     paint.drawRect("rgb(255,0,0)", 1, 0, 10 + num * 50, 10, 50 + num * 50, 110)
def editStrategy(view, firstTouch, firstPoint, secondTouch, secondPoint, clicks):
    x = firstPoint.x
    y = firstPoint.y
    if clicks == 2:
         print("编辑策略")
    elif clicks == 1:
        if 1:
            view.borderColor = "rgb(184,255,137)"
        elif 2:
            view.borderColor = "rgb(255,255,255)"

    if x > 20 and x < 80 and y > 260 and y < 280:
        print(firstPoint.x)
        print(firstPoint.y)
        print("添加策略")

def onPaintStrategyDiv(div, paint, clipRect):
    strategy = div.strategy
    if div.backColor != "none":
        paint.fillRoundRect(div.backColor, 0, 0, div.size.cx, div.size.cy, div.cornerRadius)
    drawFont = "Default,14"
    paint.drawLine("rgb(255,255,255)", 1.5, 0, 180, 8, 190, 20)
    paint.drawLine("rgb(255,255,255)", 1.5, 0, 190, 8, 180, 20)
    paint.drawText(str(strategy[2]), "rgb(175,196,228)", drawFont, 60,  1)
    paint.drawText("当前价格", "rgb(175,196,228)", drawFont, 6,  30)
    paint.drawText("9.88", "rgb(255,82,82)", drawFont, 72,  30)
    paint.drawText("策略类型", "rgb(175,196,228)", drawFont, 6,  70)
    paint.drawText(str(strategy[4]), "rgb(255,82,82)", drawFont, 72,  70)
    paint.drawText("策略摘要", "rgb(175,196,228)", drawFont, 6,  110)
    paint.drawText(strategy[6], "rgb(255,82,82)", drawFont, 72,  110)
    paint.drawText("通知等级", "rgb(175,196,228)", drawFont, 6,  150)
    paint.drawText(str(strategy[7]), "rgb(255,82,82)", drawFont, 72,  150)
    paint.drawText("通知冷却", "rgb(175,196,228)", drawFont, 6,  190)
    paint.drawText(str(strategy[8]) + "分钟", "rgb(255,82,82)", drawFont, 72,  190)
    paint.drawText("通知次数", "rgb(175,196,228)", drawFont, 6,  230)
    paint.drawText( str(strategy[11]) + "/" + str(strategy[10]), "rgb(255,82,82)", drawFont, 72,  230)

def onPaintStrategyDivBorder(view, paint, clipRect):
    if view.viewType == "strategyDiv":
        paint.drawRoundRect(view.borderColor, view.borderWidth, 0, 0, 0, view.size.cx, view.size.cy, view.cornerRadius)
        paint.drawEllipse("rgb(255,0,0)", 3, 0, 0, 0, 5, 5)
    drawDivScrollBar(view, paint, clipRect)
          
def scroll(view, mp, buttons, clicks, delta):
    if view.viewType == "strategyDiv":
        view = view.parent
    elif view.viewType == "div":
         pass
    oldScrollV = view.scrollV
    if delta > 0:
        oldScrollV -= 100
    elif delta < 0:
        oldScrollV += 100
    contentHeight = getDivContentHeight(view)
    if contentHeight < view.size.cy:
        view.scrollV = 0
    else:
        if oldScrollV < 0:
            oldScrollV = 0
        elif oldScrollV > contentHeight - view.size.cy:
            oldScrollV = contentHeight - view.size.cy
        view.scrollV = oldScrollV
    invalidateView(view)
         
