from facecat import * 


#获取价格数据
def getPriceColor(price, comparePrice):
	if price != 0:
		if price > comparePrice:
			return "rgb(255,82,82)"
		elif price < comparePrice:
			return "rgb(46,255,50)"
	return "rgb(190,190,235)"
#绘制买卖档
#view:视图
#paint:绘图对象
#clipRect:区域
def drawLatestDiv(view, paint, latestDataStr, clipRect):
	avgHeight = 20
	drawFont = "Default,14"
	dTop = 30
	paint.drawLine(view.borderColor, 1, 0, 0, dTop, view.size.cx, dTop)
	dataStrs = latestDataStr.split(",")
	lastClose = 0
	priceList = []
	volList = []
	buySellTexts = []
	if len(dataStrs) > 10:
		paint.drawText(dataStrs[0], "rgb(175,196,228)", "Default,14", 5, 7)
		paint.drawText(dataStrs[1], "rgb(194,151,18)", "Default,14", 80, 7)
		lastClose = float(dataStrs[8])
		priceList.append(float(dataStrs[23]))
		priceList.append(float(dataStrs[22]))
		priceList.append(float(dataStrs[21]))
		priceList.append(float(dataStrs[20]))
		priceList.append(float(dataStrs[19]))
		priceList.append(float(dataStrs[9]))
		priceList.append(float(dataStrs[10]))
		priceList.append(float(dataStrs[11]))
		priceList.append(float(dataStrs[12]))
		priceList.append(float(dataStrs[13]))

		volList.append(float(dataStrs[28]))
		volList.append(float(dataStrs[27]))
		volList.append(float(dataStrs[26]))
		volList.append(float(dataStrs[25]))
		volList.append(float(dataStrs[24]))
		volList.append(float(dataStrs[14]))
		volList.append(float(dataStrs[15]))
		volList.append(float(dataStrs[16]))
		volList.append(float(dataStrs[17]))
		volList.append(float(dataStrs[18]))

	buySellTexts.append("卖5")
	buySellTexts.append("卖4")
	buySellTexts.append("卖3")
	buySellTexts.append("卖2")
	buySellTexts.append("卖1")
	buySellTexts.append("买1")
	buySellTexts.append("买2")
	buySellTexts.append("买3")
	buySellTexts.append("买4")
	buySellTexts.append("买5")
	textColor = "rgb(175,196,228)"
	if view.paint.defaultUIStyle == "light":
		textColor = "rgb(0,0,0)"
	maxVol = maxValue(volList)
	for i in range(0, 10):
		tSize = paint.textSize(buySellTexts[i], drawFont)
		paint.drawText(buySellTexts[i], textColor, drawFont, 5, dTop + avgHeight / 2 - tSize.cy / 2)
		if len(priceList) > 0:
			price = priceList[i]
			upDownColor = "rgb(255,82,82)"
			upDownColor2 = "rgb(50,0,0)"
			if price < lastClose:
				upDownColor = "rgb(46,255,50)"
				upDownColor2 = "rgb(0,50,0)"
			paint.drawText(toFixed(priceList[i], 2), upDownColor, drawFont, 50, dTop + avgHeight / 2 - tSize.cy / 2)
			if maxVol > 0:
				paint.fillRect(upDownColor2, view.size.cx - volList[i] * 80 / maxVol, dTop + 2, view.size.cx, dTop + avgHeight - 2)
			volText = toFixed(volList[i] / 100, 0)
			volTextSize = paint.textSize(volText, drawFont)
			paint.drawText(volText, textColor, drawFont, view.size.cx - volTextSize.cx - 10, dTop + avgHeight / 2 - volTextSize.cy / 2)
		dTop += avgHeight
	paint.drawLine(view.borderColor, 1, 0, 0, dTop, view.size.cx, dTop)
	paint.drawText("现价", "rgb(175,196,228)", drawFont, 5, dTop + 10)
	paint.drawText("幅度", "rgb(175,196,228)", drawFont, 5, dTop + 35)
	paint.drawText("总额", "rgb(175,196,228)", drawFont, 5, dTop + 60)
	paint.drawText("总量", "rgb(175,196,228)", drawFont, 5, dTop + 85)
	paint.drawText("开盘", "rgb(175,196,228)", drawFont, 110, dTop + 10)
	paint.drawText("振幅", "rgb(175,196,228)", drawFont, 110, dTop + 35)
	paint.drawText("最高", "rgb(175,196,228)", drawFont, 110, dTop + 60)
	paint.drawText("最低", "rgb(175,196,228)", drawFont, 110, dTop + 85)
	if len(dataStrs) > 10:
		close = float(dataStrs[2])
		high = float(dataStrs[3])
		low = float(dataStrs[4])
		open = float(dataStrs[5])
		volume = float(dataStrs[6])
		amount = float(dataStrs[7])
		diff = 0
		if lastClose > 0:
			diff = 100 * (close - lastClose) / lastClose
		diff2 = 0
		if lastClose > 0:
			diff2 = 100 * (high - lastClose) / lastClose - 100 * (low - lastClose) / lastClose
		paint.drawText(toFixed(close, 2), getPriceColor(close, lastClose), drawFont, 40, dTop + 10)
		paint.drawText(toFixed(diff, 2) + "%", getPriceColor(close, lastClose), drawFont, 40, dTop + 35)
		paint.drawText(toFixed(amount / 10000, 0), textColor, drawFont, 40, dTop + 60)
		paint.drawText(toFixed(volume / 10000, 0), textColor, drawFont, 40, dTop + 85)

		paint.drawText(toFixed(open, 2), getPriceColor(open, lastClose), drawFont, 150, dTop + 10)
		paint.drawText(toFixed(diff2, 2) + "%", getPriceColor(close, lastClose), drawFont, 150, dTop + 35)
		paint.drawText(toFixed(high, 2), getPriceColor(high, lastClose), drawFont, 150, dTop + 60)
		paint.drawText(toFixed(low, 2), getPriceColor(low, lastClose), drawFont, 150, dTop + 85)
