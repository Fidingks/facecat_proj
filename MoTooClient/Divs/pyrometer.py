# -*- coding:utf-8 -*-
#! python3
from facecat import *
#这里可能需要pip install requests
import requests
from requests.adapters import HTTPAdapter
import random
from datetime import datetime

#绘制视图
#view:视图
#paint:绘图对象
#clipRect:区域
def onPaint(view, paint, clipRect):
	if view.viewType == "pyrometer":
		drawDiv(view, paint, clipRect)
		for i in range(0, len(view.children)):
			pData = view.children[i]
			backColor = "none"
			borderColor = "none"
			if view.paint.defaultUIStyle == "dark":
				if pData.close >= pData.lastClose:
					backColor = "rgb(219,68,83)"
				else:
					backColor = "rgb(15,193,118)"
				borderColor = "rgb(0,0,0)"
			elif view.paint.defaultUIStyle == "light":
				if pData.close >= pData.lastClose:
					backColor = "rgb(255,255,255)"
				else:
					backColor = "rgb(255,255,255)"
				borderColor = "rgb(255,255,255)"
			paint.fillRect(backColor, pData.location.x, pData.location.y, pData.location.x + pData.size.cx, pData.location.y + pData.size.cy)
			paint.drawRect(borderColor, 1, 0, pData.location.x, pData.location.y, pData.location.x + pData.size.cx, pData.location.y + pData.size.cy)
			fontSize1 = int(min(pData.size.cx, pData.size.cy) / 5)
			if fontSize1 > 1:
				baseUpper = pData.text
				font1 = "Default," + str(fontSize1)
				tSize = paint.textSize(baseUpper, font1)
				isContinue = False
				while tSize.cx > pData.size.cx - 10:
					fontSize1 = fontSize1 - 1
					if fontSize1 < 1:
						isContinue = True
						break
					font1 = "Default," + str(fontSize1)
					tSize = paint.textSize(baseUpper, font1)   
				if isContinue:
					continue
				quoteUpper = pData.key
				font2 = "Default," + str(fontSize1 / 2)
				tSize2 = paint.textSize(quoteUpper, font2)
				if view.paint.defaultUIStyle == "dark":
					paint.drawText(baseUpper, "rgb(255,255,255)", font1, pData.location.x + (pData.size.cx - tSize.cx) / 2, pData.location.y + pData.size.cy / 2 - tSize.cy - tSize.cy / 2)
					paint.drawText(quoteUpper, "rgb(255,255,255)", font2, pData.location.x + (pData.size.cx - tSize2.cx) / 2, pData.location.y + pData.size.cy / 2 - tSize.cy / 4)
				elif view.paint.defaultUIStyle == "light":
					paint.drawText(baseUpper, "rgb(0,0,0)", font1, pData.location.x + (pData.size.cx - tSize.cx) / 2, pData.location.y + pData.size.cy / 2 - tSize.cy- tSize.cy / 2)
					paint.drawText(quoteUpper, "rgb(0,0,0)", font2, pData.location.x + (pData.size.cx - tSize2.cx) / 2, pData.location.y + pData.size.cy / 2- tSize.cy / 4)
				strPrice = "0.00%"
				if pData.lastClose > 0:
					strPrice = toFixed(100 * (pData.close - pData.lastClose) / pData.lastClose, 2) + "%"
					if pData.close > pData.lastClose:
						strPrice = "+" + strPrice
				font3 = "Default," + str(fontSize1 * 2 / 3)
				tSize5 = paint.textSize(strPrice, font3)
				if view.paint.defaultUIStyle == "dark":
					paint.drawText(strPrice, "rgb(255,255,255)", font3, pData.location.x + (pData.size.cx - tSize5.cx) / 2, pData.location.y + pData.size.cy / 2 + tSize.cy- tSize.cy / 2)
				elif view.paint.defaultUIStyle == "light":
					paint.drawText(strPrice, "rgb(0,0,0)", font3, pData.location.x + (pData.size.cx - tSize5.cx) / 2, pData.location.y + pData.size.cy / 2 + tSize.cy- tSize.cy / 2)
	else:
		onPaintDefault(view, paint, clipRect)

#面积图数据
class PyrometerData(object):
	def __init__(self):
		self.text = "" #文字
		self.key = "" #键
		self.lastClose = 0 #开始数据
		self.close = 0 #最新数据
		self.value = 0 #数值
		self.location = FCPoint(0, 0) #位置
		self.size = FCSize(0, 0) #大小

