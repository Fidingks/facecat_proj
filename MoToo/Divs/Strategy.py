from facecat import * 
import sqlite3
from DataApi.sub_data import BinanceWebSocketClient
from MonitorStrategy import mo_price
global ws_client
current_directory = os.getcwd()
DB_PATH = f'{current_directory}/data/user.db' 
mo = mo_price.PriceMonitor()
def on_message(data):
	mo.process(data)
	pass
ws_client = BinanceWebSocketClient(on_message_callback=on_message)
ws_client.start()

# x是allStrategy的宽度
def ChangeLocation(views, x):
    button_width = 200
    button_height = 300
    spacing = 10

    buttons_per_row = (x ) // (button_width + 20) + 1
    row = 0  # 当前行
    col = 0  # 当前列
    for view in views:
        button_x = col * (button_width + spacing) + spacing
        button_y = row * (button_height + spacing) + spacing
        view.location = FCPoint(button_x, button_y)
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
        self.status = "inactive" # 
        self.onClick = self.onClickStrategyDiv
        self.size = FCSize(200, 300)
        self.viewType = "strategyDiv"
        self.backColor = "rgb(0,0,0)"
        self.cornerRadius = 10
        self.onPaint = self.onPaintStrategyDiv
        self.onPaintBorder = self.onPaintStrategyDivBorder
        self.borderWidth = 2
        self.borderColor = "rgb(255, 255, 255)"
        self.onMouseWheel = self.scroll

    def unsubscribe(self):
        strategy_id = (self.strategy[1])
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute('''
        UPDATE strategy
        SET active = ?
        WHERE strategy_id = ?
        ''', (0, strategy_id))
        conn.commit()
        cur.close()
        conn.close()
        symbol = self.strategy[2]
        ws_client.unsubscribe(f"{symbol}@avgPrice")

    def subscribe(self):
        strategy_id = (self.strategy[1])
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute('''
        UPDATE strategy
        SET active = ?
        WHERE strategy_id = ?
        ''', (1, strategy_id))
        conn.commit()
        cur.close()
        conn.close()
        symbol = self.strategy[2]
        print(symbol)
        ws_client.subscribe(f"{symbol}@avgPrice")

    def onClickStrategyDiv(self, view, firstTouch, firstPoint, secondTouch, secondPoint, clicks):
        print(firstTouch, firstPoint, secondTouch, secondPoint, clicks)
        x = firstPoint.x
        y = firstPoint.y
        if clicks == 2:
            if view.status == "active":
                view.status = "inactive"
                view.borderColor = "rgb(255,255,255)"
            print("编辑策略")
        elif clicks == 1:
            print(x)
            print(y)
            if 170 < x < 200 and 0 < y < 20:
                self.deleteStrategyDiv()
            elif view.status == "inactive":
                view.borderColor = "rgb(184,255,137)"
                view.status = "active"
                print("启动策略")
            elif view.status == "active":
                view.borderColor = "rgb(255,255,255)"
                view.status = "inactive"
                print("停止策略")
    def deleteStrategyDiv(self):
        conn = sqlite3.connect('data/user.db')
        cur = conn.cursor()
        cur.execute('''
        DELETE FROM strategy WHERE strategy_id = ?
        ''', (self.strategy[1],)) 
        conn.commit()
        cur.close()
        conn.close()

    def onPaintStrategyDiv(self, div, paint, clipRect):
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

    def onPaintStrategyDivBorder(self, view, paint, clipRect):
        if view.viewType == "strategyDiv":
            paint.drawRoundRect(view.borderColor, view.borderWidth, 0, 0, 0, view.size.cx, view.size.cy, view.cornerRadius)
            paint.drawEllipse("rgb(255,0,0)", 3, 0, 0, 0, 5, 5)
        drawDivScrollBar(view, paint, clipRect)
    # 修改鼠标滚轮实现
    def scroll(self, view, mp, buttons, clicks, delta):
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

    #获取价格数据
    def getPriceColor(self, price, comparePrice):
        if price != 0:
            if price > comparePrice:
                return "rgb(255,82,82)"
            elif price < comparePrice:
                return "rgb(46,255,50)"
        return "rgb(190,190,235)"