#面积图
class PyrometerDiv(FCView):
	def __init__(self):
		super().__init__()
		self.useAnimation = False #是否使用动画
		self.viewType = "pyrometer" #类型
		self.INF = 0x3f3f3f #无效数据
		self.Rwidth = 0 #宽度
		self.Rheight = 0 #高度
		self.children = [] #子视图
		self.rects = []

#重置行
def layoutrow(pyrometer, R, w):
	width = pyrometer.size.cx
	height = pyrometer.size.cy
	lx = width - pyrometer.Rwidth
	ly = height - pyrometer.Rheight
	direction = 0 
	sumValue = 0
	for x in range(0, len(R)):
		sumValue = sumValue + R[x]
	ext = sumValue / w
	if abs(w - pyrometer.Rwidth) <= 1e-6:
		pyrometer.Rheight = pyrometer.Rheight - ext
		direction = 0
	else:
		pyrometer.Rwidth = pyrometer.Rwidth - ext
		direction = 1

	for x in range(0, len(R)):
		r = R[x]
		if direction == 0:
			hh = ext
			ww = r / ext
			newRect = FCRect(0, 0, 0, 0)
			newRect.left = math.floor(lx)
			newRect.top = math.floor(ly)
			newRect.right = math.ceil(lx + ww)
			newRect.bottom = math.ceil(ly + hh)
			pyrometer.rects.append(newRect)
			lx = lx + ww
		else:
			ww = ext
			hh = r / ext
			newRect = FCRect(0, 0, 0, 0)
			newRect.left = math.floor(lx)
			newRect.top = math.floor(ly)
			newRect.right = math.ceil(lx + ww)
			newRect.bottom = math.ceil(ly + hh)
			pyrometer.rects.append(newRect)
			ly = ly + hh

#获取长度
def rWidth(pyrometer, R, w):
	return min(pyrometer.Rwidth, pyrometer.Rheight)

#获取最差的值
def worst(pyrometer, R, w):
	if len(R) == 0:
		return pyrometer.INF
	rmx = 0
	rmn = pyrometer.INF
	s = 0
	for x in range(0, len(R)):
		r = R[x]
		s = s + r
		if r > rmx:
			rmx = r
		if r < rmn:
			rmn = r
	pw = math.pow(w, 2)
	sw = math.pow(s, 2)
	return max(pw * rmx / sw, sw / (pw * rmn))

#秒表事件
#pyrometer 面积图
def onPyrometerTime(pyrometer):
	paint2 = False
	if pyrometer.useAnimation:
		for i in range(0, len(pyrometer.rects)):
			subView = pyrometer.children[i]
			targetRect = pyrometer.rects[i]
			nowRect = FCRect(subView.location.x, subView.location.y, subView.location.x + subView.size.cx, subView.location.y + subView.size.cy)
			if 1 == 1:
				if nowRect.left > targetRect.left:
					nowRect.left -= (nowRect.left - targetRect.left) / 4
					if nowRect.left - targetRect.left < 10:
						nowRect.left = targetRect.left
					paint2 = True
				elif nowRect.left < targetRect.left:
					nowRect.left += (targetRect.left - nowRect.left) / 4
					if targetRect.left - nowRect.left < 10:
						nowRect.left = targetRect.left
					paint2 = True
			if 1 == 1:
				if nowRect.top > targetRect.top:
					nowRect.top -= (nowRect.top - targetRect.top) / 4
					if nowRect.top - targetRect.top < 10:
						nowRect.top = targetRect.top
					paint2 = True
				elif nowRect.top < targetRect.top:
					nowRect.top += (targetRect.top - nowRect.top) / 4
					if targetRect.top - nowRect.top < 10:
						nowRect.top = targetRect.top
					paint2 = True
			if 1 == 1:
				if nowRect.right > targetRect.right:
					nowRect.right -= (nowRect.right - targetRect.right) / 4
					if nowRect.right - targetRect.right < 10:
						nowRect.right = targetRect.right
					paint2 = True
				elif nowRect.right < targetRect.right:
					nowRect.right += (targetRect.right - nowRect.right) / 4
					if targetRect.right - nowRect.right < 10:
						nowRect.right = targetRect.right
					paint2 = True
			if 1 == 1:
				if nowRect.bottom > targetRect.bottom:
					nowRect.bottom -= (nowRect.bottom - targetRect.bottom) / 4
					if nowRect.bottom - targetRect.bottom < 10:
						nowRect.bottom = targetRect.bottom
					paint2 = True
				elif nowRect.bottom < targetRect.bottom:
					nowRect.bottom += (targetRect.bottom - nowRect.bottom) / 4
					if targetRect.bottom - nowRect.bottom < 10:
						nowRect.bottom = targetRect.bottom
					paint2 = True
			subView.location = FCPoint(nowRect.left, nowRect.top)
			subView.size = FCSize(nowRect.right - nowRect.left, nowRect.bottom - nowRect.top)
	else:
		for i in range(0, len(pyrometer.rects)):
			subView = pyrometer.children[i]
			targetRect = pyrometer.rects[i]
			subView.location = FCPoint(targetRect.left, targetRect.top)
			subView.size = FCSize(targetRect.right - targetRect.left, targetRect.bottom - targetRect.top)
	if paint2:
		invalidateView(pyrometer)

#更新面积图
#pyrometer 面积图
def updatePyromoter(pyrometer):
	pyrometer.rects = []
	totalAmount = 0
	for i in range(0, len(pyrometer.children)):
		totalAmount += pyrometer.children[i].value
	rates = []
	for i in range(0, len(pyrometer.children)):
		rates.append(pyrometer.children[i].value / totalAmount)
	pyrometer.Rwidth = pyrometer.size.cx
	pyrometer.Rheight = pyrometer.size.cy
	areas = []
	for i in range(0, len(rates)):
		areas.append(rates[i] * pyrometer.size.cx * pyrometer.size.cy)
	children = areas
	row = []
	w = min(pyrometer.Rwidth, pyrometer.Rheight)
	while 1 == 1:
		if len(pyrometer.rects) > len(pyrometer.children):
			break
		if w <= 0:
			break
		if len(children) == 0:
			if len(row) > 0:
				layoutrow(pyrometer, row, w)  
			break
		c = children[0]
		if c == 0:
			layoutrow(pyrometer, row, w)
			break
		newrow = []
		for x in range(0, len(row)):
			newrow.append(row[x])
		newrow.append(c)
		if worst(pyrometer, row, w) >= worst(pyrometer, newrow, w):
			tmp = []
			for x in range(1, len(children)):
				tmp.append(children[x])
			children = tmp
			row = newrow
		else:
			layoutrow(pyrometer, row, w)  
			row = []
			w = rWidth(pyrometer, row, int(w))

#更新悬浮状态
#views:视图集合
def updateView(views):
	updateViewDefault(views)
	for i in range(0,len(views)):
		view = views[i]
		if view.viewType == "pyrometer":
			updatePyromoter(view)
			onPyrometerTime(view)

def queryPrice():
	url = "http://110.42.188.197:9968/quote?func=price&count=100&codes=all"
	try:
		s = requests.Session()
		s.mount('http://', HTTPAdapter(max_retries=3))
		response = s.get(url)
		result = response.text
		strs = result.split("\r\n")
		for i in range(0, len(strs)):
			subStrs = strs[i].split(",")
			if len(subStrs) >= 15:
				pData = PyrometerData()
				pData.key = subStrs[0]
				pData.text = subStrs[1]
				pData.value = float(subStrs[6])
				pData.close = float(subStrs[2])
				pData.lastClose = float(subStrs[8])
				pData.size = FCSize(0, 0)
				pData.location = FCPoint(pyrometer.size.cx, pyrometer.size.cy)
				pyrometer.children.append(pData)
		pyrometer.children = sorted(pyrometer.children, key=attrgetter('value'), reverse=True)	
		updateView(gPaint.views)
		updatePyromoter(pyrometer)
		onPyrometerTime(pyrometer)
		invalidateView(pyrometer)
	except requests.exceptions.RequestException as e:
		print(str(e))

#消息循环
def WndProc(hwnd,msg,wParam,lParam):
	return WndProcDefault(gPaint,hwnd,msg,wParam,lParam)

gPaint = FCPaint() #创建绘图对象
gPaint.defaultUIStyle = "dark"
gPaint.onPaint = onPaint
gPaint.onUpdateView = updateView

#初始化窗体
createMainWindow(gPaint, "facecat-py", WndProc)
#创建和添加视图
pyrometer = PyrometerDiv()
#填充布局
pyrometer.dock = "fill"
pyrometer.backColor = "rgb(0,0,0)"
#添加到框架
addView(pyrometer, gPaint)
queryPrice()
showWindow(gPaint)