//FaceCat-JavaScript
//Shanghai JuanJuanMao Information Technology Co., Ltd 

/*
* 坐标结构
*/
class FCPoint {
	// 构造函数
	constructor(ix, iy) {
		this.x = ix;
		this.y = iy;
	}
};

/*
* 大小结构
*/
class FCSize {
	// 构造函数
	constructor(icx, icy) {
		this.cx = icx;
		this.cy = icy;
	}
};

/*
* 矩形结构
*/
class FCRect {
	// 构造函数
	constructor(ileft, itop, iright, ibottom) {
		this.left = ileft;
		this.top = itop;
		this.right = iright;
		this.bottom = ibottom;
	}
};

/*
* 边距信息
*/
class FCPadding {
	// 构造函数
	constructor(ileft, itop, iright, ibottom) {
		this.left = ileft;
		this.top = itop;
		this.right = iright;
		this.bottom = ibottom;
	}
};

/*
* 转换颜色
*/
let convertColor = function(inColor) {
	if (inColor.indexOf("rgba(") != -1) {
		let inStrs = inColor.replace("rgba(", "").replace(")", "");
		let strs = inStrs.split(',');
		if (strs.length >= 4) {
			let a = parseFloat(strs[3]);
			a /= 255;
			return "rgba(" + strs[0] + "," + strs[1] + "," + strs[2] + "," + a + ")";
		}
	}
	return inColor;
};

/*
* 绘图结构
*/
class FCPaint {
	constructor() {
		this.cancelClick = false; //是否退出点击
		this.canvas = null; //视图
		this.container = null; //容器
		this.context = null; //绘图上下文
		this.defaultUIStyle = "light"; //默认样式 light:白色 dark:黑色
		this.dragBeginPoint = new FCPoint(0, 0); //拖动开始时的触摸位置
		this.dragBeginRect = new FCRect(0, 0, 0, 0); //拖动开始时的区域
		this.draggingView = null; //正被拖动的视图
		this.editMode = 1; //编辑框的模式
		this.editingTextBox = null; //正在编辑的文本框
		this.firstTouch = false; //是否第一次触摸
		this.focusedView = null; //焦点视图
		this.isDoubleClick = false; //是否双击
		this.isPath = false; //是否路径
		this.isMobile = false; //是否移动端
		this.lastClickTime = 0; //上次点击时间
		this.moveTo = false;
		this.offsetX = 0; //横向偏移
		this.offsetY = 0; //纵向偏移
		this.ratio = 1; //缩放比例
		this.resizeColumnState = 0; //改变列宽度的状态
		this.resizeColumnBeginWidth = 0; //改变列宽度的起始值
		this.resizeColumnIndex = -1; //改变列宽度的索引
		this.scaleFactorX = 1; //横向缩放比例
		this.scaleFactorY = 1; //纵向缩放比例
		this.secondTouch = false; //是否第二次触摸
		this.systemFont = "Arial"; //系统字体
		this.textBox = null; //原生文本框
		this.touchDownView = null; //触摸的视图
		this.touchMoveView = null; //触摸移动的视图
		this.touchDownPoint = null; //触摸的坐标
		this.touchFirstPoint = new FCPoint(0, 0); //第一次触摸的点
		this.touchSecondPoint = new FCPoint(0, 0); //第二次触摸的点
		this.viewMode = 0; //视图的模式
		this.views = new Array(); //视图集合
		this.onClickGridCell = null; //点击单元格的回调
		this.onClickGridColumn = null; //点击列的回调
		this.onClickTreeNode = null; //点击树节点的回调
		this.onCalculateChartMaxMin = null; //计算最大最小值的回调
		this.onContainsPoint = null; //是否包含坐标点
		this.onInvalidate = null; //绘图回调
		this.onInvalidateView = null; //局部绘图回调
		this.onPaint = null; //重绘回调
		this.onPaintBorder = null; //重绘边线回调
		this.onPaintGridCell = null; //绘制单元格的回调
		this.onPaintGridColumn = null; //绘制表格列的回调
		this.onPaintTreeNode = null; //绘制树节点的回调
		this.onPaintChartScale = null; //绘制坐标轴回调
		this.onPaintChartHScale = null; //绘制坐标轴回调
		this.onPaintChartStock = null; //绘制图表回调
		this.onPaintChartPlot = null; //绘制画线回调
		this.onPaintChartCrossLine = null; //绘制十字线回调
		this.onPaintCalendarDayButton = null;  //绘制日历的日按钮回调
		this.onPaintCalendarMonthButton = null; //绘制日历的月按钮回调
		this.onPaintCalendarYearButton = null; //绘制日历的年按钮回调
		this.onPaintCalendarHeadDiv = null; //绘制日历头部回调
		this.onRenderViews = null; //绘制视图的回调
		this.onUpdateView = null; //更新布局的回调
		this.onMouseDown = null; //鼠标按下事件回调
        this.onMouseMove = null; //鼠标移动事件回调
        this.onMouseUp = null; //鼠标抬起事件回调
        this.onMouseWheel = null; //鼠标滚轮事件回调
        this.onTouchBegin = null; //触摸开始事件回调
        this.onTouchMove = null; //触摸移动事件回调
        this.onTouchEnd = null; //触摸结束事件回调
        this.onMouseEnter = null; //鼠标进入事件回调
        this.onMouseLeave = null; //鼠标离开事件回调
        this.onClick = null; //点击事件回调
        this.onKeyDown = null; //键盘按下事件
        this.onKeyUp = null; //键盘抬起事件
		this.textSizeCache = new Map(); 
	}
	/*
	* 添加线
	* x1:横坐标1
	* y1:纵坐标1
	* x2:横坐标2
	* y2:纵坐标2
	*/
	addLine(x1, y1, x2, y2) {
		if (!this.moveTo) {
			this.moveTo = true;
			this.context.moveTo(Math.round((x1 + this.offsetX) * this.scaleFactorX), Math.round((y1 + this.offsetY) * this.scaleFactorY));
		}
		this.context.lineTo(Math.round((x2 + this.offsetX) * this.scaleFactorX), Math.round((y2 + this.offsetY) * this.scaleFactorY));
	};
	/*
	* 开始路径
	*/
	beginPath() {
		this.context.beginPath();
		this.isPath = true;
	};
	/*
	* 开始绘图
	* rect:区域
	*/
	beginPaint(rect) {
		if(this.container){
			if(!this.context)
			{
				this.context = uni.createCanvasContext(this.canvas.id, this.container);
			}
		} else {
			if (!this.context) {
				this.context = this.canvas.getContext("2d");
			}
		}
		this.moveTo = false;
		this.offsetX = 0;
		this.offsetY = 0;
	};
	/*
	* 闭合路径
	*/
	closeFigure() {
		this.context.closePath();
	};
	/*
	* 关闭路径
	*/
	closePath() {
		this.moveTo = false;
	};
	/*
	* 绘制线
	* color:颜色
	* width:宽度
	* style:样式
	* x1:横坐标1
	* y1:纵坐标1
	* x2:横坐标2
	* y2:纵坐标2
	*/
	drawLine(color, width, style, x1, y1, x2, y2) {
		width = Math.min(this.scaleFactorX, this.scaleFactorY) * width;
		this.context.beginPath();
		this.context.strokeStyle = convertColor(color);
		this.context.lineWidth = width;
		if (this.context.lineWidth < 1) {
			this.context.lineWidth = 1;
		}
		if (style != 0) {
			this.context.setLineDash(style);
		}
		this.context.moveTo(Math.round((x1 + this.offsetX) * this.scaleFactorX), Math.round((y1 + this.offsetY) * this.scaleFactorY));
		this.context.lineTo(Math.round((x2 + this.offsetX) * this.scaleFactorX), Math.round((y2 + this.offsetY) * this.scaleFactorY));
		this.context.stroke();
		if (style != 0) {
			this.context.setLineDash([]);
		}
	};
	/*
	* 绘制路径
	* color:颜色
	* width:宽度
	* style:样式
	*/
	drawPath(color, width, style) {
		width = Math.min(this.scaleFactorX, this.scaleFactorY) * width;
		if (style != 0) {
			this.context.setLineDash(style);
		}
		this.context.strokeStyle = convertColor(color);
		this.context.lineWidth = width;
		if (this.context.lineWidth < 1) {
			this.context.lineWidth = 1;
		}
		this.context.stroke();
		if (style != 0) {
			this.context.setLineDash([]);
		}
	};
	/*
	* 绘制连续线条
	* color:颜色
	* width:宽度
	* style:样式
	*/
	drawPolyline(color, width, style, apt) {
		if(apt.length > 1){
			width = Math.min(this.scaleFactorX, this.scaleFactorY) * width;
			if (style) {
				this.context.setLineDash(style);
			}
			this.context.strokeStyle = convertColor(color);
			this.context.lineWidth = width;
			if (this.context.lineWidth < 1) {
				this.context.lineWidth = 1;
			}
			this.context.beginPath();
			for(let i = 0; i < apt.length; i++){
				let x = apt[i].x;
				let y = apt[i].y;
				x = x + this.offsetX;
				y = y + this.offsetY;
				if (this.scaleFactorX != 1 || this.scaleFactorY != 1){
					x = this.scaleFactorX * x;
					y = this.scaleFactorY * y;
				}
				if (i == 0){
					this.context.moveTo(Math.round(x), Math.round(y));
				}else{
					this.context.lineTo(Math.round(x), Math.round(y));
				}
			}
			this.context.stroke();
			if (style) {
				this.context.setLineDash([]);
			}
		}else if(apt.length == 1){
			this.drawLine(color, width, style, apt[0].x, apt[0].y, apt[0].x + 1, apt[0].y);
		}
	};
	/*
	* 绘制多边形
	* color:颜色
	* width:宽度
	* style:样式
	*/
	drawPolygon(color, width, style, apt) {
		if(apt.length > 1){
			width = Math.min(this.scaleFactorX, this.scaleFactorY) * width;
			if (style) {
				this.context.setLineDash(style);
			}
			this.context.strokeStyle = convertColor(color);
			this.context.lineWidth = width;
			if (this.context.lineWidth < 1) {
				this.context.lineWidth = 1;
			}
			this.context.beginPath();
			for(let i = 0; i < apt.length; i++){
				let x = apt[i].x;
				let y = apt[i].y;
				x = x + this.offsetX;
				y = y + this.offsetY;
				if (this.scaleFactorX != 1 || this.scaleFactorY != 1){
					x = this.scaleFactorX * x;
					y = this.scaleFactorY * y;
				}
				if (i == 0){
					this.context.moveTo(Math.round(x), Math.round(y));
				}else{
					this.context.lineTo(Math.round(x), Math.round(y));
				}
			}
			this.context.closePath();
			this.context.stroke();
			if (style) {
				this.context.setLineDash([]);
			}
		}
	};
	/*
	* 绘制图片
	* left:左侧坐标
	* top:上方坐标
	* right:右侧坐标
	* bottom:下方坐标
	*/
	drawImage(image, left, top, right, bottom) {
		let w = right - left;
		let h = bottom - top;
		this.context.drawImage(image, Math.round((left + this.offsetX) * this.scaleFactorX), Math.round((top + this.offsetY) * this.scaleFactorY), Math.round(w * this.scaleFactorX), Math.round(h * this.scaleFactorY));
	};
	/*
	* 绘制矩形
	* color:颜色
	* width:宽度
	* style:样式
	* left:左侧坐标
	* top:上方坐标
	* right:右侧坐标
	* bottom:下方坐标
	*/
	drawRect(color, width, style, left, top, right, bottom) {
		width = Math.min(this.scaleFactorX, this.scaleFactorY) * width;
		let w = right - left;
		let h = bottom - top;
		if (style != 0) {
			this.context.setLineDash(style);
		}
		this.context.strokeStyle = convertColor(color);
		this.context.lineWidth = width;
		if (this.context.lineWidth < 1) {
			this.context.lineWidth = 1;
		}
		this.context.strokeRect(Math.round((left + this.offsetX) * this.scaleFactorX), Math.round((top + this.offsetY) * this.scaleFactorY), Math.round(w * this.scaleFactorX), Math.round(h * this.scaleFactorY));
		if (style != 0) {
			this.context.setLineDash([]);
		}
	};
	/*
	* 绘制圆角矩形
	* color:颜色
	* left:左侧坐标
	* top:上方坐标
	* right:右侧坐标
	* bottom:下方坐标
	* cornerRadius:圆角度数
	*/
	drawRoundRect(color, width, style, left, top, right, bottom, cornerRadius) {
		if (cornerRadius > 0) {
			width = Math.min(this.scaleFactorX, this.scaleFactorY) * width;
			if (style != 0) {
				this.context.setLineDash(style);
			}
			this.context.strokeStyle = convertColor(color);
			this.context.lineWidth = width;
			if (this.context.lineWidth < 1) {
				this.context.lineWidth = 1;
			}
			let corner = cornerRadius * Math.min(this.scaleFactorX, this.scaleFactorY);
			let w = Math.round((right - left) * this.scaleFactorX);
			let h = Math.round((bottom - top) * this.scaleFactorY);
			let x = (left + this.offsetX) * this.scaleFactorX;
			let y = (top + this.offsetY) * this.scaleFactorY;
			this.context.beginPath();
			this.context.moveTo(x + corner, y);
			this.context.arcTo(x + w, y, x + w, y + h, corner);
			this.context.arcTo(x + w, y + h, x, y + h, corner);
			this.context.arcTo(x, y + h, x, y, corner);
			this.context.arcTo(x, y, x + corner, y, corner);
			this.context.stroke();
			if (style != 0) {
				this.context.setLineDash([]);
			}
		} else {
			this.drawRect(color, width, style, left, top, right, bottom);
		}
	};
	/*
	* 绘制椭圆
	* color:颜色
	* width:宽度
	* style:样式
	* left:左侧坐标
	* top:上方坐标
	* right:右侧坐标
	* bottom:下方坐标
	*/
	drawEllipse(color, width, style, left, top, right, bottom) {
		width = Math.min(this.scaleFactorX, this.scaleFactorY) * width;
		let w = right - left;
		let h = bottom - top;

		if (style != 0) {
			this.context.setLineDash(style);
		}
		this.context.strokeStyle = convertColor(color);
		this.context.lineWidth = width;
		if (this.context.lineWidth < 1) {
			this.context.lineWidth = 1;
		}
		let centerX = (left + (right - left) / 2 + this.offsetX) * this.scaleFactorX;
		let centerY = (top + (bottom - top) / 2 + this.offsetY) * this.scaleFactorY;
		if (this.context.ellipse) {
			this.context.beginPath();
			this.context.ellipse(centerX, centerY, (w / 2) * this.scaleFactorX, (h / 2) * this.scaleFactorY, 0, 0, Math.PI * 2);
			this.context.stroke();
		} else {
			let radius = Math.max(w, h) / 2;
			if(radius < 1){
				radius = 1;
			}
			this.context.save();
			this.context.translate(centerX, centerY);
			if(radius > 1){
				if (w > h) {
					this.context.scale(1, h / w);
				} else if (w < h) {
					this.context.scale(w / h, 1);
				}
			}
			this.context.beginPath();
			this.context.arc(0, 0, radius, 0, 2 * Math.PI, false);
			this.context.stroke();
			this.context.restore();
		}
		
		if (style != 0) {
			this.context.setLineDash([]);
		}
	};
	/*
	* 绘制文字
	* text:文字
	* color:颜色
	* font:字体
	* x:横坐标
	* y:纵坐标
	*/
	drawText(text, color, font, x, y) {
		if (text && text.length != 0 && font) {
			let strs = font.split(',');
			let fontFamily = strs[0];
			if (fontFamily == "Default") {
				fontFamily = this.systemFont;
            }
			let sFont = parseInt(strs[1]) + "px " + fontFamily;
			if (this.scaleFactorX != 1 || this.scaleFactorY != 1) {
				sFont = parseInt((this.scaleFactorX + this.scaleFactorY) / 2 * parseFloat(strs[1])) + "px " + fontFamily;
			}
			for (let i = 2; i < strs.length; i++) {
				let iStr = strs[i].toLowerCase();
				if (iStr == "bold" || iStr == "italic") {
					sFont = iStr + " " + sFont;
				}
			}
			this.context.font = sFont;
			this.context.fillStyle = convertColor(color);
			this.context.textAlign = 'left';
			this.context.textBaseline = 'top';
			this.context.fillText(text, Math.round((x + this.offsetX) * this.scaleFactorX), Math.round((y + this.offsetY) * this.scaleFactorY));
		}
	};
	/*
	* 结束绘图
	*/
	endPaint() {
		if(this.container){
			this.context.draw();
		}
	};
	/*
	* 填充路径
	* color:颜色
	*/
	fillPath(color) {
		let fColor = convertColor(color);
		if (this.context.fillStyle != fColor) {
			this.context.fillStyle = fColor;
		}
		this.context.fill();
	};
	/*
	* 填充多边形
	* color:颜色
	* width:宽度
	* style:样式
	*/
	fillPolygon(color, apt) {
		if(apt.length > 1){
			this.context.beginPath();
			for(let i = 0; i < apt.length; i++){
				let x = apt[i].x;
				let y = apt[i].y;
				x = x + this.offsetX;
				y = y + this.offsetY;
				if (this.scaleFactorX != 1 || this.scaleFactorY != 1){
					x = this.scaleFactorX * x;
					y = this.scaleFactorY * y;
				}
				if (i == 0){
					this.context.moveTo(Math.round(x), Math.round(y));
				}else{
					this.context.lineTo(Math.round(x), Math.round(y));
				}
			}
			this.context.fillStyle = convertColor(color);
			this.context.closePath();
			this.context.fill();
		}
	};
	/*
	* 填充矩形
	* color:颜色
	* left:左侧坐标
	* top:上方坐标
	* right:右侧坐标
	* bottom:下方坐标
	*/
	fillRect(color, left, top, right, bottom) {
		let w = right - left;
		let h = bottom - top;
		this.context.fillStyle = convertColor(color);
		this.context.fillRect(Math.round((left + this.offsetX) * this.scaleFactorX), Math.round((top + this.offsetY) * this.scaleFactorY), Math.round(w * this.scaleFactorX), Math.round(h * this.scaleFactorY));
	};
	/*
	* 填充圆角矩形
	* color:颜色
	* left:左侧坐标
	* top:上方坐标
	* right:右侧坐标
	* bottom:下方坐标
	* cornerRadius:圆角度数
	*/
	fillRoundRect(color, left, top, right, bottom, cornerRadius) {
		if (cornerRadius > 0) {
			let w = Math.round((right - left) * this.scaleFactorX);
			let h = Math.round((bottom - top) * this.scaleFactorY);
			let x = (left + this.offsetX) * this.scaleFactorX;
			let y = (top + this.offsetY) * this.scaleFactorY;
			let corner = cornerRadius * Math.min(this.scaleFactorX, this.scaleFactorY);
			this.context.beginPath();
			this.context.moveTo(x + corner, y);
			this.context.arcTo(x + w, y, x + w, y + h, corner);
			this.context.arcTo(x + w, y + h, x, y + h, corner);
			this.context.arcTo(x, y + h, x, y, corner);
			this.context.arcTo(x, y, x + corner, y, corner);
			this.context.fillStyle = convertColor(color);
			this.context.fill();
		} else {
			this.fillRect(color, left, top, right, bottom);
		}
	};
	/*
	* 填充椭圆
	* color:颜色
	* left:左侧坐标
	* top:上方坐标
	* right:右侧坐标
	* bottom:下方坐标
	*/
	fillEllipse(color, left, top, right, bottom) {
		let w = right - left;
		let h = bottom - top;
		this.context.fillStyle = convertColor(color);
		let centerX = (left + (right - left) / 2 + this.offsetX) * this.scaleFactorX;
		let centerY = (top + (bottom - top) / 2 + this.offsetY) * this.scaleFactorY;
		if (this.context.ellipse) {
			this.context.beginPath();
			this.context.ellipse(centerX, centerY, (w / 2) * this.scaleFactorX, (h / 2) * this.scaleFactorY, 0, 0, Math.PI * 2);
			this.context.fill();
		} else {
			let radius = Math.max(w, h) / 2;
			if(radius < 1){
				radius = 1;
			}
			this.context.save();
			this.context.translate(centerX, centerY);
			if(radius > 1){
				if (w > h) {
					this.context.scale(1, h / w);
				} else if (w < h) {
					this.context.scale(w / h, 1);
				}
			}
			this.context.beginPath();
			this.context.arc(0, 0, radius, 0, 2 * Math.PI, false);
			this.context.fill();
			this.context.restore();
		}
	};
	/*
	* 裁剪
	* left:左侧坐标
	* top:上方坐标
	* right:右侧坐标
	* bottom:下方坐标
	*/
	setClip(left, top, right, bottom) {
		let w = right - left;
		let h = bottom - top;
		this.context.beginPath();
		this.context.rect(Math.round((left + this.offsetX) * this.scaleFactorX), Math.round((top + this.offsetY) * this.scaleFactorY), Math.round(w * this.scaleFactorX), Math.round(h * this.scaleFactorY));
		this.context.clip();
	};

	/*
	* 设置偏移量
	* offsetX:横向偏移
	* offsetY:纵向偏移
	*/
	setOffset(offsetX, offsetY) {
		this.offsetX = offsetX;
		this.offsetY = offsetY;
	};
	/*
	* 获取字体大小
	* text:文字
	* font:字体
	*/
	textSize(text, font) {
		if (text && text.length != 0 && font) {
			if(this.container){
				let key = text + font + this.scaleFactorX.toString() + this.scaleFactorY.toString();
				if(this.textSizeCache.has(key)){
					return this.textSizeCache.get(key);
				}
			}
			let strs = font.split(',');
			let fontFamily = strs[0];
			if (fontFamily == "Default") {
				fontFamily = this.systemFont;
			}
			let rate = (this.scaleFactorX + this.scaleFactorY) / 2;
			let sFont = parseInt(strs[1]) * rate + "px " + fontFamily;
			for (let i = 2; i < strs.length; i++) {
				let iStr = strs[i].toLowerCase();
				if (iStr == "bold" || iStr == "italic") {
					sFont = iStr + " " + sFont;
				}
			}
            this.context.font = sFont;
            this.context.textAlign = 'left';
			this.context.textBaseline = 'top';
			let metrics = this.context.measureText(text);
			if(this.container){
				let tSize = new FCSize(metrics.width / rate, parseInt(strs[1]) / rate);
				let key = text + font + this.scaleFactorX.toString() + this.scaleFactorY.toString();
				this.textSizeCache.set(key, tSize);
				return tSize;
			}else{
                let actualHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
                if(!actualHeight || actualHeight <= 0){
                    return new FCSize(metrics.width / rate, parseInt(strs[1]) / rate);
                }else{
                    let tSize = new FCSize(metrics.width / rate, actualHeight / rate);
                    return tSize;
                }
			}
		} else {
			return new FCSize(0, 0);
		}
	};
	/*
	* 保存状态
	*/
	save() {
		this.context.save();
	};
	/*
	* 恢复状态
	*/
	restore() {
		this.context.restore();
	};
	/*
	* 绘制文字，超过范围的内容用...表示
	* text:文字
	* color:颜色
	* font:字体
	* left:左侧坐标
	* top:上方坐标
	* right:右侧坐标
	* bottom:下方坐标
	*/
	drawTextAutoEllipsis(text, color, font, left, top, right, bottom) {
		if (text && text.length != 0) {
			let tSize = this.textSize(text, font);
			if (tSize.cx < right - left) {
				this.drawText(text, color, font, left, top);
			} else {
				if (tSize.cx > 0) {
					let subLen = 3;
					while (true) {
						let newLen = text.length - subLen;
						if (newLen > 0) {
							let newText = text.substring(0, newLen) + "...";
							tSize = this.textSize(newText, font);
							if (tSize.cx < right - left) {
								this.drawText(newText, color, font, left, top);
								break;
							} else {
								subLen += 3;
							}
						} else {
							break;
						}
					}
				}
			}
		}
	};
};
	
/*
* 基础视图
*/
class FCView {
	// 构造函数
	constructor() {
		this.allowDrag = false; //是否允许拖动
		this.allowResize = false; //是否可以拖动改变大小
		this.align = "left"; //横向布局
		this.allowDragScroll = false; //是否允许拖动滚动
		this.allowPreviewsEvent = false; //是否允许预处理事件
		this.backColor = null; //背景色
		this.backImage = null; //背景图片
		this.borderColor = null; //边线色
		this.borderWidth = 1; //边线宽度
		this.clipRect = null; //裁剪区域
		this.cornerRadius = 0; //圆角
		this.cursor = ""; //光标
		this.displayOffset = true; //是否显示偏移量
		this.dock = "none"; //悬浮状态
		this.downScrollHButton = false; //是否按下横向滚动条
		this.downScrollVButton = false; //是否按下纵向滚动条
		this.exAttributes = new Map(); //额外属性
		this.enabled = true; //是否可用
		this.font = "Default,12"; //字体
		this.hoveredColor = null; //鼠标悬停时的颜色
		this.hScrollIsVisible = false; //横向滚动是否显示
		this.image = null; //图片
		this.input = null; //包含的原生组件
		this.location = new FCPoint(0, 0); //坐标
		this.margin = new FCPadding(0, 0, 0, 0); //外边距
		this.maximumSize = new FCSize(0, 0); //大小
		this.padding = new FCPadding(0, 0, 0, 0); //内边距
		this.paint = null; //绘图对象
		this.parent = null; //父视图
		this.pushedColor = "rgb(200,200,200)"; //鼠标按下时的颜色
		this.resizePoint = -1; //调整尺寸的点
		this.scrollV = 0; //纵向滚动
		this.scrollH = 0; //横向滚动
		this.scrollSize = 8; //滚动条的大小
		this.selectedBackColor = "none"; //选中的颜色
		this.showHScrollBar = false; //是否显示横向滚动条
		this.showVScrollBar = false; //是否显示纵向滚动条
		this.scrollBarColor = "rgb(200,200,200)"; //滚动条的颜色
		this.scrollBarHoveredColor = "rgb(42,138,195)"; //滚动条悬停的颜色
		this.size = new FCSize(0, 0); //大小
		this.startScrollH = 0; //开始滚动的值
		this.startScrollV = 0; //结束滚动的值
		this.startPoint = new FCPoint(); //起始点
		this.startRect = new FCRect(); //移动开始时的视图矩形
		this.tabIndex = 0; //Tab索引
  		this.tabStop = false; //是否支持Tab
		this.tag = null; //数据
		this.topMost = false; //是否置顶
		this.text = null; //文字
		this.textColor = null; //前景色
		this.textAlign = "middleleft"; //文字位置
		this.touchDownTime = 0; //鼠标按下的时间
		this.views = new Array(); //子视图
		this.viewName = null; //名称
		this.visible = true; //可见性
		this.verticalAlign = "top"; //纵向布局
		this.vScrollIsVisible = false; //纵向滚动是否显示

		this.onPaint = null; //重绘回调
		this.onPaintBorder = null; //重绘边线回调
		this.onClick = null; //点击方法
		this.onMouseDown = null;  //鼠标按下
		this.onMouseMove = null; //鼠标移动
		this.onMouseWheel = null; //鼠标滚动
		this.onMouseUp = null; //鼠标抬起
		this.onTouchBegin = null; //触摸开始
		this.onTouchMove = null; //触摸移动
		this.onTouchEnd = null; //触摸结束
		this.onKeyDown = null; //键盘按下
		this.onKeyUp = null; //键盘抬起
		this.onMouseEnter = null;  
		this.onMouseLeave = null; 
	};
};

/*
* 按钮
*/
class FCButton extends FCView {
	// 构造函数
	constructor() {
		super();
		super.hoveredColor = "rgb(150,150,150)"; //鼠标悬停时的颜色
		super.size = new FCSize(100, 20); //大小
		super.pushedColor = "rgb(200,200,200)"; //鼠标按下时的颜色
		super.viewType = "button"; //类型
	}
};

/*
* 标签
*/
class FCLabel extends FCView {
	// 构造函数
	constructor() {
		super();
		super.viewType = "label";
		super.borderColor = null;
	}
};

/*
* 复选按钮
*/
class FCCheckBox extends FCView {
	// 构造函数
	constructor() {
		super();
		this.buttonSize = new FCSize(16, 16); //按钮的大小
		this.checked = false; //是否选中
		super.viewType = "checkbox";
	}
};

/*
* 单选按钮
*/
class FCRadioButton extends FCView {
	// 构造函数
	constructor() {
		super();
		this.buttonSize = new FCSize(16, 16); //按钮的大小
		this.checked = false; //是否选中
		this.groupName = ""; //组别
		super.viewType = "radiobutton";
	}
};

/*
* 证券数据结构
*/
class SecurityData {
	constructor() {
		this.amount = 0; //成交额
		this.close = 0; //收盘价
		this.date = 0; //日期，为1970年到现在的秒
		this.high = 0; //最高价
		this.low = 0; //最低价
		this.open = 0; //开盘价
		this.volume = 0; //成交额
	}
	//拷贝数值
	copy(securityData) {
		this.amount = securityData.amount;
		this.close = securityData.close;
		this.date = securityData.date;
		this.high = securityData.high;
		this.low = securityData.low;
		this.open = securityData.open;
		this.volume = securityData.volume;
	}
};

/*
* 基础图形
*/
class BaseShape {
	constructor() {
		this.color = "none"; //颜色
		this.color2 = "none"; //颜色2
		this.datas = new Array(); //第一组数据
		this.datas2 = new Array(); //第二组数据
		this.divIndex = 0; //所在层
		this.leftOrRight = true; //依附于左轴或右轴
		this.lineWidth = 1; //线的宽度
		this.shapeType = "line"; //类型
		this.shapeName = ""; //名称
		this.showHideDatas = new Array(); //控制显示隐藏的数据
		this.style = ""; //样式
		this.text = ""; //显示的文字
		this.title = ""; //第一个标题
		this.title2 = ""; //第二个标题
		this.value = 0; //显示文字的值
	}
};

/*
* 画线工具结构
*/
class FCPlot {
	constructor() {
		this.key1 = null; //第一个键
		this.key2 = null; //第二个键
		this.key3 = null; //第三个键
		this.lineColor = "rgb(0,0,0)"; //线的颜色
		this.lineWidth = 1; //线的宽度
		this.pointColor = "rgba(0,0,0,125)"; //线的颜色
		this.plotType = "Line"; //线的类型
		this.startKey1 = null; //移动前第一个键
		this.startValue1 = null; //移动前第一个值
		this.startKey2 = null; //移动前第二个键
		this.startValue2 = null; //移动前第二个值
		this.startKey3 = null; //移动前第三个键
		this.startValue3 = null; //移动前第三个值
		this.value1 = null; //第一个值
		this.value2 = null; //第二个值
		this.value3 = null; //第三个值
	}
};

/*
* 图表
*/
class FCChart extends FCView {
	// 构造函数
	constructor() {
		super();
		this.addingPlot = ""; //正要添加的画线
		super.allowDragScroll = true; //是否允许拖动滚动
		this.autoFillHScale = false; //是否填充满X轴
		this.allowDragChartDiv = false; //是否允许拖拽图层
		this.allowSelectShape = false; //是否允许选中线条
		this.candleMax = 0; //蜡烛线的最大值
		this.candleMin = 0; //蜡烛线的最小值
		this.candleMaxRight = 0; //蜡烛线的右轴最大值
		this.candleMinRight = 0; //蜡烛线的右轴最小值
		this.candleDivPercent = 0.5; //图表层的占比
		this.crossTipColor = "rgb(50,50,50)"; //十字线标识的颜色
		this.crossLineColor = "rgb(100,100,100)"; //十字线的颜色
		this.candleDigit = 2; //图表层保留小数的位数
		this.candlePaddingTop = 30; //图表层的上边距
		this.candlePaddingBottom = 30; //图表层的下边距
		this.crossStopIndex = -1; //鼠标停留位置
		this.cycle = "day"; //周期
		this.datas = null; //图表数据
		this.downColor = "rgb(15,193,118)"; //下跌颜色
		this.firstVisibleIndex = -1; //起始可见的索引
		this.gridColor = "rgb(150,150,150)"; //网格颜色 
		this.hScalePixel = 11; //蜡烛线的宽度
		this.hScaleHeight = 30; //X轴的高度
		this.hScaleFormat = ""; //X轴的格式化字符，例如YYYY-mm-dd HH:MM:SS
		this.hScaleTextDistance = 10; //X轴的文字间隔
		this.indMax = 0; //指标层的最大值
		this.indMin = 0; //指标层的最小值
		this.indMax2 = 0; //指标层2的最大值
		this.indMin2 = 0; //指标层2的最小值
		this.indMaxRight = 0; //指标层的右轴最大值
		this.indMinRight = 0; //指标层的右轴最小值
		this.indMax2Right = 0; //指标层2的右轴最大值
		this.indMin2Right = 0; //指标层2的右轴最小值
		this.indDigit = 2; //指标层保留小数的位数
		this.indDigit2 = 2; //指标层2保留小数的位数
		this.indDivPercent = 0.3; //指标层的占比
		this.indDivPercent2 = 0.0; //指标层2的占比
		this.indPaddingTop = 20; //指标层的上边距
		this.indPaddingBottom = 20; //指标层的下边距
		this.indPaddingTop2 = 20; //指标层2的上边距
		this.indPaddingBottom2 = 20; //指标层2的下边距
		this.indicatorColors = []; //扩展图形
		this.leftVScaleWidth = 0; //左轴宽度
		this.lastVisibleIndex = -1; //结束可见的索引
		this.lastRecordIsVisible = true; //最后记录是否可见
		this.lastVisibleKey = 0; //最后可见的主键
		this.lastValidIndex = -1; //最后有效数据索引
		this.lineWidthChart = 1;
		this.mainIndicator = ""; //主图指标
		this.magnitude = 1; //成交量的比例
		this.midColor = "none"; //中间色
		this.offsetX = 0; //横向绘图偏移
		this.plots = new Array(); //画线的集合
		this.plotPointSizeChart = 5; //画线的选中点大小
		this.rightVScaleWidth = 100; //右轴宽度
		this.rightSpace = 0; //右侧空间
		this.scaleColor = "rgb(100,100,100)"; //刻度的颜色
		this.showIndicator = ""; //显示指标
		this.showIndicator2 = ""; //显示指标2
		this.showCrossLine = false; //是否显示十字线
		this.selectPlotPoint = -1; ////选中画线的点
		this.sPlot = null; //选中的画线
		this.startMovePlot = false; //选中画线
		this.selectShape = ""; //选中的图形
		this.selectShapeEx = ""; //选中的图形信息
		this.shapes = new Array(); //扩展图形
		this.targetOldX = 0; //缩小时旧的位置1
		this.targetOldX2 = 0; //放大时旧的位置2
		this.touchPosition = new FCPoint(); //鼠标坐标
		this.touchDownPoint = new FCPoint(0, 0);
		this.trendColor = "rgb(0,0,0)"; //分时线颜色
		this.volMax = 0; //成交量层的最大值
		this.volMin = 0; //成交量层的最小值
		this.volMaxRight = 0; //成交量层的右轴最大值
		this.volMinRight = 0; //成交量层的右轴最小值
		this.volDigit = 0; //成交量层保留小数的位数
		this.volDivPercent = 0.2; //成交量层的占比
		this.volPaddingTop = 20; //成交量层的上边距
		this.volPaddingBottom = 0; //成交量层的下边距
		this.vScaleDistance = 35; //纵轴的间隔
		this.vScaleType = "standard"; //纵轴的类型 log10代表指数坐标
		super.viewType = "chart"; //类型
		this.upColor = "rgb(219,68,83)"; //上涨颜色
		this.candleStyle = "rect";
		this.barStyle = "rect";
		this.firstOpen = 0;
		this.hScaleTextColor = "none"; //横轴的文字颜色
		this.vScaleTextColor = "none"; //纵轴的文字颜色
		this.volColor = "none"; //成交量的颜色
		//指标的缓存
		this.closearr = new Array();
		this.allema12 = new Array();
		this.allema26 = new Array();
		this.alldifarr = new Array();
		this.alldeaarr = new Array();
		this.allmacdarr = new Array();
		this.bollMap = {};
		this.biasMap = {};
		this.dmaMap = {};
		this.kdjMap = {};
		this.bbiMap = {};
		this.rocMap = {};
		this.rsiMap = {};
		this.wrMap = {};
		this.trixMap = {};
		this.maMap = {};
		this.cciArr = [];
		this.gridStep = 0; //网格计算临时变量
		this.gridDigit = 0; //网格计算临时变量
		this.firstIndexCache = -1;
		this.firstTouchIndexCache = -1;
		this.firstTouchPointCache = new FCPoint();
		this.lastIndexCache = -1;
		this.secondTouchIndexCache = -1;
		this.secondTouchPointCache = new FCPoint();
		this.firstPaddingTop = 0;
		this.firtstPaddingBottom = 0;
		this.kChart = 0.0;
		this.bChart = 0.0;
		this.oXChart = 0.0;
		this.oYChart = 0.0;
		this.rChart = 0.0;
		this.x4Chart = 0.0;
		this.y4Chart = 0.0;
		this.nHighChart = 0.0;
		this.nLowChart = 0.0;
		this.xChart = 0.0;
		this.yChart = 0.0;
		this.wChart = 0.0;
		this.hChart = 0.0;
		this.upSubValue = 0.0;
		this.downSubValue = 0.0;
		this.indicatorColors.push("rgb(100,100,100)");
		this.indicatorColors.push("rgb(206,147,27)");
		this.indicatorColors.push("rgb(150,0,150)");
		this.indicatorColors.push("rgb(255,0,0)");
		this.indicatorColors.push("rgb(0,150,150)");
		this.indicatorColors.push("rgb(0,150,0)");
		this.indicatorColors.push("rgb(59,174,218)");
		this.indicatorColors.push("rgb(50,50,50)");

		this.onCalculateChartMaxMin = null; //计算最大最小值的回调
		this.onPaintChartScale = null; //绘制坐标轴回调
		this.onPaintChartHScale = null; //绘制坐标轴回调
		this.onPaintChartStock = null; //绘制图表回调
		this.onPaintChartPlot = null; //绘制画线回调
		this.onPaintChartCrossLine = null; //绘制十字线回调
		this.getChartTitles = null; //获取标题
		this.onPaintChartTip = null; //绘制提示
	}
};

/*
* 日的按钮
*/
class DayButton {
	constructor() {
		this.backColor = null; //背景颜色
		this.borderColor = "rgb(150,150,150)"; //文字颜色 
		this.bounds = new FCRect(0, 0, 0, 0); //显示区域
		this.calendar = null; //日历视图
		this.day = null; //日
		this.font = "Default,16"; //字体
		this.inThisMonth = false; //是否在本月
		this.selected = false; //是否被选中
		this.textColor = "rgb(0,0,0)"; //文字颜色
		this.textColor2 = "rgb(50,50,50)"; //第二个文字颜色
		this.visible = true; //是否可见
	}
};

/*
* 月的按钮
*/
class MonthButton {
	constructor() {
		this.backColor = null; //背景颜色
		this.borderColor = "rgb(150,150,150)"; //文字颜色 
		this.bounds = new FCRect(0, 0, 0, 0); //显示区域
		this.calendar = null; //日历视图
		this.font = "Default,16"; //字体
		this.month = 0; //月
		this.textColor = "rgb(0,0,0)"; //文字颜色
		this.visible = true; //是否可见
		this.year = 0; //年
	}
};

/*
* 年的按钮
*/
class YearButton {
	constructor() {
		this.backColor = null; //背景颜色
		this.borderColor = "rgb(150,150,150)"; //文字颜色 
		this.bounds = new FCRect(0, 0, 0, 0); //显示区域
		this.calendar = null; //日历视图
		this.font = "Default,16"; //字体
		this.textColor = "rgb(0,0,0)"; //文字颜色
		this.visible = true; //是否可见
		this.year = 0; //年
	}
};

/*
* 日期层
*/
class DayDiv {
	constructor() {
		this.aClickRowFrom = 0; //点击时的上月的行
		this.aClickRowTo = 0; //点击时的当月的行
		this.aDirection = 0; //动画的方向
		this.aTick = 0; //动画当前帧数
		this.aTotalTick = 40; //动画总帧数
		this.calendar = null; //日历视图
		this.dayButtons = new Array(); //日期的集合
		this.dayButtons_am = new Array();  //动画日期的集合
	}
};

/*
* 月层
*/
class MonthDiv {
	constructor() {
		this.aDirection = 0; //动画的方向
		this.aTick = 0; //动画当前帧数
		this.aTotalTick = 40; //动画总帧数
		this.calendar = null; //日历视图
		this.monthButtons = new Array(); //月的按钮
		this.monthButtons_am = new Array(); //月的动画按钮
		this.year = 0; //年份
	}
};

/*
* 年层
*/
class YearDiv {
	constructor() {
		this.aDirection = 0; //动画的方向
		this.aTick = 0; //动画当前帧数
		this.aTotalTick = 40; //动画总帧数
		this.calendar = null; //日历视图
		this.startYear = 0; //开始年份
		this.yearButtons = new Array(); //月的按钮
		this.yearButtons_am = new Array(); //月的动画按钮
	}
};

/*
* 头部层
*/
class HeadDiv {
	constructor() {
		this.arrowColor = "rgb(150,150,150)"; //箭头颜色
		this.backColor = "rgb(255,255,255)"; //箭头颜色
		this.bounds = new FCRect(0, 0, 0, 0); //显示区域
		this.calendar = null; //日历视图
		this.textColor = "rgb(0,0,0)"; //文字颜色
		this.titleFont = "Default,20"; //标题字体
		this.visible = true; //是否可见
		this.weekFont = "Default,14"; //星期字体
	}
};

/*
* 时间层
*/
class TimeDiv {
	constructor() {
		this.bounds = new FCRect(0, 0, 0, 0); //显示区域
		this.calendar = null; //日历视图
	}
};

/*
* 年的结构
*/
class CYear {
	constructor() {
		this.months = new Map(); //月的集合
		this.year = 0; //年
	}
};

/*
* 月的结构
*/
class CMonth {
	constructor() {
		this.days = new Map(); //日的集合
		this.month = 0; //月
		this.year = 0; //年
	}
};

/*
* 日的结构
*/
class CDay {
	constructor() {
		this.day = 0; //日
		this.month = 0; //月
		this.year = 0; //年
	}
};

/*
* 日历
*/
class FCCalendar extends FCView {
	// 构造函数
	constructor() {
		super();
		this.dayDiv = new DayDiv(); //日层
		this.headDiv = new HeadDiv(); //头部层
		this.monthDiv = new MonthDiv(); //月层
		this.mode = "day"; //模式
		this.selectedDay = null; //选中日
		this.showWeekend = true; //是否显示周末
		super.size = new FCSize(100, 20); //大小
		this.timeDiv = new TimeDiv(); //时间层
		this.useAnimation = false; //是否使用动画
		super.viewType = "calendar"; //类型
		this.yearDiv = new YearDiv(); //年层
		this.years = new Map(); //日历

		this.onPaintCalendarDayButton = null;  //绘制日历的日按钮回调
		this.onPaintCalendarMonthButton = null; //绘制日历的月按钮回调
		this.onPaintCalendarYearButton = null; //绘制日历的年按钮回调
		this.onPaintCalendarHeadDiv = null; //绘制日历头部回调
	}
};

/*
* 图层
*/
class FCDiv extends FCView {
	// 构造函数
	constructor() {
		super();
		super.allowDragScroll = true;
		super.viewType = "div";
	}
};

/*
* 表格列
*/
class FCGridColumn {
	constructor() {
		this.allowSort = true; //是否允许排序
		this.allowResize = false; //是否允许改变大小
		this.backColor = "rgb(200,200,200)"; //背景色
		this.borderColor = "rgb(150,150,150)"; //边线颜色
		this.bounds = new FCRect(); //区域
		this.cellAlign = "left"; //left:居左 center:居中 right:居右
		this.colType = ""; //类型 string:字符串 double:浮点型 int:整型 bool: 布尔型
		this.colName = ""; //名称
		this.font = "Default,12"; //字体
		this.frozen = false; //是否冻结
		this.index = -1; //索引
		this.sort = "none"; //排序模式
		this.text = ""; //文字
		this.textColor = "rgb(50,50,50)"; //文字颜色
		this.visible = true; //是否可见
		this.width = 120; //宽度
		this.widthStr = ""; //宽度字符串
	}
};

/*
* 表格单元格
*/
class FCGridCell {
	constructor() {
		this.backColor = "rgb(255,255,255)"; //背景色
		this.borderColor = "rgb(150,150,150)"; //边线颜色
		this.colSpan = 1; //列距
		this.column = null; //所在列
		this.digit = -1; //保留小数的位数
		this.font = "Default,12"; //字体
		this.rowSpan = 1; //行距
		this.textColor = "rgb(0,0,0)"; //文字颜色
		this.value = null; //值
		this.view = null; //包含的视图
	}
};

/*
* 表格行
*/
class FCGridRow {
	constructor() {
		this.alternate = false; //是否交替行
		this.cells = new Array(); //单元格
		this.index = -1; //行的索引
		this.selected = false; //是否选中
		this.visible = true; //是否可见
	}
};

/*
* 表格
*/
class FCGrid extends FCView {
	// 构造函数
	constructor() {
		super();
		super.allowDragScroll = true; //是否允许拖动滚动
		this.alternateRowColor = "none"; //交替行的颜色
		this.columns = new Array(); //列
		this.headerHeight = 30; //头部高度
		this.rows = new Array(); //行
		this.rowHeight = 30; //行高
		super.showHScrollBar = true; //是否显示横向滚动条
		super.showVScrollBar = true; //是否显示横向滚动条
		this.selectedRowColor = "rgb(125,125,125)"; //选中行的颜色
		super.viewType = "grid"; //类型

		this.onClickGridCell = null; //点击单元格的回调
		this.onClickGridColumn = null; //点击列的回调
		this.onPaintGridCell = null; //绘制单元格的回调
		this.onPaintGridColumn = null; //绘制表格列的回调
	}
};

/*
* 文本框
*/
class FCTextBox extends FCView {
	// 构造函数
	constructor() {
		super();
		super.viewType = "textbox";
	}
};

/*
* 下拉选择
*/
class FCComboBox extends FCView {
	// 构造函数
	constructor() {
		super();
		this.dropDownMenu = null; //下拉菜单 
		this.selectedIndex = -1; //选中索引
		super.viewType = "combobox";
	}
};

/*
* 日期框
*/
class FCImage extends FCView {
	// 构造函数
	constructor() {
		super();
		this.src = ""; //图片路径
		super.viewType = "image"; //类型
	}
};

/*
 * 多布局图层
 */
class FCLayoutDiv extends FCDiv {
	// 构造函数
	constructor() {
		super();
		super.allowDragScroll = true;
		this.autoWrap = false; //是否自动换行
		this.layoutStyle = "lefttoright"; //分割方式
		super.viewType = "layout";
		super.showHScrollBar = true; //是否显示横向滚动条
		super.showVScrollBar = true; //是否显示横向滚动条
	}
};

/*
* 分割图层
*/
class FCSplitLayoutDiv extends FCView {
	// 构造函数
	constructor() {
		super();
		this.firstView = null; //第一个视图
		this.layoutStyle = "lefttoright"; //分割方式
		this.oldSize = new FCSize(0, 0); //上次的尺寸
		this.splitMode = "absolutesize"; //分割模式 percentsize百分比或absolutesize绝对值
		this.splitPercent = -1; //分割百分比
		this.secondView = null; //第二个视图
		this.splitter = null; //分割线
		super.viewType = "split";
	}
};

/*
* 多页夹
*/
class FCTabView extends FCView {
	// 构造函数
	constructor() {
		super();
		this.animationSpeed = 20; //动画速度
		this.layout = "top"; //布局方式
		this.tabPages = new Array(); //页夹集合
		this.underLineColor = null;//下划线的颜色
		this.underLineSize = null; //下划线的宽度
		this.underPoint = null; //下划点
		this.useAnimation = false; //是否使用动画
		super.viewType = "tabview"; //类型
	}
};

/*
* 页
*/
class FCTabPage extends FCView {
	// 构造函数
	constructor() {
		super();
		this.headerButton = null; //页头的按钮
		super.viewType = "tabpage";
		super.visible = false;
	}
};

/*
* 树的列
*/
class FCTreeColumn {
	constructor() {
		this.bounds = new FCRect(); //区域
		this.index = -1; //索引
		this.visible = true; //是否可见
		this.width = 120; //宽度	
		this.widthStr = ""; //宽度字符串
	}
};

/*
* 树节点
*/
class FCTreeNode {
	constructor() {
		this.allowCollapsed = true; //是否允许折叠
		this.backColor = "rgb(255,255,255)"; //背景色
		this.checked = false; //是否选中
		this.childNodes = new Array(); //子节点
		this.column = null; //所在列
		this.collapsed = false; //是否折叠
		this.font = "Default,14"; //字体
		this.indent = 0; //缩进
		this.parentNode = null; //父节点
		this.row = null; //所在行
		this.textColor = "rgb(0,0,0)"; //文字颜色
		this.value = null; //值	
	}
};

/*
* 树的行
*/
class FCTreeRow {
	constructor() {
		this.alternate = false; //是否交替行
		this.cells = new Array(); //单元格
		this.index = -1; //索引
		this.selected = false; //是否选中
		this.visible = true; //是否可见
	}
};

/*
* 树
*/
class FCTree extends FCView {
	// 构造函数
	constructor() {
		super();
		super.allowDragScroll = true; //是否允许拖动滚动
		this.alternateRowColor = "none"; //交替行的颜色
		this.childNodes = new Array(); //子节点
		this.checkBoxWidth = 25; //复选框占用的宽度
		this.collapsedWidth = 25; //折叠按钮占用的宽度
		this.columns = new Array(); //列
		this.headerHeight = 0; //头部高度
		this.indent = 20; //缩进
		super.showHScrollBar = true; //是否显示横向滚动条
		super.showVScrollBar = true; //是否显示横向滚动条
		this.showCheckBox = false; //是否显示复选框
		this.selectedRowColor = "rgb(125,125,125)"; //选中行的颜色
		this.rows = new Array(); //行
		this.rowHeight = 30; //行高
		super.viewType = "tree"; //类型

		this.onClickTreeNode = null; //点击树节点的回调
		this.onPaintTreeNode = null; //绘制树节点的回调
	}
};

/*
* 菜单
*/
class FCMenu extends FCLayoutDiv {
	// 构造函数
	constructor() {
		super();
		this.autoSize = true; //是否自动适应尺寸
		this.comboBox = null; //所在的下拉菜单
		this.items = []; //菜单项
		this.popup = true; //是否弹出
		this.allowPreviewsEvent = true;
		super.viewType = "menu";
		super.size = new FCSize(100, 100);
		super.showHScrollBar = true;
		super.showVScrollBar = true;
		super.visible = false;
		super.layoutStyle = "toptobottom";
		super.autoWrap = false;
		super.maximumSize = new FCSize(100, 300);
	}
};

/*
* 菜单项
*/
class FCMenuItem extends FCView {
	// 构造函数
	constructor() {
		super();
		this.checked = false; //是否选中
		this.dropDownMenu = null; //下拉菜单
		this.items = []; //菜单项
		this.parentMenu = null; //所在菜单
		this.parentItem = null; //父菜单项
		this.value = ""; //值
		super.viewType = "menuitem";
		super.hoveredColor = "rgb(150,150,150)";
		super.pushedColor = "rgb(200,200,200)";
		super.textColor = "rgb(0,0,0)";
		super.borderColor = "rgb(100,100,100)";
		super.size = new FCSize(100, 25);
	}
};

/*
 * 添加顶层视图
 * view:视图
 * paint:绘图对象
 */
let addView = function (view, paint) {
	view.paint = paint;
	paint.views.push(view);
};

/*
 * 添加到父视图
 * view:视图
 * parent:父视图
 */
let addViewToParent = function (view, parent) {
	view.paint = parent.paint;
	if (!parent.views) {
		parent.views = new Array();
	}
	parent.views.push(view);
	view.parent = parent;
};

/*
 * 插入到顶层视图
 * view:视图
 * paint:绘图对象
 * index:索引
 */
let insertView = function (view, paint, index) {
	view.paint = paint;
	paint.views.splice(index, 0, view);
};

/*
 * 插入到父视图
 * view:视图
 * parent:父视图
 * index:索引
 */
let insertViewToParent = function (view, parent, index) {
	view.paint = parent.paint;
	if (!parent.views) {
		parent.views = new Array();
	}
	parent.views.splice(index, 0, view);
	view.parent = parent;
};

/*
* 清除输入框
*/
let clearViewInputs = function(views){
	for (let i = 0; i < views.length; i++) {
		let view = views[i];
		if(view.input){
			document.body.removeChild(view.input);
			view.input = null;
		}
		clearViewInputs(view.views);
	}
};

/*
* 清除视图
* paint:绘图对象
*/
let clearViews = function (paint) {
	clearViewInputs(paint.views);
	paint.views = [];
};
	
/*
* 移除顶层视图
* view:视图
* paint:绘图对象
*/
let removeView = function (view, paint) {
	if (paint.views) {
		for (let i = 0; i < paint.views.length; i++) {
			if (paint.views[i] == view) {
				paint.views.splice(i, 1);
				let removeViews = new Array();
				removeViews.push(view);
				clearViewInputs(removeViews);
				break;
			}
		}
	}
};

/*
 * 从父视图中移除
 * view:视图
 * parent:父视图
 */
let removeViewFromParent = function (view, parent) {
	if (parent.views) {
		for (let i = 0; i < parent.views.length; i++) {
			if (parent.views[i] == view) {
				parent.views.splice(i, 1);
				let removeViews = new Array();
				removeViews.push(view);
				clearViewInputs(removeViews);
				break;
			}
		}
	}
};

/*
* 获取绝对位置X
* view:视图
*/
let clientX = function (view) {
	if (view) {
		let cLeft = view.location.x;
		if (view.parent) {
			if (view.parent.displayOffset && view.parent.scrollH) {
				return cLeft + clientX(view.parent) - view.parent.scrollH;
			} else {
				return cLeft + clientX(view.parent);
			}
		} else {
			return cLeft;
		}
	} else {
		return 0;
	}
};

/*
* 获取绝对位置Y
* view:视图
*/
let clientY = function (view) {
	if (view) {
		let cTop = view.location.y;
		if (view.parent) {
			if (view.parent.displayOffset && view.parent.scrollV) {
				return cTop + clientY(view.parent) - view.parent.scrollV;;
			} else {
				return cTop + clientY(view.parent);
			}
		} else {
			return cTop;
		}
	} else {
		return 0;
	}
};

/*
* 是否包含坐标
* view:视图
* mp:坐标
*/
let containsPoint = function (view, mp) {
	if(isViewEnabled(view)){
		let clx = clientX(view);
		let cly = clientY(view);
		let size = view.size;
		let cp = new FCPoint(mp.x - clx, mp.y - cly);
		if (cp.x >= 0 && cp.x <= size.cx &&
			cp.y >= 0 && cp.y <= size.cy) {
			return true;
		} else {
			return false;
		}
	}else{
		return false;
	}
};

/*
* 查找有预处理事件的父视图
* view:视图
*/
let findPreviewsEventParent = function (view) {
	if (!view.allowPreviewsEvent && view.parent) {
		if (view.parent.allowPreviewsEvent) {
			return view.parent;
		} else {
			return findPreviewsEventParent(view.parent);
		}
	} else {
		return null;
	}
};

/*
* 根据名称查找视图
* name:名称
* views:视图集合
*/
let findViewByName = function (name, views) {
	let size = views.length;
	for (let i = 0; i < size; i++) {
		let view = views[i];
		if (view.viewName == name) {
			return view;
		} else {
			if (view.views) {
				let subView = findViewByName(name, view.views);
				if (subView) {
					return subView;
				}
			}
		}
	}
	return null;
};

/*
* 根据坐标查找视图
* mp:坐标
* views:视图集合
*/
let findView = function (mp, views) {
	let size = views.length;
	for (let i = size - 1; i >= 0; i--) {
		let view = views[i];
		if (view.visible && view.topMost) {
			let hasPoint = false;
			if (view.paint != null && view.paint.onContainsPoint) {
				hasPoint = view.paint.onContainsPoint(view, mp);
			} else {
				hasPoint = containsPoint(view, mp);
			}
			if (hasPoint) {
				if (view.vScrollIsVisible && view.scrollSize) {
					let clx = clientX(view);
					if (mp.x >= clx + view.size.cx - view.scrollSize) {
						return view;
					}
				}
				if (view.hScrollIsVisible && view.scrollSize) {
					let cly = clientY(view);
					if (mp.y >= cly + view.size.cy - view.scrollSize) {
						return view;
					}
				}
				if (view.views) {
					let subView = findView(mp, view.views);
					if (subView) {
						return subView;
					}
				}
				return view;
			}
		}
	}
	for (let i = size - 1; i >= 0; i--) {
		let view = views[i];
		if (view.visible && !view.topMost) {
			let hasPoint = false;
			if (view.paint != null && view.paint.onContainsPoint) {
				hasPoint = view.paint.onContainsPoint(view, mp);
			} else {
				hasPoint = containsPoint(view, mp);
			}
			if (hasPoint) {
				if (view.vScrollIsVisible && view.scrollSize) {
					let clx = clientX(view);
					if (mp.x >= clx + view.size.cx - view.scrollSize) {
						return view;
					}
				}
				if (view.hScrollIsVisible && view.scrollSize) {
					let cly = clientY(view);
					if (mp.y >= cly + view.size.cy - view.scrollSize) {
						return view;
					}
				}
				if (view.views) {
					let subView = findView(mp, view.views);
					if (subView) {
						return subView;
					}
				}
				return view;
			}
		}
	}
	return null;
};

/*
* 获取点击位置
* evt:事件
* canvas:图层
* ratio:比例
*/
let getTouchPosition = function (evt, canvas, paint) {
	let style = window.getComputedStyle(canvas, null);
	//宽高
	let cssWidth = parseFloat(style["width"]);
	let cssHeight = parseFloat(style["height"]);
	//各个方向的边框长度
	let borderLeft = parseFloat(style["border-left-width"]);
	let borderTop = parseFloat(style["border-top-width"]);
	let paddingLeft = parseFloat(style["padding-left"]);
	let paddingTop = parseFloat(style["padding-top"]);

	let scaleX = canvas.width / cssWidth; // 水平方向的缩放因子
	let scaleY = canvas.height / cssHeight; // 垂直方向的缩放因子
	let x = evt.clientX;
	let y = evt.clientY;

	let rect = canvas.getBoundingClientRect();
	x -= (rect.left + borderLeft + paddingLeft); // 去除 borderLeft paddingLeft 后的坐标
	y -= (rect.top + borderTop + paddingTop); // 去除 borderLeft paddingLeft 后的坐标
	if(!paint.container){
		x *= scaleX; // 修正水平方向的坐标
		y *= scaleY; // 修正垂直方向的坐标
	}
	x /= paint.ratio;
	y /= paint.ratio;
	x /= paint.scaleFactorX;
	y /= paint.scaleFactorY;
	return { x, y };
};

/*
* 是否重绘时可见
* view:视图
*/
let isPaintVisible = function (view) {
	if (view.visible) {
		if (view.parent) {
			if (view.parent.visible) {
				return isPaintVisible(view.parent);
			} else {
				return false;
			}
		} else {
			return true;
		}
	} else {
		return false;
	}
};

/*
* 是否可用
* view:视图
*/
let isViewEnabled = function (view) {
	if (view.enabled) {
		if (view.parent) {
			if (view.parent.enabled) {
				return isViewEnabled(view.parent);
			} else {
				return false;
			}
		} else {
			return true;
		}
	} else {
		return false;
	}
};
	
/*
* 获取区域的交集
*/
let getIntersectRect = function (lpDestRect, lpSrc1Rect, lpSrc2Rect) {
	lpDestRect.left = Math.max(lpSrc1Rect.left, lpSrc2Rect.left);
	lpDestRect.right = Math.min(lpSrc1Rect.right, lpSrc2Rect.right);
	lpDestRect.top = Math.max(lpSrc1Rect.top, lpSrc2Rect.top);
	lpDestRect.bottom = Math.min(lpSrc1Rect.bottom, lpSrc2Rect.bottom);
	if (lpDestRect.right > lpDestRect.left && lpDestRect.bottom > lpDestRect.top) {
		return 1;
	}
	else {
		lpDestRect.left = 0;
		lpDestRect.right = 0;
		lpDestRect.top = 0;
		lpDestRect.bottom = 0;
		return 0;
	}
};

/*
* 重绘视图
* views:视图集合
* paint:绘图对象
* rect:区域
*/
let renderViews = function (views, paint, rect) {
	let viewsSize = views.length;
	for (let i = 0; i < viewsSize; i++) {
		let view = views[i];
		if (!rect) {
			if (view.views) {
				let subViewsSize = view.views.length;
				if (subViewsSize > 0) {
					renderViews(view.views, paint, null);
				}
			}
			view.clipRect = null;
			continue;
		}
		if (!view.topMost && isPaintVisible(view)) {
			let clx = clientX(view);
			let cly = clientY(view);
			let drawRect = new FCRect(0, 0, view.size.cx, view.size.cy);
			let clipRect = new FCRect(clx, cly, clx + view.size.cx, cly + view.size.cy);
			let destRect = new FCRect();
			if (getIntersectRect(destRect, rect, clipRect) > 0) {
				paint.save();
				paint.setOffset(0, 0);
				paint.setClip(destRect.left, destRect.top, destRect.right, destRect.bottom);
				view.clipRect = destRect;
				paint.setOffset(clx, cly);
				if (paint.onPaint) {
					paint.onPaint(view, paint, drawRect);
				} else {
					onPaintDefault(view, paint, drawRect);
                }
				if (view.views) {
					let subViewsSize = view.views.length;
					if (subViewsSize > 0) {
						renderViews(view.views, paint, destRect);
					}
				}
				paint.setOffset(clx, cly);
				if (paint.onPaintBorder) {
					paint.onPaintBorder(view, paint, drawRect);
				} else {
					onPaintBorderDefault(view, paint, drawRect);
                }
				paint.restore();
			} else {
				if (view.views) {
					let subViewsSize = view.views.length;
					if (subViewsSize > 0) {
						renderViews(view.views, paint, null);
					}
				}
				view.clipRect = null;
			}
		}
	}
	for (let i = 0; i < viewsSize; i++) {
		let view = views[i];
		if (!rect) {
			continue;
		}
		if (view.topMost && isPaintVisible(view)) {
			let clx = clientX(view);
			let cly = clientY(view);
			let drawRect = new FCRect(0, 0, view.size.cx, view.size.cy);
			let clipRect = new FCRect(clx, cly, clx + view.size.cx, cly + view.size.cy);
			let destRect = new FCRect();
			if (getIntersectRect(destRect, rect, clipRect) > 0) {
				paint.save();
				paint.setOffset(0, 0);
				view.clipRect = destRect;
				paint.setClip(destRect.left, destRect.top, destRect.right, destRect.bottom);
				paint.setOffset(clx, cly);
				if (paint.onPaint) {
					paint.onPaint(view, paint, drawRect);
				} else {
					onPaintDefault(view, paint, drawRect);
                }
				if (view.views) {
					let subViewsSize = view.views.length;
					if (subViewsSize > 0) {
						renderViews(view.views, paint, destRect);
					}
				}
				paint.setOffset(clx, cly);
				if (paint.onPaintBorder) {
					paint.onPaintBorder(view, paint, drawRect);
				} else
				{
					onPaintBorderDefault(view, paint, drawRect);
				}
				paint.restore();
			}
			else {
				if (view.views) {
					let subViewsSize = view.views.length;
					if (subViewsSize > 0) {
						renderViews(view.views, paint, null);
					}
				}
				view.clipRect = null;
			}
		}
	}
};

/*
* 刷新输入框
*/
let invalidateEdit = function(paint){
	if(paint.textBox && paint.editingTextBox && paint.textBox.style.display == "block"){
		let canvas = paint.canvas;
		let rect = canvas.getBoundingClientRect();
		let newTop = rect.top + document.documentElement.scrollTop;
		let newLeft = rect.left + document.documentElement.scrollLeft;
		let view = paint.editingTextBox;
		let clx = clientX(view);
		let cly = clientY(view);
		let relativeRect = new FCRect(newLeft + clx * paint.scaleFactorX, newTop + cly * paint.scaleFactorY, newLeft + (clx + view.size.cx) * paint.scaleFactorX, newTop + (cly + view.size.cy) * paint.scaleFactorY);
		paint.textBox.style.left = relativeRect.left + "px";
		paint.textBox.style.top = relativeRect.top + "px";
		paint.textBox.style.width = (relativeRect.right - relativeRect.left) + "px";
		paint.textBox.style.height = (relativeRect.bottom - relativeRect.top) + "px";
	}
};

/*
* 全局刷新方法
* paint:绘图对象
*/
let invalidate = function (paint) {
	let drawViews = paint.views;
	if (paint.onInvalidate) {
		paint.onInvalidate(paint);
	} else {
		paint.beginPaint(null);
		let drawRect = new FCRect(0, 0, (paint.canvas.width / paint.ratio / paint.scaleFactorX), (paint.canvas.height / paint.ratio / paint.scaleFactorY));
		if (paint.onRenderViews) {
			paint.onRenderViews(drawViews, paint, drawRect);
		} else {
			renderViews(drawViews, paint, drawRect);
		}
		paint.endPaint();
		if(paint.editMode == 0){
			showOrHideInput(drawViews);
		}else{
			invalidateEdit(paint);
		}
	}
};

/*
* 刷新视图方法
* view:视图
*/
let invalidateView = function (view) {
	let paint = view.paint;
	if (paint.onInvalidateView) {
		paint.onInvalidateView(view);
	} else {
		if (isPaintVisible(view)) {
			let clX = clientX(view) - 1;
			let clY = clientY(view) - 1;
			let drawViews = paint.views;
			paint.beginPaint(null);
			let drawRect = null;
			if(paint.container){
				drawRect = new FCRect(0, 0, (paint.canvas.width / paint.ratio / paint.scaleFactorX), (paint.canvas.height / paint.ratio / paint.scaleFactorY));
			}else{
				drawRect = new FCRect(clX, clY, clX + view.size.cx + 1, clY + view.size.cy + 1);
			}
			if (paint.onRenderViews) {
				paint.onRenderViews(drawViews, paint, drawRect);
			} else {
				renderViews(drawViews, paint, drawRect);
			}
			paint.endPaint();
			if(paint.editMode == 0){
				showOrHideInput(drawViews);
			}else{
				invalidateEdit(paint);
			}
		}
	}
};
	
/*
* 更新布局状态
* views:视图集合
*/
let updateViewDefault = function (views) {
	for (let i = 0; i < views.length; i++) {
		let view = views[i];
		if (view.exAttributes) {
			if (view.exAttributes.has("leftstr")) {
				let pWidth = view.paint.canvas.width / view.paint.ratio / view.paint.scaleFactorX;
				if (view.parent) {
					pWidth = view.parent.size.cx;
				}
				let newStr = view.exAttributes.get("leftstr");
				newStr = newStr.replace("%", "");
				view.location.x = Number(newStr) * pWidth / 100;
			}
			if (view.exAttributes.has("topstr")) {
				let pHeight = view.paint.canvas.height / view.paint.ratio / view.paint.scaleFactorY;
				if (view.parent) {
					pHeight = view.parent.size.cy;
				}
				let newStr = view.exAttributes.get("topstr");
				newStr = newStr.replace("%", "");
				view.location.y = Number(newStr) * pHeight / 100;
			}
			if (view.exAttributes.has("widthstr")) {
				let pWidth = view.paint.canvas.width / view.paint.ratio / view.paint.scaleFactorX;
				if (view.parent) {
					pWidth = view.parent.size.cx;
				}
				let newStr = view.exAttributes.get("widthstr");
				newStr = newStr.replace("%", "");
				view.size.cx = Number(newStr) * pWidth / 100;
			}
			if (view.exAttributes.has("heightstr")) {
				let pHeight = view.paint.canvas.height / view.paint.ratio / view.paint.scaleFactorY;
				if (view.parent) {
					pHeight = view.parent.size.cy;
				}
				let newStr = view.exAttributes.get("heightstr");
				newStr = newStr.replace("%", "");
				view.size.cy = Number(newStr) * pHeight / 100;
			}
		}
		if (view.parent && view.parent.viewType != "split") {
			let margin = view.margin;
			let padding = view.parent.padding;
			if (view.dock == "fill") {
				view.location = new FCPoint(margin.left + padding.left, margin.top + padding.top);
				let vcx = view.parent.size.cx - margin.left - padding.left - margin.right - padding.right;
				if (vcx < 0){
					vcx = 0;
				}
				let vcy = view.parent.size.cy - margin.top - padding.top - margin.bottom - padding.bottom;
				if (vcy < 0){
					vcy = 0;
				}
				view.size = new FCSize(vcx, vcy);
			} else if (view.dock == "left") {
				view.location = new FCPoint(margin.left + padding.left, margin.top + padding.top);
				let vcy = view.parent.size.cy - margin.top - padding.top - margin.bottom - padding.bottom;
				if (vcy < 0){
					vcy = 0;
				}
				view.size = new FCSize(view.size.cx, vcy);
			} else if (view.dock == "top") {
				view.location = new FCPoint(margin.left + padding.left, margin.top + padding.top);
				let vcx = view.parent.size.cx - margin.left - padding.left - margin.right - padding.right;
				if (vcx < 0){
					vcx = 0;
				}
				view.size = new FCSize(vcx, view.size.cy);
			} else if (view.dock == "right") {
				view.location = new FCPoint(view.parent.size.cx - view.size.cx - padding.right - margin.right, margin.top + padding.top);
				let vcy = view.parent.size.cy - margin.top - padding.top - margin.bottom - padding.bottom;
				if (vcy < 0){
					vcy = 0;
				}
				view.size = new FCSize(view.size.cx, vcy);
			} else if (view.dock == "bottom") {
				view.location = new FCPoint(margin.left + padding.left, view.parent.size.cy - view.size.cy - margin.bottom - padding.bottom);
				let vcx = view.parent.size.cx - margin.left - padding.left - margin.right - padding.right;
				if (vcx < 0){
					vcx = 0;
				}
				view.size = new FCSize(vcx, view.size.cy);
			}
			if (view.align == "center") {
				view.location = new FCPoint((view.parent.size.cx - view.size.cx) / 2, view.location.y);
			}else if(view.align == "right"){
				view.location = new FCPoint(view.parent.size.cx - view.size.cx - padding.right - margin.right, view.location.y);
			}
			if (view.verticalAlign == "middle") {
				view.location = new FCPoint(view.location.x, (view.parent.size.cy - view.size.cy) / 2);
			}else if(view.verticalAlign == 'bottom'){
				view.location = new FCPoint(view.location.x, view.parent.size.cy - view.size.cy - padding.bottom - margin.bottom);
			}
		} else if (!view.parent) {
			if (view.dock == "fill") {
				let paint = view.paint;
				view.size = new FCSize((paint.canvas.width / paint.ratio / paint.scaleFactorX), (paint.canvas.height / paint.ratio / paint.scaleFactorY));
            }
        }
		if (view.viewType == "split") {
			resetSplitLayoutDiv(view);
		} else if (view.viewType == "tabview") {
			updateTabLayout(view);
		} else if (view.viewType == "layout") {
			resetLayoutDiv(view);
		} else if (view.viewType == "calendar") {
			updateCalendar(view);
		} else if (view.viewType == "chart") {
			let chart = view;
			resetChartVisibleRecord(chart);
			checkChartLastVisibleIndex(chart);
			if(chart.onCalculateChartMaxMin){
				chart.onCalculateChartMaxMin(chart);
			}
			else if (chart.paint.onCalculateChartMaxMin) {
				chart.paint.onCalculateChartMaxMin(chart);
			} else {
				calculateChartMaxMin(chart);
			}
		}
		if (view.views) {
			updateViewDefault(view.views);
		}
	}
};

/*
* 视图尺寸改变
*/
let windowResize = function(rect, resizePoint, nowPoint, startTouchPoint){
	if (resizePoint == 0){
		rect.left = rect.left + nowPoint.x - startTouchPoint.x;
		rect.top = rect.top + nowPoint.y - startTouchPoint.y;
	}
	else if (resizePoint == 1){
		rect.left = rect.left + nowPoint.x - startTouchPoint.x;
		rect.bottom = rect.bottom + nowPoint.y - startTouchPoint.y;
	}
	else if (resizePoint == 2){
		rect.right = rect.right + nowPoint.x - startTouchPoint.x;
		rect.top = rect.top + nowPoint.y - startTouchPoint.y;
	}
	else if (resizePoint == 3){
		rect.right = rect.right + nowPoint.x - startTouchPoint.x;
		rect.bottom = rect.bottom + nowPoint.y - startTouchPoint.y;
	}
	else if (resizePoint == 4){
		rect.left = rect.left + nowPoint.x - startTouchPoint.x;
	}
	else if (resizePoint == 5){
		rect.top = rect.top + nowPoint.y - startTouchPoint.y;
	}
	else if (resizePoint == 6){
		rect.right = rect.right + nowPoint.x - startTouchPoint.x;
	}
	else if (resizePoint == 7){
		rect.bottom = rect.bottom + nowPoint.y - startTouchPoint.y;
	}
};

/*
* 获取调整尺寸的点
*/
let getResizeState = function(view, mp){
	let bWidth = 5;
	let width = view.size.cx, height = view.size.cy;
	if (mp.x >= 0 && mp.x <= bWidth * 2 && mp.y >= 0 && mp.y <= bWidth * 2){
		return 0;
	}else if (mp.x >= 0 && mp.x <= bWidth * 2 && mp.y >= height - bWidth * 2 && mp.y <= height){
		return 1;
	}else if (mp.x >= width - bWidth * 2 && mp.x <= width && mp.y >= 0 && mp.y <= bWidth * 2){
		return 2;
	}else if (mp.x >= width - bWidth * 2 && mp.x <= width && mp.y >= height - bWidth * 2 && mp.y <= height){
		return 3;
	}else if (mp.x >= 0 && mp.x <= bWidth && mp.y >= 0 && mp.y <= height){
		return 4;
	}else if (mp.x >= 0 && mp.x <= width && mp.y >= 0 && mp.y <= bWidth){
		return 5;
	}else if (mp.x >= width - bWidth && mp.x <= width && mp.y >= 0 && mp.y <= height){
		return 6;
	}else if (mp.x >= 0 && mp.x <= width && mp.y >= height - bWidth && mp.y <= height){
		return 7;
	}else{
		return -1;
	}
};

/*
* 添加鼠标按下的方法
* canvas:图层
* callBack:回调函数
*/
let addMouseDownEvent = function (canvas, paint, callBack) {
	canvas.onmousedown = function (evt) {
        if (!paint.isMobile) {
			let mp = getTouchPosition(evt, canvas, paint);
            paint.cancelClick = false;
            paint.touchDownPoint = mp;
			let lastFocusedView = paint.focusedView;
			paint.touchDownView = findView(mp, paint.views);
			let newClickTime = new Date().getTime();
			let clicks = 1;
			if(newClickTime - paint.lastClickTime < 250){
				paint.isDoubleClick = true;
				paint.lastClickTime = 0;
				clicks = 2;
			}else{
				paint.isDoubleClick = false;
				paint.lastClickTime = newClickTime;
			}	
			checkShowMenu(paint);
			if (paint.touchDownView) {
				paint.focusedView = paint.touchDownView;
				let cmp = new FCPoint(mp.x - clientX(paint.touchDownView), mp.y - clientY(paint.touchDownView));
				if (callBack) {
					if (evt.button == 2) {
						callBack(paint.touchDownView, cmp, 2, clicks, 0);
					} else {
						callBack(paint.touchDownView, cmp, 1, clicks, 0);
                    }
				}else if (paint.onMouseDown != null && paint.touchDownView.onMouseDown == null) {
                    if (evt.button == 2) {
                        paint.onMouseDown(paint.touchDownView, cmp, 2, clicks, 0);
                    }
                    else {
                        paint.onMouseDown(paint.touchDownView, cmp, 1, clicks, 0);
                    }
                } else {
					if (evt.button == 2) {
						onMouseDownDefault(paint.touchDownView, cmp, 2, clicks, 0);
					} else {
						onMouseDownDefault(paint.touchDownView, cmp, 1, clicks, 0);
					}
                }
				if(paint.touchDownView.allowResize){
					paint.touchDownView.resizePoint = getResizeState(paint.touchDownView, cmp);
					if(paint.touchDownView.resizePoint != -1){
						paint.touchDownView.startRect = new FCRect(paint.touchDownView.location.x, paint.touchDownView.location.y, paint.touchDownView.location.x + paint.touchDownView.size.cx,
							paint.touchDownView.location.y + paint.touchDownView.size.cy);
					}
				}
				if(paint.editMode == 1){
					if (paint.focusedView.viewType == "textbox"){
						showTextInput(paint.focusedView, lastFocusedView);
					}else{
						hideTextInput(paint.focusedView);
					}
				}
			}
			if(paint.editMode == 0){
				showOrHideInput(paint.views);
			}
        }
    };
};

/*
* 添加鼠标移动的方法
* canvas:图层
* callBack:回调函数
*/
let addMouseMoveEvent = function (canvas, paint, callBack) {
    canvas.onmousemove = function (evt) {
        if (evt.buttons == 0) {
			paint.touchDownView = null;
        }
		if (!paint.isMobile) {
			let mp = getTouchPosition(evt, canvas, paint);
			if (paint.touchDownView) {
				paint.touchMoveView = paint.touchDownView;
				let cmp = new FCPoint(mp.x - clientX(paint.touchDownView), mp.y - clientY(paint.touchDownView));
				if (callBack) {
					callBack(paint.touchDownView, cmp, 1, 1, 0);
				}else if (paint.onMouseMove != null && paint.touchDownView.onMouseMove == null) {
                    paint.onMouseMove(paint.touchDownView, cmp, 1, 1, 0);
                }else {
					onMouseMoveDefault(paint.touchDownView, cmp, 1, 1, 0);
				}
				if(paint.touchDownView.resizePoint != -1){
					let newBounds = new FCRect(paint.touchDownView.startRect.left, paint.touchDownView.startRect.top, paint.touchDownView.startRect.right, paint.touchDownView.startRect.bottom);
					windowResize(newBounds, paint.touchDownView.resizePoint, mp, paint.touchDownPoint);
					paint.touchDownView.location = new FCPoint(newBounds.left, newBounds.top);
					paint.touchDownView.size = new FCSize(newBounds.right - newBounds.left, newBounds.bottom - newBounds.top);
					if (paint.touchDownView.parent) {
						if (paint.touchDownView.parent.paint) {
							invalidateView(paint.touchDownView.parent);
						}
					} else {
						if (paint) {
							invalidate(paint);
						}
					}
				}
				else if (paint.touchDownView.allowDrag) {
					if (Math.abs(mp.x - paint.touchDownPoint.x) > 5 || Math.abs(mp.y - paint.touchDownPoint.y) > 5) {
						paint.dragBeginRect = new FCRect(paint.touchDownView.location.x, paint.touchDownView.location.y,
							paint.touchDownView.location.x + paint.touchDownView.size.cx,
							paint.touchDownView.location.y + paint.touchDownView.size.cy);
						paint.dragBeginPoint = new FCPoint(paint.touchDownPoint.x, paint.touchDownPoint.y);
						paint.draggingView = paint.touchDownView;
						paint.touchDownView = null;
					}
				}
            }
			else if (paint.draggingView != null) {
				let offsetX = mp.x - paint.dragBeginPoint.x;
				let offsetY = mp.y - paint.dragBeginPoint.y;
				let newBounds = new FCRect(paint.dragBeginRect.left + offsetX, paint.dragBeginRect.top + offsetY,
					paint.dragBeginRect.right + offsetX, paint.dragBeginRect.bottom + offsetY);
				paint.draggingView.location = new FCPoint(newBounds.left, newBounds.top);
				if (paint.draggingView.parent && paint.draggingView.parent.viewType == "split") {
					paint.draggingView.parent.splitPercent = -1;
					resetSplitLayoutDiv(paint.draggingView.parent);
					if (paint.onUpdateView) {
						paint.onUpdateView(paint.draggingView.parent.views);
					}
					else {
						updateViewDefault(paint.draggingView.parent.views);
					}
                }
				if (paint.draggingView.parent) {
					if (paint.draggingView.parent.paint) {
						invalidateView(paint.draggingView.parent);
                    }
                } else {
                    if (paint) {
                        invalidate(paint);
                    }
                }
            }
            else {
				let view = findView(mp, paint.views);
				let cmp = new FCPoint(mp.x - clientX(view), mp.y - clientY(view));
				if (view) {
					let oldMouseMoveView = paint.touchMoveView;
					paint.touchMoveView = view;
					if (oldMouseMoveView && oldMouseMoveView != view) {
						invalidateView(oldMouseMoveView);
					}
					if (oldMouseMoveView || oldMouseMoveView != view) {
						if (paint.canvas) {
							paint.canvas.style.cursor = view.cursor;
						}
					}
					if (callBack) {
						callBack(view, cmp, 0, 0, 0);
					} else if (paint.onMouseMove != null && view.onMouseMove == null) {
                        paint.onMouseMove(view, cmp, 0, 0, 0);
                    } else {
						onMouseMoveDefault(view, cmp, 0, 0, 0);
					}
				}
            }
        }
    };
};

/*
* 添加鼠标移动的方法
* canvas:图层
* callBack:回调函数
* enterCallBack:进入回调函数
* leaveCallBack:离开回调函数
*/
let addMouseMoveEvent2 = function (canvas, paint, callBack, enterCallBack, leaveCallBack) {
	canvas.onmousemove = function (evt) {
        if (evt.buttons == 0) {
			paint.touchDownView = null;
        }
		if (!paint.isMobile) {
			let mp = getTouchPosition(evt, canvas, paint);
			if (paint.touchDownView) {
				paint.touchMoveView = paint.touchDownView;
				let cmp = new FCPoint(mp.x - clientX(paint.touchDownView), mp.y - clientY(paint.touchDownView));
				if (callBack) {
					callBack(paint.touchDownView, cmp, 1, 1, 0);
				}else if (paint.onMouseMove != null && paint.touchDownView.onMouseMove == null) {
                    paint.onMouseMove(paint.touchDownView, cmp, 1, 1, 0);
                }else {
					onMouseMoveDefault(paint.touchDownView, cmp, 1, 1, 0);
				}
				if(paint.touchDownView.resizePoint != -1){
					let newBounds = new FCRect(paint.touchDownView.startRect.left, paint.touchDownView.startRect.top, paint.touchDownView.startRect.right, paint.touchDownView.startRect.bottom);
					windowResize(newBounds, paint.touchDownView.resizePoint, mp, paint.touchDownPoint);
					paint.touchDownView.location = new FCPoint(newBounds.left, newBounds.top);
					paint.touchDownView.size = new FCSize(newBounds.right - newBounds.left, newBounds.bottom - newBounds.top);
					if (paint.touchDownView.parent) {
						if (paint.touchDownView.parent.paint) {
							invalidateView(paint.touchDownView.parent);
						}
					} else {
						if (paint) {
							invalidate(paint);
						}
					}
				}
				else if (paint.touchDownView.allowDrag) {
					if (Math.abs(mp.x - paint.touchDownPoint.x) > 5 || Math.abs(mp.y - paint.touchDownPoint.y) > 5) {
						paint.dragBeginRect = new FCRect(paint.touchDownView.location.x, paint.touchDownView.location.y,
							paint.touchDownView.location.x + paint.touchDownView.size.cx,
							paint.touchDownView.location.y + paint.touchDownView.size.cy);
						paint.dragBeginPoint = new FCPoint(paint.touchDownPoint.x, paint.touchDownPoint.y);
						paint.draggingView = paint.touchDownView;
						paint.touchDownView = null;
					}
				}
            }
            else if (paint.draggingView != null) {
				let offsetX = mp.x - paint.dragBeginPoint.x;
				let offsetY = mp.y - paint.dragBeginPoint.y;
				let newBounds = new FCRect(paint.dragBeginRect.left + offsetX, paint.dragBeginRect.top + offsetY,
					paint.dragBeginRect.right + offsetX, paint.dragBeginRect.bottom + offsetY);
				paint.draggingView.location = new FCPoint(newBounds.left, newBounds.top);
				if (paint.draggingView.parent && paint.draggingView.parent.viewType == "split") {
					paint.draggingView.parent.splitPercent = -1;
					resetSplitLayoutDiv(paint.draggingView.parent);
					if (paint.onUpdateView) {
						paint.onUpdateView(paint.draggingView.parent.views);
					} else {
						updateViewDefault(paint.draggingView.parent.views);
					}
                }
				if (paint.draggingView.parent) {
					if (paint.draggingView.parent.paint) {
						invalidateView(paint.draggingView.parent);
                    }
                } else {
                    if (paint) {
                        invalidate(paint);
                    }
                }
            }
            else {
                let view = findView(mp, paint.views);
                let cmp = new FCPoint(mp.x - clientX(view), mp.y - clientY(view));
                if (view) {
					let oldMouseMoveView = paint.touchMoveView;
					paint.touchMoveView = view;
                    if (oldMouseMoveView && oldMouseMoveView != view) {
						if(oldMouseMoveView.onMouseLeave){
							oldMouseMoveView.onMouseLeave(oldMouseMoveView, cmp, 0, 0, 0);
						}else if (leaveCallBack) {
							leaveCallBack(oldMouseMoveView, cmp, 0, 0, 0);
                        }else if (paint.onMouseLeave != null) {
                            paint.onMouseLeave(oldMouseMoveView, cmp, 0, 0, 0);
                        }
						invalidateView(oldMouseMoveView);
                    }
                    if (oldMouseMoveView || oldMouseMoveView != view) {
						if(view.onMouseEnter){
							view.onMouseEnter(view, cmp, 0, 0, 0);
						}
                        else if (enterCallBack) {
                            enterCallBack(view, cmp, 0, 0, 0);
						}else if (paint.onMouseEnter != null) {
                            paint.onMouseEnter(view, cmp, 0, 0, 0);
                        }
						if (paint.canvas) {
							paint.canvas.style.cursor = view.cursor;
						}
                    }
					if (callBack) {
						callBack(view, cmp, 0, 0, 0);
					}else if (paint.onMouseMove != null && view.onMouseMove == null) {
                        paint.onMouseMove(view, cmp, 0, 0, 0);
                    }else {
						onMouseMoveDefault(view, cmp, 0, 0, 0);
                    }
                }
            }
        }
    };
};

/*
* 添加鼠标滚动的方法
* canvas:图层
* callBack:回调函数
*/
let addMouseWheelEvent = function (canvas, paint, callBack) {
	canvas.addEventListener("DOMMouseScroll", function (evt) {
		if (!paint.isMobile) {
			let mp = getTouchPosition(evt, canvas, paint);
            let view = findView(mp, paint.views);
            if (view) {
                let cmp = new FCPoint(mp.x - clientX(view), mp.y - clientY(view));
                let delta = evt.detail;
				if (callBack) {
					callBack(view, cmp, 0, 0, delta);
				}else if (paint.onMouseWheel != null && view.onMouseWheel == null) {
                    paint.onMouseWheel(view, cmp, 0, 0, delta);
                }else {
					onMouseWheelDefault(view, cmp, 0, 0, delta);
                }
            }
            if (view && view.allowDragScroll) {
                evt.preventDefault && evt.preventDefault();
                evt.returnValue = false;
                evt.stopPropagation && evt.stopPropagation();
            }
        }
        return false;
    }, false);
    //图层鼠标移动事件
    canvas.onmousewheel = function (evt) {
		if (!paint.isMobile) {
			let mp = getTouchPosition(evt, canvas, paint);
            let view = findView(mp, paint.views);
            if (view) {
                let cmp = new FCPoint(mp.x - clientX(view), mp.y - clientY(view));
                let delta = evt.deltaY;
				if (callBack) {
					callBack(view, cmp, 0, 0, delta);
				} else if (paint.onMouseWheel != null && view.onMouseWheel == null) {
                    paint.onMouseWheel(view, cmp, 0, 0, delta);
                }else {
					onMouseWheelDefault(view, cmp, 0, 0, delta);
                }
            }
            if (view && view.allowDragScroll) {
                evt.preventDefault && evt.preventDefault();
                evt.returnValue = false;
                evt.stopPropagation && evt.stopPropagation();
            }
        }
        return false;
    };
};

/*
* 添加鼠标抬起的方法
* canvas:图层
* callBack:回调函数
*/
let addMouseUpEvent = function (canvas, paint, callBack, clickCallBack) {
	canvas.onmouseup = function (evt) {
		if (!paint.isMobile) {
			let mp = getTouchPosition(evt, canvas, paint);
			if (paint.touchDownView) {
				let cmp = new FCPoint(mp.x - clientX(paint.touchDownView), mp.y - clientY(paint.touchDownView));
                let view = findView(mp, paint.views);
				let clicks = 1;
				if(paint.isDoubleClick){
					clicks = 2;
				}
				if (view != null && view == paint.touchDownView) {
                    if (!paint.cancelClick) {
						if (clickCallBack) {
							clickCallBack(paint.touchDownView, true, cmp, false, cmp, clicks);
						} else if (paint.onClick != null && paint.touchDownView.onClick == null) {
                            paint.onClick(paint.touchDownView, true, cmp, false, cmp, clicks);
                        }else {
							onClickDefault(paint.touchDownView, true, cmp, false, cmp, clicks);
                        }
                    }
                }
				if (paint.touchDownView) {
					let touchDownView = paint.touchDownView;
					paint.touchDownView.resizePoint = -1;
					paint.touchDownView = null;
					if (callBack) {
						callBack(touchDownView, cmp, 1, clicks, 0);
					} else if (paint.onMouseUp != null && touchDownView.onMouseUp == null) {
                        paint.onMouseUp(touchDownView, cmp, 1, clicks, 0);
                    }else {
						onMouseUpDefault(touchDownView, cmp, 1, clicks, 0);
                    }
                }
            }
			paint.draggingView = null;
        }
    };
};

/*
* 添加触摸开始的方法
* canvas:图层
* callBack:回调函数
*/
let addTouchBeginEvent = function (canvas, paint, callBack) {
    /*
    * 触摸开始方法
    * evt: 事件参数
    */
    canvas.ontouchstart = function (evt) {
		if (paint.isMobile) {
			paint.cancelClick = false;
			let mp = getTouchPosition(evt.touches[0], canvas, paint);
            paint.touchDownPoint = new FCPoint(mp.x, mp.y);
			let lastFocusedView = paint.focusedView;
			paint.touchDownView = findView(mp, paint.views);
			let newClickTime = new Date().getTime();
			let clicks = 1;
			if(evt.touches.length == 1 && newClickTime - paint.lastClickTime < 250){
				paint.isDoubleClick = true;
				paint.lastClickTime = 0;
				clicks = 2;
			}else{
				paint.isDoubleClick = false;
				paint.lastClickTime = newClickTime;
			}	
			checkShowMenu(paint);
			if (paint.touchDownView) {
				paint.focusedView = paint.touchDownView;
				paint.firstTouch = false;
				paint.secondTouch = false;
				paint.touchFirstPoint = new FCPoint();
				paint.touchSecondPoint = new FCPoint();
				let clx = clientX(paint.touchDownView);
				let cly = clientY(paint.touchDownView);
                if (evt.touches.length >= 1) {
					paint.firstTouch = true;
					paint.touchFirstPoint = getTouchPosition(evt.touches[0], canvas, paint);
					paint.touchFirstPoint.x -= clx;
					paint.touchFirstPoint.y -= cly;
                }
                if (evt.touches.length >= 2) {
					paint.secondTouch = true;
					paint.touchSecondPoint = getTouchPosition(evt.touches[1], canvas, paint);
					paint.touchSecondPoint.x -= clx;
					paint.touchSecondPoint.y -= cly;
                }
				if (callBack) {
					callBack(paint.touchDownView, paint.firstTouch, paint.touchFirstPoint, paint.secondTouch, paint.touchSecondPoint);
				}else if (paint.onTouchBegin != null && paint.touchDownView.onTouchBegin == null) {
                    paint.onTouchBegin(paint.touchDownView, paint.firstTouch, paint.touchFirstPoint, paint.secondTouch, paint.touchSecondPoint);
                } else {
					onTouchBeginDefault(paint.touchDownView, paint.firstTouch, paint.touchFirstPoint, paint.secondTouch, paint.touchSecondPoint);
                }
				if(paint.touchDownView.allowResize){
					paint.touchDownView.resizePoint = getResizeState(paint.touchDownView, paint.touchFirstPoint);
					if(paint.touchDownView.resizePoint != -1){
						paint.touchDownView.startRect = new FCRect(paint.touchDownView.location.x, paint.touchDownView.location.y, paint.touchDownView.location.x + paint.touchDownView.size.cx,
							paint.touchDownView.location.y + paint.touchDownView.size.cy);
					}
				}
				if(paint.editMode == 1){
					if (paint.focusedView.viewType == "textbox"){
						showTextInput(paint.focusedView, lastFocusedView);
					}else{
						hideTextInput(paint.focusedView);
					}
				}
				if(paint.editMode == 0){
					showOrHideInput(paint.views);
				}
            }
        }
    };
};

/*
* 添加触摸移动的方法
* canvas:图层
* callBack:回调函数
*/
let addTouchMoveEvent = function (canvas, paint, callBack) {
    canvas.ontouchmove = function (evt) {
		if (paint.isMobile) {
			if (paint.touchDownView) {
				paint.firstTouch = false;
				paint.secondTouch = false;
				paint.touchFirstPoint = new FCPoint();
				paint.touchSecondPoint = new FCPoint();
				let mp = getTouchPosition(evt.touches[0], canvas, paint);
				let pParent = findPreviewsEventParent(paint.focusedView);
				if (pParent && pParent.allowDragScroll && (pParent.viewType == "div" || pParent.viewType == "layout" || pParent.viewType == "menu")) {
					paint.touchMoveView = pParent;
					paint.focusedView = pParent;
					paint.touchDownView = pParent;
					let clx = clientX(paint.touchDownView);
					let cly = clientY(paint.touchDownView);
					if (evt.touches.length >= 1) {
						paint.firstTouch = true;
						paint.touchFirstPoint = getTouchPosition(evt.touches[0], canvas, paint);
						paint.touchFirstPoint.x -= clx;
						paint.touchFirstPoint.y -= cly;
					}
					if (evt.touches.length >= 2) {
						paint.secondTouch = true;
						paint.touchSecondPoint = getTouchPosition(evt.touches[1], canvas, paint);
						paint.touchSecondPoint.x -= clx;
						paint.touchSecondPoint.y -= cly;
					}
					touchDownDiv(pParent, paint.firstTouch, paint.touchFirstPoint, paint.secondTouch, paint.touchSecondPoint, 1);
					touchMoveDiv(pParent, paint.firstTouch, paint.touchFirstPoint, paint.secondTouch, paint.touchSecondPoint);
					invalidateView(pParent);
				} else {
					let clx = clientX(paint.touchDownView);
					let cly = clientY(paint.touchDownView);
					if (evt.touches.length >= 1) {
						paint.firstTouch = true;
						paint.touchFirstPoint = getTouchPosition(evt.touches[0], canvas, paint);
						paint.touchFirstPoint.x -= clx;
						paint.touchFirstPoint.y -= cly;
					}
					if (evt.touches.length >= 2) {
						paint.secondTouch = true;
						paint.touchSecondPoint = getTouchPosition(evt.touches[1], canvas, paint);
						paint.touchSecondPoint.x -= clx;
						paint.touchSecondPoint.y -= cly;
					}
					if (callBack) {
						callBack(paint.touchDownView, paint.firstTouch, paint.touchFirstPoint, paint.secondTouch, paint.touchSecondPoint);
					} else if (paint.onTouchMove != null && paint.touchDownView.onTouchMove == null) {
                        paint.onTouchMove(paint.touchDownView, paint.firstTouch, paint.touchFirstPoint, paint.secondTouch, paint.touchSecondPoint);
                    }else {
						onTouchMoveDefault(paint.touchDownView, paint.firstTouch, paint.touchFirstPoint, paint.secondTouch, paint.touchSecondPoint);
					}
					if(paint.touchDownView.resizePoint != -1){
						let newBounds = new FCRect(paint.touchDownView.startRect.left, paint.touchDownView.startRect.top, paint.touchDownView.startRect.right, paint.touchDownView.startRect.bottom);
						windowResize(newBounds, paint.touchDownView.resizePoint, mp, paint.touchDownPoint);
						paint.touchDownView.location = new FCPoint(newBounds.left, newBounds.top);
						paint.touchDownView.size = new FCSize(newBounds.right - newBounds.left, newBounds.bottom - newBounds.top);
						if (paint.touchDownView.parent) {
							if (paint.touchDownView.parent.paint) {
								invalidateView(paint.touchDownView.parent);
							}
						} else {
							if (paint) {
								invalidate(paint);
							}
						}
					}
					else if (paint.touchDownView.allowDrag) {
						if (Math.abs(mp.x - paint.touchDownPoint.x) > 5 || Math.abs(mp.y - paint.touchDownPoint.y) > 5) {
							paint.dragBeginRect = new FCRect(paint.touchDownView.location.x, paint.touchDownView.location.y,
								paint.touchDownView.location.x + paint.touchDownView.size.cx,
								paint.touchDownView.location.y + paint.touchDownView.size.cy);
							paint.dragBeginPoint = new FCPoint(paint.touchDownPoint.x, paint.touchDownPoint.y);
							paint.draggingView = paint.touchDownView;
							paint.touchDownView = null;
						}
					}else{
						paint.touchDownPoint = mp;
					}
				}
				if (paint.touchDownView && paint.touchDownView.allowDragScroll) {
                    evt.preventDefault && evt.preventDefault();
                    evt.returnValue = false;
                    evt.stopPropagation && evt.stopPropagation();
                }
            }
			else if (paint.draggingView != null) {
				let mp = getTouchPosition(evt.touches[0], canvas, paint);
				paint.touchDownPoint = mp;
				let offsetX = mp.x - paint.dragBeginPoint.x;
				let offsetY = mp.y - paint.dragBeginPoint.y;
				let newBounds = new FCRect(paint.dragBeginRect.left + offsetX, paint.dragBeginRect.top + offsetY,
					paint.dragBeginRect.right + offsetX, paint.dragBeginRect.bottom + offsetY);
				paint.draggingView.location = new FCPoint(newBounds.left, newBounds.top);
				if (paint.draggingView.parent && paint.draggingView.parent.viewType == "split") {
					resetSplitLayoutDiv(paint.draggingView.parent);
					if (paint.onUpdateView) {
						paint.onUpdateView(paint.draggingView.parent.views);
					} else {
						updateViewDefault(paint.draggingView.parent.views);
					}
				}
				if (paint.draggingView.parent) {
					if (paint.draggingView.parent.paint) {
						invalidateView(paint.draggingView.parent);
                    }
                } else {
                    if (paint) {
                        invalidate(paint);
                    }
                }
				if (paint.draggingView && paint.draggingView.allowDragScroll) {
                    evt.preventDefault && evt.preventDefault();
                    evt.returnValue = false;
                    evt.stopPropagation && evt.stopPropagation();
                }
            }
        }
        return false;
    };
};

/*
* 添加触摸结束的方法
* canvas:图层
* callBack:回调函数
*/
let addTouchEndEvent = function (canvas, paint, callBack, clickCallBack) {
    canvas.ontouchend = function (evt) {
		if (paint.isMobile) {
			if (paint.touchDownView) {
				let touchDownView = paint.touchDownView;
                let mp = paint.touchDownPoint;
                let view = findView(mp, paint.views);
				let clicks = 1;
				if(paint.isDoubleClick){
					clicks = 2;
				}
				if (view != null && view == paint.touchDownView) {
					let cmp = new FCPoint(mp.x - clientX(paint.touchDownView), mp.y - clientY(paint.touchDownView));
					if (clickCallBack) {
						clickCallBack(paint.touchDownView, true, cmp, false, cmp, clicks);
					} else if (paint.onClick != null && paint.touchDownView.onClick == null) {
                        paint.onClick(paint.touchDownView, true, cmp, false, cmp, clicks);
                    }else {
						onClickDefault(paint.touchDownView, true, cmp, false, cmp, clicks);
                    }
                }
				paint.touchDownView.resizePoint = -1;
				paint.touchDownView = null;
				if (callBack) {
					callBack(touchDownView, paint.firstTouch, paint.touchFirstPoint, paint.secondTouch, paint.touchSecondPoint);
				} else if (paint.onTouchEnd != null && touchDownView.onTouchEnd == null) {
                    paint.onTouchEnd(touchDownView, paint.firstTouch, paint.touchFirstPoint, paint.secondTouch, paint.touchSecondPoint);
                }else {
					onTouchEndDefault(touchDownView, paint.firstTouch, paint.touchFirstPoint, paint.secondTouch, paint.touchSecondPoint);
				}
            }
			paint.draggingView = null;
        }
    };
};

/*
* 添加键盘按下事件
* canvas:图层
* callBack:回调函数
*/
let addKeyDownEvent = function(canvas, paint, callBack){
	document.onkeydown = function (evt) {
		if(document.activeElement.contains(canvas)){
			if(paint.focusedView){
				if(paint.focusedView.onKeyDown){
					onKeyDownDefault(paint.focusedView, evt.key);
				}else{
					if(callBack){
						callBack(paint.focusedView, evt.key);
					}else if (paint.onKeyDown != null) {
                        paint.onKeyDown(paint.focusedView, evt.key);
                    }else{
						onKeyDownDefault(paint.focusedView, evt.key);
					}
				}
			}
		}
	};
};

/*
* 添加键盘抬起事件
* canvas:图层
* callBack:回调函数
*/
let addKeyUpEvent = function(canvas, paint, callBack){
	document.onkeyup = function (evt) {
		if(document.activeElement.contains(canvas)){
			if(paint.focusedView){
				if(paint.focusedView.onKeyUp){
					onKeyUpDefault(paint.focusedView, evt.key);
				}else{
					if(callBack){
						callBack(paint.focusedView, evt.key);
					}else if (paint.onKeyUp != null) {
                        paint.onKeyUp(paint.focusedView, evt.key);
                    }else{
						onKeyUpDefault(paint.focusedView, evt.key);
					}
				}
			}
		}
	};
};

/*
* 添加默认的事件
* canvas:图层
* paint:绘图对象
*/
let addDefaultEvent = function(canvas, paint){
	addMouseDownEvent(canvas, paint, null);
	addMouseMoveEvent2(canvas, paint, null, null, null);
	addMouseWheelEvent(canvas, paint, null);
	addMouseUpEvent(canvas, paint, null, null);
	addTouchBeginEvent(canvas, paint, null);
	addTouchMoveEvent(canvas, paint, null);
	addTouchEndEvent(canvas, paint, null, null);
	addKeyDownEvent(canvas, paint, null);
	addKeyUpEvent(canvas, paint, null);
};

/*
* 加载图形界面
* paint:绘图对象
* xml:Xml内容
*/
let renderFaceCat = function (paint, xml) {
	if(paint.editMode == 1 && !paint.container){
		if(!paint.textBox){
			let input = document.createElement("input");
			paint.textBox = input;
			input.type = "text";
			input.style.position = "absolute";
			input.style.boxSizing = "border-box";
			input.style.display = "none";
			document.body.appendChild(input);
		}
	}
	let xmlDoc = new DOMParser().parseFromString(xml, "text/xml");
	let rootNode = xmlDoc.getElementsByTagName('body')[0];
	readXmlNodeDefault(paint, rootNode, null);
	if (paint.onUpdateView) {
		paint.onUpdateView(paint.views);
	} else {
		updateViewDefault(paint.views);
	}
	invalidate(paint);
};

/*
* 加载图形界面到父视图
* parent:父视图
* xml:Xml内容
*/
let renderFaceCatInParent = function (parent, xml) {
	let paint = parent.paint;
	let xmlDoc = new DOMParser().parseFromString(xml, "text/xml");
	let rootNode = xmlDoc.getElementsByTagName('body')[0];
	readXmlNodeDefault(paint, rootNode, parent);
	if (paint.onUpdateView) {
		paint.onUpdateView(paint.views);
	} else {
		updateViewDefault(paint.views);
	}
	invalidate(paint);
};

/*
* 重绘复选按钮
* checkBox:视图
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawCheckBox = function (checkBox, paint, clipRect) {
	let width = checkBox.size.cx, height = checkBox.size.cy;
	if (checkBox.textColor && checkBox.textColor != "none") {
		let eRight = checkBox.buttonSize.cx + 10;
		let eRect = new FCRect(1, (height - checkBox.buttonSize.cy) / 2, checkBox.buttonSize.cx + 1, (height + checkBox.buttonSize.cy) / 2);
		if (checkBox.text.length == 0) {
			eRect = new FCRect((width - checkBox.buttonSize.cx) / 2, (height - checkBox.buttonSize.cy) / 2, (width + checkBox.buttonSize.cx) / 2, (height + checkBox.buttonSize.cy) / 2);
		}
		paint.drawRect(checkBox.textColor, 1, 0, eRect.left, eRect.top, eRect.right, eRect.bottom);
		if (checkBox.checked) {
			eRect.left += 2;
			eRect.top += 2;
			eRect.right -= 2;
			eRect.bottom -= 2;
			paint.beginPath();
			paint.addLine(eRect.left, eRect.top + 8, eRect.left + 6, eRect.bottom);
			paint.addLine(eRect.left + 6, eRect.bottom, eRect.right - 1, eRect.top);
			paint.drawPath(checkBox.textColor, 1, 0);
			paint.closePath();
		}
		if (checkBox.text.length > 0) {
			let tSize = paint.textSize(checkBox.text, checkBox.font);
			paint.drawText(checkBox.text, checkBox.textColor, checkBox.font, eRight, height / 2 - tSize.cy / 2);
		}
	}
};
	
/*
* 重绘单选按钮
* radioButton:视图
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawRadioButton = function (radioButton, paint, clipRect) {
	let width = radioButton.size.cx, height = radioButton.size.cy;
	if (radioButton.textColor && radioButton.textColor != "none") {
		let eRight = radioButton.buttonSize.cx + 10;
		let eRect = new FCRect(1, (height - radioButton.buttonSize.cy) / 2, radioButton.buttonSize.cx + 1, (height + radioButton.buttonSize.cy) / 2);
		paint.drawEllipse(radioButton.textColor, 1, 0, eRect.left, eRect.top, eRect.right, eRect.bottom);
		if (radioButton.checked) {
			eRect.left += 2;
			eRect.top += 2;
			eRect.right -= 2;
			eRect.bottom -= 2;
			paint.fillEllipse(radioButton.textColor, eRect.left, eRect.top, eRect.right, eRect.bottom);
		}
		let tSize = paint.textSize(radioButton.text, radioButton.font);
		paint.drawText(radioButton.text, radioButton.textColor, radioButton.font, eRight, height / 2 - tSize.cy / 2);
	}
};

/*
* 点击复选按钮
* checkBox:视图
* mp:坐标
*/
let clickCheckBox = function (checkBox, mp) {
	checkBox.checked = !checkBox.checked;
};

/*
* 点击单选按钮
* radioButton:视图
* mp: 坐标
*/
let clickRadioButton = function (radioButton, mp) {
	let hasOther = false;
	if (radioButton.parent && radioButton.parent.views) {
		for (let i = 0; i < radioButton.parent.views.length; i++) {
			let rView = radioButton.parent.views[i];
			if (rView != radioButton &&
				rView.groupName == radioButton.groupName) {
				rView.checked = false;
			}
		}
	}
	radioButton.checked = true;
};

/*
* 重绘按钮
* button:视图
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawButton = function (button, paint, clipRect) {
	if (button.viewType != "tabbutton" && button == paint.touchDownView) {
		if (button.pushedColor && button.pushedColor != "none") {
			paint.fillRoundRect(button.pushedColor, 0, 0, button.size.cx, button.size.cy, button.cornerRadius);
		} else {
			if (button.backColor && button.backColor != "none") {
				paint.fillRoundRect(button.backColor, 0, 0, button.size.cx, button.size.cy, button.cornerRadius);
			}
		}
	} else if (button.viewType != "tabbutton" && button == paint.touchMoveView) {
		if (button.hoveredColor && button.hoveredColor != "none") {
			paint.fillRoundRect(button.hoveredColor, 0, 0, button.size.cx, button.size.cy, button.cornerRadius);
		} else {
			if (button.backColor && button.backColor != "none") {
				paint.fillRoundRect(button.backColor, 0, 0, button.size.cx, button.size.cy, button.cornerRadius);
			}
		}
	}
	else if (button.backColor && button.backColor != "none") {
		let selected = false;
		if(button.viewType == "tabbutton"){
			let tabView = button.parent;
			for(let i = 0; i < tabView.tabPages.length; i++){
				if(tabView.tabPages[i].visible && tabView.tabPages[i].headerButton == button){
					selected = true;
					break;
				}
			}
		}
		if(selected && button.selectedBackColor && button.selectedBackColor != "none"){
			paint.fillRoundRect(button.selectedBackColor, 0, 0, button.size.cx, button.size.cy, button.cornerRadius);
		}else{
			paint.fillRoundRect(button.backColor, 0, 0, button.size.cx, button.size.cy, button.cornerRadius);
		}
	}
	if (button.backImage && button.backImage.length > 0) {
		if (!button.image) {
			button.image = new Image();
			button.image.onload = function () { invalidateView(button); };
			button.image.src = button.backImage;
		} else {
			paint.drawImage(button.image, 0, 0, button.size.cx, button.size.cy);
		}
	}
	if (button.textColor && button.textColor != "none" && button.text) {
		let tSize = paint.textSize(button.text, button.font);
		paint.drawText(button.text, button.textColor, button.font, (button.size.cx - tSize.cx) / 2, button.size.cy / 2 - tSize.cy / 2);
	}
	if (button.borderColor && button.borderColor != "none") {
		paint.drawRoundRect(button.borderColor, button.borderWidth, 0, 0, 0, button.size.cx, button.size.cy, button.cornerRadius);
	}
};

/*
* 获取月的日数
* year:年
* month:月
*/
let getDaysInMonth = function (year, month) {
	const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if (month < 1 || month > 12) { return 0; }
	if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {return 29;}
	return daysInMonth[month - 1];
};

/*
* 根据字符获取月份
* month:月
*/
let getMonthStr = function (month) {
	const monthNames = { 1: "一月", 2: "二月", 3: "三月", 4: "四月", 5: "五月", 6: "六月",
		7: "七月", 8: "八月", 9: "九月", 10: "十月", 11: "十一月", 12: "十二月"};
	return monthNames[month] || "";
};

/*
* 获取年
* years:年的集合
* year:年
*/
let getYear = function (years, year) {
	let cy = null;
	if (!years.has(year)) {
		cy = new CYear();
		cy.year = year;
		years.set(year, cy);
		for (let i = 1; i <= 12; i++) {
			let cMonth = new CMonth();
			cMonth.year = year;
			cMonth.month = i;
			cy.months.set(i, cMonth);
			let daysInMonth = getDaysInMonth(year, i);
			for (let j = 1; j <= daysInMonth; j++) {
				let cDay = new CDay();
				cDay.year = year;
				cDay.month = i;
				cDay.day = j;
				cMonth.days.set(j, cDay);
			}
		}
	}
	else {
		cy = years.get(year);
	}
	return cy;
};

/*
* 显示隐藏日期层
* dayDiv:日期层
* visible:是否可见
*/
let showOrHideDayDiv = function (dayDiv, visible) {
	let dayButtonSize = dayDiv.dayButtons.length;
	for (let i = 0; i < dayButtonSize; i++) {
		let dayButton = dayDiv.dayButtons[i];
		dayButton.visible = visible;
	}
};

/*
* 显示隐藏月层
* monthDiv:月层
* visible:是否可见
*/
let showOrHideMonthDiv = function (monthDiv, visible) {
	let monthButtonSize = monthDiv.monthButtons.length;
	for (let i = 0; i < monthButtonSize; i++) {
		let monthButton = monthDiv.monthButtons[i];
		monthButton.visible = visible;
	}
};
	
/*
* 显示隐藏年层
* yearButtons:年层
* visible:是否可见
*/
let showOrHideYearDiv = function (yearDiv, visible) {
	let yearButtonSize = yearDiv.yearButtons.length;
	for (let i = 0; i < yearButtonSize; i++) {
		let yearButton = yearDiv.yearButtons[i];
		yearButton.visible = visible;
	}
};

/*
* 初始化日历
* calendar:日历
*/
let initCalendar = function (calendar) {
	calendar.dayDiv.calendar = calendar;
	calendar.monthDiv.calendar = calendar;
	calendar.yearDiv.calendar = calendar;
	for (let i = 0; i < 42; i++) {
		let dayButton = new DayButton();
		dayButton.calendar = calendar;
		calendar.dayDiv.dayButtons.push(dayButton);
		let dayFCButtonm = new DayButton();
		dayFCButtonm.calendar = calendar;
		dayFCButtonm.visible = false;
		calendar.dayDiv.dayButtons_am.push(dayFCButtonm);
	}
	for (let i = 0; i < 12; i++) {
		let monthButton = new MonthButton();
		monthButton.calendar = calendar;
		monthButton.month = (i + 1);
		calendar.monthDiv.monthButtons.push(monthButton);
		let monthButtonAm = new MonthButton();
		monthButtonAm.calendar = calendar;
		monthButtonAm.visible = false;
		monthButtonAm.month = (i + 1);
		calendar.monthDiv.monthButtons_am.push(monthButtonAm);
	}

	for (let i = 0; i < 12; i++) {
		let yearButton = new YearButton();
		yearButton.calendar = calendar;
		calendar.yearDiv.yearButtons.push(yearButton);
		let yearButtonAm = new YearButton();
		yearButtonAm.calendar = calendar;
		yearButtonAm.visible = false;
		calendar.yearDiv.yearButtons_am.push(yearButtonAm);
	}
	calendar.headDiv.calendar = calendar;
	calendar.timeDiv.calendar = calendar;
};

/*
* 获取星期
* y:年
* m:月
* d:日
*/
let dayOfWeek = function (y, m, d) {
	if (m == 1 || m == 2) {
		m += 12;
		y--;
	}
	return parseInt((parseInt((d + 2 * m + 3 * (m + 1) / 5) + y + parseInt(y / 4) - parseInt(y / 100) + parseInt(y / 400)) + 1) % 7);
};

/*
* 获取当月
* calendar:日历
*/
let getMonth = function (calendar) {
	return getYear(calendar.years, calendar.selectedDay.year).months.get(calendar.selectedDay.month);
};

/*
* 获取下个月
* calendar:日历
* year:年
* month:月
*/
let getNextMonth = function (calendar, year, month) {
	let nextMonth = month + 1;
	let nextYear = year;
	if (nextMonth == 13) {
		nextMonth = 1;
		nextYear += 1;
	}
	return getYear(calendar.years, nextYear).months.get(nextMonth);
};

/*
* 获取上个月
* calendar:日历
* year:年
* month:月
*/
let getLastMonth = function (calendar, year, month) {
	let lastMonth = month - 1;
	let lastYear = year;
	if (lastMonth == 0) {
		lastMonth = 12;
		lastYear -= 1;
	}
	return getYear(calendar.years, lastYear).months.get(lastMonth);
};

/*
* 重置日期层布局
* dayDiv:日期层
* state:状态
*/
let resetDayDiv = function (dayDiv, state) {
	let calendar = dayDiv.calendar;
	let thisMonth = getMonth(calendar);
	let lastMonth = getLastMonth(calendar, thisMonth.year, thisMonth.month);
	let nextMonth = getNextMonth(calendar, thisMonth.year, thisMonth.month);
	let left = 0;
	let headHeight = calendar.headDiv.bounds.bottom;
	let top = headHeight;
	let width = calendar.size.cx;
	let height = calendar.size.cy;
	height -= calendar.timeDiv.bounds.bottom - calendar.timeDiv.bounds.top;
	let dayButtonHeight = height - headHeight;
	if (dayButtonHeight < 1) {
		dayButtonHeight = 1;
	}
	let toY = 0;
	if (dayDiv.aDirection == 1) {
		toY = dayButtonHeight * dayDiv.aTick / dayDiv.aTotalTick;
		if (state == 1) {
			thisMonth = nextMonth;
			let month = thisMonth.month;
			lastMonth = getLastMonth(calendar, thisMonth.year, month);
			nextMonth = getNextMonth(calendar, thisMonth.year, month);
		}
	}
	else if (dayDiv.aDirection == 2) {
		toY = -dayButtonHeight * dayDiv.aTick / dayDiv.aTotalTick;
		if (state == 1) {
			thisMonth = lastMonth;
			let month = thisMonth.month;
			lastMonth = getLastMonth(calendar, thisMonth.year, month);
			nextMonth = getNextMonth(calendar, thisMonth.year, month);
		}
	}
	let buttonSize = 0;
	if (state == 0) {
		buttonSize = dayDiv.dayButtons.length;
	}
	else if (state == 1) {
		buttonSize = dayDiv.dayButtons_am.length;
	}
	let dheight = dayButtonHeight / 6;
	let days = thisMonth.days;
	let firstDay = days.get(1);
	let startDayOfWeek = dayOfWeek(firstDay.year, firstDay.month, firstDay.day);
	for (let i = 0; i < buttonSize; i++) {
		let dayButton = null;
		if (state == 0) {
			dayButton = dayDiv.dayButtons[i];
			buttonSize = dayDiv.dayButtons.length;
		}
		else if (state == 1) {
			dayButton = dayDiv.dayButtons_am[i];
			buttonSize = dayDiv.dayButtons_am.length;
		}
		if (i == 35) {
			dheight = height - top;
		}
		let vOffset = 0;
		if (state == 1) {
			if (dayDiv.aTick > 0) {
				dayButton.visible = true;
				if (dayDiv.aDirection == 1) {
					vOffset = toY - dayButtonHeight;
				}
				else if (dayDiv.aDirection == 2) {
					vOffset = toY + dayButtonHeight;

				}
			}
			else {
				dayButton.visible = false;
				continue;
			}
		}
		else {
			vOffset = toY;
		}
		if ((i + 1) % 7 == 0) {
			let dp = new FCPoint(left, top + vOffset);
			let ds = new FCSize(width - left, dheight);
			if(!calendar.showWeekend){
				ds.cx = 0;
			}
			let bounds = new FCRect(dp.x, dp.y, dp.x + ds.cx, dp.y + ds.cy);
			dayButton.bounds = bounds;
			left = 0;
			if (i != 0 && i != buttonSize - 1) {
				top += dheight;
			}
		}
		else {
			let dp = new FCPoint(left, top + vOffset);
			let ds = new FCSize(width / 7 + ((i + 1) % 7) % 2, dheight);
			if(!calendar.showWeekend){
				if((i + 1) % 7 == 1){
					ds.cx = 0;
				}else{
					ds.cx = width / 5 + ((i + 1) % 5) % 2;
				}
			}
			let bounds = new FCRect(dp.x, dp.y, dp.x + ds.cx, dp.y + ds.cy);
			dayButton.bounds = bounds;
			left += ds.cx;
		}
		let cDay = null;
		dayButton.inThisMonth = false;
		if (i >= startDayOfWeek && i <= startDayOfWeek + days.size - 1) {
			cDay = days.get(i - startDayOfWeek + 1);
			dayButton.inThisMonth = true;
		}
		else if (i < startDayOfWeek) {
			cDay = lastMonth.days.get(lastMonth.days.size - startDayOfWeek + i + 1);
		}
		else if (i > startDayOfWeek + days.size - 1) {
			cDay = nextMonth.days.get(i - startDayOfWeek - days.size + 1);
		}
		dayButton.day = cDay;
		if (state == 0 && dayButton.day && dayButton.day == calendar.selectedDay) {
			dayButton.selected = true;
		}
		else {
			dayButton.selected = false;
		}
	}
};

/*
* 重置月层布局
* monthDiv:月层
* state:状态
*/
let resetMonthDiv = function (monthDiv, state) {
	let calendar = monthDiv.calendar;
	let thisYear = monthDiv.year;
	let lastYear = monthDiv.year - 1;
	let nextYear = monthDiv.year + 1;
	let left = 0;
	let headHeight = calendar.headDiv.bounds.bottom;
	let top = headHeight;
	let width = calendar.size.cx;
	let height = calendar.size.cy;
	height -= calendar.timeDiv.bounds.bottom - calendar.timeDiv.bounds.top;
	let monthButtonHeight = height - top;
	if (monthButtonHeight < 1) {
		monthButtonHeight = 1;
	}
	let toY = 0;
	let monthButtons;
	if (monthDiv.aDirection == 1) {
		toY = monthButtonHeight * monthDiv.aTick / monthDiv.aTotalTick;
		if (state == 1) {
			thisYear = nextYear;
			lastYear = thisYear - 1;
			nextYear = thisYear + 1;
		}
	}
	else if (monthDiv.aDirection == 2) {
		toY = -monthButtonHeight * monthDiv.aTick / monthDiv.aTotalTick;
		if (state == 1) {
			thisYear = lastYear;
			lastYear = thisYear - 1;
			nextYear = thisYear + 1;
		}
	}
	if (state == 0) {
		monthButtons = monthDiv.monthButtons;
	}
	else if (state == 1) {
		monthButtons = monthDiv.monthButtons_am;
	}
	let dheight = monthButtonHeight / 3;
	let buttonSize = monthButtons.length;
	for (let i = 0; i < buttonSize; i++) {
		if (i == 8) {
			dheight = height - top;
		}
		let monthButton = monthButtons[i];
		monthButton.year = thisYear;
		let vOffSet = 0;
		if (state == 1) {
			if (monthDiv.aTick > 0) {
				monthButton.visible = true;
				if (monthDiv.aDirection == 1) {
					vOffSet = toY - monthButtonHeight;
				}
				else if (monthDiv.aDirection == 2) {
					vOffSet = toY + monthButtonHeight;
				}
			}
			else {
				monthButton.visible = false;
				continue;
			}
		}
		else {
			vOffSet = toY;
		}
		if ((i + 1) % 4 == 0) {
			let dp = new FCPoint(left, top + vOffSet);
			let ds = new FCSize(width - left, dheight);
			let bounds = new FCRect(dp.x, dp.y, dp.x + ds.cx, dp.y + ds.cy);
			monthButton.bounds = bounds;
			left = 0;
			if (i != 0 && i != buttonSize - 1) {
				top += dheight;
			}
		}
		else {
			let dp = new FCPoint(left, top + vOffSet);
			let ds = new FCSize(width / 4 + ((i + 1) % 4) % 2, dheight);
			let bounds = new FCRect(dp.x, dp.y, dp.x + ds.cx, dp.y + ds.cy);
			monthButton.bounds = bounds;
			left += ds.cx;
		}
	}
};

/*
* 重置年层布局
* yearDiv:年层
* state:状态
*/
let resetYearDiv = function (yearDiv, state) {
	let calendar = yearDiv.calendar;
	let thisStartYear = yearDiv.startYear;
	let lastStartYear = yearDiv.startYear - 12;
	let nextStartYear = yearDiv.startYear + 12;
	let left = 0;
	let headHeight = calendar.headDiv.bounds.bottom;
	let top = headHeight;
	let width = calendar.size.cx;
	let height = calendar.size.cy;
	height -= calendar.timeDiv.bounds.bottom - calendar.timeDiv.bounds.top;
	let yearButtonHeight = height - top;
	if (yearButtonHeight < 1) {
		yearButtonHeight = 1;
	}
	let toY = 0;
	let yearButtons;
	if (yearDiv.aDirection == 1) {
		toY = yearButtonHeight * yearDiv.aTick / yearDiv.aTotalTick;
		if (state == 1) {
			thisStartYear = nextStartYear;
			lastStartYear = thisStartYear - 12;
			nextStartYear = thisStartYear + 12;
		}
	}
	else if (yearDiv.aDirection == 2) {
		toY = -yearButtonHeight * yearDiv.aTick / yearDiv.aTotalTick;
		if (state == 1) {
			thisStartYear = lastStartYear;
			lastStartYear = thisStartYear - 12;
			nextStartYear = thisStartYear + 12;
		}
	}
	if (state == 0) {
		yearButtons = yearDiv.yearButtons;
	}
	else if (state == 1) {
		yearButtons = yearDiv.yearButtons_am;
	}
	let dheight = yearButtonHeight / 3;
	let buttonSize = yearDiv.yearButtons.length;
	for (let i = 0; i < buttonSize; i++) {
		if (i == 8) {
			dheight = height - top;
		}
		let yearButton = yearButtons[i];
		yearButton.year = thisStartYear + i;
		let vOffSet = 0;
		if (state == 1) {
			if (yearDiv.aTick > 0) {
				yearButton.visible = true;
				if (yearDiv.aDirection == 1) {
					vOffSet = toY - yearButtonHeight;
				}
				else if (yearDiv.aDirection == 2) {
					vOffSet = toY + yearButtonHeight;
				}
			}
			else {
				yearButton.visible = false;
				continue;
			}
		}
		else {
			vOffSet = toY;
		}
		if ((i + 1) % 4 == 0) {
			let dp = new FCPoint(left, top + vOffSet);
			let ds = new FCSize(width - left, dheight);
			let bounds = new FCRect(dp.x, dp.y, dp.x + ds.cx, dp.y + ds.cy);
			yearButton.bounds = bounds;
			left = 0;
			if (i != 0 && i != buttonSize - 1) {
				top += dheight;
			}
		}
		else {
			let dp = new FCPoint(left, top + vOffSet);
			let ds = new FCSize(width / 4 + ((i + 1) % 4) % 2, dheight);
			let bounds = new FCRect(dp.x, dp.y, dp.x + ds.cx, dp.y + ds.cy);
			yearButton.bounds = bounds;
			left += ds.cx;
		}
	}
};

/*
* 选择开始年份
* yearDiv:年层
* startYear:开始年
*/
let selectStartYear = function (yearDiv, startYear) {
	if (yearDiv.startYear != startYear) {
		if (startYear > yearDiv.startYear) {
			yearDiv.aDirection = 1;
		}
		else {
			yearDiv.aDirection = 2;
		}
		if (yearDiv.calendar.useAnimation) {
			yearDiv.aTick = yearDiv.aTotalTick;
		}
		yearDiv.startYear = startYear;
	}
};

/*
* 选择年份
* monthDiv:月层
* year:年
*/
let selectYear = function (monthDiv, year) {
	if (monthDiv.year != year) {
		if (year > monthDiv.year) {
			monthDiv.aDirection = 1;
		}
		else {
			monthDiv.aDirection = 2;
		}
		if (monthDiv.calendar.useAnimation) {
			monthDiv.aTick = monthDiv.aTotalTick;
		}
		monthDiv.year = year;
	}
};

/*
* 选中日期
* dayDiv:日期层
* selectedDay:选中日
* lastDay:上一日
*/
let selectDay = function (dayDiv, selectedDay, lastDay) {
	let calendar = dayDiv.calendar;
	let m = getYear(calendar.years, selectedDay.year).months.get(selectedDay.month);
	let thisMonth = getYear(calendar.years, lastDay.year).months.get(lastDay.month);
	if (m != thisMonth) {
		if (thisMonth.year * 12 + thisMonth.month > m.year * 12 + m.month) {
			dayDiv.aDirection = 2;
		}
		else {
			dayDiv.aDirection = 1;
		}
		let i = 0;
		let buttonSize = dayDiv.dayButtons.length;
		for (i = 0; i < buttonSize; i++) {
			let dayButton = dayDiv.dayButtons[i];
			if ((dayDiv.aDirection == 1 && dayButton.day == thisMonth.days.get(0))
				|| (dayDiv.aDirection == 2 && dayButton.day == thisMonth.days.get(thisMonth.days.size - 1))) {
				dayDiv.aClickRowFrom = i / 7;
				if (i % 7 != 0) {
					dayDiv.aClickRowFrom += 1;
				}
			}
		}
		resetDayDiv(dayDiv, 0);
		buttonSize = dayDiv.dayButtons_am.length;
		for (i = 0; i < buttonSize; i++) {
			let dayFCButtonm = dayDiv.dayButtons_am[i];
			if ((dayDiv.aDirection == 1 && dayFCButtonm.day == m.days.get(0))
				|| (dayDiv.aDirection == 2 && dayFCButtonm.day == m.days.get(m.days.size - 1))) {
				dayDiv.aClickRowTo = i / 7;
				if (i % 7 != 0) {
					dayDiv.aClickRowTo += 1;
				}
			}
		}

		if (calendar.useAnimation) {
			dayDiv.aTick = dayDiv.aTotalTick;
		}
	} else {
		let dayButtonsSize = dayDiv.dayButtons.length;
		for (let i = 0; i < dayButtonsSize; i++) {
			let dayButton = dayDiv.dayButtons[i];
			if (dayButton.day != selectedDay) {
				dayButton.selected = false;
			}
		}
	}
};

/*
* 日历的秒表
* calendar:日历
*/
let calendarTimer = function (calendar) {
	let paint = false;
	if (calendar.dayDiv.aTick > 0) {
		calendar.dayDiv.aTick = parseInt(calendar.dayDiv.aTick * 2 / 3);
		paint = true;
	}
	if (calendar.monthDiv.aTick > 0) {
		calendar.monthDiv.aTick = parseInt(calendar.monthDiv.aTick * 2 / 3);
		paint = true;
	}
	if (calendar.yearDiv.aTick > 0) {
		calendar.yearDiv.aTick = parseInt(calendar.yearDiv.aTick * 2 / 3);
		paint = true;
	}
	if (paint) {
		updateCalendar(calendar);
		if (calendar.paint) {
			invalidateView(calendar);
		}
	}
};

/*
* 更新日历的布局
* calendar:日历
*/
let updateCalendar = function (calendar) {
	if(calendar.headDiv.visible){
		calendar.headDiv.bounds = new FCRect(0, 0, calendar.size.cx, 80);

	}else{
		calendar.headDiv.bounds = new FCRect(0, 0, calendar.size.cx, 0);
	}
	if (calendar.mode == "day") {
		resetDayDiv(calendar.dayDiv, 0);
		resetDayDiv(calendar.dayDiv, 1);
	} else if (calendar.mode == "month") {
		resetMonthDiv(calendar.monthDiv, 0);
		resetMonthDiv(calendar.monthDiv, 1);
	}
	else if (calendar.mode == "year") {
		resetYearDiv(calendar.yearDiv, 0);
		resetYearDiv(calendar.yearDiv, 1);
	}
};

/*
* 绘制头部层
* headDiv:头部层
* paint:绘图对象
*/
let drawHeadDiv = function (headDiv, paint) {
	let calendar = headDiv.calendar;
	let bounds = headDiv.bounds;
	if (headDiv.backColor && headDiv.backColor != "none") {
		paint.fillRect(headDiv.backColor, bounds.left, bounds.top, bounds.right, bounds.bottom);
	}
	let weekStrings = new Array();
	if(calendar.showWeekend){
		weekStrings.push("周日");
	}
	weekStrings.push("周一");
	weekStrings.push("周二");
	weekStrings.push("周三");
	weekStrings.push("周四");
	weekStrings.push("周五");
	if(calendar.showWeekend){
		weekStrings.push("周六");
	}
	let w = bounds.right - bounds.left;
	let left = bounds.left;
	for (let i = 0; i < weekStrings.length; i++) {
		let weekDaySize = paint.textSize(weekStrings[i], headDiv.weekFont);
		let textX = left + (w / weekStrings.length) / 2 - weekDaySize.cx / 2;
		let textY = bounds.bottom - weekDaySize.cy - 2;
		paint.drawText(weekStrings[i], headDiv.textColor, headDiv.weekFont, textX, textY);
		left += w / weekStrings.length;
	}
	let drawTitle = "";
	if (calendar.mode == "day") {
		drawTitle = calendar.selectedDay.year + "年" + calendar.selectedDay.month + "月";
	} else if (calendar.mode == "month") {
		drawTitle = calendar.monthDiv.year + "年";
	} else {
		drawTitle = calendar.yearDiv.startYear + "年-" + (calendar.yearDiv.startYear + 11) + "年";
	}
	let tSize = paint.textSize(drawTitle, headDiv.titleFont);
	paint.drawText(drawTitle, headDiv.textColor, headDiv.titleFont, bounds.left + (w - tSize.cx) / 2, 30);
	let tR = 10;
	//画左右三角
	paint.beginPath();
	paint.addLine(5, bounds.top + (bounds.bottom - bounds.top) / 2, 5 + tR * 2, bounds.top + (bounds.bottom - bounds.top) / 2 - tR);
	paint.addLine(5 + tR * 2, bounds.top + (bounds.bottom - bounds.top) / 2 - tR, 5 + tR * 2, bounds.top + (bounds.bottom - bounds.top) / 2 + tR);
	paint.addLine(5 + tR * 2, bounds.top + (bounds.bottom - bounds.top) / 2 + tR, 5, bounds.top + (bounds.bottom - bounds.top) / 2);
	paint.fillPath(headDiv.arrowColor);
	paint.closePath();

	paint.beginPath();
	paint.addLine(bounds.right - 5, bounds.top + (bounds.bottom - bounds.top) / 2, bounds.right - 5 - tR * 2, bounds.top + (bounds.bottom - bounds.top) / 2 - tR);
	paint.addLine(bounds.right - 5 - tR * 2, bounds.top + (bounds.bottom - bounds.top) / 2 - tR, bounds.right - 5 - tR * 2, bounds.top + (bounds.bottom - bounds.top) / 2 + tR);
	paint.addLine(bounds.right - 5 - tR * 2, bounds.top + (bounds.bottom - bounds.top) / 2 + tR, bounds.right - 5, bounds.top + (bounds.bottom - bounds.top) / 2);
	paint.fillPath(headDiv.arrowColor);
	paint.closePath();
};

/*
* 绘制日的按钮
* dayButton:日期按钮
* paint:绘图对象
*/
let drawDayButton = function (dayButton, paint) {
	if (dayButton.day) {
		let calendar = dayButton.calendar;
		let bounds = dayButton.bounds;
		if(bounds.right - bounds.left > 0){
			let text = dayButton.day.day;
			let tSize = paint.textSize(text, dayButton.font);
			if (dayButton.backColor && dayButton.backColor != "none") {
				paint.fillRect(dayButton.backColor, bounds.left + 2, bounds.top + 2, bounds.right - 2, bounds.bottom - 2);
			}
			if (dayButton.inThisMonth) {
				paint.drawText(text, dayButton.textColor, dayButton.font, bounds.left + 5, bounds.top + 7);
			} else {
				paint.drawText(text, dayButton.textColor2, dayButton.font, bounds.left + 5, bounds.top + 7);
			}
			if (dayButton.borderColor && dayButton.borderColor != "none") {
				paint.drawRect(dayButton.borderColor, 1, 0, bounds.left + 2, bounds.top + 2, bounds.right - 2, bounds.bottom - 2);
			}
		}
	}
};

/*
* 绘制月的按钮
* monthButton:月按钮
* paint:绘图对象
*/
let drawMonthButton = function (monthButton, paint) {
	let calendar = monthButton.calendar;
	let bounds = monthButton.bounds;
	let text = getMonthStr(monthButton.month);
	let tSize = paint.textSize(text, monthButton.font);
	if (monthButton.backColor && monthButton.backColor != "none") {
		paint.fillRect(monthButton.backColor, bounds.left + 2, bounds.top + 2, bounds.right - 2, bounds.bottom - 2);
	}
	paint.drawText(text, monthButton.textColor, monthButton.font, bounds.left + 5, bounds.top + 7);
	if (monthButton.borderColor && monthButton.borderColor != "none") {
		paint.drawRect(monthButton.borderColor, 1, 0, bounds.left + 2, bounds.top + 2, bounds.right - 2, bounds.bottom - 2);
	}
};

/*
* 绘制年的按钮
* yearButton:年按钮
* paint:绘图对象
*/
let drawYearButton = function (yearButton, paint) {
	let calendar = yearButton.calendar;
	let bounds = yearButton.bounds;
	let text = yearButton.year;
	let tSize = paint.textSize(text, yearButton.font);
	if (yearButton.backColor && yearButton.backColor != "none") {
		paint.fillRect(yearButton.backColor, bounds.left + 2, bounds.top + 2, bounds.right - 2, bounds.bottom - 2);
	}
	paint.drawText(text, yearButton.textColor, yearButton.font, bounds.left + 5, bounds.top + 7);
	if (yearButton.borderColor && yearButton.borderColor != "none") {
		paint.drawRect(yearButton.borderColor, 1, 0, bounds.left + 2, bounds.top + 2, bounds.right - 2, bounds.bottom - 2);
	}
};

/*
* 绘制日历
* calendar:日历
* paint:绘图对象
*/
let drawCalendar = function (calendar, paint) {
	if (calendar.backColor && calendar.backColor != "none") {
		paint.fillRect(calendar.backColor, 0, 0, calendar.size.cx, calendar.size.cy);
	}
	if (calendar.mode == "day") {
		let dayButtonsSize = calendar.dayDiv.dayButtons.length;
		for (let i = 0; i < dayButtonsSize; i++) {
			let dayButton = calendar.dayDiv.dayButtons[i];
			if (dayButton.visible) {
				if (calendar.onPaintCalendarDayButton) {
					calendar.onPaintCalendarDayButton(calendar, dayButton, paint);
				}
				else if (paint.onPaintCalendarDayButton) {
					paint.onPaintCalendarDayButton(calendar, dayButton, paint);
				} else {
					drawDayButton(dayButton, paint);
				}
			}
		}
		let dayFCButtonmSize = calendar.dayDiv.dayButtons_am.length;
		for (let i = 0; i < dayFCButtonmSize; i++) {
			let dayButton = calendar.dayDiv.dayButtons_am[i];
			if (dayButton.visible) {
				if (calendar.onPaintCalendarDayButton) {
					calendar.onPaintCalendarDayButton(calendar, dayButton, paint);
				}
				else if (paint.onPaintCalendarDayButton) {
					paint.onPaintCalendarDayButton(calendar, dayButton, paint);
				} else {
					drawDayButton(dayButton, paint);
				}
			}
		}
	}
	else if (calendar.mode == "month") {
		let monthButtonsSize = calendar.monthDiv.monthButtons.length;
		for (let i = 0; i < monthButtonsSize; i++) {
			let monthButton = calendar.monthDiv.monthButtons[i];
			if (monthButton.visible) {
				if (calendar.onPaintCalendarMonthButton) {
					calendar.onPaintCalendarMonthButton(calendar, monthButton, paint);
				} 
				else if (paint.onPaintCalendarMonthButton) {
					paint.onPaintCalendarMonthButton(calendar, monthButton, paint);
				} else {
					drawMonthButton(monthButton, paint);
				}
			}
		}
		let monthFCButtonmSize = calendar.monthDiv.monthButtons_am.length;
		for (let i = 0; i < monthFCButtonmSize; i++) {
			let monthButton = calendar.monthDiv.monthButtons_am[i];
			if (monthButton.visible) {
				if (calendar.onPaintCalendarMonthButton) {
					calendar.onPaintCalendarMonthButton(calendar, monthButton, paint);
				} 
				else if (paint.onPaintCalendarMonthButton) {
					paint.onPaintCalendarMonthButton(calendar, monthButton, paint);
				} else {
					drawMonthButton(monthButton, paint);
				}
			}
		}
	} else if (calendar.mode == "year") {
		let yearButtonsSize = calendar.yearDiv.yearButtons.length;
		for (let i = 0; i < yearButtonsSize; i++) {
			let yearButton = calendar.yearDiv.yearButtons[i];
			if (yearButton.visible) {
				if (calendar.onPaintCalendarYearButton) {
					calendar.onPaintCalendarYearButton(calendar, yearButton, paint);
				}
				else if (paint.onPaintCalendarYearButton) {
					paint.onPaintCalendarYearButton(calendar, yearButton, paint);
				} else {
					drawYearButton(yearButton, paint);
				}
			}
		}
		let yearFCButtonmSize = calendar.yearDiv.yearButtons_am.length;
		for (let i = 0; i < yearFCButtonmSize; i++) {
			let yearButton = calendar.yearDiv.yearButtons_am[i];
			if (yearButton.visible) {
				if (calendar.onPaintCalendarYearButton) {
					calendar.onPaintCalendarYearButton(calendar, yearButton, paint);
				}
				else if (paint.onPaintCalendarYearButton) {
					paint.onPaintCalendarYearButton(calendar, yearButton, paint);
				} else {
					drawYearButton(yearButton, paint);
				}
			}
		}
	}
	if(calendar.headDiv.visible){
		if (calendar.onPaintCalendarHeadDiv) {
			calendar.onPaintCalendarHeadDiv(calendar, calendar.headDiv, paint);
		}
		else if (paint.onPaintCalendarHeadDiv) {
			paint.onPaintCalendarHeadDiv(calendar, calendar.headDiv, paint);
		} else {
			drawHeadDiv(calendar.headDiv, paint);
		}
	}
	if (calendar.borderColor && calendar.borderColor != "none") {
		paint.drawRect(calendar.borderColor, 1, 0, 0, 0, calendar.size.cx, calendar.size.cy);
	}
};

/*
* 点击日的按钮
* dayButton:日期按钮
* mp:坐标
*/
let clickDayButton = function (dayButton, mp) {
	let calendar = dayButton.calendar;
	let lastDay = calendar.selectedDay;
	calendar.selectedDay = dayButton.day;
	selectDay(calendar.dayDiv, calendar.selectedDay, lastDay);
	updateCalendar(calendar);
	if (calendar.paint) {
		invalidateView(calendar);
	}
};

/*
* 点击月的按钮
* monthButton:月按钮
* mp:坐标
*/
let clickMonthButton = function (monthButton, mp) {
	let calendar = monthButton.calendar;
	let month = getYear(calendar.years, monthButton.year).months.get(monthButton.month);
	calendar.mode = "day";
	let lastDay = calendar.selectedDay;
	calendar.selectedDay = month.days.get(1);
	selectDay(calendar.dayDiv, calendar.selectedDay, lastDay);
	updateCalendar(calendar);
	if (calendar.paint) {
		invalidateView(calendar);
	}
};

/*
* 点击年的按钮
* yearButton:年按钮
* mp:坐标
*/
let clickYearButton = function (yearButton, mp) {
	let calendar = yearButton.calendar;
	calendar.mode = "month";
	selectYear(calendar.monthDiv, yearButton.year);
	updateCalendar(calendar);
	if (calendar.paint) {
		invalidateView(calendar);
	}
};

/*
* 点击左侧的按钮
* headDiv:头部层
* mp:坐标
*/
let clickLastButton = function (headDiv, mp) {
	let calendar = headDiv.calendar;
	if (calendar.mode == "day") {
		let lastMonth = getLastMonth(calendar, calendar.selectedDay.year, calendar.selectedDay.month);
		let lastDay = calendar.selectedDay;
		calendar.selectedDay = lastMonth.days.get(1);
		selectDay(calendar.dayDiv, calendar.selectedDay, lastDay);
		updateCalendar(calendar);
		if (calendar.paint) {
			invalidateView(calendar);
		}
	} else if (calendar.mode == "month") {
		let year = calendar.monthDiv.year;
		year -= 1;
		selectYear(calendar.monthDiv, year);
		updateCalendar(calendar);
		if (calendar.paint) {
			invalidateView(calendar);
		}
	} else if (calendar.mode == "year") {
		let year = calendar.yearDiv.startYear;
		year -= 12;
		selectStartYear(calendar.yearDiv, year);
		updateCalendar(calendar);
		if (calendar.paint) {
			invalidateView(calendar);
		}
	}
};
	
/*
* 点击右侧的按钮
* headDiv:头部层
* mp:坐标
*/
let clickNextButton = function (headDiv, mp) {
	let calendar = headDiv.calendar;
	if (calendar.mode == "day") {
		let nextMonth = getNextMonth(calendar, calendar.selectedDay.year, calendar.selectedDay.month);
		let lastDay = calendar.selectedDay;
		calendar.selectedDay = nextMonth.days.get(1);
		selectDay(calendar.dayDiv, calendar.selectedDay, lastDay);
		updateCalendar(calendar);
		if (calendar.paint) {
			invalidateView(calendar);
		}
	} else if (calendar.mode == "month") {
		let year = calendar.monthDiv.year;
		year += 1;
		selectYear(calendar.monthDiv, year);
		updateCalendar(calendar);
		if (calendar.paint) {
			invalidateView(calendar);
		}
	} else if (calendar.mode == "year") {
		let year = calendar.yearDiv.startYear;
		year += 12;
		selectStartYear(calendar.yearDiv, year);
		updateCalendar(calendar);
		if (calendar.paint) {
			invalidateView(calendar);
		}
	}
};

/*
* 改变模式的按钮
* headDiv:头部层
* mp:坐标
*/
let clickModeButton = function (headDiv, mp) {
	let calendar = headDiv.calendar;
	if (calendar.mode == "day") {
		calendar.mode = "month";
		calendar.monthDiv.month = calendar.selectedDay.month;
		calendar.monthDiv.year = calendar.selectedDay.year;
		updateCalendar(calendar);
		if (calendar.paint) {
			invalidateView(calendar);
		}
	}
	else if (calendar.mode == "month") {
		calendar.mode = "year";
		selectStartYear(calendar.yearDiv, calendar.monthDiv.year);
		updateCalendar(calendar);
		if (calendar.paint) {
			invalidateView(calendar);
		}
	}
};

/*
* 点击日历
* calendar:日历
* mp:坐标
*/
let clickCalendar = function (calendar, mp) {
	let headBounds = calendar.headDiv.bounds;
	if (mp.x >= headBounds.left && mp.x <= headBounds.right && mp.y >= headBounds.top && mp.y <= headBounds.bottom) {
		let tR = 10;
		if (mp.x < headBounds.left + tR * 3) {
			clickLastButton(calendar.headDiv, mp);
			return;
		} else if (mp.x > headBounds.right - tR * 3) {
			clickNextButton(calendar.headDiv, mp);
			return;
		} else {
			clickModeButton(calendar.headDiv, mp);
			return;
		}
	}
	if (calendar.mode == "day") {
		let dayButtonsSize = calendar.dayDiv.dayButtons.length;
		for (let i = 0; i < dayButtonsSize; i++) {
			let dayButton = calendar.dayDiv.dayButtons[i];
			if (dayButton.visible) {
				let bounds = dayButton.bounds;
				if (mp.x >= bounds.left && mp.x <= bounds.right && mp.y >= bounds.top && mp.y <= bounds.bottom) {
					clickDayButton(dayButton, mp);
					return;
				}
			}
		}
	}
	else if (calendar.mode == "month") {
		let monthButtonsSize = calendar.monthDiv.monthButtons.length;
		for (let i = 0; i < monthButtonsSize; i++) {
			let monthButton = calendar.monthDiv.monthButtons[i];
			if (monthButton.visible) {
				let bounds = monthButton.bounds;
				if (mp.x >= bounds.left && mp.x <= bounds.right && mp.y >= bounds.top && mp.y <= bounds.bottom) {
					clickMonthButton(monthButton, mp);
					return;
				}
			}
		}
	} else if (calendar.mode == "year") {
		let yearButtonsSize = calendar.yearDiv.yearButtons.length;
		for (let i = 0; i < yearButtonsSize; i++) {
			let yearButton = calendar.yearDiv.yearButtons[i];
			if (yearButton.visible) {
				let bounds = yearButton.bounds;
				if (mp.x >= bounds.left && mp.x <= bounds.right && mp.y >= bounds.top && mp.y <= bounds.bottom) {
					clickYearButton(yearButton, mp);
					return;
				}
			}
		}
	}
};

/*
* 绘制滚动条
* div:图层
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawDivScrollBar = function (div, paint, clipRect) {
	div.hScrollIsVisible = false;
	div.vScrollIsVisible = false;
	if (paint.isMobile) {
		if (paint.touchDownView == div) {
		} else if (g_dragScrollView_Div == div && g_scrollAddSpeed_Div != 0) {
		} else {
			return;
		}
	}
	//绘制滚动条
	if (div.showHScrollBar) {
		let contentWidth = getDivContentWidth(div);
		if (contentWidth > 0 && contentWidth > div.size.cx) {
			let sLeft = div.scrollH / contentWidth * div.size.cx;
			let sRight = (div.scrollH + div.size.cx) / contentWidth * div.size.cx;
			if (sRight - sLeft < div.scrollSize) {
				sRight = sLeft + div.scrollSize;
			}
			if (paint.touchMoveView == div && (div.hoverScrollHButton || div.downScrollHButton)) {
				paint.fillRect(div.scrollBarHoveredColor, sLeft, div.size.cy - div.scrollSize, sRight, div.size.cy);
			} else {
				paint.fillRect(div.scrollBarColor, sLeft, div.size.cy - div.scrollSize, sRight, div.size.cy);
			}
			div.hScrollIsVisible = true;
		}
	}
	if (div.showVScrollBar) {
		let contentHeight = getDivContentHeight(div);
		if (contentHeight > 0 && contentHeight > div.size.cy) {
			let sTop = div.scrollV / contentHeight * div.size.cy;
			let sBottom = sTop + (div.size.cy / contentHeight * div.size.cy);
			if (sBottom - sTop < div.scrollSize) {
				sBottom = sTop + div.scrollSize;
			}
			if (paint.touchMoveView == div && (div.hoverScrollVButton || div.downScrollVButton)) {
				paint.fillRect(div.scrollBarHoveredColor, div.size.cx - div.scrollSize, sTop, div.size.cx, sBottom);
			} else {
				paint.fillRect(div.scrollBarColor, div.size.cx - div.scrollSize, sTop, div.size.cx, sBottom);
			}
			div.vScrollIsVisible = true;
		}
	}
};

/*
* 获取内容的宽度
* div:图层
*/
let getDivContentWidth = function (div) {
	let cWidth = 0;
	if (div.views) {
		for (let i = 0; i < div.views.length; i++) {
			if (div.views[i].visible) {
				if (cWidth < div.views[i].location.x + div.views[i].size.cx) {
					cWidth = div.views[i].location.x + div.views[i].size.cx;
				}
			}
		}
	}
	return cWidth;
};
	
/*
* 获取内容的高度
* div:图层
*/
let getDivContentHeight = function (div) {
	let cHeight = 0;
	if (div.views) {
		for (let i = 0; i < div.views.length; i++) {
			if (div.views[i].visible) {
				if (cHeight < div.views[i].location.y + div.views[i].size.cy) {
					cHeight = div.views[i].location.y + div.views[i].size.cy;
				}
			}
		}
	}
	return cHeight;
};

/*
* 图层的鼠标移动方法
* div: 图层
* firstTouch:是否第一次触摸
* secondTouch:是否第二次触摸
* firstPoint:第一次触摸的坐标
* secondPoint:第二次触摸的坐标
*/
let touchMoveDiv = function (div, firstTouch, firstPoint, secondTouch, secondPoint) {
	div.hoverScrollHButton = false;
	div.hoverScrollVButton = false;
	let mp = firstPoint;
	if (firstTouch) {
		if (div.showHScrollBar || div.showVScrollBar) {
			if (div.downScrollHButton) {
				let contentWidth = getDivContentWidth(div);
				let subX = (mp.x - div.startPoint.x) / div.size.cx * contentWidth;
				let newScrollH = div.startScrollH + subX;
				if (newScrollH < 0) {
					newScrollH = 0;
				} else if (newScrollH > contentWidth - div.size.cx) {
					newScrollH = contentWidth - div.size.cx;
				}
				div.scrollH = newScrollH;
				div.paint.cancelClick = true;
				return;

			} else if (div.downScrollVButton) {
				let contentHeight = getDivContentHeight(div);
				let subY = (mp.y - div.startPoint.y) / div.size.cy * contentHeight;
				let newScrollV = div.startScrollV + subY;
				if (newScrollV < 0) {
					newScrollV = 0;
				} else if (newScrollV > contentHeight - div.size.cy) {
					newScrollV = contentHeight - div.size.cy;
				}
				div.scrollV = newScrollV;
				div.paint.cancelClick = true;
				return;
			}
		}
		if (div.allowDragScroll) {
			let contentWidth = getDivContentWidth(div);
			if (contentWidth > div.size.cx) {
				let subX = div.startPoint.x - mp.x;
				let newScrollH = div.startScrollH + subX;
				if (newScrollH < 0) {
					newScrollH = 0;
				} else if (newScrollH > contentWidth - div.size.cx) {
					newScrollH = contentWidth - div.size.cx;
				}
				div.scrollH = newScrollH;
				if (Math.abs(subX) > 5) {
					div.paint.cancelClick = true;
				}
			}
			let contentHeight = getDivContentHeight(div);
			if (contentHeight > div.size.cy) {
				let subY = div.startPoint.y - mp.y;
				let newScrollV = div.startScrollV + subY;
				if (newScrollV < 0) {
					newScrollV = 0;
				} else if (newScrollV > contentHeight - div.size.cy) {
					newScrollV = contentHeight - div.size.cy;
				}
				div.scrollV = newScrollV;
				if (Math.abs(subY) > 5) {
					div.paint.cancelClick = true;
				}
			}
		}
	} else {
		if (div.showHScrollBar) {
			let contentWidth = getDivContentWidth(div);
			if (contentWidth > 0 && contentWidth > div.size.cx) {
				let sLeft = div.scrollH / contentWidth * div.size.cx;
				let sRight = (div.scrollH + div.size.cx) / contentWidth * div.size.cx;
				if (sRight - sLeft < div.scrollSize) {
					sRight = sLeft + div.scrollSize;
				}
				if (mp.x >= sLeft && mp.x <= sRight && mp.y >= div.size.cy - div.scrollSize && mp.y <= div.size.cy) {
					div.hoverScrollHButton = true;
					return;
				} else {
					div.hoverScrollHButton = false;
				}
			}
		}
		if (div.showVScrollBar) {
			let contentHeight = getDivContentHeight(div);
			if (contentHeight > 0 && contentHeight > div.size.cy) {
				let sTop = div.scrollV / contentHeight * div.size.cy;
				let sBottom = (div.scrollV + div.size.cy) / contentHeight * div.size.cy;
				if (sBottom - sTop < div.scrollSize) {
					sBottom = sTop + div.scrollSize;
				}
				if (mp.x >= div.size.cx - div.scrollSize && mp.x <= div.size.cx && mp.y >= sTop && mp.y <= sBottom) {
					div.hoverScrollVButton = true;
					return;
				} else {
					div.hoverScrollVButton = false;
				}
			}
		}
	}
};

/*
* 图层的鼠标按下方法
* div: 图层
* firstTouch:是否第一次触摸
* firstPoint:第一次触摸的坐标
* secondTouch:是否第二次触摸
* secondPoint:第二次触摸的坐标
* clicks:点击次数
*/
let touchDownDiv = function (div, firstTouch, firstPoint, secondTouch, secondPoint, clicks) {
	let mp = firstPoint;
	div.touchDownTime = new Date().getTime();
	div.startPoint = mp;
	div.downScrollHButton = false;
	div.downScrollVButton = false;
	div.hoverScrollHButton = false;
	div.hoverScrollVButton = false;
	g_dragScrollView_Div = null;
	g_scrollAddSpeed_Div = 0;
	g_scrollDirection_Div = 0;
	if (div.showHScrollBar) {
		let contentWidth = getDivContentWidth(div);
		if (contentWidth > 0 && contentWidth > div.size.cx) {
			let sLeft = div.scrollH / contentWidth * div.size.cx;
			let sRight = (div.scrollH + div.size.cx) / contentWidth * div.size.cx;
			if (sRight - sLeft < div.scrollSize) {
				sRight = sLeft + div.scrollSize;
			}
			if (mp.x >= sLeft && mp.x <= sRight && mp.y >= div.size.cy - div.scrollSize && mp.y <= div.size.cy) {
				div.downScrollHButton = true;
				div.startScrollH = div.scrollH;
				return;
			}
		}
	}
	if (div.showVScrollBar) {
		let contentHeight = getDivContentHeight(div);
		if (contentHeight > 0 && contentHeight > div.size.cy) {
			let sTop = div.scrollV / contentHeight * div.size.cy;
			let sBottom = (div.scrollV + div.size.cy) / contentHeight * div.size.cy;
			if (sBottom - sTop < div.scrollSize) {
				sBottom = sTop + div.scrollSize;
			}
			if (mp.x >= div.size.cx - div.scrollSize && mp.x <= div.size.cx && mp.y >= sTop && mp.y <= sBottom) {
				div.downScrollVButton = true;
				div.startScrollV = div.scrollV;
				return;
			}
		}
	}
	if (div.allowDragScroll) {
		div.startScrollH = div.scrollH;
		div.startScrollV = div.scrollV;
	}
};

let g_dragScrollView_Div = null;//正在滚动的表格
let g_scrollAddSpeed_Div = 0;//滚动加速
let g_scrollDirection_Div = 0; //滚动方向

/*
* 检查拖动滚动
*/
let checkDragScroll_Div = function () {
	if (g_dragScrollView_Div) {
		let sub = parseInt(g_scrollAddSpeed_Div / 10);
		if (sub == 0 && g_scrollAddSpeed_Div > 1) {
			sub = 1;
		} else if (sub == 0 && g_scrollAddSpeed_Div < -1) {
			sub = -1;
		}
		g_scrollAddSpeed_Div -= sub;
		if (Math.abs(sub) <= 1) {
			let viewCache = g_dragScrollView_Div;
			g_scrollAddSpeed_Div = 0;
			g_dragScrollView_Div = null;
			if (viewCache.paint) {
				invalidateView(viewCache);
			}
		} else {
			let oldScrollV = parseInt(g_dragScrollView_Div.scrollV + g_scrollAddSpeed_Div);
			let oldScrollH = parseInt(g_dragScrollView_Div.scrollH + g_scrollAddSpeed_Div);
			if (g_scrollDirection_Div == 0) {
				let contentHeight = getDivContentHeight(g_dragScrollView_Div);
				if (contentHeight < g_dragScrollView_Div.size.cy) {
					g_dragScrollView_Div.scrollV = 0;
				} else {
					if (oldScrollV < 0) {
						oldScrollV = 0;
					} else if (oldScrollV > contentHeight - g_dragScrollView_Div.size.cy) {
						oldScrollV = contentHeight - g_dragScrollView_Div.size.cy;
					}
					g_dragScrollView_Div.scrollV = oldScrollV;
				}
			} else {
				let contentWidth = getDivContentWidth(g_dragScrollView_Div);
				if (contentWidth < g_dragScrollView_Div.size.cx) {
					g_dragScrollView_Div.scrollH = 0;
				} else {
					if (oldScrollH < 0) {
						oldScrollH = 0;
					} else if (oldScrollH > contentWidth - g_dragScrollView_Div.size.cx) {
						oldScrollH = contentWidth - g_dragScrollView_Div.size.cx;
					}
					g_dragScrollView_Div.scrollH = oldScrollH;
				}
			}
			if (g_dragScrollView_Div.paint) {
				invalidateView(g_dragScrollView_Div);
			}
		}
	}
};

/*
 * 更新滚动
 */
let updateScroll = function () {
	checkDragScroll_Div();
	checkGridDragScroll();
	checkTabPageAnimation();
	checkDragScroll_Tree();
	if(focusingTextBox != null){
		focusingTextBox.focus();
		focusingTextBox = null;
	}
};

setInterval(updateScroll, 20);

/*
* 格式化字符串
* fmt:格式化字符
* date:日期
*/
function dateFormat(fmt, date) {
	let ret;
	const opt = {
		"Y+": date.getFullYear().toString(),        // 年
		"m+": (date.getMonth() + 1).toString(),     // 月
		"d+": date.getDate().toString(),            // 日
		"H+": date.getHours().toString(),           // 时
		"M+": date.getMinutes().toString(),         // 分
		"S+": date.getSeconds().toString()          // 秒
		// 有其他格式化字符需求可以继续添加，必须转化成字符串
	};
	for (let k in opt) {
		ret = new RegExp("(" + k + ")").exec(fmt);
		if (ret) {
			fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
		};
	};
	return fmt;
};

/*
* 计算直线参数
* mp:坐标
* x1:横坐标1
* y1:纵坐标1
* x2:横坐标2
* y2:纵坐标2
* oX:坐标起始X
* oY:坐标起始Y
*/
let lineXY = function (chart, x1, y1, x2, y2, oX, oY) {
	chart.kChart = 0;
	chart.bChart = 0;
	if ((x1 - oX) != (x2 - oX)) {
		chart.kChart = ((y2 - oY) - (y1 - oY)) / ((x2 - oX) - (x1 - oX));
		chart.bChart = (y1 - oY) - chart.kChart * (x1 - oX);
	}
};

/*
* 判断是否选中直线
* mp:坐标
* x1:横坐标1
* y1:纵坐标1
* x2:横坐标2
* y2:纵坐标2
*/
let selectLine = function (chart, mp, x1, y1, x2, y2) {
	lineXY(chart, x1, y1, x2, y2, 0, 0);
	if (!(chart.kChart == 0 && chart.bChart == 0)) {
		if (mp.y / (mp.x * chart.kChart + chart.bChart) >= 0.9 && mp.y / (mp.x * chart.kChart + chart.bChart) <= 1.1) {
			return true;
		}
	} else {
		if (mp.x >= x1 - chart.plotPointSizeChart && mp.x <= x1 + chart.plotPointSizeChart) {
			return true;
		}
	}
	return false;
};

/*
* 判断是否选中射线
* mp:坐标
* x1:横坐标1
* y1:纵坐标1
* x2:横坐标2
* y2:纵坐标2
*/
let selectRay = function (chart, mp, x1, y1, x2, y2) {
	lineXY(chart, x1, y1, x2, y2, 0, 0);
	if (!(chart.kChart == 0 && chart.bChart == 0)) {
		if (mp.y / (mp.x * chart.kChart + chart.bChart) >= 0.9 && mp.y / (mp.x * chart.kChart + chart.bChart) <= 1.1) {
			if (x1 >= x2) {
				if (mp.x > x1 + chart.plotPointSizeChart) return false;
			} else if (x1 < x2) {
				if (mp.x < x1 - chart.plotPointSizeChart) return false;
			}
			return true;
		}
	} else {
		if (mp.x >= x1 - chart.plotPointSizeChart && mp.x <= x1 + chart.plotPointSizeChart) {
			if (y1 >= y2) {
				if (mp.y <= y1 - chart.plotPointSizeChart) {
					return true;
				}
			} else {
				if (mp.y >= y1 - chart.plotPointSizeChart) {
					return true;
				}
			}
		}
	}
	return false;
};

/*
* 判断是否选中线段
* mp:坐标
* x1:横坐标1
* y1:纵坐标1
* x2:横坐标2
* y2:纵坐标2
*/
let selectSegment = function (chart, mp, x1, y1, x2, y2) {
	lineXY(chart, x1, y1, x2, y2, 0, 0);
	let smallX = x1 <= x2 ? x1 : x2;
	let smallY = y1 <= y2 ? y1 : y2;
	let bigX = x1 > x2 ? x1 : x2;
	let bigY = y1 > y2 ? y1 : y2;
	if (mp.x >= smallX - 2 && mp.x <= bigX + 2 && mp.y >= smallY - 2 && mp.y <= bigY + 2) {
		if (chart.kChart != 0 || chart.bChart != 0) {
			if (mp.y / (mp.x * chart.kChart + chart.bChart) >= 0.9 && mp.y / (mp.x * chart.kChart + chart.bChart) <= 1.1) {
				return true;
			}
		} else {
			if (mp.x >= x1 - chart.plotPointSizeChart && mp.x <= x1 + chart.plotPointSizeChart) {
				return true;
			}
		}
	}
	return false;
};

/*
* 根据三点计算圆心
* x1:横坐标1
* y1:纵坐标1
* x2:横坐标2
* y2:纵坐标2
* x3:横坐标3
* y3:纵坐标3
*/
let ellipseOR = function (chart, x1, y1, x2, y2, x3, y3) {
	chart.oXChart = ((y3 - y1) * (y2 * y2 - y1 * y1 + x2 * x2 - x1 * x1) + (y2 - y1) * (y1 * y1 - y3 * y3 + x1 * x1 - x3 * x3))
		/ (2 * (x2 - x1) * (y3 - y1) - 2 * (x3 - x1) * (y2 - y1));
	chart.oYChart = ((x3 - x1) * (x2 * x2 - x1 * x1 + y2 * y2 - y1 * y1) + (x2 - x1) * (x1 * x1 - x3 * x3 + y1 * y1 - y3 * y3))
		/ (2 * (y2 - y1) * (x3 - x1) - 2 * (y3 - y1) * (x2 - x1));
	chart.rChart = Math.sqrt((x1 - chart.oXChart) * (x1 - chart.oXChart) + (y1 - chart.oYChart) * (y1 - chart.oYChart));
}

/*
* 判断点是否在椭圆上
* x:横坐标
* y:纵坐标
* oX:坐标起始X
* oY:坐标起始Y
* a:椭圆参数a
* b:椭圆参数b
*/
let ellipseHasPoint = function (x, y, oX, oY, a, b) {
	x -= oX;
	y -= oY;
	if (a == 0 && b == 0 && x == 0 && y == 0) {
		return true;
	}
	if (a == 0) {
		if (x == 0 && y >= -b && y <= b) {
			return false;
		}
	}
	if (b == 0) {
		if (y == 0 && x >= -a && x <= a) {
			return true;
		}
	}
	if ((x * x) / (a * a) + (y * y) / (b * b) >= 0.8 && (x * x) / (a * a) + (y * y) / (b * b) <= 1.2) {
		return true;
	}
	return false;
};

/*
* 计算线性回归
* list:集合
*/
let linearRegressionEquation = function (chart, list) {
	let result = 0;
	let sumX = 0;
	let sumY = 0;
	let sumUp = 0;
	let sumDown = 0;
	let xAvg = 0;
	let yAvg = 0;
	chart.kChart = 0;
	chart.bChart = 0;
	let length = list.length;
	if (length > 1) {
		for (let i = 0; i < length; i++) {
			sumX += i + 1;
			sumY += list[i];
		}
		xAvg = sumX / length;
		yAvg = sumY / length;
		for (let i = 0; i < length; i++) {
			sumUp += (i + 1 - xAvg) * (list[i] - yAvg);
			sumDown += (i + 1 - xAvg) * (i + 1 - xAvg);
		}
		chart.kChart = sumUp / sumDown;
		chart.bChart = yAvg - chart.kChart * xAvg;
	}
	return result;
}

/*
* 计算最大值
* list:集合
*/
let maxValue = function (list) {
	let length = list.length;
	let max = 0;
	for (let i = 0; i < length; i++) {
		if (i == 0) {
			max = list[i];
		}
		else {
			if (max < list[i]) {
				max = list[i];
			}
		}
	}
	return max;
};

/*
* 计算最小值
* list:集合
*/
let minValue = function (list) {
	let length = list.length;
	let min = 0;
	for (let i = 0; i < length; i++) {
		if (i == 0) {
			min = list[i];
		}
		else {
			if (min > list[i]) {
				min = list[i];
			}
		}
	}
	return min;
};

/*
* 计算平均值
* list:集合
*/
let avgValue = function (list) {
	let sum = 0;
	let length = list.length;
	if (length > 0) {
		for (let i = 0; i < length; i++) {
			sum += list[i];
		}
		return sum / length;
	}
	return 0;
};

/*
* 计算平行四边形参数
* x1:横坐标1
* y1:纵坐标1
* x2:横坐标2
* y2:纵坐标2
* x3:横坐标3
* y3:纵坐标3
*/
let parallelogram = function (chart, x1, y1, x2, y2, x3, y3) {
	chart.x4Chart = x1 + x3 - x2;
	chart.y4Chart = y1 + y3 - y2;
};

/*
* 计算斐波那契数列
* index:索引
*/
let fibonacciValue = function (index) {
	if (index < 1) {
		return 0;
	}
	else {
		let vList = new Array();
		for (let i = 0; i < index; i++) {
			vList.push(0);
		}
		let result = 0;
		for (let i = 0; i <= index - 1; i++) {
			if (i == 0 || i == 1) {
				vList[i] = 1;
			}
			else {
				vList[i] = vList[i - 1] + vList[i - 2];
			}
		}
		result = vList[index - 1];
		return result;
	}
};

/*
* 获取百分比线的刻度
* y1: 纵坐标1
* y2: 纵坐标2
*/
let getPercentParams = function (y1, y2) {
	let y0 = 0, y25 = 0, y50 = 0, y75 = 0, y100 = 0;
	y0 = y1;
	y25 = y1 <= y2 ? y1 + (y2 - y1) / 4 : y2 + (y1 - y2) * 3 / 4;
	y50 = y1 <= y2 ? y1 + (y2 - y1) / 2 : y2 + (y1 - y2) / 2;
	y75 = y1 <= y2 ? y1 + (y2 - y1) * 3 / 4 : y2 + (y1 - y2) / 4;
	y100 = y2;
	let list = new Array();
	list.push(y0);
	list.push(y25);
	list.push(y50);
	list.push(y75);
	list.push(y100);
	return list;
};

/*
* 获取图表的区域
* chart: 图表
* plot: 画线
*/
let getCandleRange = function (chart, plot) {
	let bIndex = getChartIndexByDate(chart, plot.key1);
	let eIndex = getChartIndexByDate(chart, plot.key2);
	let tempBIndex = Math.min(bIndex, eIndex);
	let tempEIndex = Math.max(bIndex, eIndex);
	bIndex = tempBIndex;
	eIndex = tempEIndex;
	let highList = new Array();
	let lowList = new Array();
	for (let i = bIndex; i <= eIndex; i++) {
		highList.push(chart.datas[i].high);
		lowList.push(chart.datas[i].low);
	}
	chart.nHighChart = maxValue(highList);
	chart.nLowChart = minValue(lowList);
};

/*
* 根据坐标计算矩形
* x1:横坐标1
* y1:纵坐标1
* x2:横坐标2
* y2:纵坐标2
*/
let rectangleXYWH = function (chart, x1, y1, x2, y2) {
	chart.xChart = x1 < x2 ? x1 : x2;
	chart.yChart = y1 < y2 ? y1 : y2;
	chart.wChart = Math.abs(x1 - x2);
	chart.hChart = Math.abs(y1 - y2);
	if (chart.wChart <= 0) {
		chart.wChart = 4;
	}
	if (chart.hChart <= 0) {
		chart.hChart = 4;
	}
};

/*
* 选中直线
* chart: 图表
* mp:坐标
*/
let selectPlot = function (chart, mp) {
	let sPlot = null;
	chart.startMovePlot = false;
	chart.selectPlotPoint = -1;
	for (let i = 0; i < chart.plots.length; i++) {
		let plot = chart.plots[i];
		let index1 = 0, index2 = 0, index3 = 0;
		let mpx1 = 0, mpy1 = 0, mpx2 = 0, mpy2 = 0, mpx3 = 0, mpy3 = 0;
		//检查关键点
		if (plot.key1) {
			index1 = getChartIndexByDate(chart, plot.key1);
			mpx1 = getChartX(chart, index1);
			mpy1 = getChartY(chart, 0, plot.value1);
			if (mp.x >= mpx1 - chart.plotPointSizeChart && mp.x <= mpx1 + chart.plotPointSizeChart && mp.y >= mpy1 - chart.plotPointSizeChart && mp.y <= mpy1 + chart.plotPointSizeChart) {
				sPlot = plot;
				chart.selectPlotPoint = 0;
				break;
			}
		}
		if (plot.key2) {
			index2 = getChartIndexByDate(chart, plot.key2);
			mpx2 = getChartX(chart, index2);
			mpy2 = getChartY(chart, 0, plot.value2);
			if (mp.x >= mpx2 - chart.plotPointSizeChart && mp.x <= mpx2 + chart.plotPointSizeChart && mp.y >= mpy2 - chart.plotPointSizeChart && mp.y <= mpy2 + chart.plotPointSizeChart) {
				sPlot = plot;
				chart.selectPlotPoint = 1;
				break;
			}
		}
		if (plot.key3) {
			index3 = getChartIndexByDate(chart, plot.key3);
			mpx3 = getChartX(chart, index3);
			mpy3 = getChartY(chart, 0, plot.value3);
			if (mp.x >= mpx3 - chart.plotPointSizeChart && mp.x <= mpx3 + chart.plotPointSizeChart && mp.y >= mpy3 - chart.plotPointSizeChart && mp.y <= mpy3 + chart.plotPointSizeChart) {
				sPlot = plot;
				chart.selectPlotPoint = 2;
				break;
			}
		}
		//判断其余部分的选中
		if (chart.selectPlotPoint == -1) {
			if (plot.plotType == "Line") {
				chart.startMovePlot = selectLine(chart, mp, mpx1, mpy1, mpx2, mpy2);
			}
			else if (plot.plotType == "ArrowSegment") {
				chart.startMovePlot = selectSegment(chart, mp, mpx1, mpy1, mpx2, mpy2);
			}
			else if (plot.plotType == "AngleLine") {
				chart.startMovePlot = selectLine(chart, mp, mpx1, mpy1, mpx2, mpy2);
				if (!chart.startMovePlot) {
					chart.startMovePlot = selectLine(chart, mp, mpx1, mpy1, mpx3, mpy3);
				}
			}
			else if (plot.plotType == "Parallel") {
				chart.startMovePlot = selectLine(chart, mp, mpx1, mpy1, mpx2, mpy2);
				if (!chart.startMovePlot) {
					lineXY(chart, mpx1, mpy1, mpx2, mpy2, 0, 0);
					let newB = mpy3 - chart.kChart * mpx3;
					if (mpx2 == mpx1) {
						if (mp.x >= mpx3 - chart.plotPointSizeChart && mp.x <= mpx3 + chart.plotPointSizeChart) {
							chart.startMovePlot = true;
						}
					} else {
						let newX1 = chart.leftVScaleWidth;
						let newY1 = newX1 * chart.kChart + newB;
						let newX2 = chart.size.cx - chart.rightVScaleWidth;
						let newY2 = newX2 * chart.kChart + newB;
						chart.startMovePlot = selectLine(chart, mp, newX1, newY1, newX2, newY2);
					}
				}
			}
			else if (plot.plotType == "LRLine") {
				chart.startMovePlot = selectSegment(chart, mp, mpx1, mpy1, mpx2, mpy2);
			}
			else if (plot.plotType == "Segment") {
				chart.startMovePlot = selectSegment(chart, mp, mpx1, mpy1, mpx2, mpy2);
			} else if (plot.plotType == "Ray") {
				chart.startMovePlot = selectRay(chart, mp, mpx1, mpy1, mpx2, mpy2);
			}
			else if (plot.plotType == "Triangle") {
				chart.startMovePlot = selectSegment(chart, mp, mpx1, mpy1, mpx2, mpy2);
				if (!chart.startMovePlot) {
					chart.startMovePlot = selectSegment(chart, mp, mpx2, mpy2, mpx3, mpy3);
				}
				if (!chart.startMovePlot) {
					chart.startMovePlot = selectSegment(chart, mp, mpx1, mpy1, mpx3, mpy3);
				}
			}
			else if (plot.plotType == "SymmetricTriangle") {
				if (mpx2 != mpx1) {
					let a = (mpy2 - mpy1) / (mpx2 - mpx1);
					let b = mpy1 - a * mpx1;
					let c = -a;
					let d = mpy3 - c * mpx3;
					let leftX = chart.leftVScaleWidth;
					let leftY = leftX * a + b;
					let rightX = chart.size.cx - chart.rightVScaleWidth;
					let rightY = rightX * a + b;
					chart.startMovePlot = selectSegment(chart, mp, leftX, leftY, rightX, rightY);
					if (!chart.startMovePlot) {
						leftY = leftX * c + d;
						rightY = rightX * c + d;
						chart.startMovePlot = selectSegment(chart, mp, leftX, leftY, rightX, rightY);
					}
				} else {
					let divHeight = getCandleDivHeight(chart);
					chart.startMovePlot = selectSegment(chart, mp, mpx1, 0, mpx1, divHeight);
					if (!chart.startMovePlot) {
						chart.startMovePlot = selectSegment(chart, mp, mpx3, 0, mpx3, divHeight);
					}
				}
			}
			else if (plot.plotType == "Rect") {
				let sX1 = Math.min(mpx1, mpx2);
				let sY1 = Math.min(mpy1, mpy2);
				let sX2 = Math.max(mpx1, mpx2);
				let sY2 = Math.max(mpy1, mpy2);
				chart.startMovePlot = selectSegment(chart, mp, sX1, sY1, sX2, sY1);
				if (!chart.startMovePlot) {
					chart.startMovePlot = selectSegment(chart, mp, sX2, sY1, sX2, sY2);
				}
				if (!chart.startMovePlot) {
					chart.startMovePlot = selectSegment(chart, mp, sX1, sY2, sX2, sY2);
				}
				if (!chart.startMovePlot) {
					chart.startMovePlot = selectSegment(chart, mp, sX1, sY1, sX1, sY2);
				}
			}
			else if (plot.plotType == "BoxLine") {
				let sX1 = Math.min(mpx1, mpx2);
				let sY1 = Math.min(mpy1, mpy2);
				let sX2 = Math.max(mpx1, mpx2);
				let sY2 = Math.max(mpy1, mpy2);
				chart.startMovePlot = selectSegment(chart, mp, sX1, sY1, sX2, sY1);
				if (!chart.startMovePlot) {
					chart.startMovePlot = selectSegment(chart, mp, sX2, sY1, sX2, sY2);
				}
				if (!chart.startMovePlot) {
					chart.startMovePlot = selectSegment(chart, mp, sX1, sY2, sX2, sY2);
				}
				if (!chart.startMovePlot) {
					chart.startMovePlot = selectSegment(chart, mp, sX1, sY1, sX1, sY2);
				}
			}
			else if (plot.plotType == "TironeLevels") {
				let sX1 = Math.min(mpx1, mpx2);
				let sY1 = Math.min(mpy1, mpy2);
				let sX2 = Math.max(mpx1, mpx2);
				let sY2 = Math.max(mpy1, mpy2);
				chart.startMovePlot = selectSegment(chart, mp, sX1, sY1, sX2, sY1);
				if (!chart.startMovePlot) {
					chart.startMovePlot = selectSegment(chart, mp, sX1, sY2, sX2, sY2);
				}
			}
			else if (plot.plotType == "QuadrantLines") {
				let sX1 = Math.min(mpx1, mpx2);
				let sY1 = Math.min(mpy1, mpy2);
				let sX2 = Math.max(mpx1, mpx2);
				let sY2 = Math.max(mpy1, mpy2);
				chart.startMovePlot = selectSegment(chart, mp, sX1, sY1, sX2, sY1);
				if (!chart.startMovePlot) {
					chart.startMovePlot = selectSegment(chart, mp, sX1, sY2, sX2, sY2);
				}
			} else if (plot.plotType == "GoldenRatio") {
				let sX1 = Math.min(mpx1, mpx2);
				let sY1 = Math.min(mpy1, mpy2);
				let sX2 = Math.max(mpx1, mpx2);
				let sY2 = Math.max(mpy1, mpy2);
				let ranges = new Array();
				ranges.push(0);
				ranges.push(0.236);
				ranges.push(0.382);
				ranges.push(0.5);
				ranges.push(0.618);
				ranges.push(0.809);
				ranges.push(1);
				ranges.push(1.382);
				ranges.push(1.618);
				ranges.push(2);
				ranges.push(2.382);
				ranges.push(2.618);
				let minValue = Math.min(plot.value1, plot.value2);
				let maxValue = Math.max(plot.value1, plot.value2);
				for (let j = 0; j < ranges.length; j++) {
					let newY = sY1 <= sY2 ? sY1 + (sY2 - sY1) * ranges[j] : sY2 + (sY1 - sY2) * (1 - ranges[j]);
					chart.startMovePlot = selectSegment(chart, mp, chart.leftVScaleWidth, newY, chart.size.cx - chart.rightVScaleWidth, newY);
					if (chart.startMovePlot) {
						break;
					}
				}
			}
			else if (plot.plotType == "Cycle") {
				let r = Math.sqrt(Math.abs((mpx2 - mpx1) * (mpx2 - mpx1) + (mpy2 - mpy1) * (mpy2 - mpy1)));
				let round = (mp.x - mpx1) * (mp.x - mpx1) + (mp.y - mpy1) * (mp.y - mpy1);
				if (round / (r * r) >= 0.9 && round / (r * r) <= 1.1) {
					chart.startMovePlot = true;
				}
			} else if (plot.plotType == "CircumCycle") {
				ellipseOR(chart, mpx1, mpy1, mpx2, mpy2, mpx3, mpy3);
				let round = (mp.x - chart.oXChart) * (mp.x - chart.oXChart) + (mp.y - chart.oYChart) * (mp.y - chart.oYChart);
				if (round / (chart.rChart * chart.rChart) >= 0.9 && round / (chart.rChart * chart.rChart) <= 1.1) {
					chart.startMovePlot = true;
				}
			}
			else if (plot.plotType == "Ellipse") {
				let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
				if (mpx1 <= mpx2) {
					x1 = mpx2;
					y1 = mpy2;
					x2 = mpx1;
					y2 = mpy1;
				} else {
					x1 = mpx1;
					y1 = mpy1;
					x2 = mpx2;
					y2 = mpy2;
				}
				let x = x1 - (x1 - x2);
				let y = 0;
				let width = (x1 - x2) * 2;
				let height = 0;
				if (y1 >= y2) {
					height = (y1 - y2) * 2;
				}
				else {
					height = (y2 - y1) * 2;
				}
				y = y2 - height / 2;
				let a = width / 2;
				let b = height / 2;
				chart.startMovePlot = ellipseHasPoint(mp.x, mp.y, x + (width / 2), y + (height / 2), a, b);
			} else if (plot.plotType == "LRBand") {
				chart.startMovePlot = selectSegment(chart, mp, mpx1, mpy1, mpx2, mpy2);
				if (!chart.startMovePlot) {
					let list = new Array();
					let minIndex = Math.min(index1, index2);
					let maxIndex = Math.max(index1, index2);
					for (let j = minIndex; j <= maxIndex; j++) {
						list.push(chart.datas[j].close);
					}
					linearRegressionEquation(chart, list);
					getLRBandRange(chart, plot, chart.kChart, chart.bChart);
					mpy1 = getChartY(chart, 0, plot.value1 + chart.upSubValue);
					mpy2 = getChartY(chart, 0, plot.value2 + chart.upSubValue);
					chart.startMovePlot = selectSegment(chart, mp, mpx1, mpy1, mpx2, mpy2);
					if (!chart.startMovePlot) {
						mpy1 = getChartY(chart, 0, plot.value1 - chart.downSubValue);
						mpy2 = getChartY(chart, 0, plot.value2 - chart.downSubValue);
						chart.startMovePlot = selectSegment(chart, mp, mpx1, mpy1, mpx2, mpy2);
					}
				}
			} else if (plot.plotType == "LRChannel") {
				lineXY(chart, mpx1, mpy1, mpx2, mpy2, 0, 0);
				let rightX = chart.size.cx - chart.rightVScaleWidth;
				let rightY = rightX * chart.kChart + chart.bChart;
				chart.startMovePlot = selectSegment(chart, mp, mpx1, mpy1, rightX, rightY);
				if (!chart.startMovePlot) {
					let list = new Array();
					let minIndex = Math.min(index1, index2);
					let maxIndex = Math.max(index1, index2);
					for (let j = minIndex; j <= maxIndex; j++) {
						list.push(chart.datas[j].close);
					}
					linearRegressionEquation(chart, list);
					getLRBandRange(chart, plot, chart.kChart, chart.bChart);
					mpy1 = getChartY(chart, 0, plot.value1 + chart.upSubValue);
					mpy2 = getChartY(chart, 0, plot.value2 + chart.upSubValue);
					lineXY(chart, mpx1, mpy1, mpx2, mpy2, 0, 0);
					rightY = rightX * chart.kChart + chart.bChart;
					chart.startMovePlot = selectSegment(chart, mp, mpx1, mpy1, rightX, rightY);
					if (!chart.startMovePlot) {
						mpy1 = getChartY(chart, 0, plot.value1 - chart.downSubValue);
						mpy2 = getChartY(chart, 0, plot.value2 - chart.downSubValue);
						lineXY(chart, mpx1, mpy1, mpx2, mpy2, 0, 0);
						rightY = rightX * chart.kChart + chart.bChart;
						chart.startMovePlot = selectSegment(chart, mp, mpx1, mpy1, rightX, rightY);
					}
				}
			} else if (plot.plotType == "ParalleGram") {
				parallelogram(chart, mpx1, mpy1, mpx2, mpy2, mpx3, mpy3);
				chart.startMovePlot = selectSegment(chart, mp, mpx1, mpy1, mpx2, mpy2);
				if (!chart.startMovePlot) {
					chart.startMovePlot = selectSegment(chart, mp, mpx2, mpy2, mpx3, mpy3);
					if (!chart.startMovePlot) {
						chart.startMovePlot = selectSegment(chart, mp, mpx3, mpy3, chart.x4Chart, chart.y4Chart);
						if (!chart.startMovePlot) {
							chart.startMovePlot = selectSegment(chart, mp, chart.x4Chart, chart.y4Chart, mpx1, mpy1);
						}
					}
				}
			}
			else if (plot.plotType == "SpeedResist") {
				chart.startMovePlot = selectSegment(chart, mp, mpx1, mpy1, mpx2, mpy2);
				if (!chart.startMovePlot) {
					if (mpx1 != mpx2 && mpy1 != mpy2) {
						let firstP = new FCPoint(mpx2, mpy2 - (mpy2 - mpy1) / 3);
						let secondP = new FCPoint(mpx2, mpy2 - (mpy2 - mpy1) * 2 / 3);
						let startP = new FCPoint(mpx1, mpy1);
						let fK = 0, fB = 0, sK = 0, sB = 0;
						lineXY(chart, startP.x, startP.y, firstP.x, firstP.y, 0, 0);
						fK = chart.kChart;
						fB = chart.bChart;
						lineXY(chart, startP.x, startP.y, secondP.x, secondP.y, 0, 0);
						sK = chart.kChart;
						sB = chart.bChart;
						let newYF = 0, newYS = 0;
						let newX = 0;
						if (mpx2 > mpx1) {
							newYF = fK * (chart.size.cx - chart.rightVScaleWidth) + fB;
							newYS = sK * (chart.size.cx - chart.rightVScaleWidth) + sB;
							newX = (chart.size.cx - chart.rightVScaleWidth);
						}
						else {
							newYF = fB;
							newYS = sB;
							newX = chart.leftVScaleWidth;
						}
						chart.startMovePlot = selectSegment(chart, mp, startP.x, startP.y, newX, newYF);
						if (!chart.startMovePlot) {
							chart.startMovePlot = selectSegment(chart, mp, startP.x, startP.y, newX, newYS);
						}
					}
				}
			} else if (plot.plotType == "FiboFanline") {
				chart.startMovePlot = selectSegment(chart, mp, mpx1, mpy1, mpx2, mpy2);
				if (!chart.startMovePlot) {
					if (mpx1 != mpx2 && mpy1 != mpy2) {
						let firstP = new FCPoint(mpx2, mpy2 - (mpy2 - mpy1) * 0.382);
						let secondP = new FCPoint(mpx2, mpy2 - (mpy2 - mpy1) * 0.5);
						let thirdP = new FCPoint(mpx2, mpy2 - (mpy2 - mpy1) * 0.618);
						let startP = new FCPoint(mpx1, mpy1);
						let listP = new Array();
						listP.push(firstP);
						listP.push(secondP);
						listP.push(thirdP);
						let listSize = listP.length;
						for (let j = 0; j < listSize; j++) {
							lineXY(chart, startP.x, startP.y, listP[j].x, listP[j].y, 0, 0);
							let newX = 0;
							let newY = 0;
							if (mpx2 > mpx1) {
								newY = chart.kChart * (chart.size.cx - chart.rightVScaleWidth) + chart.bChart;
								newX = (chart.size.cx - chart.rightVScaleWidth);
							}
							else {
								newY = chart.bChart;
								newX = chart.leftVScaleWidth;
							}
							chart.startMovePlot = selectSegment(chart, mp, startP.x, startP.y, newX, newY);
							if (chart.startMovePlot) {
								break;
							}
						}
					}
				}
			}
			else if (plot.plotType == "FiboTimezone") {
				let fValue = 1;
				let aIndex = index1;
				let pos = 1;
				let divHeight = getCandleDivHeight(chart);
				chart.startMovePlot = selectSegment(chart, mp, mpx1, 0, mpx1, divHeight);
				if (!chart.startMovePlot) {
					while (aIndex + fValue <= chart.lastVisibleIndex) {
						fValue = fibonacciValue(pos);
						let newIndex = aIndex + fValue;
						let newX = getChartX(chart, newIndex);
						chart.startMovePlot = selectSegment(chart, mp, newX, 0, newX, divHeight);
						if (chart.startMovePlot) {
							break;
						}
						pos++;
					}
				}
			}
			else if (plot.plotType == "Percent") {
				let list = getPercentParams(mpy1, mpy2);
				for (let j = 0; j < list.length; j++) {
					chart.startMovePlot = selectSegment(chart, mp, chart.leftVScaleWidth, list[j], chart.size.cx - chart.rightVScaleWidth, list[j]);
					if (chart.startMovePlot) {
						break;
					}
				}
			}
			if (chart.startMovePlot) {
				sPlot = plot;
				plot.startKey1 = plot.key1;
				plot.startValue1 = plot.value1;
				plot.startKey2 = plot.key2;
				plot.startValue2 = plot.value2;
				plot.startKey3 = plot.key3;
				plot.startValue3 = plot.value3;
				break;
			}
		}
	}
	return sPlot;
};

/*
* 添加画线
* chart: 图表
* firstTouch:是否第一次触摸
* firstPoint:第一次触摸的坐标
* secondTouch:是否第二次触摸
* secondPoint:第二次触摸的坐标
*/
let addPlotDefault = function (chart, firstTouch, firstPoint, secondTouch, secondPoint) {
	let mp = firstPoint;
	if (mp.y < getCandleDivHeight(chart)) {
		let touchIndex = getChartIndex(chart, mp);
		if (touchIndex >= chart.firstVisibleIndex && touchIndex <= chart.lastVisibleIndex) {
			if (chart.addingPlot == "FiboTimezone") {
				let fIndex = touchIndex;
				let fDate = getChartDateByIndex(chart, fIndex);
				let y = getChartValue(chart, mp);
				let newPlot = new FCPlot;
				if (chart.paint.defaultUIStyle == "light") {
					newPlot.lineColor = "rgb(0,0,0)";
					newPlot.pointColor = "rgba(0,0,0,125)";
				} else {
					newPlot.lineColor = "rgb(255,255,255)";
					newPlot.pointColor = "rgba(255,255,255,125)";
				}
				newPlot.key1 = fDate;
				newPlot.value1 = y;
				newPlot.plotType = chart.addingPlot;
				chart.plots.push(newPlot);
				chart.sPlot = selectPlot(chart, mp);
			}
			else if (chart.addingPlot == "Triangle" || chart.addingPlot == "CircumCycle" || chart.addingPlot == "ParalleGram" || chart.addingPlot == "AngleLine" || chart.addingPlot == "Parallel" || chart.addingPlot == "SymmetricTriangle") {
				let eIndex = touchIndex;
				let bIndex = eIndex - 5;
				if (bIndex >= 0) {
					let fDate = getChartDateByIndex(chart, bIndex);
					let sDate = getChartDateByIndex(chart, eIndex);
					let y = getChartValue(chart, mp);
					let newPlot = new FCPlot;
					if (chart.paint.defaultUIStyle == "light") {
						newPlot.lineColor = "rgb(0,0,0)";
						newPlot.pointColor = "rgba(0,0,0,125)";
					} else {
						newPlot.lineColor = "rgb(255,255,255)";
						newPlot.pointColor = "rgba(255,255,255,125)";
					}
					newPlot.key1 = fDate;
					newPlot.value1 = y;
					newPlot.key2 = sDate;
					newPlot.value2 = y;
					newPlot.key3 = sDate;
					newPlot.value3 = chart.candleMin + (chart.candleMax - chart.candleMin) / 2;
					newPlot.plotType = chart.addingPlot;
					chart.plots.push(newPlot);
					chart.sPlot = selectPlot(chart, mp);
				}
			} else {
				let eIndex = touchIndex;
				let bIndex = eIndex - 5;
				if (bIndex >= 0) {
					let fDate = getChartDateByIndex(chart, bIndex);
					let sDate = getChartDateByIndex(chart, eIndex);
					let y = getChartValue(chart, mp);
					let newPlot = new FCPlot;
					if (chart.paint.defaultUIStyle == "light") {
						newPlot.lineColor = "rgb(0,0,0)";
						newPlot.pointColor = "rgba(0,0,0,125)";
					} else {
						newPlot.lineColor = "rgb(255,255,255)";
						newPlot.pointColor = "rgba(255,255,255,125)";
					}
					newPlot.key1 = fDate;
					newPlot.value1 = y;
					newPlot.key2 = sDate;
					newPlot.value2 = y;
					newPlot.plotType = chart.addingPlot;
					chart.plots.push(newPlot);
					chart.sPlot = selectPlot(chart, mp);
				}
			}
		}
	}
};

/*
* 图表的鼠标按下方法
* chart: 图表
* firstTouch:是否第一次触摸
* firstPoint:第一次触摸的坐标
* secondTouch:是否第二次触摸
* secondPoint:第二次触摸的坐标
*/
let touchDownChart = function (chart, firstTouch, firstPoint, secondTouch, secondPoint) {
	let mp = firstPoint;
	chart.touchDownPoint = mp;
	chart.targetOldX = 0;
	chart.targetOldX2 = 0;
	chart.crossStopIndex = getChartIndex(chart, mp);
	chart.selectShape = "";
	chart.selectShapeEx = "";
	if (chart.datas && chart.datas.length > 0) {
		chart.sPlot = selectPlot(chart, mp);
		if (chart.allowSelectShape && !chart.sPlot) {
			selectShape(chart, mp);
		}
	}
	if(chart.paint.isDoubleClick){
		chart.showCrossLine = !chart.showCrossLine;
	}
};

/*
*左滚
*chart:图表
*step:步长
*/
let scrollLeftChart = function(chart, step){
	chart.targetOldX = 0;
	chart.targetOldX2 = 0;
	if(chart.showCrossLine){
		chart.crossStopIndex = chart.crossStopIndex - step;
		if(chart.crossStopIndex >= chart.firstVisibleIndex){
			step = 0;
		}
		else if(chart.crossStopIndex < 0){
			chart.crossStopIndex = 0;
		}
	}
	if(step > 0){
		let subIndex = chart.lastVisibleIndex - chart.firstVisibleIndex;
		let fIndex = chart.firstVisibleIndex - step;
		if(fIndex < 0){
			fIndex = 0;
		}
		let eIndex = fIndex + subIndex;
		chart.firstVisibleIndex = fIndex;
		chart.lastVisibleIndex = eIndex;
	}
	checkChartLastVisibleIndex(chart)
	if(chart.onCalculateChartMaxMin){
		chart.onCalculateChartMaxMin(chart);
	}
	else if (chart.paint.onCalculateChartMaxMin) {
		chart.paint.onCalculateChartMaxMin(chart);
	} else {
		calculateChartMaxMin(chart);
	}
}

/*
*右滚
*chart:图表
*step:步长
*/
let scrollRightChart = function(chart, step){
	chart.targetOldX = 0;
	chart.targetOldX2 = 0;
	let dataCount = chart.datas.length;
	if(chart.showCrossLine){
		chart.crossStopIndex = chart.crossStopIndex + step;
		if(chart.crossStopIndex <= chart.lastVisibleIndex){
			step = 0;
		}
		else if(chart.crossStopIndex > dataCount - 1){
			chart.crossStopIndex = dataCount - 1;
		}
	}
	if(step > 0){
		let subIndex = chart.lastVisibleIndex - chart.firstVisibleIndex;
		let eIndex = chart.lastVisibleIndex + step;
		if(eIndex > dataCount - 1){
			eIndex = dataCount - 1;
		}
		let fIndex = eIndex - subIndex;
		chart.firstVisibleIndex = fIndex;
		chart.lastVisibleIndex = eIndex;
	}
	checkChartLastVisibleIndex(chart)
	if(chart.onCalculateChartMaxMin){
		chart.onCalculateChartMaxMin(chart);
	}
	else if (chart.paint.onCalculateChartMaxMin) {
		chart.paint.onCalculateChartMaxMin(chart);
	} else {
		calculateChartMaxMin(chart);
	}
}

/*
*图表的键盘按下事件
*chart:图表
*key:按键
*/
let keyDownChart = function(chart, key){
	if (key == 'ArrowUp'){
		zoomOutChart(chart);
	}else if(key == 'ArrowDown'){
		zoomInChart(chart);
	}else if(key == 'ArrowLeft'){
		scrollLeftChart(chart, 1);
	}else if(key == 'ArrowRight'){
		scrollRightChart(chart, 1);
	}
};

/*
* 图表的鼠标移动方法
* chart: 图表
* firstTouch:是否第一次触摸
* firstPoint:第一次触摸的坐标
* secondTouch:是否第二次触摸
* secondPoint:第二次触摸的坐标
*/
let touchMoveChart = function (chart, firstTouch, firstPoint, secondTouch, secondPoint) {
	if (!chart.datas || chart.datas.length == 0) {
		return;
	}
	let mp = firstPoint;
	chart.targetOldX = 0;
	chart.targetOldX2 = 0;
	chart.crossStopIndex = getChartIndex(chart, mp);
	chart.touchPosition = mp;
	if (firstTouch && chart.sPlot) {
		let newIndex = getChartIndex(chart, mp);
		if (newIndex >= 0 && newIndex < chart.datas.length) {
			let newDate = getChartDateByIndex(chart, newIndex);
			let newValue = getCandleDivValue(chart, mp);
			if (chart.selectPlotPoint == 0) {
				chart.sPlot.key1 = newDate;
				chart.sPlot.value1 = newValue;
			} else if (chart.selectPlotPoint == 1) {
				chart.sPlot.key2 = newDate;
				chart.sPlot.value2 = newValue;
			} else if (chart.selectPlotPoint == 2) {
				chart.sPlot.key3 = newDate;
				chart.sPlot.value3 = newValue;
			}
			else if (chart.startMovePlot) {
				let bValue = getCandleDivValue(chart, chart.touchDownPoint);
				let bIndex = getChartIndex(chart, chart.touchDownPoint);
				if (chart.sPlot.key1) {
					chart.sPlot.value1 = chart.sPlot.startValue1 + (newValue - bValue);
					let startIndex1 = getChartIndexByDate(chart, chart.sPlot.startKey1);
					let newIndex1 = startIndex1 + (newIndex - bIndex);
					if (newIndex1 < 0) {
						newIndex1 = 0;
					}
					else if (newIndex1 > chart.datas.length - 1) {
						newIndex1 = chart.datas.length - 1;
					}
					chart.sPlot.key1 = getChartDateByIndex(chart, newIndex1);
				}
				if (chart.sPlot.key2) {
					chart.sPlot.value2 = chart.sPlot.startValue2 + (newValue - bValue);
					let startIndex2 = getChartIndexByDate(chart, chart.sPlot.startKey2);
					let newIndex2 = startIndex2 + (newIndex - bIndex);
					if (newIndex2 < 0) {
						newIndex2 = 0;
					}
					else if (newIndex2 > chart.datas.length - 1) {
						newIndex2 = chart.datas.length - 1;
					}
					chart.sPlot.key2 = getChartDateByIndex(chart, newIndex2);
				}
				if (chart.sPlot.key3) {
					chart.sPlot.value3 = chart.sPlot.startValue3 + (newValue - bValue);
					let startIndex3 = getChartIndexByDate(chart, chart.sPlot.startKey3);
					let newIndex3 = startIndex3 + (newIndex - bIndex);
					if (newIndex3 < 0) {
						newIndex3 = 0;
					}
					else if (newIndex3 > chart.datas.length - 1) {
						newIndex3 = chart.datas.length - 1;
					}
					chart.sPlot.key3 = getChartDateByIndex(chart, newIndex3);
				}
			}
		}
		return;
	}
	if (firstTouch && secondTouch) {
		if (firstPoint.x > secondPoint.x) {
			chart.firstTouchPointCache = secondPoint;
			chart.secondTouchPointCache = firstPoint;
		} else {
			chart.firstTouchPointCache = firstPoint;
			chart.secondTouchPointCache = secondPoint;
		}
		if (chart.firstTouchIndexCache == -1 || chart.secondTouchIndexCache == -1) {
			chart.firstTouchIndexCache = getChartIndex(chart, chart.firstTouchPointCache);
			chart.secondTouchIndexCache = getChartIndex(chart, chart.secondTouchPointCache);
			chart.firstIndexCache = chart.firstVisibleIndex;
			chart.lastIndexCache = chart.lastVisibleIndex;
		}
	} else if (firstTouch) {
		chart.secondTouchIndexCache = -1;
		if (chart.firstTouchIndexCache == -1) {
			chart.firstTouchPointCache = firstPoint;
			chart.firstTouchIndexCache = getChartIndex(chart, chart.firstTouchPointCache);
			chart.firstIndexCache = chart.firstVisibleIndex;
			chart.lastIndexCache = chart.lastVisibleIndex;
			chart.firstPaddingTop = chart.candlePaddingTop;
			chart.firtstPaddingBottom = chart.candlePaddingBottom;
		}
	}

	if (firstTouch && secondTouch) {
		if (chart.firstTouchIndexCache != -1 && chart.secondTouchIndexCache != -1) {
			let fPoint = firstPoint;
			let sPoint = secondPoint;
			if (firstPoint.x > secondPoint.x) {
				fPoint = secondPoint;
				sPoint = firstPoint;;
			}
			let subX = Math.abs(sPoint.x - fPoint.x);
			let subIndex = Math.abs(chart.secondTouchIndexCache - chart.firstTouchIndexCache);
			if (subX > 0 && subIndex > 0) {
				let newScalePixel = subX / subIndex;
				if (newScalePixel >= 3) {
					let intScalePixel = parseInt(newScalePixel);
					newScalePixel = intScalePixel;
				}
				if (newScalePixel != chart.hScalePixel) {
					let newFirstIndex = chart.firstTouchIndexCache;
					let thisX = fPoint.x;
					thisX -= newScalePixel;
					while (thisX > chart.leftVScaleWidth + newScalePixel) {
						newFirstIndex--;
						if (newFirstIndex < 0) {
							newFirstIndex = 0;
							break;
						}
						thisX -= newScalePixel;
					}

					thisX = sPoint.x;
					let newSecondIndex = chart.secondTouchIndexCache;
					thisX += newScalePixel;
					while (thisX < chart.size.cx - chart.rightVScaleWidth - newScalePixel) {
						newSecondIndex++;
						if (newSecondIndex > chart.datas.length - 1) {
							newSecondIndex = chart.datas.length - 1;
							break;
						}
						thisX += newScalePixel;
					}
					setChartVisibleIndex(chart, newFirstIndex, newSecondIndex);
					let maxVisibleRecord = getChartMaxVisibleCount(chart, chart.hScalePixel, getChartWorkAreaWidth(chart));
					while (maxVisibleRecord < chart.lastVisibleIndex - chart.firstVisibleIndex + 1
						&& chart.lastVisibleIndex > chart.firstVisibleIndex) {
						chart.lastVisibleIndex--;
					}
					checkChartLastVisibleIndex(chart);
					resetChartVisibleRecord(chart);
					if(chart.onCalculateChartMaxMin){
						chart.onCalculateChartMaxMin(chart);
					}
					else if (chart.paint.onCalculateChartMaxMin) {
						chart.paint.onCalculateChartMaxMin(chart);
					} else {
						calculateChartMaxMin(chart);
					}
				}
			}
		}
	} else if (firstTouch) {
		if(!chart.autoFillHScale){
			let subIndex = parseInt((chart.firstTouchPointCache.x - firstPoint.x) / chart.hScalePixel);
			if (chart.allowDragChartDiv) {
				chart.candlePaddingTop = chart.firstPaddingTop - (chart.firstTouchPointCache.y - firstPoint.y);
				chart.candlePaddingBottom = chart.firtstPaddingBottom + (chart.firstTouchPointCache.y - firstPoint.y);
			}
			let fIndex = chart.firstIndexCache + subIndex;
			let lIndex = chart.lastIndexCache + subIndex;
			if(fIndex > chart.datas.length - 1){
				fIndex = chart.datas.length - 1;
				lIndex = chart.datas.length - 1;
			}
			chart.firstVisibleIndex = fIndex;
			chart.lastVisibleIndex = lIndex;
			checkChartLastVisibleIndex(chart);
			if(chart.onCalculateChartMaxMin){
				chart.onCalculateChartMaxMin(chart);
			}
			else if (chart.paint.onCalculateChartMaxMin) {
				chart.paint.onCalculateChartMaxMin(chart);
			} else {
				calculateChartMaxMin(chart);
			}
		}
	}
};

/*
* 图表的鼠标抬起方法
* chart: 图表
* firstTouch:是否第一次触摸
* firstPoint:第一次触摸的坐标
* secondTouch:是否第二次触摸
* secondPoint:第二次触摸的坐标
*/
let touchUpChart = function (chart, firstTouch, firstPoint, secondTouch, secondPoint) {
	chart.firstTouchIndexCache = -1;
	chart.secondTouchIndexCache = -1;
};

/*
* 计算线性回归上下限
* chart:图表
* plot:画线
* a:直线k
* b:直线b
*/
let getLRBandRange = function (chart, plot, a, b) {
	let bIndex = getChartIndexByDate(chart, plot.key1);
	let eIndex = getChartIndexByDate(chart, plot.key2);
	let tempBIndex = Math.min(bIndex, eIndex);
	let tempEIndex = Math.max(bIndex, eIndex);
	bIndex = tempBIndex;
	eIndex = tempEIndex;
	let upList = new Array();
	let downList = new Array();
	for (let i = bIndex; i <= eIndex; i++) {
		let high = chart.datas[i].high;
		let low = chart.datas[i].low;
		let midValue = (i - bIndex + 1) * a + b;
		upList.push(high - midValue);
		downList.push(midValue - low);
	}
	chart.upSubValue = maxValue(upList);
	chart.downSubValue = maxValue(downList);
};

/*
* 根据位置计算索引
* chart:图表
* mp:坐标
*/
let getChartIndex = function (chart, mp) {
	if (chart.datas && chart.datas.length == 0) {
		return -1;
	}
	if (mp.x <= 0) {
		return 0;
	}
	let intX = parseInt(mp.x - chart.leftVScaleWidth - chart.hScalePixel - chart.offsetX);
	if(intX < 0){
		intX = 0;
	}
	let index = parseInt(chart.firstVisibleIndex + intX / chart.hScalePixel);
	if (intX % chart.hScalePixel != 0) {
		index++;
	}
	if (index < 0) {
		index = 0;
	} else if (chart.datas && index > chart.datas.length - 1) {
		index = chart.datas.length - 1;
	}
	return index;
};

/*
* 获取最大显示记录条数
* chart:图表
* hScalePixel:间隔
* pureH:横向距离
*/
let getChartMaxVisibleCount = function (chart, hScalePixel, pureH) {
	let count = parseInt(pureH / hScalePixel);
	if (count < 0) {
		count = 0;
	}
	return count;
};

/*
* 获取图表层的高度
* chart:图表
*/
let getCandleDivHeight = function (chart) {
	let height = chart.size.cy - chart.hScaleHeight;
	if (height > 0) {
		return height * chart.candleDivPercent;
	} else {
		return 0;
	}
};

/*
* 获取成交量层的高度
* chart:图表
*/
let getVolDivHeight = function (chart) {
	let height = chart.size.cy - chart.hScaleHeight;
	if (height > 0) {
		return height * chart.volDivPercent;
	} else {
		return 0;
	}
};

/*
* 获取指标层的高度
* chart:图表
*/
let getIndDivHeight = function (chart) {
	let height = chart.size.cy - chart.hScaleHeight;
	if (height > 0) {
		return height * chart.indDivPercent;
	} else {
		return 0;
	}
};

/*
* 获取指标层2的高度
* chart:图表
*/
let getIndDivHeight2 = function (chart) {
	let height = chart.size.cy - chart.hScaleHeight;
	if (height > 0) {
		return height * chart.indDivPercent2;
	} else {
		return 0;
	}
};

/*
* 获取横向工作区
* chart:图表
*/
let getChartWorkAreaWidth = function (chart) {
	return chart.size.cx - chart.leftVScaleWidth - chart.rightVScaleWidth - chart.rightSpace - chart.offsetX;
};

/*
* 根据索引获取横坐标
* chart:图表
* index:索引
*/
let getChartX = function (chart, index) {
	return chart.leftVScaleWidth + (index - chart.firstVisibleIndex) * chart.hScalePixel + chart.hScalePixel / 2 + chart.offsetX;
};

/*
* 根据日期获取索引
* chart:图表
* date:日期
*/
let getChartIndexByDate = function (chart, date) {
	let index = -1;
	for (let i = 0; i < chart.datas.length; i++) {
		if (chart.datas[i].date == date) {
			index = i;
			break;
		}
	}
	return index;
};

/*
* 根据索引获取日期
* chart:图表
* index:索引
*/
let getChartDateByIndex = function (chart, index) {
	let date = 0;
	if (index >= 0 && index < chart.datas.length) {
		date = chart.datas[index].date;
	}
	return date;
};

/*
* 计算数值在层中的位置
* chart:图表
* divIndex:所在层
* value:数值
*/
let getChartY = function (chart, divIndex, value) {
	if (divIndex == 0) {
		if (chart.candleMax > chart.candleMin) {
			let cValue = value, cMax = chart.candleMax, cMin = chart.candleMin;
			if (chart.vScaleType != "standard") {
				if (cValue > 0) {
					cValue = Math.log10(cValue);
				} else if (cValue < 0) {
					cValue = -Math.log10(Math.abs(cValue));
				}
				if (cMax > 0) {
					cMax = Math.log10(cMax);
				} else if (cMax < 0) {
					cMax = -Math.log10(Math.abs(cMax));
				}
				if (cMin > 0) {
					cMin = Math.log10(cMin);
				} else if (cMin < 0) {
					cMin = -Math.log10(Math.abs(cMin));
				}
			}
			let rate = (cValue - cMin) / (cMax - cMin);
			let divHeight = getCandleDivHeight(chart);
			return divHeight - chart.candlePaddingBottom - (divHeight - chart.candlePaddingTop - chart.candlePaddingBottom) * rate;
		} else {
			return 0;
		}
	} else if (divIndex == 1) {
		if (chart.volMax > chart.volMin) {
			let rate = (value - chart.volMin) / (chart.volMax - chart.volMin);
			let candleHeight = getCandleDivHeight(chart);
			let volHeight = getVolDivHeight(chart);
			return candleHeight + volHeight - chart.volPaddingBottom - (volHeight - chart.volPaddingTop - chart.volPaddingBottom) * rate;
		} else {
			return 0;
		}
	} else if (divIndex == 2) {
		if (chart.indMax > chart.indMin) {
			let rate = (value - chart.indMin) / (chart.indMax - chart.indMin);
			let candleHeight = getCandleDivHeight(chart);
			let volHeight = getVolDivHeight(chart);
			let indHeight = getIndDivHeight(chart);
			return candleHeight + volHeight + indHeight - chart.indPaddingBottom - (indHeight - chart.indPaddingTop - chart.indPaddingBottom) * rate;
		} else {
			return 0;
		}
	}
	else if (divIndex == 3) {
		if (chart.indMax2 > chart.indMin2) {
			let rate = (value - chart.indMin2) / (chart.indMax2 - chart.indMin2);
			let candleHeight = getCandleDivHeight(chart);
			let volHeight = getVolDivHeight(chart);
			let indHeight = getIndDivHeight(chart);
			let indHeight2 = getIndDivHeight2(chart);
			return candleHeight + volHeight + indHeight + indHeight2 - chart.indPaddingBottom2 - (indHeight2 - chart.indPaddingTop2 - chart.indPaddingBottom2) * rate;
		} else {
			return 0;
		}
	}
	return 0;
};

/*
* 计算数值在层中的右轴位置
* chart:图表
* divIndex:所在层
* chart:数值
*/
let getChartYInRight = function (chart, divIndex, value) {
	if (divIndex == 0) {
		if (chart.candleMaxRight > chart.candleMinRight) {
			let cValue = value, cMax = chart.candleMaxRight, cMin = chart.candleMinRight;
			if (chart.vScaleType != "standard") {
				if (cValue > 0) {
					cValue = Math.log10(cValue);
				} else if (cValue < 0) {
					cValue = -Math.log10(Math.abs(cValue));
				}
				if (cMax > 0) {
					cMax = Math.log10(cMax);
				} else if (cMax < 0) {
					cMax = -Math.log10(Math.abs(cMax));
				}
				if (cMin > 0) {
					cMin = Math.log10(cMin);
				} else if (cMin < 0) {
					cMin = -Math.log10(Math.abs(cMin));
				}
			}
			let rate = (cValue - cMin) / (cMax - cMin);
			let divHeight = getCandleDivHeight(chart);
			return divHeight - chart.candlePaddingBottom - (divHeight - chart.candlePaddingTop - chart.candlePaddingBottom) * rate;
		} else {
			return 0;
		}
	} else if (divIndex == 1) {
		if (chart.volMaxRight > chart.volMinRight) {
			let rate = (value - chart.volMinRight) / (chart.volMaxRight - chart.volMinRight);
			let candleHeight = getCandleDivHeight(chart);
			let volHeight = getVolDivHeight(chart);
			return candleHeight + volHeight - chart.volPaddingBottom - (volHeight - chart.volPaddingTop - chart.volPaddingBottom) * rate;
		} else {
			return 0;
		}
	} else if (divIndex == 2) {
		if (chart.indMaxRight > chart.indMinRight) {
			let rate = (value - chart.indMinRight) / (chart.indMaxRight - chart.indMinRight);
			let candleHeight = getCandleDivHeight(chart);
			let volHeight = getVolDivHeight(chart);
			let indHeight = getIndDivHeight(chart);
			return candleHeight + volHeight + indHeight - chart.indPaddingBottom - (indHeight - chart.indPaddingTop - chart.indPaddingBottom) * rate;
		} else {
			return 0;
		}
	}
	else if (divIndex == 3) {
		if (chart.indMax2Right > chart.indMin2Right) {
			let rate = (value - chart.indMin2Right) / (chart.indMax2Right - chart.indMin2Right);
			let candleHeight = getCandleDivHeight(chart);
			let volHeight = getVolDivHeight(chart);
			let indHeight = getIndDivHeight(chart);
			let indHeight2 = getIndDivHeight2(chart);
			return candleHeight + volHeight + indHeight + indHeight2 - chart.indPaddingBottom2 - (indHeight2 - chart.indPaddingTop2 - chart.indPaddingBottom2) * rate;
		} else {
			return 0;
		}
	}
	return 0;
};

/*
* 根据坐标获取对应的值
* chart:图表
* point:坐标
*/
let getChartValue = function (chart, point) {
	let candleHeight = getCandleDivHeight(chart);
	let volHeight = getVolDivHeight(chart);
	let indHeight = getIndDivHeight(chart);
	let indHeight2 = getIndDivHeight(chart);
	if (point.y <= candleHeight) {
		if(candleHeight - chart.candlePaddingTop - chart.candlePaddingBottom > 0){
			let rate = (candleHeight - chart.candlePaddingBottom - point.y) / (candleHeight - chart.candlePaddingTop - chart.candlePaddingBottom);
			let cMin = chart.candleMin, cMax = chart.candleMax;
			if (chart.vScaleType != "standard") {
				if (cMax > 0) {
					cMax = Math.log10(cMax);
				} else if (cMax < 0) {
					cMax = -Math.log10(Math.abs(cMax));
				}
				if (cMin > 0) {
					cMin = Math.log10(cMin);
				} else if (cMin < 0) {
					cMin = -Math.log10(Math.abs(cMin));
				}
			}
			let result = cMin + (cMax - cMin) * rate;
			if (chart.vScaleType != "standard") {
				return Math.pow(10, result);
			} else {
				return result;
			}
		}
	}
	else if (point.y > candleHeight && point.y <= candleHeight + volHeight) {
		if(volHeight - chart.volPaddingTop - chart.volPaddingBottom > 0){
			let rate = (volHeight - chart.volPaddingBottom - (point.y - candleHeight)) / (volHeight - chart.volPaddingTop - chart.volPaddingBottom);
			return chart.volMin + (chart.volMax - chart.volMin) * rate;
		}
	} else if (point.y > candleHeight + volHeight && point.y <= candleHeight + volHeight + indHeight) {
		if(indHeight - chart.indPaddingTop - chart.indPaddingBottom > 0){
			let rate = (indHeight - chart.indPaddingBottom - (point.y - candleHeight - volHeight)) / (indHeight - chart.indPaddingTop - chart.indPaddingBottom);
			return chart.indMin + (chart.indMax - chart.indMin) * rate;
		}
	} else if (point.y > candleHeight + volHeight + indHeight && point.y <= candleHeight + volHeight + indHeight + indHeight2) {
		if(indHeight2 - chart.indPaddingTop2 - chart.indPaddingBottom2 > 0){
			let rate = (indHeight2 - chart.indPaddingBottom2 - (point.y - candleHeight - volHeight - indHeight)) / (indHeight2 - chart.indPaddingTop2 - chart.indPaddingBottom2);
			return chart.indMin2 + (chart.indMax2 - chart.indMin2) * rate;
		}
	}
	return 0;
}

/*
* 根据坐标获取对应的值
* chart:图表
* point:坐标
*/
let getCandleDivValue = function (chart, point) {
	let candleHeight = getCandleDivHeight(chart);
	let rate = 0;
	if(candleHeight - chart.candlePaddingTop - chart.candlePaddingBottom > 0){
		rate = (candleHeight - chart.candlePaddingBottom - point.y) / (candleHeight - chart.candlePaddingTop - chart.candlePaddingBottom);
	}
	let cMin = chart.candleMin, cMax = chart.candleMax;
	if (chart.vScaleType != "standard") {
		if (cMax > 0) {
			cMax = Math.log10(cMax);
		} else if (cMax < 0) {
			cMax = -Math.log10(Math.abs(cMax));
		}
		if (cMin > 0) {
			cMin = Math.log10(cMin);
		} else if (cMin < 0) {
			cMin = -Math.log10(Math.abs(cMin));
		}
	}
	let result = cMin + (cMax - cMin) * rate;
	if (chart.vScaleType != "standard") {
		return Math.pow(10, result);
	} else {
		return result;
	}
}

/*
* 检查最后可见索引
* chart:图表
*/
let checkChartLastVisibleIndex = function (chart) {
	if(chart.datas){
		let dataCount = chart.datas.length;
		let workingAreaWidth = getChartWorkAreaWidth(chart);
		let maxVisibleRecord = getChartMaxVisibleCount(chart, chart.hScalePixel, workingAreaWidth);
		if(chart.firstVisibleIndex < 0){
			chart.firstVisibleIndex = 0;
		}
		if(chart.lastVisibleIndex >= chart.firstVisibleIndex + maxVisibleRecord - 1 || chart.lastVisibleIndex < dataCount - 1){
			chart.lastVisibleIndex = chart.firstVisibleIndex + maxVisibleRecord - 1;
		}
		if(chart.lastVisibleIndex > dataCount - 1){
			chart.lastVisibleIndex = dataCount - 1;
		}
	}
	if (chart.datas && chart.datas.length > 0 && chart.lastVisibleIndex != -1) {
		chart.lastVisibleKey = chart.datas[chart.lastVisibleIndex].date;
		if (chart.lastVisibleIndex == chart.datas.length - 1) {
			chart.lastRecordIsVisible = true;
		} else {
			chart.lastRecordIsVisible = false;
		}
	} else {
		chart.lastVisibleKey = 0;
		chart.lastRecordIsVisible = true;
	}
};

/*
* 自动设置首先可见和最后可见的记录号
* chart:图表
*/
let resetChartVisibleRecord = function (chart) {
	if (chart.datas) {
		let rowsCount = chart.datas.length;
		let workingAreaWidth = getChartWorkAreaWidth(chart);
		if (chart.autoFillHScale) {
			if (workingAreaWidth > 0 && rowsCount > 0) {
				chart.hScalePixel = workingAreaWidth / rowsCount;
				chart.firstVisibleIndex = 0;
				chart.lastVisibleIndex = rowsCount - 1;
			}
		} else {
			let maxVisibleRecord = getChartMaxVisibleCount(chart, chart.hScalePixel, workingAreaWidth);
			//没数据时重置
			if (rowsCount == 0) {
				chart.firstVisibleIndex = -1;
				chart.lastVisibleIndex = -1;
			} else {
				//数据不足一屏时
				if (rowsCount < maxVisibleRecord) {
					chart.lastVisibleIndex = rowsCount - 1;
					chart.firstVisibleIndex = 0;
				}
				//数据超过一屏时
				else {
					//显示中间的数据时
					if (chart.firstVisibleIndex != -1 && chart.lastVisibleIndex != -1 && !chart.lastRecordIsVisible) {
						let index = getChartIndexByDate(chart, chart.lastVisibleKey);
						if (index != -1) {
							chart.lastVisibleIndex = index;
						}
						chart.firstVisibleIndex = chart.lastVisibleIndex - maxVisibleRecord + 1;
						if (chart.firstVisibleIndex < 0) {
							chart.firstVisibleIndex = 0;
							chart.lastVisibleIndex = chart.firstVisibleIndex + maxVisibleRecord;
							checkChartLastVisibleIndex(chart);
						}
					} else {
						//第一条或最后一条数据被显示时
						chart.lastVisibleIndex = rowsCount - 1;
						chart.firstVisibleIndex = chart.lastVisibleIndex - maxVisibleRecord + 1;
						if (chart.firstVisibleIndex > chart.lastVisibleIndex) {
							chart.firstVisibleIndex = chart.lastVisibleIndex;
						}
					}
				}
			}
		}
	}
};

/*
* 设置可见索引
* chart:图表
* firstVisibleIndex:起始索引
* lastVisibleIndex:结束索引
*/
let setChartVisibleIndex = function (chart, firstVisibleIndex, lastVisibleIndex) {
	let xScalePixel = getChartWorkAreaWidth(chart) / (lastVisibleIndex - firstVisibleIndex + 1);
	if (xScalePixel < 1000000) {
		chart.firstVisibleIndex = firstVisibleIndex;
		chart.lastVisibleIndex = lastVisibleIndex;
		//设置最后一条记录是否可见
		if (lastVisibleIndex != chart.datas.length - 1) {
			chart.lastRecordIsVisible = false;
		} else {
			chart.lastRecordIsVisible = true;
		}
		chart.hScalePixel = xScalePixel;
		checkChartLastVisibleIndex(chart);
	}
};

/*
* 绘制图表
* chart:图表
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawChart = function (chart, paint, clipRect) {
	try {
		if (chart.backColor && chart.backColor != "none") {
			paint.fillRect(chart.backColor, 0, 0, chart.size.cx, chart.size.cy);
		}
		if (chart.onPaintChartScale) {
			chart.onPaintChartScale(chart, paint, clipRect);
		}
		else if (paint.onPaintChartScale) {
			paint.onPaintChartScale(chart, paint, clipRect);
		} else {
			drawChartScale(chart, paint, clipRect);
		}
		if (chart.onPaintChartStock) {
			chart.onPaintChartStock(chart, paint, clipRect);
		}
		else if (paint.onPaintChartStock) {
			paint.onPaintChartStock(chart, paint, clipRect);
		} else {
			drawChartStock(chart, paint, clipRect);
		}
		if (chart.onPaintChartPlot) {
			chart.onPaintChartPlot(chart, paint, clipRect);
		}
		else if (paint.onPaintChartPlot) {
			paint.onPaintChartPlot(chart, paint, clipRect);
		} else {
			drawChartPlot(chart, paint, clipRect);
		}
		if (chart.onPaintChartCrossLine) {
			chart.onPaintChartCrossLine(chart, paint, clipRect);
		} 
		else if (paint.onPaintChartCrossLine) {
			paint.onPaintChartCrossLine(chart, paint, clipRect);
		} else {
			drawChartCrossLine(chart, paint, clipRect);
		}
		if(chart.onPaintChartTip){
			chart.onPaintChartTip(chart, paint, clipRect);
		}
		if (chart.borderColor && chart.borderColor != "none") {
			paint.drawRect(chart.borderColor, chart.lineWidthChart, 0, 0, 0, chart.size.cx, chart.size.cy);
		}
	} catch (err) {
	}
};

/*
* 计算坐标轴
* min:最小值
* max:最大值
* yLen:长度
* maxSpan:最大间隔
* minSpan:最小间隔
* defCount:数量
*/
let chartGridScale = function (chart, min, max, yLen, maxSpan, minSpan, defCount) {
	chart.gridStep = 0;
	chart.gridDigit = 0;
	if(defCount == 0){
		return 0;
	}
	let sub = max - min;
	let nMinCount = parseInt(Math.ceil(yLen / maxSpan));
	let nMaxCount = parseInt(Math.floor(yLen / minSpan));
	let nCount = defCount;
	let logStep = sub / nCount;
	let start = false;
	let divisor = 0;
	let i = 0, nTemp = 0;
	
	nCount = Math.max(nMinCount, nCount);
	nCount = Math.min(nMaxCount, nCount);
	nCount = Math.max(nCount, 1);
	for (i = 15; i >= -6; i--) {
		divisor = Math.pow(10.0, i);
		if (divisor < 1) {
			chart.gridDigit++;
		}
		nTemp = parseInt(Math.floor(logStep / divisor));
		if (start) {
			if (nTemp < 4) {
				if (chart.gridDigit > 0) {
					chart.gridDigit--;
				}
			} else if (nTemp >= 4 && nTemp <= 6) {
				nTemp = 5;
				chart.gridStep += nTemp * divisor;
			} else {
				chart.gridStep += 10 * divisor;
				if (chart.gridDigit > 0) {
					chart.gridDigit--;
				}
			}
			break;
		} else if (nTemp > 0) {
			chart.gridStep = nTemp * divisor + chart.gridStep;
			logStep -= chart.gridStep;
			start = true;
		}
	}
	return 0;
};

/*
* 缩小
* chart:图表
*/
let zoomOutChart = function (chart) {
	if (!chart.autoFillHScale) {
		let hScalePixel = chart.hScalePixel;
		let oldX = getChartX(chart, chart.crossStopIndex);
		if(chart.targetOldX == 0){
			chart.targetOldX = oldX;
		}
		let pureH = getChartWorkAreaWidth(chart);
		let oriMax = -1, max = -1, deal = 0;
		let dataCount = chart.datas.length;
		let findex = chart.firstVisibleIndex, lindex = chart.lastVisibleIndex;
		if (hScalePixel < pureH) {
			oriMax = getChartMaxVisibleCount(chart, hScalePixel, pureH);
			if (dataCount < oriMax) {
				deal = 1;
			}
			if (hScalePixel > 3) {
				hScalePixel += 1;
			} else {
				if (hScalePixel == 1) {
					hScalePixel = 2;
				} else {
					hScalePixel = hScalePixel * 1.5;
					if (hScalePixel > 3) {
						hScalePixel = parseInt(hScalePixel);
					}
				}
			}
			max = getChartMaxVisibleCount(chart, hScalePixel, pureH);
			if (dataCount >= max) {
				if (deal == 1) {
					lindex = dataCount - 1;
				}
				findex = lindex - max + 1;
				if (findex < 0) {
					findex = 0;
				}
			}
		}
		chart.hScalePixel = hScalePixel;
		let sX = chart.targetOldX;
		findex = chart.crossStopIndex;
		while(sX >= chart.leftVScaleWidth + chart.hScalePixel / 2){
			findex = findex - 1;
			chart.offsetX = sX - chart.leftVScaleWidth - chart.hScalePixel / 2;
			sX = sX - chart.hScalePixel;
		}
		findex = findex + 1;
		chart.firstVisibleIndex = findex;
		chart.lastVisibleIndex = lindex;
		checkChartLastVisibleIndex(chart);
		if(chart.onCalculateChartMaxMin){
			chart.onCalculateChartMaxMin(chart);
		}
		else if (chart.paint.onCalculateChartMaxMin) {
			chart.paint.onCalculateChartMaxMin(chart);
		} else {
			calculateChartMaxMin(chart);
		}
	}
};

/*
* 放大
* chart:图表
*/
let zoomInChart = function (chart) {
	if (!chart.autoFillHScale) {
		let hScalePixel = chart.hScalePixel;
		let oldX = getChartX(chart, chart.crossStopIndex);
		if(chart.targetOldX2 == 0){
			chart.targetOldX2 = oldX;
		}
		let pureH = getChartWorkAreaWidth(chart);
		let max = -1;
		let dataCount = chart.datas.length;
		let findex = chart.firstVisibleIndex, lindex = chart.lastVisibleIndex;
		if (hScalePixel > 3) {
			hScalePixel -= 1;
		} else {
			hScalePixel = hScalePixel * 2 / 3;
			if (hScalePixel > 3) {
				hScalePixel = parseInt(hScalePixel);
			}
		}
		max = getChartMaxVisibleCount(chart, hScalePixel, pureH);
		if (max >= dataCount) {
			if (hScalePixel < 1) {
				hScalePixel = pureH / max;
			}
			findex = 0;
			lindex = dataCount - 1;
		} else {
			findex = lindex - max + 1;
			if (findex < 0) {
				findex = 0;
			}
		}
		chart.hScalePixel = hScalePixel;
		let sX = chart.targetOldX2;
		findex = chart.crossStopIndex;
		while(sX >= chart.leftVScaleWidth + chart.hScalePixel / 2){
			findex = findex - 1;
			chart.offsetX = sX - chart.leftVScaleWidth - chart.hScalePixel / 2;
			sX = sX - chart.hScalePixel;
		}
		findex = findex + 1;
		chart.firstVisibleIndex = findex;
		chart.lastVisibleIndex = lindex;
		checkChartLastVisibleIndex(chart);
		if(chart.onCalculateChartMaxMin){
			chart.onCalculateChartMaxMin(chart);
		}
		else if (chart.paint.onCalculateChartMaxMin) {
			chart.paint.onCalculateChartMaxMin(chart);
		} else {
			calculateChartMaxMin(chart);
		}
	}
};

/*
* 绘制刻度
* chart:图表
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawChartScale = function (chart, paint, clipRect) {
	if (chart.leftVScaleWidth > 0) {
		paint.drawLine(chart.scaleColor, chart.lineWidthChart, 0, chart.leftVScaleWidth, 0, chart.leftVScaleWidth, chart.size.cy - chart.hScaleHeight);
	}
	if (chart.rightVScaleWidth > 0) {
		paint.drawLine(chart.scaleColor, chart.lineWidthChart, 0, chart.size.cx - chart.rightVScaleWidth, 0, chart.size.cx - chart.rightVScaleWidth, chart.size.cy - chart.hScaleHeight);
	}
	if (chart.hScaleHeight > 0) {
		paint.drawLine(chart.scaleColor, chart.lineWidthChart, 0, 0, chart.size.cy - chart.hScaleHeight, chart.size.cx, chart.size.cy - chart.hScaleHeight);
	}
	let candleDivHeight = getCandleDivHeight(chart);
	let volDivHeight = getVolDivHeight(chart);
	let indDivHeight = getIndDivHeight(chart);
	let indDivHeight2 = getIndDivHeight2(chart);
	if (volDivHeight > 0) {
		paint.drawLine(chart.scaleColor, chart.lineWidthChart, 0, chart.leftVScaleWidth, candleDivHeight, chart.size.cx - chart.rightVScaleWidth, candleDivHeight);
	}
	if (indDivHeight > 0) {
		paint.drawLine(chart.scaleColor, chart.lineWidthChart, 0, chart.leftVScaleWidth, candleDivHeight + volDivHeight, chart.size.cx - chart.rightVScaleWidth, candleDivHeight + volDivHeight);
	}
	if (indDivHeight2 > 0) {
		paint.drawLine(chart.scaleColor, chart.lineWidthChart, 0, chart.leftVScaleWidth, candleDivHeight + volDivHeight + indDivHeight, chart.size.cx - chart.rightVScaleWidth, candleDivHeight + volDivHeight + indDivHeight);
	}
	let topPoint = new FCPoint(0, 20);
	let bottomPoint = new FCPoint(0, candleDivHeight - 10);
	let candleMax = getChartValue(chart, topPoint);
	let candleMin = getChartValue(chart, bottomPoint);
	chartGridScale(chart, candleMin, candleMax, (candleDivHeight - chart.candlePaddingTop - chart.candlePaddingBottom) / 2, chart.vScaleDistance, chart.vScaleDistance / 2, parseInt((candleDivHeight - chart.candlePaddingTop - chart.candlePaddingBottom) / chart.vScaleDistance));
	if (chart.gridStep > 0) {
		let drawValues = new Array();
		let isTrend = chart.cycle == "trend";
		let firstOpen = chart.firstOpen;
		if (isTrend) {
			if(firstOpen == 0){
				firstOpen = chart.datas[chart.firstVisibleIndex].close;
			}
			let subValue = (candleMax - candleMin);
			let count = parseInt((candleDivHeight - chart.candlePaddingTop - chart.candlePaddingBottom) / chart.vScaleDistance);
			if (count > 0) {
				subValue /= count;
			}
			let start = firstOpen;
			while (start < candleMax) {
				start += subValue;
				if (start <= candleMax) {
					drawValues.push(start);
				}
			}
			start = firstOpen;
			while (start > candleMin) {
				start -= subValue;
				if (start >= candleMin) {
					drawValues.push(start);
				}
			}
		} else {
			let start = 0;
			if (candleMin >= 0) {
				while (start + chart.gridStep < candleMin) {
					start += chart.gridStep;
				}
			} else {
				while (start - chart.gridStep > candleMin) {
					start -= chart.gridStep;
				}
			}

			while (start <= candleMax) {
				if (start > candleMin) {
					drawValues.push(start);
				}
				start += chart.gridStep;
			}
		}
		drawValues.push(firstOpen);
		for (let i = 0; i < drawValues.length; i++) {
			let start = drawValues[i];
			let hAxisY = getChartY(chart, 0, start);
			if (hAxisY < 1 || hAxisY > candleDivHeight) {
				continue;
			}
			paint.drawLine(chart.gridColor, chart.lineWidthChart, 0, chart.leftVScaleWidth, parseInt(hAxisY), chart.size.cx - chart.rightVScaleWidth, parseInt(hAxisY));
			paint.drawLine(chart.scaleColor, chart.lineWidthChart, 0, chart.leftVScaleWidth - 8, parseInt(hAxisY), chart.leftVScaleWidth, parseInt(hAxisY));
			paint.drawLine(chart.scaleColor, chart.lineWidthChart, 0, chart.size.cx - chart.rightVScaleWidth, parseInt(hAxisY), chart.size.cx - chart.rightVScaleWidth + 8, parseInt(hAxisY));
			let drawText = start.toFixed(chart.candleDigit);
			let tSize = paint.textSize(drawText, chart.font);
			if (isTrend) {
				let diffRange = ((start - firstOpen) / firstOpen * 100);
				let diffRangeStr = diffRange.toFixed(2) + "%";
				if (diffRange >= 0) {
					paint.drawText(diffRangeStr, chart.upColor, chart.font, chart.size.cx - chart.rightVScaleWidth + 10, parseInt(hAxisY) - tSize.cy / 2);
				} else {
					paint.drawText(diffRangeStr, chart.downColor, chart.font, chart.size.cx - chart.rightVScaleWidth + 10, parseInt(hAxisY) - tSize.cy / 2);
				}
			} else {
				if(chart.vScaleTextColor && chart.vScaleTextColor != "none"){
					paint.drawText(drawText, chart.vScaleTextColor, chart.font, chart.size.cx - chart.rightVScaleWidth + 10, parseInt(hAxisY) - tSize.cy / 2);
				}else{
					paint.drawText(drawText, chart.textColor, chart.font, chart.size.cx - chart.rightVScaleWidth + 10, parseInt(hAxisY) - tSize.cy / 2);
				}
			}
			if(chart.vScaleTextColor && chart.vScaleTextColor != "none"){
				paint.drawText(drawText, chart.vScaleTextColor, chart.font, chart.leftVScaleWidth - tSize.cx - 10, parseInt(hAxisY) - tSize.cy / 2);
			}else{
				paint.drawText(drawText, chart.textColor, chart.font, chart.leftVScaleWidth - tSize.cx - 10, parseInt(hAxisY) - tSize.cy / 2);
			}
		}
	}
	topPoint = new FCPoint(0, candleDivHeight + 10);
	bottomPoint = new FCPoint(0, candleDivHeight + volDivHeight - 10);
	let volMax = getChartValue(chart, topPoint);
	let volMin = getChartValue(chart, bottomPoint);
	chartGridScale(chart, volMin, volMax, (volDivHeight - chart.volPaddingTop - chart.volPaddingBottom) / 2, chart.vScaleDistance, chart.vScaleDistance / 2, parseInt((volDivHeight - chart.volPaddingTop - chart.volPaddingBottom) / chart.vScaleDistance));
	if (chart.gridStep > 0) {
		let start = 0;
		if (volMin >= 0) {
			while (start + chart.gridStep < volMin) {
				start += chart.gridStep;
			}
		} else {
			while (start - chart.gridStep > volMin) {
				start -= chart.gridStep;
			}
		}
		while (start <= volMax) {
			if (start > volMin) {
				let hAxisY = getChartY(chart, 1, start);
				if (hAxisY < candleDivHeight || hAxisY > candleDivHeight + volDivHeight) {
					start += chart.gridStep;
					continue;
				}
				paint.drawLine(chart.gridColor, chart.lineWidthChart, 0, chart.leftVScaleWidth, parseInt(hAxisY), chart.size.cx - chart.rightVScaleWidth, parseInt(hAxisY));
				paint.drawLine(chart.scaleColor, chart.lineWidthChart, 0, chart.leftVScaleWidth - 8, parseInt(hAxisY), chart.leftVScaleWidth, parseInt(hAxisY));
				paint.drawLine(chart.scaleColor, chart.lineWidthChart, 0, chart.size.cx - chart.rightVScaleWidth, parseInt(hAxisY), chart.size.cx - chart.rightVScaleWidth + 8, parseInt(hAxisY));
				let drawText = (start / chart.magnitude).toFixed(chart.volDigit);
				let tSize = paint.textSize(drawText, chart.font);
				if(chart.vScaleTextColor && chart.vScaleTextColor != "none"){
					paint.drawText(drawText, chart.vScaleTextColor, chart.font, chart.size.cx - chart.rightVScaleWidth + 10, parseInt(hAxisY) - tSize.cy / 2);
					paint.drawText(drawText, chart.vScaleTextColor, chart.font, chart.leftVScaleWidth - tSize.cx - 10, parseInt(hAxisY) - tSize.cy / 2);
				}else{
					paint.drawText(drawText, chart.textColor, chart.font, chart.size.cx - chart.rightVScaleWidth + 10, parseInt(hAxisY) - tSize.cy / 2);
					paint.drawText(drawText, chart.textColor, chart.font, chart.leftVScaleWidth - tSize.cx - 10, parseInt(hAxisY) - tSize.cy / 2);
				}
			}
			start += chart.gridStep;
		}
	}
	if (indDivHeight > 0) {
		topPoint = new FCPoint(0, candleDivHeight + volDivHeight + 10);
		bottomPoint = new FCPoint(0, candleDivHeight + volDivHeight + indDivHeight - 10);
		let indMax = getChartValue(chart, topPoint);
		let indMin = getChartValue(chart, bottomPoint);
		chartGridScale(chart, indMin, indMax, (indDivHeight - chart.indPaddingTop - chart.indPaddingBottom) / 2, chart.vScaleDistance, chart.vScaleDistance / 2, parseInt((indDivHeight - chart.indPaddingTop - chart.indPaddingBottom) / chart.vScaleDistance));
		if (chart.gridStep > 0) {
			let start = 0;
			if (indMin >= 0) {
				while (start + chart.gridStep < indMin) {
					start += chart.gridStep;
				}
			} else {
				while (start - chart.gridStep > indMin) {
					start -= chart.gridStep;
				}
			}

			while (start <= indMax) {
				if (start > indMin) {
					let hAxisY = getChartY(chart, 2, start);
					if (hAxisY < candleDivHeight + volDivHeight || hAxisY > candleDivHeight + volDivHeight + indDivHeight) {
						start += chart.gridStep;
						continue;
					}
					paint.drawLine(chart.gridColor, chart.lineWidthChart, 0, chart.leftVScaleWidth, parseInt(hAxisY), chart.size.cx - chart.rightVScaleWidth, parseInt(hAxisY));
					paint.drawLine(chart.scaleColor, chart.lineWidthChart, 0, chart.leftVScaleWidth - 8, parseInt(hAxisY), chart.leftVScaleWidth, parseInt(hAxisY));
					paint.drawLine(chart.scaleColor, chart.lineWidthChart, 0, chart.size.cx - chart.rightVScaleWidth, parseInt(hAxisY), chart.size.cx - chart.rightVScaleWidth + 8, parseInt(hAxisY));
					let drawText = start.toFixed(chart.indDigit);
					let tSize = paint.textSize(drawText, chart.font);
					if(chart.vScaleTextColor && chart.vScaleTextColor != "none"){
						paint.drawText(drawText, chart.vScaleTextColor, chart.font, chart.size.cx - chart.rightVScaleWidth + 10, parseInt(hAxisY) - tSize.cy / 2);
						paint.drawText(drawText, chart.vScaleTextColor, chart.font, chart.leftVScaleWidth - tSize.cx - 10, parseInt(hAxisY) - tSize.cy / 2);
					}else{
						paint.drawText(drawText, chart.textColor, chart.font, chart.size.cx - chart.rightVScaleWidth + 10, parseInt(hAxisY) - tSize.cy / 2);
						paint.drawText(drawText, chart.textColor, chart.font, chart.leftVScaleWidth - tSize.cx - 10, parseInt(hAxisY) - tSize.cy / 2);
					}
				}
				start += chart.gridStep;
			}
		}
	}
	if (indDivHeight2 > 0) {
		topPoint = new FCPoint(0, candleDivHeight + volDivHeight + indDivHeight + 10);
		bottomPoint = new FCPoint(0, candleDivHeight + volDivHeight + indDivHeight + indDivHeight2 - 10);
		let indMax2 = getChartValue(chart, topPoint);
		let indMin2 = getChartValue(chart, bottomPoint);
		chartGridScale(chart, indMin2, indMax2, (indDivHeight2 - chart.indPaddingTop2 - chart.indPaddingBottom2) / 2, chart.vScaleDistance, chart.vScaleDistance / 2, parseInt((indDivHeight2 - chart.indPaddingTop2 - chart.indPaddingBottom2) / chart.vScaleDistance));
		if (chart.gridStep > 0) {
			let start = 0;
			if (indMin2 >= 0) {
				while (start + chart.gridStep < indMin2) {
					start += chart.gridStep;
				}
			} else {
				while (start - chart.gridStep > indMin2) {
					start -= chart.gridStep;
				}
			}

			while (start <= indMax2) {
				if (start > indMin2) {
					let hAxisY = getChartY(chart, 3, start);
					if (hAxisY < candleDivHeight + volDivHeight + indDivHeight || hAxisY > candleDivHeight + volDivHeight + indDivHeight + indDivHeight2) {
						start += chart.gridStep;
						continue;
					}
					paint.drawLine(chart.gridColor, chart.lineWidthChart, 0, chart.leftVScaleWidth, parseInt(hAxisY), chart.size.cx - chart.rightVScaleWidth, parseInt(hAxisY));
					paint.drawLine(chart.scaleColor, chart.lineWidthChart, 0, chart.leftVScaleWidth - 8, parseInt(hAxisY), chart.leftVScaleWidth, parseInt(hAxisY));
					paint.drawLine(chart.scaleColor, chart.lineWidthChart, 0, chart.size.cx - chart.rightVScaleWidth, parseInt(hAxisY), chart.size.cx - chart.rightVScaleWidth + 8, parseInt(hAxisY));
					let drawText = start.toFixed(chart.indDigit);
					let tSize = paint.textSize(drawText, chart.font);
					if(chart.vScaleTextColor && chart.vScaleTextColor != "none"){
						paint.drawText(drawText, chart.vScaleTextColor, chart.font, chart.size.cx - chart.rightVScaleWidth + 10, parseInt(hAxisY) - tSize.cy / 2);
						paint.drawText(drawText, chart.vScaleTextColor, chart.font, chart.leftVScaleWidth - tSize.cx - 10, parseInt(hAxisY) - tSize.cy / 2);
					}else{
						paint.drawText(drawText, chart.textColor, chart.font, chart.size.cx - chart.rightVScaleWidth + 10, parseInt(hAxisY) - tSize.cy / 2);
						paint.drawText(drawText, chart.textColor, chart.font, chart.leftVScaleWidth - tSize.cx - 10, parseInt(hAxisY) - tSize.cy / 2);
					}
				}
				start += chart.gridStep;
			}
		}
	}
	if(chart.onPaintChartHScale){
		chart.onPaintChartHScale(chart, paint, clipRect);
	}
	else if (paint.onPaintChartHScale) {
		paint.onPaintChartHScale(chart, paint, clipRect);
	} else{
		if (chart.datas && chart.datas.length > 0 && chart.hScaleHeight > 0) {
			let dLeft = chart.leftVScaleWidth + 10;
			for (let i = chart.firstVisibleIndex; i <= chart.lastVisibleIndex; i++) {
				let date = new Date();
				date.setTime(chart.datas[i].date);
				let xText = "";
				if (chart.hScaleFormat.length > 0) {
					xText = dateFormat(chart.hScaleFormat, date);
				} else {
					if (chart.cycle == "day") {
						xText = dateFormat("YYYY-mm-dd", date);
					} else if (chart.cycle == "minute") {
						xText = dateFormat("HH:MM", date);
					} else if (chart.cycle == "trend") {
						xText = dateFormat("HH:MM", date);
					}
					else if (chart.cycle == "second") {
						xText = dateFormat("HH:MM:SS", date);
					}
					else if (chart.cycle == "tick") {
						xText = i + 1;
					}
				}
				let tSize = paint.textSize(xText, chart.font);
				let x = getChartX(chart, i);
				let dx = x - tSize.cx / 2;
				if (dx > dLeft && dx < chart.size.cx - chart.rightVScaleWidth - 10) {
					paint.drawLine(chart.scaleColor, chart.lineWidthChart, 0, x, chart.size.cy - chart.hScaleHeight, x, chart.size.cy - chart.hScaleHeight + 8);
					if(chart.hScaleTextColor && chart.hScaleTextColor != "none"){
						paint.drawText(xText, chart.hScaleTextColor, chart.font, dx, chart.size.cy - chart.hScaleHeight + 8 - tSize.cy / 2 + 7);
					}else{
						paint.drawText(xText, chart.textColor, chart.font, dx, chart.size.cy - chart.hScaleHeight + 8 - tSize.cy / 2 + 7);
					}
					i = i + parseInt((tSize.cx + chart.hScaleTextDistance) / chart.hScalePixel) + 1
				}
			}
		}
	}
};

/*
* 绘制十字线
* chart:图表
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawChartCrossLine = function (chart, paint, clipRect) {
	if (!chart.datas || chart.datas.length == 0) {
		return;
	}
	let candleDivHeight = getCandleDivHeight(chart);
	let volDivHeight = getVolDivHeight(chart);
	let indDivHeight = getIndDivHeight(chart);
	let indDivHeight2 = getIndDivHeight2(chart);
	let crossLineIndex = chart.crossStopIndex;
	if (crossLineIndex == -1 || !chart.showCrossLine) {
		if(chart.lastValidIndex != -1){
			crossLineIndex = chart.lastValidIndex;
		}else{
			crossLineIndex = chart.lastVisibleIndex;
		}
	}
	if (crossLineIndex == -1){
		return;
	}
	let str = "A" + crossLineIndex;
	if (str == "ANaN") {
		crossLineIndex = chart.lastVisibleIndex;
	}
	if (volDivHeight > 0) {
		let drawTitles = new Array();
		let drawColors = new Array();
		if(chart.getChartTitles != null){
			chart.getChartTitles(chart, 1, drawTitles, drawColors);
		}else{
			drawTitles.push("VOL " + (chart.datas[crossLineIndex].volume / chart.magnitude).toFixed(chart.volDigit));
			drawColors.push(chart.textColor);
			if (chart.shapes.length > 0) {
				for (let i = 0; i < chart.shapes.length; i++) {
					let shape = chart.shapes[i]
					if (shape.divIndex == 1) {
						if (shape.title.length > 0) {
							if (shape.shapeType == "bar" && shape.style == "2color") {
								drawTitles.push(shape.title + " " + shape.datas[crossLineIndex].toFixed(chart.volDigit));
								drawColors.push(shape.color2);
							} else {
								if (shape.shapeType != "text") {
									drawTitles.push(shape.title + " " + shape.datas[crossLineIndex].toFixed(chart.volDigit));
									drawColors.push(shape.color);
									if (shape.datas2.length > 0) {
										drawTitles.push(shape.title2 + " " + shape.datas2[crossLineIndex].toFixed(chart.volDigit));
										drawColors.push(shape.color2);
									}
								}
							}
						}
					}
				}
			}
		}
		let iLeft = chart.leftVScaleWidth + 5;
		for (let i = 0; i < drawTitles.length; i++) {
			let tSize = paint.textSize(drawTitles[i], chart.font);
			paint.drawText(drawTitles[i], drawColors[i], chart.font, iLeft, candleDivHeight + 5);
			iLeft += tSize.cx + 5;
		}
	}
	//上面显示数据  高开低收
	if (chart.cycle == "trend") {
		let drawTitles = new Array();
		let drawColors = new Array();
		if(chart.getChartTitles != null){
			chart.getChartTitles(chart, 0, drawTitles, drawColors);
		}else{
			if(chart.text && chart.text.length > 0){
				drawTitles.push(chart.text);
				drawColors.push(chart.textColor);
			}
			if (chart.shapes.length > 0) {
				for (let i = 0; i < chart.shapes.length; i++) {
					let shape = chart.shapes[i];
					if (shape.divIndex == 0) {
						if (shape.title.length > 0) {
							if (shape.shapeType == "bar" && shape.style == "2color") {
								drawTitles.push(shape.title + " " + shape.datas[crossLineIndex].toFixed(chart.candleDigit));
								drawColors.push(shape.color2);
							} else {
								if (shape.shapeType != "text") {
									drawTitles.push(shape.title + " " + shape.datas[crossLineIndex].toFixed(chart.candleDigit));
									drawColors.push(shape.color);
									if (shape.datas2.length > 0) {
										drawTitles.push(shape.title2 + " " + shape.datas2[crossLineIndex].toFixed(chart.candleDigit));
										drawColors.push(shape.color2);
									}
								}
							}
						}
					}
				}
			}
		}
		let iLeft = chart.leftVScaleWidth + 5;
		for (let i = 0; i < drawTitles.length; i++) {
			let tSize = paint.textSize(drawTitles[i], chart.font);
			paint.drawText(drawTitles[i], drawColors[i], chart.font, iLeft, 5);
			iLeft += tSize.cx + 5;
		}
	} else {
		let drawTitles = new Array();
		let drawColors = new Array();
		if(chart.getChartTitles != null){
			chart.getChartTitles(chart, 0, drawTitles, drawColors);
		}else{
			if(chart.text && chart.text.length > 0){
				drawTitles.push(chart.text);
				drawColors.push(chart.textColor);
			}
			if (chart.mainIndicator == "MA") {
				if (chart.maMap.ma5 && chart.maMap.ma5.length > 0) {
					drawTitles.push("MA5 " + chart.maMap.ma5[crossLineIndex].toFixed(chart.candleDigit));
				} else {
					drawTitles.push("MA5")
				}
				drawColors.push(chart.indicatorColors[0]);
				if (chart.maMap.ma10 && chart.maMap.ma10.length > 0) {
					drawTitles.push("MA10 " + chart.maMap.ma10[crossLineIndex].toFixed(chart.candleDigit));
				} else {
					drawTitles.push("MA10");
				}
				drawColors.push(chart.indicatorColors[1]);
				if (chart.maMap.ma20 && chart.maMap.ma20.length > 0) {
					drawTitles.push("MA20 " + chart.maMap.ma20[crossLineIndex].toFixed(chart.candleDigit));

				} else {
					drawTitles.push("MA20");
				}
				drawColors.push(chart.indicatorColors[2]);
				if (chart.maMap.ma30 && chart.maMap.ma30.length > 0) {
					drawTitles.push("MA30 " + chart.maMap.ma30[crossLineIndex].toFixed(chart.candleDigit));
				} else {
					drawTitles.push("MA30");
				}
				drawColors.push(chart.indicatorColors[5]);
				if (chart.maMap.ma120 && chart.maMap.ma120.length > 0) {
					drawTitles.push("MA120 " + chart.maMap.ma120[crossLineIndex].toFixed(chart.candleDigit));

				} else {
					drawTitles.push("MA120");
				}
				drawColors.push(chart.indicatorColors[4]);
				if (chart.maMap.ma250 && chart.maMap.ma250.length > 0) {
					drawTitles.push("MA250 " + chart.maMap.ma250[crossLineIndex].toFixed(chart.candleDigit));
				} else {
					drawTitles.push("MA250");
				}
				drawColors.push(chart.indicatorColors[3]);
			} else if (chart.mainIndicator == "BOLL") {
				if (chart.bollMap.mid && chart.bollMap.mid.length > 0) {
					drawTitles.push("MID " + chart.bollMap.mid[crossLineIndex].toFixed(chart.candleDigit));
				} else {
					drawTitles.push("MID");
				}
				drawColors.push(chart.indicatorColors[0]);
				if (chart.bollMap.upper && chart.bollMap.upper.length > 0) {
					drawTitles.push("UP " + chart.bollMap.upper[crossLineIndex].toFixed(chart.candleDigit));
				} else {
					drawTitles.push("UP");
				}
				drawColors.push(chart.indicatorColors[1]);
				if (chart.bollMap.lower && chart.bollMap.lower.length > 0) {
					drawTitles.push("LOW " + chart.bollMap.lower[crossLineIndex].toFixed(chart.candleDigit));
				} else {
					drawTitles.push("LOW");
				}
				drawColors.push(chart.indicatorColors[2]);
			}
			if (chart.shapes.length > 0) {
				for (let i = 0; i < chart.shapes.length; i++) {
					let shape = chart.shapes[i];
					if (shape.divIndex == 0) {
						if (shape.title.length > 0) {
							if (shape.shapeType == "bar" && shape.style == "2color") {
								drawTitles.push(shape.title + " " + shape.datas[crossLineIndex].toFixed(chart.candleDigit));
								drawColors.push(shape.color2);
							} else {
								if (shape.shapeType != "text") {
									drawTitles.push(shape.title + " " + shape.datas[crossLineIndex].toFixed(chart.candleDigit));
									drawColors.push(shape.color);
									if (shape.datas2.length > 0) {
										drawTitles.push(shape.title2 + " " + shape.datas2[crossLineIndex].toFixed(chart.candleDigit));
										drawColors.push(shape.color2);
									}
								}
							}
						}
					}
				}
			}
		}
		let iLeft = chart.leftVScaleWidth + 5;
		for (let i = 0; i < drawTitles.length; i++) {
			let tSize = paint.textSize(drawTitles[i], chart.font);
			paint.drawText(drawTitles[i], drawColors[i], chart.font, iLeft, 5);
			iLeft += tSize.cx + 5;
		}
	}
	if (indDivHeight > 0) {
		let drawTitles = new Array();
		let drawColors = new Array();
		if(chart.getChartTitles != null){
			chart.getChartTitles(chart, 2, drawTitles, drawColors);
		}else{
			if (chart.showIndicator == "MACD") {
				if (chart.alldifarr && chart.alldifarr.length > 0) {
					drawTitles.push("DIF " + chart.alldifarr[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("DIF");
				}
				drawColors.push(chart.indicatorColors[0]);
				if (chart.alldeaarr && chart.alldeaarr.length > 0) {
					drawTitles.push("DEA " + chart.alldeaarr[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("DEA");
				}
				drawColors.push(chart.indicatorColors[1]);
				if (chart.allmacdarr && chart.allmacdarr.length > 0) {
					drawTitles.push("MACD " + chart.allmacdarr[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("MACD");
				}
				drawColors.push(chart.indicatorColors[4]);
			} else if (chart.showIndicator == "KDJ") {
				if (chart.kdjMap.k && chart.kdjMap.k.length > 0) {
					drawTitles.push("K " + chart.kdjMap.k[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("K");
				}
				drawColors.push(chart.indicatorColors[0]);
				if (chart.kdjMap.d && chart.kdjMap.d.length > 0) {
					drawTitles.push("D " + chart.kdjMap.d[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("D");
				}
				drawColors.push(chart.indicatorColors[1]);
				if (chart.kdjMap.j && chart.kdjMap.j.length > 0) {
					drawTitles.push("J " + chart.kdjMap.j[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("J");
				}
				drawColors.push(chart.indicatorColors[2]);
			} else if (chart.showIndicator == "RSI") {
				if (chart.rsiMap.rsi6 && chart.rsiMap.rsi6.length > 0) {
					drawTitles.push("RSI6 " + chart.rsiMap.rsi6[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("RSI6");
				}
				drawColors.push(chart.indicatorColors[5]);
				if (chart.rsiMap.rsi12 && chart.rsiMap.rsi12.length > 0) {
					drawTitles.push("RSI12 " + chart.rsiMap.rsi12[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("RSI12");
				}
				drawColors.push(chart.indicatorColors[1]);
				if (chart.rsiMap.rsi24 && chart.rsiMap.rsi24.length > 0) {
					drawTitles.push("RSI24 " + chart.rsiMap.rsi24[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("RSI24");
				}
				drawColors.push(chart.indicatorColors[2]);
			}
			else if (chart.showIndicator == "BIAS") {
				if (chart.biasMap.bias1 && chart.biasMap.bias1.length > 0) {
					drawTitles.push("BIAS6 " + chart.biasMap.bias1[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("BIAS6");
				}
				drawColors.push(chart.indicatorColors[5]);
				if (chart.biasMap.bias2 && chart.biasMap.bias2.length > 0) {
					drawTitles.push("BIAS12 " + chart.biasMap.bias2[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("BIAS12");
				}
				drawColors.push(chart.indicatorColors[1]);
				if (chart.biasMap.bias3 && chart.biasMap.bias3.length > 0) {
					drawTitles.push("BIAS24 " + chart.biasMap.bias3[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("BIAS24");
				}
				drawColors.push(chart.indicatorColors[2]);
			}
			else if (chart.showIndicator == "ROC") {
				if (chart.rocMap.roc && chart.rocMap.roc.length > 0) {
					drawTitles.push("ROC " + chart.rocMap.roc[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("ROC");
				}
				drawColors.push(chart.indicatorColors[0]);
				if (chart.rocMap.maroc && chart.rocMap.maroc.length > 0) {
					drawTitles.push("ROCMA " + chart.rocMap.maroc[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("ROCMA");
				}
				drawColors.push(chart.indicatorColors[1]);
			}
			else if (chart.showIndicator == "WR") {
				if (chart.wrMap.wr1 && chart.wrMap.wr1.length > 0) {
					drawTitles.push("WR5 " + chart.wrMap.wr1[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("WR5");
				}
				drawColors.push(chart.indicatorColors[0]);
				if (chart.wrMap.wr2 && chart.wrMap.wr2.length > 0) {
					drawTitles.push("WR10 " + chart.wrMap.wr2[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("WR10");
				}
				drawColors.push(chart.indicatorColors[1]);
			}
			else if (chart.showIndicator == "CCI") {
				if (chart.cciArr && chart.cciArr.length > 0) {
					drawTitles.push("CCI " + chart.cciArr[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("CCI");
				}
				drawColors.push(chart.indicatorColors[0]);
			} else if (chart.showIndicator == "BBI") {
				if (chart.bbiMap.bbi && chart.bbiMap.bbi.length > 0) {
					drawTitles.push("BBI " + chart.bbiMap.bbi[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("BBI");
				}
				drawColors.push(chart.indicatorColors[0]);
			} else if (chart.showIndicator == "TRIX") {
				if (chart.trixMap.trix && chart.trixMap.trix.length > 0) {
					drawTitles.push("TRIX " + chart.trixMap.trix[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("TRIX");
				}
				drawColors.push(chart.indicatorColors[0]);
				if (chart.trixMap.matrix && chart.trixMap.matrix.length > 0) {
					drawTitles.push("TRIXMA " + chart.trixMap.matrix[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("TRIXMA");
				}
				drawColors.push(chart.indicatorColors[1]);
			}
			else if (chart.showIndicator == "DMA") {
				if (chart.dmaMap.dif && chart.dmaMap.dif.length > 0) {
					drawTitles.push("MA10 " + chart.dmaMap.dif[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("MA10");
				}
				drawColors.push(chart.indicatorColors[0]);
				if (chart.dmaMap.difma && chart.dmaMap.difma.length > 0) {
					drawTitles.push("MA50 " + chart.dmaMap.difma[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("MA50");
				}
				drawColors.push(chart.indicatorColors[1]);
			}
			if (chart.shapes.length > 0) {
				for (let i = 0; i < chart.shapes.length; i++) {
					let shape = chart.shapes[i];
					if (shape.divIndex == 2) {
						if (shape.title.length > 0) {
							if (shape.shapeType == "bar" && shape.style == "2color") {
								drawTitles.push(shape.title + " " + shape.datas[crossLineIndex].toFixed(chart.indDigit));
								drawColors.push(shape.color2);
							} else {
								if (shape.shapeType != "text") {
									drawTitles.push(shape.title + " " + shape.datas[crossLineIndex].toFixed(chart.indDigit));
									drawColors.push(shape.color);
									if (shape.datas2.length > 0) {
										drawTitles.push(shape.title2 + " " + shape.datas2[crossLineIndex].toFixed(chart.indDigit));
										drawColors.push(shape.color2);
									}
								}
							}
						}
					}
				}
			}
		}
		let iLeft = chart.leftVScaleWidth + 5;
		for (let i = 0; i < drawTitles.length; i++) {
			let tSize = paint.textSize(drawTitles[i], chart.font);
			paint.drawText(drawTitles[i], drawColors[i], chart.font, iLeft, candleDivHeight + volDivHeight + 5);
			iLeft += tSize.cx + 5;
		}
	}
	if (indDivHeight2 > 0) {
		let drawTitles = new Array();
		let drawColors = new Array();
		if(chart.getChartTitles != null){
			chart.getChartTitles(chart, 3, drawTitles, drawColors);
		}else{
			if (chart.showIndicator2 == "MACD") {
				if (chart.alldifarr && chart.alldifarr.length > 0) {
					drawTitles.push("DIF " + chart.alldifarr[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("DIF");
				}
				drawColors.push(chart.indicatorColors[0]);
				if (chart.alldeaarr && chart.alldeaarr.length > 0) {
					drawTitles.push("DEA " + chart.alldeaarr[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("DEA");
				}
				drawColors.push(chart.indicatorColors[1]);
				if (chart.allmacdarr && chart.allmacdarr.length > 0) {
					drawTitles.push("MACD " + chart.allmacdarr[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("MACD");
				}
				drawColors.push(chart.indicatorColors[4]);
			} else if (chart.showIndicator2 == "KDJ") {
				if (chart.kdjMap.k && chart.kdjMap.k.length > 0) {
					drawTitles.push("K " + chart.kdjMap.k[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("K");
				}
				drawColors.push(chart.indicatorColors[0]);
				if (chart.kdjMap.d && chart.kdjMap.d.length > 0) {
					drawTitles.push("D " + chart.kdjMap.d[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("D");
				}
				drawColors.push(chart.indicatorColors[1]);
				if (chart.kdjMap.j && chart.kdjMap.j.length > 0) {
					drawTitles.push("J " + chart.kdjMap.j[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("J");
				}
				drawColors.push(chart.indicatorColors[2]);
			} else if (chart.showIndicator2 == "RSI") {
				if (chart.rsiMap.rsi6 && chart.rsiMap.rsi6.length > 0) {
					drawTitles.push("RSI6 " + chart.rsiMap.rsi6[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("RSI6");
				}
				drawColors.push(chart.indicatorColors[5]);
				if (chart.rsiMap.rsi12 && chart.rsiMap.rsi12.length > 0) {
					drawTitles.push("RSI12 " + chart.rsiMap.rsi12[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("RSI12");
				}
				drawColors.push(chart.indicatorColors[1]);
				if (chart.rsiMap.rsi24 && chart.rsiMap.rsi24.length > 0) {
					drawTitles.push("RSI24 " + chart.rsiMap.rsi24[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("RSI24");
				}
				drawColors.push(chart.indicatorColors[2]);
			}
			else if (chart.showIndicator2 == "BIAS") {
				if (chart.biasMap.bias1 && chart.biasMap.bias1.length > 0) {
					drawTitles.push("BIAS6 " + chart.biasMap.bias1[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("BIAS6");
				}
				drawColors.push(chart.indicatorColors[5]);
				if (chart.biasMap.bias2 && chart.biasMap.bias2.length > 0) {
					drawTitles.push("BIAS12 " + chart.biasMap.bias2[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("BIAS12");
				}
				drawColors.push(chart.indicatorColors[1]);
				if (chart.biasMap.bias3 && chart.biasMap.bias3.length > 0) {
					drawTitles.push("BIAS24 " + chart.biasMap.bias3[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("BIAS24");
				}
				drawColors.push(chart.indicatorColors[2]);
			}
			else if (chart.showIndicator2 == "ROC") {
				if (chart.rocMap.roc && chart.rocMap.roc.length > 0) {
					drawTitles.push("ROC " + chart.rocMap.roc[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("ROC");
				}
				drawColors.push(chart.indicatorColors[0]);
				if (chart.rocMap.maroc && chart.rocMap.maroc.length > 0) {
					drawTitles.push("ROCMA " + chart.rocMap.maroc[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("ROCMA");
				}
				drawColors.push(chart.indicatorColors[1]);
			}
			else if (chart.showIndicator2 == "WR") {
				if (chart.wrMap.wr1 && chart.wrMap.wr1.length > 0) {
					drawTitles.push("WR5 " + chart.wrMap.wr1[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("WR5");
				}
				drawColors.push(chart.indicatorColors[0]);
				if (chart.wrMap.wr2 && chart.wrMap.wr2.length > 0) {
					drawTitles.push("WR10 " + chart.wrMap.wr2[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("WR10");
				}
				drawColors.push(chart.indicatorColors[1]);
			}
			else if (chart.showIndicator2 == "CCI") {
				if (chart.cciArr && chart.cciArr.length > 0) {
					drawTitles.push("CCI " + chart.cciArr[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("CCI");
				}
				drawColors.push(chart.indicatorColors[0]);
			} else if (chart.showIndicator2 == "BBI") {
				if (chart.bbiMap.bbi && chart.bbiMap.bbi.length > 0) {
					drawTitles.push("BBI " + chart.bbiMap.bbi[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("BBI");
				}
				drawColors.push(chart.indicatorColors[0]);
			} else if (chart.showIndicator2 == "TRIX") {
				if (chart.trixMap.trix && chart.trixMap.trix.length > 0) {
					drawTitles.push("TRIX " + chart.trixMap.trix[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("TRIX");
				}
				drawColors.push(chart.indicatorColors[0]);
				if (chart.trixMap.matrix && chart.trixMap.matrix.length > 0) {
					drawTitles.push("TRIXMA " + chart.trixMap.matrix[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("TRIXMA");
				}
				drawColors.push(chart.indicatorColors[1]);
			}
			else if (chart.showIndicator2 == "DMA") {
				if (chart.dmaMap.dif && chart.dmaMap.dif.length > 0) {
					drawTitles.push("MA10 " + chart.dmaMap.dif[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("MA10");
				}
				drawColors.push(chart.indicatorColors[0]);
				if (chart.dmaMap.difma && chart.dmaMap.difma.length > 0) {
					drawTitles.push("MA50 " + chart.dmaMap.difma[crossLineIndex].toFixed(chart.indDigit));
				} else {
					drawTitles.push("MA50");
				}
				drawColors.push(chart.indicatorColors[1]);
			}
			if (chart.shapes.length > 0) {
				for (let i = 0; i < chart.shapes.length; i++) {
					let shape = chart.shapes[i];
					if (shape.divIndex == 3) {
						if (shape.title.length > 0) {
							if (shape.shapeType == "bar" && shape.style == "2color") {
								drawTitles.push(shape.title + " " + shape.datas[crossLineIndex].toFixed(chart.indDigit2));
								drawColors.push(shape.color2);
							} else {
								if (shape.shapeType != "text") {
									drawTitles.push(shape.title + " " + shape.datas[crossLineIndex].toFixed(chart.indDigit2));
									drawColors.push(shape.color);
									if (shape.datas2.length > 0) {
										drawTitles.push(shape.title2 + " " + shape.datas2[crossLineIndex].toFixed(chart.indDigit2));
										drawColors.push(shape.color2);
									}
								}
							}
						}
					}
				}
			}
		}
		if (drawTitles.length > 0) {
			let iLeft = chart.leftVScaleWidth + 5;
			for (let i = 0; i < drawTitles.length; i++) {
				let tSize = paint.textSize(drawTitles[i], chart.font);
				paint.drawText(drawTitles[i], drawColors[i], chart.font, iLeft, candleDivHeight + volDivHeight + indDivHeight + 5);
				iLeft += tSize.cx + 5;
			}
		}
	}
	if ((paint.isMobile && chart.showCrossLine) || (!paint.isMobile && (chart == paint.touchDownView || chart == paint.touchMoveView))){
		let rightText = "";
		if (chart.touchPosition.y < candleDivHeight) {
			rightText = getChartValue(chart, chart.touchPosition).toFixed(chart.candleDigit);
		}
		else if (chart.touchPosition.y > candleDivHeight && chart.touchPosition.y < candleDivHeight + volDivHeight) {
			rightText = (getChartValue(chart, chart.touchPosition) / chart.magnitude).toFixed(chart.volDigit);
		} else if (chart.touchPosition.y > candleDivHeight + volDivHeight && chart.touchPosition.y < candleDivHeight + volDivHeight + indDivHeight) {
			rightText = getChartValue(chart, chart.touchPosition).toFixed(chart.indDigit);
		} else if (chart.touchPosition.y > candleDivHeight + volDivHeight + indDivHeight && chart.touchPosition.y < candleDivHeight + volDivHeight + indDivHeight + indDivHeight2) {
			rightText = getChartValue(chart, chart.touchPosition).toFixed(chart.indDigit2);
		}

		let drawY = chart.touchPosition.y;
		if (drawY > chart.size.cy - chart.hScaleHeight) {
			drawY = chart.size.cy - chart.hScaleHeight;
		}
		let tSize = paint.textSize(rightText, chart.font);
		if (chart.leftVScaleWidth > 0) {
			paint.fillRect(chart.crossTipColor, chart.leftVScaleWidth - tSize.cx, drawY - tSize.cy / 2 - 4, chart.leftVScaleWidth, drawY + tSize.cy / 2 + 3);
			paint.drawText(rightText, chart.textColor, chart.font, chart.leftVScaleWidth - tSize.cx, drawY - tSize.cy / 2);
		}
		if (chart.rightVScaleWidth > 0) {
			paint.fillRect(chart.crossTipColor, chart.size.cx - chart.rightVScaleWidth, drawY - tSize.cy / 2 - 4, chart.size.cx - chart.rightVScaleWidth + tSize.cx, drawY + tSize.cy / 2 + 3);
			paint.drawText(rightText, chart.textColor, chart.font, chart.size.cx - chart.rightVScaleWidth, drawY - tSize.cy / 2);
		}
		//绘制十字线
		let drawX = getChartX(chart, chart.crossStopIndex)
		if(chart.targetOldX == 0 && chart.targetOldX2 == 0){
			drawX = chart.touchPosition.x;
		}
		if (drawX < chart.leftVScaleWidth) {
			drawX = chart.leftVScaleWidth;
		}
		if (drawX > chart.size.cx - chart.rightVScaleWidth) {
			drawX = chart.size.cx - chart.rightVScaleWidth;
		}
		if (chart.showCrossLine) {
			paint.drawLine(chart.crossLineColor, chart.lineWidthChart, 0, chart.leftVScaleWidth, drawY, chart.size.cx - chart.rightVScaleWidth, drawY);
			paint.drawLine(chart.crossLineColor, chart.lineWidthChart, 0, drawX, 0, drawX, chart.size.cy - chart.hScaleHeight);
		}
		str = "A" + chart.crossStopIndex;
		if (chart.crossStopIndex != -1 && chart.crossStopIndex < chart.datas.length && str != "ANaN") {
			let date = new Date();
			date.setTime(chart.datas[chart.crossStopIndex].date);
			let xText = "";
			if (chart.cycle == "day") {
				xText = dateFormat("YYYY-mm-dd", date);
			} else if (chart.cycle == "minute") {
				xText = dateFormat("HH:MM", date);
			} else if (chart.cycle == "trend") {
				xText = dateFormat("HH:MM", date);
			}
			else if (chart.cycle == "second") {
				xText = dateFormat("HH:MM:SS", date);
			}
			else if (chart.cycle == "tick") {
				xText = chart.crossStopIndex + 1;
			}
			if (chart.hScaleFormat.length > 0) {
				xText = dateFormat(chart.hScaleFormat, date);
			}
			let xSize = paint.textSize(xText, chart.font);
			paint.fillRect(chart.crossTipColor, drawX - xSize.cx / 2 - 2, candleDivHeight + volDivHeight + indDivHeight, drawX + xSize.cx / 2 + 2, candleDivHeight + volDivHeight + indDivHeight + xSize.cy + 6);
			paint.drawText(xText, chart.textColor, chart.font, drawX - xSize.cx / 2, candleDivHeight + volDivHeight + indDivHeight + 3);
		}
	}
};

/*
* 计算最大最小值
* chart:图表
*/
let calculateChartMaxMin = function (chart) {
	chart.candleMax = 0;
	chart.candleMin = 0;
	chart.volMax = 0;
	chart.volMin = 0;
	chart.indMin = 0;
	chart.indMin = 0;
	let load1 = false;
	let load2 = false;
	let load3 = false;
	let load4 = false;
	let isTrend = chart.cycle == "trend";
	let firstOpen = chart.firstOpen;
	if (chart.datas && chart.datas.length > 0) {
		let lastValidIndex = chart.lastVisibleIndex;
		if (chart.lastValidIndex != -1) {
			lastValidIndex = chart.lastValidIndex;
		}
		for (let i = chart.firstVisibleIndex; i <= lastValidIndex; i++) {
			if (i == chart.firstVisibleIndex) {
				if (isTrend) {
					chart.candleMax = chart.datas[i].close;
					chart.candleMin = chart.datas[i].close;
					if(firstOpen == 0){
						firstOpen = chart.datas[i].close;
					}
				} else {
					chart.candleMax = chart.datas[i].high;
					chart.candleMin = chart.datas[i].low;
				}
				chart.volMax = chart.datas[i].volume;
				load1 = true;
				load2 = true;
				if (chart.showIndicator == "MACD") {
					chart.indMax = chart.alldifarr[i];
					chart.indMin = chart.alldifarr[i];
					load3 = true;
				}
				else if (chart.showIndicator == "KDJ") {
					chart.indMax = chart.kdjMap.k[i];
					chart.indMin = chart.kdjMap.k[i];
					load3 = true;
				}
				else if (chart.showIndicator == "RSI") {
					chart.indMax = chart.rsiMap.rsi6[i];
					chart.indMin = chart.rsiMap.rsi6[i];
					load3 = true;
				}
				else if (chart.showIndicator == "BIAS") {
					chart.indMax = chart.biasMap.bias1[i];
					chart.indMin = chart.biasMap.bias1[i];
					load3 = true;
				}
				else if (chart.showIndicator == "ROC") {
					chart.indMax = chart.rocMap.roc[i];
					chart.indMin = chart.rocMap.roc[i];
					load3 = true;
				}
				else if (chart.showIndicator == "WR") {
					chart.indMax = chart.wrMap.wr1[i];
					chart.indMin = chart.wrMap.wr1[i];
					load3 = true;
				} else if (chart.showIndicator == "CCI") {
					chart.indMax = chart.cciArr[i];
					chart.indMin = chart.cciArr[i];
					load3 = true;
				} else if (chart.showIndicator == "BBI") {
					chart.indMax = chart.bbiMap.bbi[i];
					chart.indMin = chart.bbiMap.bbi[i];
					load3 = true;
				}
				else if (chart.showIndicator == "TRIX") {
					chart.indMax = chart.trixMap.trix[i];
					chart.indMin = chart.trixMap.trix[i];
					load3 = true;
				}
				else if (chart.showIndicator == "DMA") {
					chart.indMax = chart.dmaMap.dif[i];
					chart.indMin = chart.dmaMap.dif[i];
					load3 = true;
				}
				if (chart.showIndicator2 == "MACD") {
					chart.indMax2 = chart.alldifarr[i];
					chart.indMin2 = chart.alldifarr[i];
					load4 = true;
				}
				else if (chart.showIndicator2 == "KDJ") {
					chart.indMax2 = chart.kdjMap.k[i];
					chart.indMin2 = chart.kdjMap.k[i];
					load4 = true;
				}
				else if (chart.showIndicator2 == "RSI") {
					chart.indMax2 = chart.rsiMap.rsi6[i];
					chart.indMin2 = chart.rsiMap.rsi6[i];
					load4 = true;
				}
				else if (chart.showIndicator2 == "BIAS") {
					chart.indMax2 = chart.biasMap.bias1[i];
					chart.indMin2 = chart.biasMap.bias1[i];
					load4 = true;
				}
				else if (chart.showIndicator2 == "ROC") {
					chart.indMax2 = chart.rocMap.roc[i];
					chart.indMin2 = chart.rocMap.roc[i];
					load4 = true;
				}
				else if (chart.showIndicator2 == "WR") {
					chart.indMax2 = chart.wrMap.wr1[i];
					chart.indMin2 = chart.wrMap.wr1[i];
					load4 = true;
				} else if (chart.showIndicator2 == "CCI") {
					chart.indMax2 = chart.cciArr[i];
					chart.indMin2 = chart.cciArr[i];
					load4 = true;
				} else if (chart.showIndicator2 == "BBI") {
					chart.indMax2 = chart.bbiMap.bbi[i];
					chart.indMin2 = chart.bbiMap.bbi[i];
					load4 = true;
				}
				else if (chart.showIndicator2 == "TRIX") {
					chart.indMax2 = chart.trixMap.trix[i];
					chart.indMin2 = chart.trixMap.trix[i];
					load4 = true;
				}
				else if (chart.showIndicator2 == "DMA") {
					chart.indMax2 = chart.dmaMap.dif[i];
					chart.indMin2 = chart.dmaMap.dif[i];
					load4 = true;
				}
			} else {
				if (isTrend) {
					if (chart.candleMax < chart.datas[i].close) {
						chart.candleMax = chart.datas[i].close;
					}
					if (chart.candleMin > chart.datas[i].close) {
						chart.candleMin = chart.datas[i].close;
					}
				} else {
					if (chart.candleMax < chart.datas[i].high) {
						chart.candleMax = chart.datas[i].high;
					}
					if (chart.candleMin > chart.datas[i].low) {
						chart.candleMin = chart.datas[i].low;
					}
				}
				if (chart.volMax < chart.datas[i].volume) {
					chart.volMax = chart.datas[i].volume;
				}
			}
			if (chart.showIndicator == "MACD") {
				if (chart.indMax < chart.alldifarr[i]) {
					chart.indMax = chart.alldifarr[i];
				}
				if (chart.indMax < chart.alldeaarr[i]) {
					chart.indMax = chart.alldeaarr[i];
				}
				if (chart.indMax < chart.allmacdarr[i]) {
					chart.indMax = chart.allmacdarr[i];
				}
				if (chart.indMin > chart.alldifarr[i]) {
					chart.indMin = chart.alldifarr[i];
				}
				if (chart.indMin > chart.alldeaarr[i]) {
					chart.indMin = chart.alldeaarr[i];
				}
				if (chart.indMin > chart.allmacdarr[i]) {
					chart.indMin = chart.allmacdarr[i];
				}
			} else if (chart.showIndicator == "KDJ") {
				if (chart.indMax < chart.kdjMap.k[i]) {
					chart.indMax = chart.kdjMap.k[i];
				}
				if (chart.indMax < chart.kdjMap.d[i]) {
					chart.indMax = chart.kdjMap.d[i];
				}
				if (chart.indMax < chart.kdjMap.j[i]) {
					chart.indMax = chart.kdjMap.j[i];
				}
				if (chart.indMin > chart.kdjMap.k[i]) {
					chart.indMin = chart.kdjMap.k[i];
				}
				if (chart.indMin > chart.kdjMap.d[i]) {
					chart.indMin = chart.kdjMap.d[i];
				}
				if (chart.indMin > chart.kdjMap.j[i]) {
					chart.indMin = chart.kdjMap.j[i];
				}
			} else if (chart.showIndicator == "RSI") {
				if (chart.indMax < chart.rsiMap.rsi6[i]) {
					chart.indMax = chart.rsiMap.rsi6[i];
				}
				if (chart.indMax < chart.rsiMap.rsi12[i]) {
					chart.indMax = chart.rsiMap.rsi12[i];
				}
				if (chart.indMax < chart.rsiMap.rsi24[i]) {
					chart.indMax = chart.rsiMap.rsi24[i];
				}
				if (chart.indMin > chart.rsiMap.rsi6[i]) {
					chart.indMin = chart.rsiMap.rsi6[i];
				}
				if (chart.indMin > chart.rsiMap.rsi12[i]) {
					chart.indMin = chart.rsiMap.rsi12[i];
				}
				if (chart.indMin > chart.rsiMap.rsi24[i]) {
					chart.indMin = chart.rsiMap.rsi24[i];
				}
			} else if (chart.showIndicator == "BIAS") {
				if (chart.indMax < chart.biasMap.bias1[i]) {
					chart.indMax = chart.biasMap.bias1[i];
				}
				if (chart.indMax < chart.biasMap.bias2[i]) {
					chart.indMax = chart.biasMap.bias2[i];
				}
				if (chart.indMax < chart.biasMap.bias3[i]) {
					chart.indMax = chart.biasMap.bias3[i];
				}
				if (chart.indMin > chart.biasMap.bias1[i]) {
					chart.indMin = chart.biasMap.bias1[i];
				}
				if (chart.indMin > chart.biasMap.bias2[i]) {
					chart.indMin = chart.biasMap.bias2[i];
				}
				if (chart.indMin > chart.biasMap.bias3[i]) {
					chart.indMin = chart.biasMap.bias3[i];
				}
			} else if (chart.showIndicator == "ROC") {
				if (chart.indMax < chart.rocMap.roc[i]) {
					chart.indMax = chart.rocMap.roc[i];
				}
				if (chart.indMax < chart.rocMap.maroc[i]) {
					chart.indMax = chart.rocMap.maroc[i];
				}
				if (chart.indMin > chart.rocMap.roc[i]) {
					chart.indMin = chart.rocMap.roc[i];
				}
				if (chart.indMin > chart.rocMap.maroc[i]) {
					chart.indMin = chart.rocMap.maroc[i];
				}
			}
			else if (chart.showIndicator == "WR") {
				if (chart.indMax < chart.wrMap.wr1[i]) {
					chart.indMax = chart.wrMap.wr1[i];
				}
				if (chart.indMax < chart.wrMap.wr2[i]) {
					chart.indMax = chart.wrMap.wr2[i];
				}
				if (chart.indMin > chart.wrMap.wr1[i]) {
					chart.indMin = chart.wrMap.wr1[i];
				}
				if (chart.indMin > chart.wrMap.wr2[i]) {
					chart.indMin = chart.wrMap.wr2[i];
				}
			} else if (chart.showIndicator == "CCI") {
				if (chart.indMax < chart.cciArr[i]) {
					chart.indMax = chart.cciArr[i];
				}
				if (chart.indMin > chart.cciArr[i]) {
					chart.indMin = chart.cciArr[i];
				}
			} else if (chart.showIndicator == "BBI") {
				if (chart.indMax < chart.bbiMap.bbi[i]) {
					chart.indMax = chart.bbiMap.bbi[i];
				}
				if (chart.indMin > chart.bbiMap.bbi[i]) {
					chart.indMin = chart.bbiMap.bbi[i];
				}
			} else if (chart.showIndicator == "TRIX") {
				if (chart.indMax < chart.trixMap.trix[i]) {
					chart.indMax = chart.trixMap.trix[i];
				}
				if (chart.indMax < chart.trixMap.matrix[i]) {
					chart.indMax = chart.trixMap.matrix[i];
				}
				if (chart.indMin > chart.trixMap.trix[i]) {
					chart.indMin = chart.trixMap.trix[i];
				}
				if (chart.indMin > chart.trixMap.matrix[i]) {
					chart.indMin = chart.trixMap.matrix[i];
				}
			} else if (chart.showIndicator == "DMA") {
				if (chart.indMax < chart.dmaMap.dif[i]) {
					chart.indMax = chart.dmaMap.dif[i];
				}
				if (chart.indMax < chart.dmaMap.difma[i]) {
					chart.indMax = chart.dmaMap.difma[i];
				}
				if (chart.indMin > chart.dmaMap.dif[i]) {
					chart.indMin = chart.dmaMap.dif[i];
				}
				if (chart.indMin > chart.dmaMap.difma[i]) {
					chart.indMin = chart.dmaMap.difma[i];
				}
			}
			if (chart.showIndicator2 == "MACD") {
				if (chart.indMax2 < chart.alldifarr[i]) {
					chart.indMax2 = chart.alldifarr[i];
				}
				if (chart.indMax2 < chart.alldeaarr[i]) {
					chart.indMax2 = chart.alldeaarr[i];
				}
				if (chart.indMax2 < chart.allmacdarr[i]) {
					chart.indMax2 = chart.allmacdarr[i];
				}
				if (chart.indMin2 > chart.alldifarr[i]) {
					chart.indMin2 = chart.alldifarr[i];
				}
				if (chart.indMin2 > chart.alldeaarr[i]) {
					chart.indMin2 = chart.alldeaarr[i];
				}
				if (chart.indMin2 > chart.allmacdarr[i]) {
					chart.indMin2 = chart.allmacdarr[i];
				}
			} else if (chart.showIndicator2 == "KDJ") {
				if (chart.indMax2 < chart.kdjMap.k[i]) {
					chart.indMax2 = chart.kdjMap.k[i];
				}
				if (chart.indMax2 < chart.kdjMap.d[i]) {
					chart.indMax2 = chart.kdjMap.d[i];
				}
				if (chart.indMax2 < chart.kdjMap.j[i]) {
					chart.indMax2 = chart.kdjMap.j[i];
				}
				if (chart.indMin2 > chart.kdjMap.k[i]) {
					chart.indMin2 = chart.kdjMap.k[i];
				}
				if (chart.indMin2 > chart.kdjMap.d[i]) {
					chart.indMin2 = chart.kdjMap.d[i];
				}
				if (chart.indMin2 > chart.kdjMap.j[i]) {
					chart.indMin2 = chart.kdjMap.j[i];
				}
			} else if (chart.showIndicator2 == "RSI") {
				if (chart.indMax2 < chart.rsiMap.rsi6[i]) {
					chart.indMax2 = chart.rsiMap.rsi6[i];
				}
				if (chart.indMax2 < chart.rsiMap.rsi12[i]) {
					chart.indMax2 = chart.rsiMap.rsi12[i];
				}
				if (chart.indMax2 < chart.rsiMap.rsi24[i]) {
					chart.indMax2 = chart.rsiMap.rsi24[i];
				}
				if (chart.indMin2 > chart.rsiMap.rsi6[i]) {
					chart.indMin2 = chart.rsiMap.rsi6[i];
				}
				if (chart.indMin2 > chart.rsiMap.rsi12[i]) {
					chart.indMin2 = chart.rsiMap.rsi12[i];
				}
				if (chart.indMin2 > chart.rsiMap.rsi24[i]) {
					chart.indMin2 = chart.rsiMap.rsi24[i];
				}
			} else if (chart.showIndicator2 == "BIAS") {
				if (chart.indMax2 < chart.biasMap.bias1[i]) {
					chart.indMax2 = chart.biasMap.bias1[i];
				}
				if (chart.indMax2 < chart.biasMap.bias2[i]) {
					chart.indMax2 = chart.biasMap.bias2[i];
				}
				if (chart.indMax2 < chart.biasMap.bias3[i]) {
					chart.indMax2 = chart.biasMap.bias3[i];
				}
				if (chart.indMin2 > chart.biasMap.bias1[i]) {
					chart.indMin2 = chart.biasMap.bias1[i];
				}
				if (chart.indMin2 > chart.biasMap.bias2[i]) {
					chart.indMin2 = chart.biasMap.bias2[i];
				}
				if (chart.indMin2 > chart.biasMap.bias3[i]) {
					chart.indMin2 = chart.biasMap.bias3[i];
				}
			} else if (chart.showIndicator2 == "ROC") {
				if (chart.indMax2 < chart.rocMap.roc[i]) {
					chart.indMax2 = chart.rocMap.roc[i];
				}
				if (chart.indMax2 < chart.rocMap.maroc[i]) {
					chart.indMax2 = chart.rocMap.maroc[i];
				}
				if (chart.indMin2 > chart.rocMap.roc[i]) {
					chart.indMin2 = chart.rocMap.roc[i];
				}
				if (chart.indMin2 > chart.rocMap.maroc[i]) {
					chart.indMin2 = chart.rocMap.maroc[i];
				}
			}
			else if (chart.showIndicator2 == "WR") {
				if (chart.indMax2 < chart.wrMap.wr1[i]) {
					chart.indMax2 = chart.wrMap.wr1[i];
				}
				if (chart.indMax2 < chart.wrMap.wr2[i]) {
					chart.indMax2 = chart.wrMap.wr2[i];
				}
				if (chart.indMin2 > chart.wrMap.wr1[i]) {
					chart.indMin2 = chart.wrMap.wr1[i];
				}
				if (chart.indMin2 > chart.wrMap.wr2[i]) {
					chart.indMin2 = chart.wrMap.wr2[i];
				}
			} else if (chart.showIndicator2 == "CCI") {
				if (chart.indMax2 < chart.cciArr[i]) {
					chart.indMax2 = chart.cciArr[i];
				}
				if (chart.indMin2 > chart.cciArr[i]) {
					chart.indMin2 = chart.cciArr[i];
				}
			} else if (chart.showIndicator2 == "BBI") {
				if (chart.indMax2 < chart.bbiMap.bbi[i]) {
					chart.indMax2 = chart.bbiMap.bbi[i];
				}
				if (chart.indMin2 > chart.bbiMap.bbi[i]) {
					chart.indMin2 = chart.bbiMap.bbi[i];
				}
			} else if (chart.showIndicator2 == "TRIX") {
				if (chart.indMax2 < chart.trixMap.trix[i]) {
					chart.indMax2 = chart.trixMap.trix[i];
				}
				if (chart.indMax2 < chart.trixMap.matrix[i]) {
					chart.indMax2 = chart.trixMap.matrix[i];
				}
				if (chart.indMin2 > chart.trixMap.trix[i]) {
					chart.indMin2 = chart.trixMap.trix[i];
				}
				if (chart.indMin2 > chart.trixMap.matrix[i]) {
					chart.indMin2 = chart.trixMap.matrix[i];
				}
			} else if (chart.showIndicator2 == "DMA") {
				if (chart.indMax2 < chart.dmaMap.dif[i]) {
					chart.indMax2 = chart.dmaMap.dif[i];
				}
				if (chart.indMax2 < chart.dmaMap.difma[i]) {
					chart.indMax2 = chart.dmaMap.difma[i];
				}
				if (chart.indMin2 > chart.dmaMap.dif[i]) {
					chart.indMin2 = chart.dmaMap.dif[i];
				}
				if (chart.indMin2 > chart.dmaMap.difma[i]) {
					chart.indMin2 = chart.dmaMap.difma[i];
				}
			}
		}
	}
	if (chart.shapes.length > 0) {
		let lastValidIndex = chart.lastVisibleIndex;
		if (chart.lastValidIndex != -1) {
			lastValidIndex = chart.lastValidIndex;
		}
		for (let s = 0; s < chart.shapes.length; s++) {
			let shape = chart.shapes[s];
			if (shape.datas.length > 0) {
				for (let i = chart.firstVisibleIndex; i <= lastValidIndex; i++) {
					if (shape.divIndex == 0) {
						if (!load1 && i == chart.firstVisibleIndex) {
							if (shape.leftOrRight) {
								chart.candleMax = shape.datas[i];
								chart.candleMin = shape.datas[i];
							} else {
								chart.candleMaxRight = shape.datas[i];
								chart.candleMinRight = shape.datas[i];
							}
							load1 = true;
						} else {
							if (shape.leftOrRight) {
								if (shape.datas[i] > chart.candleMax) {
									chart.candleMax = shape.datas[i];
								}
								if (shape.datas[i] < chart.candleMin) {
									chart.candleMin = shape.datas[i];
								}
							} else {
								if (shape.datas[i] > chart.candleMaxRight) {
									chart.candleMaxRight = shape.datas[i];
								}
								if (shape.datas[i] < chart.candleMinRight) {
									chart.candleMinRight = shape.datas[i];
								}
							}
						}
					} else if (shape.divIndex == 1) {
						if (!load2 && i == chart.firstVisibleIndex) {
							if (shape.leftOrRight) {
								chart.volMax = shape.datas[i];
								chart.volMin = shape.datas[i];
							} else {
								chart.volMaxRight = shape.datas[i];
								chart.volMinRight = shape.datas[i];
							}
							load2 = true;
						} else {
							if (shape.leftOrRight) {
								if (shape.datas[i] > chart.volMax) {
									chart.volMax = shape.datas[i];
								}
								if (shape.datas[i] < chart.volMin) {
									chart.volMin = shape.datas[i];
								}
							} else {
								if (shape.datas[i] > chart.volMaxRight) {
									chart.volMaxRight = shape.datas[i];
								}
								if (shape.datas[i] < chart.volMinRight) {
									chart.volMinRight = shape.datas[i];
								}
							}
						}
					} else if (shape.divIndex == 2) {
						if (!load3 && i == chart.firstVisibleIndex) {
							if (shape.leftOrRight) {
								chart.indMax = shape.datas[i];
								chart.indMin = shape.datas[i];
							} else {
								chart.indMaxRight = shape.datas[i];
								chart.indMinRight = shape.datas[i];
							}
							load3 = true;
						} else {
							if (shape.leftOrRight) {
								if (shape.datas[i] > chart.indMax) {
									chart.indMax = shape.datas[i];
								}
								if (shape.datas[i] < chart.indMin) {
									chart.indMin = shape.datas[i];
								}
							} else {
								if (shape.datas[i] > chart.indMaxRight) {
									chart.indMaxRight = shape.datas[i];
								}
								if (shape.datas[i] < chart.indMinRight) {
									chart.indMinRight = shape.datas[i];
								}
							}
						}
					} else if (shape.divIndex == 3) {
						if (!load4 && i == chart.firstVisibleIndex) {
							if (shape.leftOrRight) {
								chart.indMax2 = shape.datas[i];
								chart.indMin2 = shape.datas[i];
							} else {
								chart.indMax2Right = shape.datas[i];
								chart.indMin2Right = shape.datas[i];
							}
							load4 = true;
						} else {
							if (shape.leftOrRight) {
								if (shape.datas[i] > chart.indMax2) {
									chart.indMax2 = shape.datas[i];
								}
								if (shape.datas[i] < chart.indMin2) {
									chart.indMin2 = shape.datas[i];
								}
							} else {
								if (shape.datas[i] > chart.indMax2Right) {
									chart.indMax2Right = shape.datas[i];
								}
								if (shape.datas[i] < chart.indMin2Right) {
									chart.indMin2Right = shape.datas[i];
								}
							}
						}
					}
				}
			}
			if (shape.datas2.length > 0) {
				for (let i = chart.firstVisibleIndex; i <= lastValidIndex; i++) {
					if (shape.divIndex == 0) {
						if (shape.leftOrRight) {
							if (shape.datas2[i] > chart.candleMax) {
								chart.candleMax = shape.datas2[i];
							}
							if (shape.datas2[i] < chart.candleMin) {
								chart.candleMin = shape.datas2[i];
							}
						} else {
							if (shape.datas2[i] > chart.candleMaxRight) {
								chart.candleMaxRight = shape.datas2[i];
							}
							if (shape.datas2[i] < chart.candleMinRight) {
								chart.candleMinRight = shape.datas2[i];
							}
						}
					} else if (shape.divIndex == 1) {
						if (shape.leftOrRight) {
							if (shape.datas2[i] > chart.volMax) {
								chart.volMax = shape.datas2[i];
							}
							if (shape.datas2[i] < chart.volMin) {
								chart.volMin = shape.datas2[i];
							}
						} else {
							if (shape.datas2[i] > chart.volMaxRight) {
								chart.volMaxRight = shape.datas2[i];
							}
							if (shape.datas2[i] < chart.volMinRight) {
								chart.volMinRight = shape.datas2[i];
							}
						}
					} else if (shape.divIndex == 2) {
						if (shape.leftOrRight) {
							if (shape.datas2[i] > chart.indMax) {
								chart.indMax = shape.datas2[i];
							}
							if (shape.datas2[i] < chart.indMin) {
								chart.indMin = shape.datas2[i];
							}
						} else {
							if (shape.datas2[i] > chart.indMaxRight) {
								chart.indMaxRight = shape.datas2[i];
							}
							if (shape.datas2[i] < chart.indMinRight) {
								chart.indMinRight = shape.datas2[i];
							}
						}
					} else if (shape.divIndex == 3) {
						if (shape.leftOrRight) {
							if (shape.datas2[i] > chart.indMax2) {
								chart.indMax2 = shape.datas2[i];
							}
							if (shape.datas2[i] < chart.indMin2) {
								chart.indMin2 = shape.datas2[i];
							}
						} else {
							if (shape.datas2[i] > chart.indMax2Right) {
								chart.indMax2Right = shape.datas2[i];
							}
							if (shape.datas2[i] < chart.indMin2Right) {
								chart.indMin2Right = shape.datas2[i];
							}
						}
					}
				}
			}
		}
	}
	if (isTrend) {
		let subMax = Math.max(Math.abs(chart.candleMax - firstOpen), Math.abs(chart.candleMin - firstOpen));
		chart.candleMax = firstOpen + subMax;
		chart.candleMin = firstOpen - subMax;
	} else {
		if (chart.candleMax == 0 && chart.candleMin == 0) {
			chart.candleMax = 1;
			chart.candleMin = -1;
		}
		if (chart.volMax == 0 && chart.volMin == 0) {
			chart.volMax = 1;
			chart.volMin = -1;
		}
		if (chart.indMax == 0 && chart.indMin == 0) {
			chart.indMax = 1;
			chart.indMin = -1;
		}
		if (chart.indMax2 == 0 && chart.indMin2 == 0) {
			chart.indMax2 = 1;
			chart.indMin2 = -1;
		}
		if (chart.candleMaxRight == 0 && chart.candleMinRight == 0) {
			chart.candleMaxRight = 1;
			chart.candleMinRight = -1;
		}
		if (chart.volMaxRight == 0 && chart.volMinRight == 0) {
			chart.volMaxRight = 1;
			chart.volMinRight = -1;
		}
		if (chart.indMaxRight == 0 && chart.indMinRight == 0) {
			chart.indMaxRight = 1;
			chart.indMinRight = -1;
		}
		if (chart.indMax2Right == 0 && chart.indMin2Right == 0) {
			chart.indMax2Right = 1;
			chart.indMin2Right = -1;
		}
	}
};

/*
* 绘制线条
* chart:图表
* paint:绘图对象
* clipRect:裁剪区域
* divIndex:图层
* datas:数据
* color:颜色
* selected:是否选中
*/
let drawChartLines = function (chart, paint, clipRect, divIndex, datas, color, selected) {
	let drawPoints = new Array();
	let maxVisibleRecord = getChartMaxVisibleCount(chart, chart.hScalePixel, getChartWorkAreaWidth(chart));
	let lastValidIndex = chart.lastVisibleIndex;
	if (chart.lastValidIndex != -1) {
		lastValidIndex = chart.lastValidIndex;
	}
	for (let i = chart.firstVisibleIndex; i <= lastValidIndex; i++) {
		let x = getChartX(chart, i);
		let value = datas[i];
		let y = getChartY(chart, divIndex, value);
		drawPoints.push(new FCPoint(x, y));
		if (selected) {
			let kPInterval = parseInt(maxVisibleRecord / 30);
			if (kPInterval < 2) {
				kPInterval = 3;
			}
			if (i % kPInterval == 0) {
				paint.fillRect(color, x - 3, y - 3, x + 3, y + 3);
			}
		}
	}
	paint.drawPolyline(color, chart.lineWidthChart, 0, drawPoints);
};

/*
* 绘制线条到右轴
* chart:图表
* paint:绘图对象
* clipRect:裁剪区域
* divIndex:图层
* datas:数据
* color:颜色
* selected:是否选中
*/
let drawChartLinesInRight = function (chart, paint, clipRect, divIndex, datas, color, selected) {
	let drawPoints = new Array();
	let maxVisibleRecord = getChartMaxVisibleCount(chart, chart.hScalePixel, getChartWorkAreaWidth(chart));
	let lastValidIndex = chart.lastVisibleIndex;
	if (chart.lastValidIndex != -1) {
		lastValidIndex = chart.lastValidIndex;
	}
	for (let i = chart.firstVisibleIndex; i <= lastValidIndex; i++) {
		let x = getChartX(chart, i);
		let value = datas[i];
		let y = getChartYInRight(chart, divIndex, value);
		drawPoints.push(new FCPoint(x, y));
		if (selected) {
			let kPInterval = parseInt(maxVisibleRecord / 30);
			if (kPInterval < 2) {
				kPInterval = 3;
			}
			if (i % kPInterval == 0) {
				paint.fillRect(color, x - 3, y - 3, x + 3, y + 3);
			}
		}
	}
	paint.drawPolyline(color, chart.lineWidthChart, 0, drawPoints);
};

/*
* 绘制画线工具
* chart:图表
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawChartPlot = function (chart, paint, clipRect) {
	paint.save();
	let divHeight = getCandleDivHeight(chart);
	paint.setClip(chart.leftVScaleWidth, 0, chart.size.cx - chart.rightVScaleWidth, divHeight);
	for (let i = 0; i < chart.plots.length; i++) {
		let plot = chart.plots[i];
		let index1 = 0, index2 = 0, index3 = 0;
		let mpx1 = 0, mpy1 = 0, mpx2 = 0, mpy2 = 0, mpx3 = 0, mpy3 = 0;
		if (plot.plotType == "LRLine" || plot.plotType == "LRChannel" || plot.plotType == "LRBand") {
			let list = new Array();
			index1 = getChartIndexByDate(chart, plot.key1);
			index2 = getChartIndexByDate(chart, plot.key2);
			let minIndex = Math.min(index1, index2);
			let maxIndex = Math.max(index1, index2);
			for (let j = minIndex; j <= maxIndex; j++) {
				list.push(chart.datas[j].close);
			}
			linearRegressionEquation(chart, list);
			plot.value1 = chart.bChart;
			plot.value2 = chart.kChart * (maxIndex - minIndex + 1) + chart.bChart;
		}
		else if (plot.plotType == "BoxLine" || plot.plotType == "TironeLevels" || plot.plotType == "QuadrantLines") {
			getCandleRange(chart, plot);
			let nHigh = chart.nHighChart, nLow = chart.nLowChart;
			index1 = getChartIndexByDate(chart, plot.key1);
			index2 = getChartIndexByDate(chart, plot.key2);
			plot.key1 = getChartDateByIndex(chart, Math.min(index1, index2));
			plot.key2 = getChartDateByIndex(chart, Math.max(index1, index2));
			plot.value1 = nHigh;
			plot.value2 = nLow;
		}
		if (plot.key1) {
			index1 = getChartIndexByDate(chart, plot.key1);
			mpx1 = getChartX(chart, index1);
			mpy1 = getChartY(chart, 0, plot.value1);
			if (chart.sPlot == plot) {
				paint.fillEllipse(plot.pointColor, mpx1 - chart.plotPointSizeChart, mpy1 - chart.plotPointSizeChart, mpx1 + chart.plotPointSizeChart, mpy1 + chart.plotPointSizeChart);
			}
		}
		if (plot.key2) {
			index2 = getChartIndexByDate(chart, plot.key2);
			mpx2 = getChartX(chart, index2);
			mpy2 = getChartY(chart, 0, plot.value2);
			if (chart.sPlot == plot) {
				paint.fillEllipse(plot.pointColor, mpx2 - chart.plotPointSizeChart, mpy2 - chart.plotPointSizeChart, mpx2 + chart.plotPointSizeChart, mpy2 + chart.plotPointSizeChart);
			}
		}
		if (plot.key3) {
			index3 = getChartIndexByDate(chart, plot.key3);
			mpx3 = getChartX(chart, index3);
			mpy3 = getChartY(chart, 0, plot.value3);
			if (chart.sPlot == plot) {
				paint.fillEllipse(plot.pointColor, mpx3 - chart.plotPointSizeChart, mpy3 - chart.plotPointSizeChart, mpx3 + chart.plotPointSizeChart, mpy3 + chart.plotPointSizeChart);
			}
		}
		if (plot.plotType == "Line") {
			lineXY(chart, mpx1, mpy1, mpx2, mpy2, 0, 0);
			if (mpx2 == mpx1) {
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, 0, mpx1, divHeight);
			} else {
				let newX1 = chart.leftVScaleWidth;
				let newY1 = newX1 * chart.kChart + chart.bChart;
				let newX2 = chart.size.cx - chart.rightVScaleWidth;
				let newY2 = newX2 * chart.kChart + chart.bChart;
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, newX1, newY1, newX2, newY2);
			}
		}
		else if (plot.plotType == "ArrowSegment") {
			let ARROW_Size = 24;
			let slopy, cosy, siny;
			slopy = Math.atan2(mpy1 - mpy2, mpx1 - mpx2);
			cosy = Math.cos(slopy);
			siny = Math.sin(slopy);
			let ptPoint = new FCPoint();
			ptPoint.x = mpx2;
			ptPoint.y = mpy2;
			let pts = new Array();
			pts.push(new FCPoint());
			pts.push(new FCPoint());
			pts.push(new FCPoint());
			pts[0] = ptPoint;
			pts[1].x = ptPoint.x + (ARROW_Size * cosy - (ARROW_Size / 2.0 * siny) + 0.5);
			pts[1].y = ptPoint.y + (ARROW_Size * siny + (ARROW_Size / 2.0 * cosy) + 0.5);
			pts[2].x = ptPoint.x + (ARROW_Size * cosy + ARROW_Size / 2.0 * siny + 0.5);
			pts[2].y = ptPoint.y - (ARROW_Size / 2.0 * cosy - ARROW_Size * siny + 0.5);
			ARROW_Size = 20;
			let ptPoint2 = new FCPoint();
			ptPoint2.x = mpx2;
			ptPoint2.y = mpy2;
			let pts2 = new Array();
			pts2.push(new FCPoint());
			pts2.push(new FCPoint());
			pts2.push(new FCPoint());
			pts2[0] = ptPoint2;
			pts2[1].x = ptPoint2.x + (ARROW_Size * cosy - (ARROW_Size / 2.0 * siny) + 0.5);
			pts2[1].y = ptPoint2.y + (ARROW_Size * siny + (ARROW_Size / 2.0 * cosy) + 0.5);
			pts2[2].x = ptPoint2.x + (ARROW_Size * cosy + ARROW_Size / 2.0 * siny + 0.5);
			pts2[2].y = ptPoint2.y - (ARROW_Size / 2.0 * cosy - ARROW_Size * siny + 0.5);
			lineXY(chart, pts2[1].x, pts2[1].y, pts2[2].x, pts2[2].y, 0, 0);
			let newX1 = 0, newY1 = 0, newX2 = 0, newY2 = 0;
			if (pts2[1].x > pts2[2].x) {
				newX1 = pts2[2].x + (pts2[1].x - pts2[2].x) / 3;
				newX2 = pts2[2].x + (pts2[1].x - pts2[2].x) * 2 / 3;
			} else {
				newX1 = pts2[1].x + (pts2[2].x - pts2[1].x) / 3;
				newX2 = pts2[1].x + (pts2[2].x - pts2[1].x) * 2 / 3;
			}
			if (chart.kChart == 0 && chart.bChart == 0) {
				if (pts2[1].y > pts2[2].y) {
					newY1 = pts2[2].y + (pts2[1].y - pts2[2].y) / 3;
					newY2 = pts2[2].y + (pts2[1].y - pts2[2].y) * 2 / 3;
				} else {
					newY1 = pts2[1].y + (pts2[2].y - pts2[1].y) / 3;
					newY2 = pts2[1].y + (pts2[2].y - pts2[1].y) * 2 / 3;
				}
			} else {
				newY1 = (chart.kChart * newX1) + chart.bChart;
				newY2 = (chart.kChart * newX2) + chart.bChart;
			}
			pts2[1].x = newX1;
			pts2[1].y = newY1;
			pts2[2].x = newX2;
			pts2[2].y = newY2;
			let drawPoints = new Array();
			drawPoints.push(new FCPoint());
			drawPoints.push(new FCPoint());
			drawPoints.push(new FCPoint());
			drawPoints.push(new FCPoint());
			drawPoints.push(new FCPoint());
			drawPoints.push(new FCPoint());
			drawPoints[0].x = ptPoint.x;
			drawPoints[0].y = ptPoint.y;
			drawPoints[1].x = pts[1].x;
			drawPoints[1].y = pts[1].y;
			if (mpy1 >= mpy2) {
				drawPoints[2].x = pts2[1].x;
				drawPoints[2].y = pts2[1].y;
			} else {
				drawPoints[2].x = pts2[2].x;
				drawPoints[2].y = pts2[2].y;
			}
			drawPoints[3].x = mpx1;
			drawPoints[3].y = mpy1;
			if (mpy1 >= mpy2) {
				drawPoints[4].x = pts2[2].x;
				drawPoints[4].y = pts2[2].y;
			} else {
				drawPoints[4].x = pts2[1].x;
				drawPoints[4].y = pts2[1].y;
			}
			drawPoints[5].x = pts[2].x;
			drawPoints[5].y = pts[2].y;

			paint.beginPath();
			for (let j = 0; j < 6; j++) {
				if (j > 0) {
					paint.addLine(drawPoints[j - 1].x, drawPoints[j - 1].y, drawPoints[j].x, drawPoints[j].y);
				}
			}
			paint.fillPath(plot.lineColor);
			paint.closePath();
		}
		else if (plot.plotType == "AngleLine") {
			lineXY(chart, mpx1, mpy1, mpx2, mpy2, 0, 0);
			if (mpx2 == mpx1) {
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, 0, mpx1, divHeight);
			} else {
				let newX1 = chart.leftVScaleWidth;
				let newY1 = newX1 * chart.kChart + chart.bChart;
				let newX2 = chart.size.cx - chart.rightVScaleWidth;
				let newY2 = newX2 * chart.kChart + chart.bChart;
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, newX1, newY1, newX2, newY2);
			}
			lineXY(chart, mpx1, mpy1, mpx3, mpy3, 0, 0);
			if (mpx3 == mpx1) {
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, 0, mpx1, divHeight);
			} else {
				let newX1 = chart.leftVScaleWidth;
				let newY1 = newX1 * chart.kChart + chart.bChart;
				let newX2 = chart.size.cx - chart.rightVScaleWidth;
				let newY2 = newX2 * chart.kChart + chart.bChart;
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, newX1, newY1, newX2, newY2);
			}
		}
		else if (plot.plotType == "Parallel") {
			lineXY(chart, mpx1, mpy1, mpx2, mpy2, 0, 0);
			if (mpx2 == mpx1) {
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, 0, mpx1, divHeight);
			} else {
				let newX1 = chart.leftVScaleWidth;
				let newY1 = newX1 * chart.kChart + chart.bChart;
				let newX2 = chart.size.cx - chart.rightVScaleWidth;
				let newY2 = newX2 * chart.kChart + chart.bChart;
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, newX1, newY1, newX2, newY2);
			}
			let newB = mpy3 - chart.kChart * mpx3;
			if (mpx2 == mpx1) {
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx3, 0, mpx3, divHeight);
			} else {
				let newX1 = chart.leftVScaleWidth;
				let newY1 = newX1 * chart.kChart + newB;
				let newX2 = chart.size.cx - chart.rightVScaleWidth;
				let newY2 = newX2 * chart.kChart + newB;
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, newX1, newY1, newX2, newY2);
			}
		}
		else if (plot.plotType == "Percent") {
			let list = getPercentParams(mpy1, mpy2);
			let texts = new Array();
			texts.push("0%");
			texts.push("25%");
			texts.push("50%");
			texts.push("75%");
			texts.push("100%");
			for (let j = 0; j < list.length; j++) {
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, chart.leftVScaleWidth, list[j], chart.size.cx - chart.rightVScaleWidth, list[j]);
				let tSize = paint.textSize(texts[j], chart.font);
				paint.drawText(texts[j], chart.textColor, chart.font, chart.leftVScaleWidth + 5, list[j] - tSize.cy - 2);
			}
		}
		else if (plot.plotType == "FiboTimezone") {
			let fValue = 1;
			let aIndex = index1;
			let pos = 1;
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, 0, mpx1, divHeight);
			let tSize = paint.textSize("1", chart.font);
			paint.drawText("1", chart.textColor, chart.font, mpx1, divHeight - tSize.cy);
			while (aIndex + fValue <= chart.lastVisibleIndex) {
				fValue = fibonacciValue(pos);
				let newIndex = aIndex + fValue;
				let newX = getChartX(chart, newIndex);
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, newX, 0, newX, divHeight);
				let tSize2 = paint.textSize(fValue, chart.font);
				paint.drawText(fValue, chart.textColor, chart.font, newX, divHeight - tSize2.cy);
				pos++;
			}
		}
		else if (plot.plotType == "SpeedResist") {
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, mpy1, mpx2, mpy2);
			if (mpx1 != mpx2 && mpy1 != mpy2) {
				let firstP = new FCPoint(mpx2, mpy2 - (mpy2 - mpy1) / 3);
				let secondP = new FCPoint(mpx2, mpy2 - (mpy2 - mpy1) * 2 / 3);
				let startP = new FCPoint(mpx1, mpy1);
				let fK = 0, fB = 0, sK = 0, sB = 0;
				lineXY(chart, startP.x, startP.y, firstP.x, firstP.y, 0, 0);
				fK = chart.kChart;
				fB = chart.bChart;
				lineXY(chart, startP.x, startP.y, secondP.x, secondP.y, 0, 0);
				sK = chart.kChart;
				sB = chart.bChart;
				let newYF = 0, newYS = 0;
				let newX = 0;
				if (mpx2 > mpx1) {
					newYF = fK * (chart.size.cx - chart.rightVScaleWidth) + fB;
					newYS = sK * (chart.size.cx - chart.rightVScaleWidth) + sB;
					newX = (chart.size.cx - chart.rightVScaleWidth);
				}
				else {
					newYF = fB;
					newYS = sB;
					newX = chart.leftVScaleWidth;
				}
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, startP.x, startP.y, newX, newYF);
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, startP.x, startP.y, newX, newYS);
			}
		}
		else if (plot.plotType == "FiboFanline") {
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, mpy1, mpx2, mpy2);
			if (mpx1 != mpx2 && mpy1 != mpy2) {
				let firstP = new FCPoint(mpx2, mpy2 - (mpy2 - mpy1) * 0.382);
				let secondP = new FCPoint(mpx2, mpy2 - (mpy2 - mpy1) * 0.5);
				let thirdP = new FCPoint(mpx2, mpy2 - (mpy2 - mpy1) * 0.618);
				let startP = new FCPoint(mpx1, mpy1);
				let listP = new Array();
				listP.push(firstP);
				listP.push(secondP);
				listP.push(thirdP);
				let listSize = listP.length;
				for (let j = 0; j < listSize; j++) {
					//获取直线参数
					lineXY(chart, startP.x, startP.y, listP[j].x, listP[j].y, 0, 0);
					let newX = 0;
					let newY = 0;
					if (mpx2 > mpx1) {
						newY = chart.kChart * (chart.size.cx - chart.rightVScaleWidth) + chart.bChart;
						newX = (chart.size.cx - chart.rightVScaleWidth);
					}
					else {
						newY = chart.bChart;
						newX = chart.leftVScaleWidth;
					}
					paint.drawLine(plot.lineColor, plot.lineWidth, 0, startP.x, startP.y, newX, newY);
				}
			}
		}
		else if (plot.plotType == "LRLine") {
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, mpy1, mpx2, mpy2);
		}
		else if (plot.plotType == "LRBand") {
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, mpy1, mpx2, mpy2);
			getLRBandRange(chart, plot, chart.kChart, chart.bChart);
			mpy1 = getChartY(chart, 0, plot.value1 + chart.upSubValue);
			mpy2 = getChartY(chart, 0, plot.value2 + chart.upSubValue);
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, mpy1, mpx2, mpy2);
			mpy1 = getChartY(chart, 0, plot.value1 - chart.downSubValue);
			mpy2 = getChartY(chart, 0, plot.value2 - chart.downSubValue);
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, mpy1, mpx2, mpy2);
		}
		else if (plot.plotType == "LRChannel") {
			getLRBandRange(chart, plot, chart.kChart, chart.bChart);
			lineXY(chart, mpx1, mpy1, mpx2, mpy2, 0, 0);
			let rightX = chart.size.cx - chart.rightVScaleWidth;
			let rightY = rightX * chart.kChart + chart.bChart;
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, mpy1, rightX, rightY);
			mpy1 = getChartY(chart, 0, plot.value1 + chart.upSubValue);
			mpy2 = getChartY(chart, 0, plot.value2 + chart.upSubValue);
			lineXY(chart, mpx1, mpy1, mpx2, mpy2, 0, 0);
			rightY = rightX * chart.kChart + chart.bChart;
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, mpy1, rightX, rightY);
			mpy1 = getChartY(chart, 0, plot.value1 - chart.downSubValue);
			mpy2 = getChartY(chart, 0, plot.value2 - chart.downSubValue);
			lineXY(chart, mpx1, mpy1, mpx2, mpy2, 0, 0);
			rightY = rightX * chart.kChart + chart.bChart;
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, mpy1, rightX, rightY);
		}
		else if (plot.plotType == "Segment") {
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, mpy1, mpx2, mpy2);
		} else if (plot.plotType == "Ray") {
			lineXY(chart, mpx1, mpy1, mpx2, mpy2, 0, 0);
			if (chart.kChart != 0 || chart.bChart != 0) {
				let leftX = chart.leftVScaleWidth;
				let leftY = leftX * chart.kChart + chart.bChart;
				let rightX = chart.size.cx - chart.rightVScaleWidth;
				let rightY = rightX * chart.kChart + chart.bChart;
				if (mpx1 >= mpx2) {
					paint.drawLine(plot.lineColor, plot.lineWidth, 0, leftX, leftY, mpx1, mpy1);
				} else {
					paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, mpy1, rightX, rightY);
				}
			}
			//垂直时
			else {
				if (mpy1 >= mpy2) {
					paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, mpy1, mpx1, 0);
				} else {
					paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, mpy1, mpx1, divHeight);
				}
			}
		} else if (plot.plotType == "Triangle") {
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, mpy1, mpx2, mpy2);
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx2, mpy2, mpx3, mpy3);
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, mpy1, mpx3, mpy3);
		}
		else if (plot.plotType == "SymmetricTriangle") {
			if (mpx2 != mpx1) {
				let a = (mpy2 - mpy1) / (mpx2 - mpx1);
				let b = mpy1 - a * mpx1;
				let c = -a;
				let d = mpy3 - c * mpx3;
				let leftX = chart.leftVScaleWidth;
				let leftY = leftX * a + b;
				let rightX = chart.size.cx - chart.rightVScaleWidth;
				let rightY = rightX * a + b;
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, leftX, leftY, rightX, rightY);
				leftY = leftX * c + d;
				rightY = rightX * c + d;
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, leftX, leftY, rightX, rightY);
			} else {
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, 0, mpx1, divHeight);
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx3, 0, mpx3, divHeight);
			}
		}
		else if (plot.plotType == "Rect") {
			let sX1 = Math.min(mpx1, mpx2);
			let sY1 = Math.min(mpy1, mpy2);
			let sX2 = Math.max(mpx1, mpx2);
			let sY2 = Math.max(mpy1, mpy2);
			paint.drawRect(plot.lineColor, plot.lineWidth, 0, sX1, sY1, sX2, sY2);
		} else if (plot.plotType == "Cycle") {
			let r = Math.sqrt(Math.abs((mpx2 - mpx1) * (mpx2 - mpx1) + (mpy2 - mpy1) * (mpy2 - mpy1)));
			paint.drawEllipse(plot.lineColor, plot.lineWidth, 0, mpx1 - r, mpy1 - r, mpx1 + r, mpy1 + r);
		} else if (plot.plotType == "CircumCycle") {
			ellipseOR(chart, mpx1, mpy1, mpx2, mpy2, mpx3, mpy3);
			paint.drawEllipse(plot.lineColor, plot.lineWidth, 0, chart.oXChart - chart.rChart, chart.oYChart - chart.rChart, chart.oXChart + chart.rChart, chart.oYChart + chart.rChart);
		} else if (plot.plotType == "Ellipse") {
			let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
			if (mpx1 <= mpx2) {
				x1 = mpx2;
				y1 = mpy2;
				x2 = mpx1;
				y2 = mpy1;
			} else {
				x1 = mpx1;
				y1 = mpy1;
				x2 = mpx2;
				y2 = mpy2;
			}
			let x = x1 - (x1 - x2);
			let y = 0;
			let width = (x1 - x2) * 2;
			let height = 0;
			if (y1 >= y2) {
				height = (y1 - y2) * 2;
			}
			else {
				height = (y2 - y1) * 2;
			}
			y = y2 - height / 2;
			paint.drawEllipse(plot.lineColor, plot.lineWidth, 0, x, y, x + width, y + height);
		} else if (plot.plotType == "ParalleGram") {
			parallelogram(chart, mpx1, mpy1, mpx2, mpy2, mpx3, mpy3);
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx1, mpy1, mpx2, mpy2);
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx2, mpy2, mpx3, mpy3);
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, mpx3, mpy3, chart.x4Chart, chart.y4Chart);
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, chart.x4Chart, chart.y4Chart, mpx1, mpy1);
		} else if (plot.plotType == "BoxLine") {
			let sX1 = Math.min(mpx1, mpx2);
			let sY1 = Math.min(mpy1, mpy2);
			let sX2 = Math.max(mpx1, mpx2);
			let sY2 = Math.max(mpy1, mpy2);
			paint.drawRect(plot.lineColor, plot.lineWidth, 0, sX1, sY1, sX2, sY2);
			let bSize = paint.textSize("COUNT:" + Math.abs(index2 - index1) + 1, chart.font);
			paint.drawText("COUNT:" + Math.abs(index2 - index1) + 1, chart.textColor, chart.font, sX1 + 2, sY1 + 2);
			let closeList = new Array();
			for (let j = index1; j <= index2; j++) {
				closeList.push(chart.datas[j].close);
			}
			let avgClose = avgValue(closeList);
			let closeY = getChartY(chart, 0, avgClose);
			paint.drawLine(plot.lineColor, plot.lineWidth, [5, 5], sX1, closeY, sX2, closeY);
			let drawAvg = "AVG:" + avgClose.toFixed(chart.candleDigit);
			let tSize = paint.textSize(drawAvg, chart.font);
			paint.drawText(drawAvg, chart.textColor, chart.font, sX1 + 2, closeY - tSize.cy - 2);
		}
		else if (plot.plotType == "TironeLevels") {
			let sX1 = Math.min(mpx1, mpx2);
			let sY1 = Math.min(mpy1, mpy2);
			let sX2 = Math.max(mpx1, mpx2);
			let sY2 = Math.max(mpy1, mpy2);
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, sX1, sY1, sX2, sY1);
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, sX1, sY2, sX2, sY2);
			paint.drawLine(plot.lineColor, plot.lineWidth, [5, 5], sX1 + (sX2 - sX1) / 2, sY1, sX1 + (sX2 - sX1) / 2, sY2);
			let t1 = chart.nHighChart, t2 = chart.nHighChart - (chart.nHighChart - chart.nLowChart) / 3, t3 = chart.nHighChart - (chart.nHighChart - chart.nLowChart) / 2, t4 = chart.nHighChart - 2 * (chart.nHighChart - chart.nLowChart) / 3, t5 = chart.nLowChart;
			let tList = new Array();
			tList.push(t2);
			tList.push(t3);
			tList.push(t4);
			for (let j = 0; j < tList.length; j++) {
				let y = getChartY(chart, 0, tList[j]);
				//画直线
				paint.drawLine(plot.lineColor, plot.lineWidth, [5, 5], chart.leftVScaleWidth, y, chart.size.cx - chart.rightVScaleWidth, y);
				let str = tList[j].toFixed(chart.candleDigit);
				let tSize = paint.textSize(str, chart.font);
				paint.drawText(str, chart.textColor, chart.font, chart.leftVScaleWidth + 2, y - tSize.cy - 2);
			}
		}
		else if (plot.plotType == "QuadrantLines") {
			let sX1 = Math.min(mpx1, mpx2);
			let sY1 = Math.min(mpy1, mpy2);
			let sX2 = Math.max(mpx1, mpx2);
			let sY2 = Math.max(mpy1, mpy2);
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, sX1, sY1, sX2, sY1);
			paint.drawLine(plot.lineColor, plot.lineWidth, 0, sX1, sY2, sX2, sY2);
			let t1 = chart.nHighChart, t2 = chart.nHighChart - (chart.nHighChart - chart.nLowChart) / 4, t3 = chart.nHighChart - (chart.nHighChart - chart.nLowChart) / 2, t4 = chart.nHighChart - 3 * (chart.nHighChart - chart.nLowChart) / 4, t5 = chart.nLowChart;
			let tList = new Array();
			tList.push(t2);
			tList.push(t3);
			tList.push(t4);
			for (let j = 0; j < tList.length; j++) {
				let y = getChartY(chart, 0, tList[j]);
				//画直线
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, sX1, y, sX2, y);
			}
		}
		else if (plot.plotType == "GoldenRatio") {
			let sX1 = Math.min(mpx1, mpx2);
			let sY1 = Math.min(mpy1, mpy2);
			let sX2 = Math.max(mpx1, mpx2);
			let sY2 = Math.max(mpy1, mpy2);
			let ranges = new Array();
			ranges.push(0);
			ranges.push(0.236);
			ranges.push(0.382);
			ranges.push(0.5);
			ranges.push(0.618);
			ranges.push(0.809);
			ranges.push(1);
			ranges.push(1.382);
			ranges.push(1.618);
			ranges.push(2);
			ranges.push(2.382);
			ranges.push(2.618);
			let minValue = Math.min(plot.value1, plot.value2);
			let maxValue = Math.max(plot.value1, plot.value2);
			for (let j = 0; j < ranges.length; j++) {
				let newY = sY1 <= sY2 ? sY1 + (sY2 - sY1) * ranges[j] : sY2 + (sY1 - sY2) * (1 - ranges[j]);
				paint.drawLine(plot.lineColor, plot.lineWidth, 0, chart.leftVScaleWidth, newY, chart.size.cx - chart.rightVScaleWidth, newY);
				let newPoint = new FCPoint(0, newY);
				let value = getCandleDivValue(chart, newPoint);
				let str = value.toFixed(chart.candleDigit);
				let tSize = paint.textSize(str, chart.font);
				paint.drawText(str, chart.textColor, chart.font, chart.leftVScaleWidth + 2, newY - tSize.cy - 2);
			}
		}
	}

	paint.restore();
};

/*
* 绘制图表
* chart:图表
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawChartStock = function (chart, paint, clipRect) {
	let lastValidIndex = chart.lastVisibleIndex;
	let cWidth = parseInt(chart.hScalePixel - 3) / 2;
	if (cWidth < 0) {
		cWidth = 0;
	}
	if (chart.datas && chart.datas.length > 0) {
		let candleHeight = getCandleDivHeight(chart);
		let volHeight = getVolDivHeight(chart);
		let indHeight = getIndDivHeight(chart);
		let indHeight2 = getIndDivHeight2(chart);
		let isTrend = chart.cycle == "trend";
		if (chart.lastValidIndex != -1) {
			lastValidIndex = chart.lastValidIndex;
		}
		let maxVisibleRecord = getChartMaxVisibleCount(chart, chart.hScalePixel, getChartWorkAreaWidth(chart));
		paint.save();
		paint.setClip(chart.leftVScaleWidth, 0, chart.size.cx - chart.rightVScaleWidth, candleHeight);
		if (isTrend) {
			let drawPoints = new Array();
			for (let i = chart.firstVisibleIndex; i <= lastValidIndex; i++) {
				let x = getChartX(chart, i);
				let close = chart.datas[i].close;
				let closeY = getChartY(chart, 0, close);
				drawPoints.push(new FCPoint(x, closeY));
			}
			paint.drawPolyline(chart.trendColor, chart.lineWidthChart, 0, drawPoints);
		}else{
			let hasMinTag = false, hasMaxTag = false;
			for (let i = chart.firstVisibleIndex; i <= lastValidIndex; i++) {
				let x = getChartX(chart, i);
				let open = chart.datas[i].open;
				let close = chart.datas[i].close;
				let high = chart.datas[i].high;
				let low = chart.datas[i].low;
				let openY = getChartY(chart, 0, open);
				let closeY = getChartY(chart, 0, close);
				let highY = getChartY(chart, 0, high);
				let lowY = getChartY(chart, 0, low);
				if (close >= open) {
					if (close == open && chart.midColor && chart.midColor != "none") {
						paint.drawLine(chart.midColor, chart.lineWidthChart, 0, x, highY, x, lowY);
					}else{
						paint.drawLine(chart.upColor, chart.lineWidthChart, 0, x, highY, x, lowY);
					}
					if (cWidth > 0) {
						if (close == open) {
							if(chart.midColor && chart.midColor != "none"){
								paint.drawLine(chart.midColor, chart.lineWidthChart, 0, x - cWidth, closeY, x + cWidth, closeY);
							}else{
								paint.drawLine(chart.upColor, chart.lineWidthChart, 0, x - cWidth, closeY, x + cWidth, closeY);
							}
						}
						else {
							if(chart.candleStyle == "rect2"){
								paint.fillRect(chart.backColor, x - cWidth, closeY, x + cWidth, openY);
								paint.drawRect(chart.upColor, 1, 0, x - cWidth, closeY, x + cWidth, openY);
							}else{
								paint.fillRect(chart.upColor, x - cWidth, closeY, x + cWidth, openY);
							}
						}
					}
				} else {
					paint.drawLine(chart.downColor, chart.lineWidthChart, 0, x, highY, x, lowY);
					if (cWidth > 0) {
						paint.fillRect(chart.downColor, x - cWidth, openY, x + cWidth, closeY);
					}
				}
				if (chart.selectShape == "CANDLE") {
					let kPInterval = parseInt(maxVisibleRecord / 30);
					if (kPInterval < 2) {
						kPInterval = 3;
					}
					if (i % kPInterval == 0) {
						paint.fillRect(chart.indicatorColors[0], x - 3, closeY - 3, x + 3, closeY + 3);
					}
				}
				if (!hasMaxTag) {
					if (high == chart.candleMax) {
						let tag = high.toFixed(chart.candleDigit);
						let tSize = paint.textSize(tag, chart.font);
						paint.drawText(tag, chart.textColor, chart.font, x - tSize.cx / 2, highY - tSize.cy - 2);
						hasMaxTag = true;
					}
				}
				if (!hasMinTag) {
					if (low == chart.candleMin) {
						let tag = low.toFixed(chart.candleDigit);
						let tSize = paint.textSize(tag, chart.font);
						paint.drawText(tag, chart.textColor, chart.font, x - tSize.cx / 2, lowY + 2);
						hasMinTag = true;
					}
				}
			}
		}
		paint.restore();
		if(volHeight > 0){
			for (let i = chart.firstVisibleIndex; i <= lastValidIndex; i++) {
				let x = getChartX(chart, i);
				let open = chart.datas[i].open;
				let close = chart.datas[i].close;
				let openY = getChartY(chart, 0, open);
				let closeY = getChartY(chart, 0, close);
				let volume = chart.datas[i].volume;
				let volY = getChartY(chart, 1, volume);
				let zeroY = getChartY(chart, 1, 0);
				if (close >= open) {
					let barColor = chart.upColor;
                    if(chart.volColor && chart.volColor != "none"){
                        barColor = chart.volColor;
                    }
					if (isTrend) {
						paint.drawLine(barColor, chart.lineWidthChart, 0, x, volY, x, zeroY);
					} else {
						if (cWidth > 0) {
							if(chart.barStyle == "rect2"){
								paint.fillRect(chart.backColor, x - cWidth, volY, x + cWidth, zeroY);
								paint.drawRect(barColor, 1, 0, x - cWidth, volY, x + cWidth, zeroY);
							}else{
								paint.fillRect(barColor, x - cWidth, volY, x + cWidth, zeroY);
							}
						} else {
							paint.drawLine(barColor, chart.lineWidthChart, 0, x - cWidth, volY, x + cWidth, zeroY);
						}
					}
				} else {
					let barColor = chart.downColor;
                    if(chart.volColor && chart.volColor != "none"){
                        barColor = chart.volColor;
                    }
					if (isTrend) {
						paint.drawLine(barColor, chart.lineWidthChart, 0, x, volY, x, zeroY);
					} else {
						if (cWidth > 0) {
							paint.fillRect(barColor, x - cWidth, volY, x + cWidth, zeroY);
						} else {
							paint.drawLine(barColor, chart.lineWidthChart, 0, x - cWidth, volY, x + cWidth, zeroY);
						}
					}
				}
				if (chart.selectShape == "VOL") {
					let kPInterval = parseInt(maxVisibleRecord / 30);
					if (kPInterval < 2) {
						kPInterval = 3;
					}
					if (i % kPInterval == 0) {
						paint.fillRect(chart.indicatorColors[0], x - 3, volY - 3, x + 3, volY + 3);
					}
				}
			}
		}
		if (!isTrend) {
			paint.save();
			paint.setClip(chart.leftVScaleWidth, 0, chart.size.cx - chart.rightVScaleWidth, candleHeight);
			if (chart.mainIndicator == "BOLL") {
				drawChartLines(chart, paint, clipRect, 0, chart.bollMap.mid, chart.indicatorColors[0], (chart.selectShape == chart.mainIndicator && chart.selectShapeEx == "MID") ? true : false);
				drawChartLines(chart, paint, clipRect, 0, chart.bollMap.upper, chart.indicatorColors[1], (chart.selectShape == chart.mainIndicator && chart.selectShapeEx == "UP") ? true : false);
				drawChartLines(chart, paint, clipRect, 0, chart.bollMap.lower, chart.indicatorColors[2], (chart.selectShape == chart.mainIndicator && chart.selectShapeEx == "DOWN") ? true : false);
			} else if (chart.mainIndicator == "MA") {
				drawChartLines(chart, paint, clipRect, 0, chart.maMap.ma5, chart.indicatorColors[0], (chart.selectShape == chart.mainIndicator && chart.selectShapeEx == "5") ? true : false);
				drawChartLines(chart, paint, clipRect, 0, chart.maMap.ma10, chart.indicatorColors[1], (chart.selectShape == chart.mainIndicator && chart.selectShapeEx == "10") ? true : false);
				drawChartLines(chart, paint, clipRect, 0, chart.maMap.ma20, chart.indicatorColors[2], (chart.selectShape == chart.mainIndicator && chart.selectShapeEx == "20") ? true : false);
				drawChartLines(chart, paint, clipRect, 0, chart.maMap.ma30, chart.indicatorColors[5], (chart.selectShape == chart.mainIndicator && chart.selectShapeEx == "30") ? true : false);
				drawChartLines(chart, paint, clipRect, 0, chart.maMap.ma120, chart.indicatorColors[4], (chart.selectShape == chart.mainIndicator && chart.selectShapeEx == "120") ? true : false);
				drawChartLines(chart, paint, clipRect, 0, chart.maMap.ma250, chart.indicatorColors[3], (chart.selectShape == chart.mainIndicator && chart.selectShapeEx == "250") ? true : false);
			}
			paint.restore();
		}
		if (indHeight > 0 || indHeight2 > 0) {
			for (let d = 2; d <= 3; d++) {
				let sind = chart.showIndicator;
				if (d == 3) {
				  sind = chart.showIndicator2;
				  if (indHeight2 <= 0) {
					continue;
				  }
				} else {
				  if (indHeight <= 0) {
					continue;
				  }
				}
				if (sind == "MACD") {
					let zeroY = getChartY(chart, d, 0);
					paint.drawLine(chart.indicatorColors[4], chart.lineWidthChart, 0, chart.leftVScaleWidth, zeroY, getChartX(chart, chart.lastVisibleIndex), zeroY);
					for (let i = chart.firstVisibleIndex; i <= lastValidIndex; i++) {
						let x = getChartX(chart, i);
						let macd = chart.allmacdarr[i];
						let macdY = getChartY(chart, d, macd);
						if (macdY < zeroY) {
							paint.drawLine(chart.indicatorColors[3], chart.lineWidthChart, 0, x, macdY, x, zeroY);
						} else {
							paint.drawLine(chart.indicatorColors[4], chart.lineWidthChart, 0, x, macdY, x, zeroY);
						}
						if (chart.selectShape == sind && chart.selectShapeEx == "MACD") {
							let kPInterval = parseInt(maxVisibleRecord / 30);
							if (kPInterval < 2) {
								kPInterval = 3;
							}
							if (i % kPInterval == 0) {
								paint.fillRect(chart.indicatorColors[4], x - 3, macdY - 3, x + 3, macdY + 3);
							}
						}
					}
					drawChartLines(chart, paint, clipRect, d, chart.alldifarr, chart.indicatorColors[0], (chart.selectShape == sind && chart.selectShapeEx == "DIF") ? true : false);
					drawChartLines(chart, paint, clipRect, d, chart.alldeaarr, chart.indicatorColors[1], (chart.selectShape == sind && chart.selectShapeEx == "DEA") ? true : false);
				} else if (sind == "KDJ") {
					drawChartLines(chart, paint, clipRect, d, chart.kdjMap.k, chart.indicatorColors[0], (chart.selectShape == sind && chart.selectShapeEx == "K") ? true : false);
					drawChartLines(chart, paint, clipRect, d, chart.kdjMap.d, chart.indicatorColors[1], (chart.selectShape == sind && chart.selectShapeEx == "D") ? true : false);
					drawChartLines(chart, paint, clipRect, d, chart.kdjMap.j, chart.indicatorColors[2], (chart.selectShape == sind && chart.selectShapeEx == "J") ? true : false);
				} else if (sind == "RSI") {
					drawChartLines(chart, paint, clipRect, d, chart.rsiMap.rsi6, chart.indicatorColors[5], (chart.selectShape == sind && chart.selectShapeEx == "6") ? true : false);
					drawChartLines(chart, paint, clipRect, d, chart.rsiMap.rsi12, chart.indicatorColors[1], (chart.selectShape == sind && chart.selectShapeEx == "12") ? true : false);
					drawChartLines(chart, paint, clipRect, d, chart.rsiMap.rsi24, chart.indicatorColors[2], (chart.selectShape == sind && chart.selectShapeEx == "24") ? true : false);
				}
				else if (sind == "BIAS") {
					drawChartLines(chart, paint, clipRect, d, chart.biasMap.bias1, chart.indicatorColors[5], (chart.selectShape == sind && chart.selectShapeEx == "1") ? true : false);
					drawChartLines(chart, paint, clipRect, d, chart.biasMap.bias2, chart.indicatorColors[1], (chart.selectShape == sind && chart.selectShapeEx == "2") ? true : false);
					drawChartLines(chart, paint, clipRect, d, chart.biasMap.bias3, chart.indicatorColors[2], (chart.selectShape == sind && chart.selectShapeEx == "3") ? true : false);
				}
				else if (sind == "ROC") {
					drawChartLines(chart, paint, clipRect, d, chart.rocMap.roc, chart.indicatorColors[0], (chart.selectShape == sind && chart.selectShapeEx == "ROC") ? true : false);
					drawChartLines(chart, paint, clipRect, d, chart.rocMap.maroc, chart.indicatorColors[1], (chart.selectShape == sind && chart.selectShapeEx == "ROCMA") ? true : false);
				} else if (sind == "WR") {
					drawChartLines(chart, paint, clipRect, d, chart.wrMap.wr1, chart.indicatorColors[0], (chart.selectShape == sind && chart.selectShapeEx == "1") ? true : false);
					drawChartLines(chart, paint, clipRect, d, chart.wrMap.wr2, chart.indicatorColors[1], (chart.selectShape == sind && chart.selectShapeEx == "2") ? true : false);
				} else if (sind == "CCI") {
					drawChartLines(chart, paint, clipRect, d, chart.cciArr, chart.indicatorColors[0], (chart.selectShape == sind) ? true : false);
				} else if (sind == "BBI") {
					drawChartLines(chart, paint, clipRect, d, chart.bbiMap.bbi, chart.indicatorColors[0], (chart.selectShape == sind) ? true : false);
				} else if (sind == "TRIX") {
					drawChartLines(chart, paint, clipRect, d, chart.trixMap.trix, chart.indicatorColors[0], (chart.selectShape == sind && chart.selectShapeEx == "TRIX") ? true : false);
					drawChartLines(chart, paint, clipRect, d, chart.trixMap.matrix, chart.indicatorColors[1], (chart.selectShape == sind && chart.selectShapeEx == "TRIXMA") ? true : false);
				} else if (sind == "DMA") {
					drawChartLines(chart, paint, clipRect, d, chart.dmaMap.dif, chart.indicatorColors[0], (chart.selectShape == sind && chart.selectShapeEx == "DIF") ? true : false);
					drawChartLines(chart, paint, clipRect, d, chart.dmaMap.difma, chart.indicatorColors[1], (chart.selectShape == sind && chart.selectShapeEx == "DIFMA") ? true : false);
				}
			}			
		}
	}
	//绘制扩展线条
	if (chart.shapes.length > 0) {
		for (let i = 0; i < chart.shapes.length; i++) {
			let shape = chart.shapes[i]
			if (shape.shapeType == "bar") {
				for (let j = chart.firstVisibleIndex; j <= lastValidIndex; j++) {
					if (shape.showHideDatas.length > j && shape.showHideDatas[j].toString() == "0") {
						continue
					}
					let x = getChartX(chart, j);
					let y1 = 0;
					if (shape.leftOrRight) {
						y1 = getChartY(chart, shape.divIndex, shape.datas[j]);
					} else {
						y1 = getChartYInRight(chart, shape.divIndex, shape.datas[j]);
					}
					if (shape.style != "2color") {
						let y2 = 0;
						if (shape.leftOrRight) {
							y2 = getChartY(chart, shape.divIndex, shape.datas2[j]);
						} else {
							y2 = getChartYInRight(chart, shape.divIndex, shape.datas2[j]);
						}
						if (y1 >= y2) {
							paint.fillRect(shape.color, x - cWidth, y2, x + cWidth, y1);
						}
						else {
							paint.fillRect(shape.color, x - cWidth, y1, x + cWidth, y2);
						}
					} else {
						let y2 = 0;
						if (shape.leftOrRight) {
							y2 = getChartY(chart, shape.divIndex, 0);
						} else {
							y2 = getChartYInRight(chart, shape.divIndex, 0);
						}
						if (y1 >= y2) {
							paint.drawLine(shape.color2, 1, 0, x, y1, x, y2);
						}
						else {
							paint.drawLine(shape.color, 1, 0, x, y1, x, y2);
						}
						if (j == lastValidIndex) {
							paint.drawLine(shape.color2, 1, 0, chart.leftVScaleWidth, y2, chart.size.cx - chart.rightVScaleWidth, y2);
						}
					}
				}
			}
			else if (shape.shapeType == "text") {
				for (let j = chart.firstVisibleIndex; j <= lastValidIndex; j++) {
					let x = getChartX(chart, j);
					if (shape.datas[j] != 0) {
						let y1 = 0;
						if (shape.leftOrRight) {
							y1 = getChartY(chart, shape.divIndex, shape.value);
						} else {
							y1 = getChartYInRight(chart, shape.divIndex, shape.value);
						}
						let drawText = shape.text;
						let tSize = paint.textSize(drawText, "Default,12");
						paint.drawText(drawText, shape.color, "Default,12", x - tSize.cx / 2, y1);
					}
				}
			}
			else {
				if (shape.leftOrRight) {
					drawChartLines(chart, paint, clipRect, shape.divIndex, shape.datas, shape.color, (chart.selectShape == shape.shapeName) ? true : false);
				} else {
					drawChartLinesInRight(chart, paint, clipRect, shape.divIndex, shape.datas, shape.color, (chart.selectShape == shape.shapeName) ? true : false);
				}
			}
		}
	}
};

/*
* 计算指标
* chart:图表
*/
let calcChartIndicator = function (chart) {
	//清除数组原有数据
	clearDataArr(chart);
	//存储数据
	//创建 一个二维数组
	let ticks = new Array();
	if (chart.datas && chart.datas.length > 0) {
		for (let i = 0; i < chart.datas.length; i++) {
			chart.closearr.push(chart.datas[i].close);
			ticks[i] = new Array();
			ticks[i][0] = chart.datas[i].close;
			ticks[i][1] = chart.datas[i].high;
			ticks[i][2] = chart.datas[i].low;

		}
	}
	if (chart.mainIndicator == "BOLL") {
		//缓存布林带数据
		chart.bollMap = getBollData(chart.closearr, 20);
	} else if (chart.mainIndicator == "MA") {
		chart.maMap = getMultiMAData(chart.closearr, 5, 10, 20, 30, 120, 250);
	}
	if (chart.showIndicator == "BIAS" || chart.showIndicator2 == "BIAS") {
		//缓存BIAS数据
		chart.biasMap = getBIASData(chart.closearr, 6, 12, 24);
	}
	if (chart.showIndicator == "DMA" || chart.showIndicator2 == "DMA") {
		//缓存DMA数据
		chart.dmaMap = getDMAData(chart.closearr, 10, 50);
	}
	if (chart.showIndicator == "BBI" || chart.showIndicator2 == "BBI") {
		//缓存BBI数据
		chart.bbiMap = getBBIData(chart.closearr, 3, 6, 12, 24);
	}
	if (chart.showIndicator == "RSI" || chart.showIndicator2 == "RSI") {
		//缓存RSI数据
		chart.rsiMap = getRSIData(chart.closearr, 6, 12, 24);
	}
	if (chart.showIndicator == "ROC" || chart.showIndicator2 == "ROC") {
		//缓存roc数据
		chart.rocMap = getRocData(chart.closearr, 12, 6);
	}
	if (chart.showIndicator == "TRIX" || chart.showIndicator2 == "TRIX") {
		//缓存TRIX数据
		chart.trixMap = getTRIXData(chart.closearr, 10, 50);
	}
	if (chart.showIndicator == "KDJ" || chart.showIndicator2 == "KDJ") {
		//缓存kdj数据
		chart.kdjMap = getKDJData(ticks, 9, 3, 3);
	}
	if (chart.showIndicator == "WR" || chart.showIndicator2 == "WR") {
		//缓存WR数据
		chart.wrMap = getWRData(ticks, 5, 10);
	}
	if (chart.showIndicator == "CCI" || chart.showIndicator2 == "CCI") {
		//缓存CCI数据
		chart.cciArr = getCCIData(ticks, 14);
	}
	if (chart.showIndicator == "MACD" || chart.showIndicator2 == "MACD") {
		//缓存MACD数据
		chart.allema12.push(chart.closearr[0]);
		chart.allema26.push(chart.closearr[0]);
		chart.alldeaarr.push(0);
		for (let i = 1; i < chart.closearr.length; i++) {
			chart.allema12.push(getEMA(12, chart.closearr[i], chart.allema12[i - 1]));
			chart.allema26.push(getEMA(26, chart.closearr[i], chart.allema26[i - 1]));
		}
		chart.alldifarr = getDIF(chart.allema12, chart.allema26);
		for (let i = 1; i < chart.alldifarr.length; i++) {
			chart.alldeaarr.push(chart.alldeaarr[i - 1] * 8 / 10 + chart.alldifarr[i] * 2 / 10);
		}
		chart.allmacdarr = getMACD(chart.alldifarr, chart.alldeaarr);
	}
	if(chart.onCalculateChartMaxMin){
		chart.onCalculateChartMaxMin(chart);
	}
	else if (chart.paint.onCalculateChartMaxMin) {
		chart.paint.onCalculateChartMaxMin(chart);
	} else {
		calculateChartMaxMin(chart);
	}
};

/*
* 计算EMA
* n:周期
* value:当前数据
* lastEMA:上期数据
*/
let getEMA = function (n, value, lastEMA) {
	return (value * 2 + lastEMA * (n - 1)) / (n + 1);
};

/*
* 计算MACD
* dif:DIF数据
* dea:DEA数据
*/
let getMACD = function (dif, dea) {
	let result = new Array();
	if (dif != "" && dea != "") {
		for (let i = 0; i < dif.length; i++) {
			result.push((dif[i] - dea[i]) * 2);
		}
	}
	return result;
};

/*
* 计算DIF
* close12:12日数据
* close26:26日数据
*/
let getDIF = function (close12, close26) {
	let result = new Array();
	if (close12 != "" && close26 != "") {
		for (let i = 0; i < close12.length; i++) {
			result.push(close12[i] - close26[i]);
		}
	}
	return result;
};

/*
* 清除缓存数据方法
* chart:图表
*/
let clearDataArr = function (chart) {
	chart.closearr = new Array();
	chart.allema12 = new Array();
	chart.allema26 = new Array();
	chart.alldifarr = new Array();
	chart.alldeaarr = new Array();
	chart.allmacdarr = new Array();

	chart.bollMap = {};
	chart.biasMap = {};
	chart.dmaMap = {};
	chart.kdjMap = {};
	chart.bbiMap = {};
	chart.rocMap = {};
	chart.rsiMap = {};
	chart.wrMap = {};
	chart.trixMap = {};
	chart.cciArr = [];
};

/**
 *
 * 计算boll指标,ma的周期为20日
 *
 * @method BOLL
 * @param {Array} ticks
 * 一维数组类型，每个元素为当前Tick的收盘价格
 * @return {Object} 返回一个包含upper mid lower属性的对象,每个属性对应的类型为{Array[Number]}
 */
let getBollData = function (ticks, maDays) {
	//移动平均线周期为20
	let tickBegin = maDays - 1,
		maSum = 0,
		p = 0;
	let ups = [],
		mas = [],
		lows = [];
	for (let i = 0; i < ticks.length; i++) {
		let c = ticks[i],
			ma, md, bstart, mdSum;
		maSum += c;
		if (i >= tickBegin) {
			maSum = maSum - p;
			ma = maSum / maDays;
			bstart = i - tickBegin;
			p = ticks[bstart];
			mas.push(ma);
			bstart = i - tickBegin;
			p = ticks[bstart];
			mdSum = ticks.slice(bstart, bstart + maDays).reduce(function (a, b) {
				return a + Math.pow(b - ma, 2);
			}, 0);
			md = Math.sqrt(mdSum / maDays);
			ups.push(ma + 2 * md);
			lows.push(ma - 2 * md);
		} else {
			//ugly constant, just keep the same type for client
			ma = maSum / (i + 1);
			mas.push(ma);
			mdSum = ticks.slice(0, i).reduce(function (a, b) {
				return a + Math.pow(b - ma, 2);
			}, 0);
			md = Math.sqrt(mdSum / (i + 1));
			ups.push(ma + 2 * md);
			lows.push(ma - 2 * md);

			//			mas.push(-1);
			//			ups.push(-1);
			//			lows.push(-1);
		}
	}
	return {
		"upper": ups,
		"mid": mas,
		"lower": lows
	};
};

/**
 *
 * 计算kdj指标,rsv的周期为9日
 *
 * @method KDJ
 * @param {Array} ticks
 * 二维数组类型，其中内层数组包含三个元素值，第一个值表示当前Tick的最高价格，第二个表示当前Tick的最低价格，第三个表示当前Tick的收盘价格
 * @return {Object} 返回一个包含k d j属性的对象,每个属性对应的类型为{Array[Number]}
 */
let getKDJData = function (ticks, n, m1, m2) {
	let nineDaysTicks = [],
		days = n,
		rsvs = [];
	let ks = [],
		ds = [],
		js = [];
	let lastK, lastD, curK, curD;
	let maxAndMin, max, min;
	for (let i = 0; i < ticks.length; i++) {
		let t = ticks[i],
			close = t[2];
		nineDaysTicks.push(t);
		maxAndMin = getMaxHighAndMinLow(nineDaysTicks);
		max = maxAndMin[0];
		min = maxAndMin[1];
		if (max == min) {
			rsvs.push(0);
		} else {
			rsvs.push((close - min) / (max - min) * 100);
		}
		if (nineDaysTicks.length == days) {
			nineDaysTicks.shift();
		}
		if (i == 0) {
			lastK = rsvs[i];
			lastD = rsvs[i];
		}
		curK = (m1 - 1) / m1 * lastK + 1.0 / m1 * rsvs[i];
		ks.push(curK);
		lastK = curK;

		curD = (m2 - 1) / m2 * lastD + 1.0 / m2 * curK;
		ds.push(curD);
		lastD = curD;

		js.push(3 * curK - 2 * curD);
	}
	return {
		"k": ks,
		"d": ds,
		"j": js
	};
};

/*
* 获取最大最小值区间
* ticks:数据
*/
let getMaxHighAndMinLow = function (ticks) {
	let maxHigh = ticks[0][0],
		minLow = ticks[0][1];
	for (let i = 0; i < ticks.length; i++) {
		let t = ticks[i],
			high = t[0],
			low = t[1];
		if (high > maxHigh) {
			maxHigh = high;
		}
		if (low < minLow) {
			minLow = low;
		}
	}
	return [maxHigh, minLow];
};

/**
 *
 * 计算rsi指标,分别返回以6日，12日，24日为参考基期的RSI值
 *
 * @method RSI
 * @param {Array} ticks
 * 一维数组类型，每个元素为当前Tick的收盘价格
 * @return {Object} 返回一个包含rsi6 rsi12 rsi24属性的对象,每个属性对应的类型为{Array[Number]}
 */
let getRSIData = function (ticks, n1, n2, n3) {
	let lastClosePx = ticks[0];
	let days = [n1, n2, n3],
		result = {};
	for (let i = 0; i < ticks.length; i++) {
		let c = ticks[i];
		let m = Math.max(c - lastClosePx, 0),
			a = Math.abs(c - lastClosePx);
		for (let di = 0; di < days.length; di++) {
			let d = days[di];
			if (!result.hasOwnProperty("rsi" + d)) {
				result["lastSm" + d] = result["lastSa" + d] = 0;
				result["rsi" + d] = [0];
			} else {
				result["lastSm" + d] = (m + (d - 1) * result["lastSm" + d]) / d;
				result["lastSa" + d] = (a + (d - 1) * result["lastSa" + d]) / d;
				if (result["lastSa" + d] != 0) {
					result["rsi" + d].push(result["lastSm" + d] / result["lastSa" + d] * 100);
				} else {
					result["rsi" + d].push(0);
				}
			}
		}
		lastClosePx = c;
	}
	return {
		"rsi6": result["rsi6"],
		"rsi12": result["rsi12"],
		"rsi24": result["rsi24"]
	};
};

/**
 * MA数据计算
 * @param {Object} ticks 收盘价数组
 * @param {Object} days 天数
 */
let MA = function (ticks, days) {
	let maSum = 0;
	let mas = [];
	let last = 0;
	for (let i = 0; i < ticks.length; i++) {
		let ma;
		if (i >= days) {
			last = ticks[i - days];
			maSum = maSum + ticks[i] - last;
			ma = maSum / days;
		} else {
			maSum += ticks[i];
			ma = maSum / (i + 1);
		}
		mas.push(ma);
	}
	return mas;
};

/**
 * 计算ROC数据
 * @param {Object} ticks 收盘价数组
 */
let getRocData = function (ticks, n, m) {
	let roc = [],
		maroc = [];

	for (let i = 0; i < ticks.length; i++) {
		let currRoc;
		if (i >= n) {
			currRoc = 100 * (ticks[i] - ticks[i - n]) / ticks[i - n];
			roc.push(currRoc);
		} else {
			currRoc = 100 * (ticks[i] - ticks[0]) / ticks[0];
			roc.push(currRoc);
		}
	}
	maroc = MA(roc, m);
	return {
		"roc": roc,
		"maroc": maroc
	}
};

/**
 * 获取BIAS的数据
 * @param {Array} ticks 收盘价数组
 * @return 
 */
let getBIASData = function (ticks, n1, n2, n3) {
	let bias1Arr = [],
		bias2Arr = [],
		bias3Arr = [];
	let ma1 = MA(ticks, n1);
	let ma2 = MA(ticks, n2);
	let ma3 = MA(ticks, n3);
	for (let i = 0; i < ticks.length; i++) {
		let b1, b2, b3;
		b1 = (ticks[i] - ma1[i]) / ma1[i] * 100;
		b2 = (ticks[i] - ma2[i]) / ma2[i] * 100;
		b3 = (ticks[i] - ma3[i]) / ma3[i] * 100;
		bias1Arr.push(b1);
		bias2Arr.push(b2);
		bias3Arr.push(b3);
	}
	return {
		"bias1": bias1Arr,
		"bias2": bias2Arr,
		"bias3": bias3Arr
	}
};

/**
 * 计算DMA（平均差）
 * @param {Object} ticks 收盘价数组
 */
let getDMAData = function (ticks, n1, n2) {
	let difArr = [],
		difmaArr = [];
	let ma10 = MA(ticks, n1);
	let ma50 = MA(ticks, n2);
	let length = ticks.length;
	for (let i = 0; i < length; i++) {
		let dif = ma10[i] - ma50[i];
		difArr.push(dif);
	}
	difmaArr = MA(difArr, n1);
	return {
		"dif": difArr,
		"difma": difmaArr
	};
};

/**
 * 计算BBI(多空指标)
 * @param {Object} ticks
 */
let getBBIData = function (ticks, n1, n2, n3, n4) {
	let bbiArr = [];
	let ma3 = MA(ticks, n1);
	let ma6 = MA(ticks, n2);
	let ma12 = MA(ticks, n3);
	let ma24 = MA(ticks, n4);
	for (let i = 0; i < ticks.length; i++) {
		let bbi = (ma3[i] + ma6[i] + ma12[i] + ma24[i]) / 4;
		bbiArr.push(bbi);
	}
	return {
		"bbi": bbiArr
	};
};

/**
 * 计算最大值
 * @param {Object} ticks 最高价数组
 * @param {Object} days
 */
let HHV = function (ticks, days) {
	let hhv = [];
	let max = ticks[0];
	for (let i = 0; i < ticks.length; i++) {
		if (i >= days) {
			max = ticks[i];
			for (let j = i; j > i - days; j--) {
				if (max < ticks[j]) {
					max = ticks[j];
				}
			}
			hhv.push(max);
		} else {
			if (max < ticks[i]) {
				max = ticks[i];
			}
			hhv.push(max);
		}
	}
	return hhv;
};

/**
 * 计算最小值
 * @param {Object} ticks 最低价数组
 * @param {Object} days
 */
let LLV = function (ticks, days) {
	let llv = [];
	let min = ticks[0];
	for (let i = 0; i < ticks.length; i++) {
		if (i >= days) {
			min = ticks[i];
			for (let j = i; j > i - days; j--) {
				if (min > ticks[j]) {
					min = ticks[j];
				}
			}
			llv.push(min);
		} else {
			if (min > ticks[i]) {
				min = ticks[i];
			}
			llv.push(min);
		}
	}
	return llv;
};

/**
 * 计算WR(威廉指标)
 * @param {Array} ticks 含最高价,最低价, 收盘价的二维数组
 * @param {Object} days
 */
let getWRData = function (ticks, n1, n2) {
	let wr1Arr = [],
		wr2Arr = [];
	let highArr = [],
		lowArr = [],
		closeArr = [];
	let length = ticks.length;
	for (let i = 0; i < length; i++) {
		let t = ticks[i];
		highArr.push(t[1]);
		lowArr.push(t[2]);
		closeArr.push(t[0])
	}
	let highArr1 = HHV(highArr, n1);
	let highArr2 = HHV(highArr, n2);
	let lowArr1 = LLV(lowArr, n1);
	let lowArr2 = LLV(lowArr, n2);
	for (let i = 0; i < length; i++) {
		let high1 = highArr1[i];
		let low1 = lowArr1[i];
		let high2 = highArr2[i];
		let low2 = lowArr2[i];
		let close = closeArr[i];
		let wr1 = 100 * (high1 - close) / (high1 - low1);
		let wr2 = 100 * (high2 - close) / (high2 - low2);
		wr1Arr.push(wr1);
		wr2Arr.push(wr2);
	}
	return {
		"wr1": wr1Arr,
		"wr2": wr2Arr
	};
};

/**
 * CCI(顺势指标)计算  CCI（N日）=（TP－MA）÷MD÷0.015
 * @param {Object} ticks 带最高价，最低价，收盘价的二维数组
 */
let getCCIData = function (ticks, n) {
	let cciArr = [],
		tpArr = [],
		closeArr = [];
	let length = ticks.length;
	for (let i = 0; i < length; i++) {
		let t = ticks[i];
		tpArr.push((t[0] + t[1] + t[2]) / 3);
		closeArr.push(t[0]);
	}
	let maClose = MA(closeArr, n);

	let mdArr = [];
	for (let i = 0; i < length; i++) {
		mdArr.push(maClose[i] - closeArr[i]);
	}

	let maMD = MA(mdArr, n);
	for (let i = 0; i < length; i++) {
		let cci = (tpArr[i] - maClose[i]) / (maMD[i] * 0.015);
		cciArr.push(cci);
	}
	return cciArr;
};

/*
* REF函数
* ticks:数据
* days:日数
*/
let REF = function (ticks, days) {
	let refArr = [];
	let length = ticks.length;
	for (let i = 0; i < length; i++) {
		let ref;
		if (i >= days) {
			ref = ticks[i - days];
		} else {
			ref = ticks[0];
		}
		refArr.push(ref);
	}
	return refArr;
};

/*
* 获取TRIX的数据
* ticks:数据
*/
let getTRIXData = function (ticks, n, m) {
	let mtrArr = [],
		trixArr = [],
		matrixArr = [];

	let length = ticks.length;
	let emaArr1 = [];
	emaArr1.push(ticks[0]);
	for (let i = 1; i < length; i++) {
		emaArr1.push(getEMA(n, ticks[i], emaArr1[i - 1]));
	}

	let emaArr2 = [];
	emaArr2.push(emaArr1[0]);
	for (let i = 1; i < length; i++) {
		emaArr2.push(getEMA(n, emaArr1[i], emaArr2[i - 1]));
	}

	mtrArr.push(emaArr2[0]);
	for (let i = 1; i < length; i++) {
		mtrArr.push(getEMA(n, emaArr2[i], mtrArr[i - 1]));
	}

	let ref = REF(mtrArr, 1);
	for (let i = 0; i < length; i++) {
		let trix = 100 * (mtrArr[i] - ref[i]) / ref[i];
		trixArr.push(trix);
	}

	matrixArr = MA(trixArr, m);
	return {
		"trix": trixArr,
		"matrix": matrixArr
	};
};

/*
 * 计算多个MA的数据
 * ticks:数据
 */
let getMultiMAData = function (ticks, n1, n2, n3, n4, n5, n6) {
	let ma5 = MA(ticks, n1);
	let ma10 = MA(ticks, n2);
	let ma20 = MA(ticks, n3);
	let ma30 = MA(ticks, n4);
	let ma120 = MA(ticks, n5);
	let ma250 = MA(ticks, n6);
	return {
		"ma5": ma5,
		"ma10": ma10,
		"ma20": ma20,
		"ma30": ma30,
		"ma120": ma120,
		"ma250": ma250
	};
};

/*
* 判断是否选中线条
* chart:图表
* mp:坐标
* divIndex:层索引
* datas:数据
* curIndex:当前索引
*/
let selectLines = function (chart, mp, divIndex, datas, curIndex) {
	if (datas.length > 0) {
		let topY = getChartY(chart, divIndex, datas[curIndex]);
		if (chart.hScalePixel <= 1) {
			if (mp.y >= topY - 8 && mp.y <= topY + 8) {
				return true;
			}
		} else {
			let index = curIndex;
			let scaleX = getChartX(chart, index);
			let judgeTop = 0;
			let judgeScaleX = scaleX;
			if (mp.x >= scaleX) {
				let leftIndex = curIndex + 1;
				if (curIndex < chart.lastVisibleIndex) {
					let rightValue = datas[leftIndex];
					judgeTop = getChartY(chart, divIndex, rightValue);
				}
				else {
					judgeTop = topY;
				}
			}
			else {
				judgeScaleX = scaleX - chart.hScalePixel;
				let rightIndex = curIndex - 1;
				if (curIndex > 0) {
					let leftValue = datas[rightIndex];
					judgeTop = getChartY(chart, divIndex, leftValue);
				} else {
					judgeTop = topY;
				}
			}
			let lineWidth = 4;
			let judgeX = 0, judgeY = 0, judgeW = 0, judgeH = 0;
			if (judgeTop >= topY) {
				judgeX = judgeScaleX;
				judgeY = topY - 2 - lineWidth;
				judgeW = chart.hScalePixel;
				judgeH = judgeTop - topY + lineWidth < 4 ? 4 : judgeTop - topY + 4 + lineWidth;
			}
			else {
				judgeX = judgeScaleX;
				judgeY = judgeTop - 2 - lineWidth / 2;
				judgeW = chart.hScalePixel;
				judgeH = topY - judgeTop + lineWidth < 4 ? 4 : topY - judgeTop + 4 + lineWidth;
			}

			if (mp.x >= judgeX && mp.x <= judgeX + judgeW && mp.y >= judgeY && mp.y <= judgeY + judgeH) {

				return true;
			}
		}
	}
	return false;
};

/*
* 判断是否在右轴选中线条
* chart:图表
* mp:坐标
* divIndex:层索引
* datas:数据
* curIndex:当前索引
*/
let selectLinesInRight = function (chart, mp, divIndex, datas, curIndex) {
	if (datas.length > 0) {
		let topY = getChartYInRight(chart, divIndex, datas[curIndex]);
		if (chart.hScalePixel <= 1) {
			if (mp.y >= topY - 8 && mp.y <= topY + 8) {
				return true;
			}
		} else {
			let index = curIndex;
			let scaleX = getChartX(chart, index);
			let judgeTop = 0;
			let judgeScaleX = scaleX;
			if (mp.x >= scaleX) {
				let leftIndex = curIndex + 1;
				if (curIndex < chart.lastVisibleIndex) {
					let rightValue = datas[leftIndex];
					judgeTop = getChartYInRight(chart, divIndex, rightValue);
				}
				else {
					judgeTop = topY;
				}
			}
			else {
				judgeScaleX = scaleX - chart.hScalePixel;
				let rightIndex = curIndex - 1;
				if (curIndex > 0) {
					let leftValue = datas[rightIndex];
					judgeTop = getChartYInRight(chart, divIndex, leftValue);
				} else {
					judgeTop = topY;
				}
			}
			let lineWidth = 4;
			let judgeX = 0, judgeY = 0, judgeW = 0, judgeH = 0;
			if (judgeTop >= topY) {
				judgeX = judgeScaleX;
				judgeY = topY - 2 - lineWidth;
				judgeW = chart.hScalePixel;
				judgeH = judgeTop - topY + lineWidth < 4 ? 4 : judgeTop - topY + 4 + lineWidth;
			}
			else {
				judgeX = judgeScaleX;
				judgeY = judgeTop - 2 - lineWidth / 2;
				judgeW = chart.hScalePixel;
				judgeH = topY - judgeTop + lineWidth < 4 ? 4 : topY - judgeTop + 4 + lineWidth;
			}

			if (mp.x >= judgeX && mp.x <= judgeX + judgeW && mp.y >= judgeY && mp.y <= judgeY + judgeH) {

				return true;
			}
		}
	}
	return false;
};

/*
* 判断是否选中图形
* chart:图表
* mp:坐标
*/
let selectShape = function (chart, mp) {
	chart.selectShape = "";
	chart.selectShapeEx = "";
	let candleHeight = getCandleDivHeight(chart);
	let volHeight = getVolDivHeight(chart);
	let indHeight = getIndDivHeight(chart);
	let indHeight2 = getIndDivHeight2(chart);
	let index = getChartIndex(chart, mp);
	if (mp.y >= candleHeight + volHeight + indHeight && mp.y <= candleHeight + volHeight + indHeight + indHeight2) {
		if (chart.showIndicator2 == "MACD") {
			if (selectLines(chart, mp, 3, chart.allmacdarr, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "MACD";
			}
			if (selectLines(chart, mp, 3, chart.alldifarr, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "DIF";
			}
			else if (selectLines(chart, mp, 3, chart.alldeaarr, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "DEA";
			}
		} else if (chart.showIndicator2 == "KDJ") {
			if (selectLines(chart, mp, 3, chart.kdjMap.k, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "K";
			}
			else if (selectLines(chart, mp, 3, chart.kdjMap.d, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "D";
			} else if (selectLines(chart, mp, 3, chart.kdjMap.j, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "J";
			}
		} else if (chart.showIndicator2 == "RSI") {
			if (selectLines(chart, mp, 3, chart.rsiMap.rsi6, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "6";
			}
			else if (selectLines(chart, mp, 3, chart.rsiMap.rsi12, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "12";
			} else if (selectLines(chart, mp, 3, chart.rsiMap.rsi24, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "24";
			}
		}
		else if (chart.showIndicator2 == "BIAS") {
			if (selectLines(chart, mp, 3, chart.biasMap.bias1, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "1";
			}
			else if (selectLines(chart, mp, 3, chart.biasMap.bias2, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "2";
			} else if (selectLines(chart, mp, 3, chart.biasMap.bias3, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "3";
			}
		}
		else if (chart.showIndicator2 == "ROC") {
			if (selectLines(chart, mp, 3, chart.rocMap.roc, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "ROC";
			}
			else if (selectLines(chart, mp, 3, chart.rocMap.maroc, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "ROCMA";
			}
		} else if (chart.showIndicator2 == "WR") {
			if (selectLines(chart, mp, 3, chart.wrMap.wr1, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "1";
			}
			else if (selectLines(chart, mp, 3, chart.wrMap.wr2, index)) {
				chart.selectShape = "WR";
				chart.selectShapeEx = "2";
			}
		} else if (chart.showIndicator2 == "CCI") {
			if (selectLines(chart, mp, 3, chart.cciArr, index)) {
				chart.selectShape = chart.showIndicator2;
			}
		} else if (chart.showIndicator2 == "BBI") {
			if (selectLines(chart, mp, 3, chart.bbiMap.bbi, index)) {
				chart.selectShape = chart.showIndicator2;
			}
		} else if (chart.showIndicator2 == "TRIX") {
			if (selectLines(chart, mp, 3, chart.trixMap.trix, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "TRIX";
			}
			else if (selectLines(chart, mp, 3, chart.trixMap.matrix, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "TRIXMA";
			}
		} else if (chart.showIndicator2 == "DMA") {
			if (selectLines(chart, mp, 3, chart.dmaMap.dif, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "DIF";
			}
			else if (selectLines(chart, mp, 3, chart.dmaMap.difma, index)) {
				chart.selectShape = chart.showIndicator2;
				chart.selectShapeEx = "DIFMA";
			}
		}
	}
	else if (mp.y >= candleHeight + volHeight && mp.y <= candleHeight + volHeight + indHeight) {
		if (chart.showIndicator == "MACD") {
			if (selectLines(chart, mp, 2, chart.allmacdarr, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "MACD";
			}
			if (selectLines(chart, mp, 2, chart.alldifarr, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "DIF";
			}
			else if (selectLines(chart, mp, 2, chart.alldeaarr, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "DEA";
			}
		} else if (chart.showIndicator == "KDJ") {
			if (selectLines(chart, mp, 2, chart.kdjMap.k, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "K";
			}
			else if (selectLines(chart, mp, 2, chart.kdjMap.d, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "D";
			} else if (selectLines(chart, mp, 2, chart.kdjMap.j, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "J";
			}
		} else if (chart.showIndicator == "RSI") {
			if (selectLines(chart, mp, 2, chart.rsiMap.rsi6, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "6";
			}
			else if (selectLines(chart, mp, 2, chart.rsiMap.rsi12, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "12";
			} else if (selectLines(chart, mp, 2, chart.rsiMap.rsi24, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "24";
			}
		}
		else if (chart.showIndicator == "BIAS") {
			if (selectLines(chart, mp, 2, chart.biasMap.bias1, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "1";
			}
			else if (selectLines(chart, mp, 2, chart.biasMap.bias2, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "2";
			} else if (selectLines(chart, mp, 2, chart.biasMap.bias3, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "3";
			}
		}
		else if (chart.showIndicator == "ROC") {
			if (selectLines(chart, mp, 2, chart.rocMap.roc, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "ROC";
			}
			else if (selectLines(chart, mp, 2, chart.rocMap.maroc, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "ROCMA";
			}
		} else if (chart.showIndicator == "WR") {
			if (selectLines(chart, mp, 2, chart.wrMap.wr1, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "1";
			}
			else if (selectLines(chart, mp, 2, chart.wrMap.wr2, index)) {
				chart.selectShape = "WR";
				chart.selectShapeEx = "2";
			}
		} else if (chart.showIndicator == "CCI") {
			if (selectLines(chart, mp, 2, chart.cciArr, index)) {
				chart.selectShape = chart.showIndicator;
			}
		} else if (chart.showIndicator == "BBI") {
			if (selectLines(chart, mp, 2, chart.bbiMap.bbi, index)) {
				chart.selectShape = chart.showIndicator;
			}
		} else if (chart.showIndicator == "TRIX") {
			if (selectLines(chart, mp, 2, chart.trixMap.trix, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "TRIX";
			}
			else if (selectLines(chart, mp, 2, chart.trixMap.matrix, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "TRIXMA";
			}
		} else if (chart.showIndicator == "DMA") {
			if (selectLines(chart, mp, 2, chart.dmaMap.dif, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "DIF";
			}
			else if (selectLines(chart, mp, 2, chart.dmaMap.difma, index)) {
				chart.selectShape = chart.showIndicator;
				chart.selectShapeEx = "DIFMA";
			}
		}
	}
	else if (mp.y >= candleHeight && mp.y <= candleHeight + volHeight) {
		let volY = getChartY(chart, 1, chart.datas[index].volume);
		let zeroY = getChartY(chart, 1, 0);
		if (mp.y >= Math.min(volY, zeroY) && mp.y <= Math.max(volY, zeroY)) {
			chart.selectShape = "VOL";
		}
	}
	else if (mp.y >= 0 && mp.y <= candleHeight) {
		let isTrend = chart.cycle == "trend";
		if (!isTrend) {
			if (chart.mainIndicator == "BOLL") {
				if (selectLines(chart, mp, 0, chart.bollMap.mid, index)) {
					chart.selectShape = chart.mainIndicator;
					chart.selectShapeEx = "MID";
				}
				else if (selectLines(chart, mp, 0, chart.bollMap.upper, index)) {
					chart.selectShape = chart.mainIndicator;
					chart.selectShapeEx = "UP";
				} else if (selectLines(chart, mp, 0, chart.bollMap.lower, index)) {
					chart.selectShape = chart.mainIndicator;
					chart.selectShapeEx = "DOWN";
				}
			} else if (chart.mainIndicator == "MA") {
				if (selectLines(chart, mp, 0, chart.maMap.ma5, index)) {
					chart.selectShape = chart.mainIndicator;
					chart.selectShapeEx = "5";
				}
				else if (selectLines(chart, mp, 0, chart.maMap.ma10, index)) {
					chart.selectShape = chart.mainIndicator;
					chart.selectShapeEx = "10";
				}
				else if (selectLines(chart, mp, 0, chart.maMap.ma20, index)) {
					chart.selectShape = chart.mainIndicator;
					chart.selectShapeEx = "20";
				}
				else if (selectLines(chart, mp, 0, chart.maMap.ma30, index)) {
					chart.selectShape = chart.mainIndicator;
					chart.selectShapeEx = "30";
				}
				else if (selectLines(chart, mp, 0, chart.maMap.ma120, index)) {
					chart.selectShape = chart.mainIndicator;
					chart.selectShapeEx = "120";
				}
				else if (selectLines(chart, mp, 0, chart.maMap.ma250, index)) {
					chart.selectShape = chart.mainIndicator;
					chart.selectShapeEx = "250";
				}
			}
		}
		if (chart.selectShape == "") {
			let highY = getChartY(chart, 0, chart.datas[index].high);
			let lowY = getChartY(chart, 0, chart.datas[index].low);
			if (isTrend) {
				if (selectLines(chart, mp, 0, chart.closearr, index)) {
					chart.selectShape = "CANDLE";
				}
			}
			else {
				if (mp.y >= Math.min(lowY, highY) && mp.y <= Math.max(lowY, highY)) {
					chart.selectShape = "CANDLE";
				}
			}
		}
	}
	if (chart.shapes.length > 0) {
		for (let i = 0; i < chart.shapes.length; i++) {
			let shape = chart.shapes[i];
			if (shape.leftOrRight) {
				if (selectLines(chart, mp, shape.divIndex, shape.datas, index)) {
					chart.selectShape = shape.shapeName;
					break;
				}
			} else {
				if (selectLinesInRight(chart, mp, shape.divIndex, shape.datas, index)) {
					chart.selectShape = shape.shapeName;
					break;
				}
			}
		}
	}
};

/*
* 图层的鼠标抬起方法
* div: 图层
* firstTouch:是否第一次触摸
* firstPoint:第一次触摸的坐标
* secondTouch:是否第二次触摸
* secondPoint:第二次触摸的坐标
* clicks:点击次数
*/
let touchUpDiv = function (div, firstTouch, firstPoint, secondTouch, secondPoint, clicks) {
	div.hoverScrollHButton = false;
	div.hoverScrollVButton = false;
	if (firstTouch && firstPoint && div.startPoint && !div.downScrollHButton && !div.downScrollVButton) {
		if (div.allowDragScroll) {
			let touchUpTime = new Date().getTime();
			let diff = touchUpTime - div.touchDownTime;
			//加速滚动
			if (diff < 250) {
				let sub1 = 100 * ((Math.abs(firstPoint.y - div.startPoint.y)) / 20) / diff * 10;
				let sub2 = 100 * ((Math.abs(firstPoint.x - div.startPoint.x)) / 20) / diff * 10;
				if ("A:" + sub1 != "A:NaN" && "A:" + sub2 != "A:NaN") {
					if (Math.abs(sub1) > Math.abs(sub2)) {
						if (firstPoint.y < div.startPoint.y) {
							g_scrollAddSpeed_Div += sub1;
						} else {
							g_scrollAddSpeed_Div -= sub1;
						}
						g_scrollDirection_Div = 0;
					} else {
						if (firstPoint.x < div.startPoint.x) {
							g_scrollAddSpeed_Div += sub2;
						} else {
							g_scrollAddSpeed_Div -= sub2;
						}
						g_scrollDirection_Div = 1;
					}
					g_dragScrollView_Div = div;
					if (Math.abs(g_scrollAddSpeed_Div) > 0) {
						div.paint.cancelClick = true;
					}
				}
			}
		}
	}
	div.downScrollHButton = false;
	div.downScrollVButton = false;
};
	
/*
* 图层的鼠标滚轮方法
* div:图层
* delta:滚轮值
*/
let touchWheelDiv = function (div, delta) {
	let oldScrollV = div.scrollV;
	if (delta < 0) {
		oldScrollV -= 20;
	} else if (delta > 0) {
		oldScrollV += 20;
	}
	let contentHeight = getDivContentHeight(div);
	if (contentHeight < div.size.cy) {
		div.scrollV = 0;
	} else {
		if (oldScrollV < 0) {
			oldScrollV = 0;
		} else if (oldScrollV > contentHeight - div.size.cy) {
			oldScrollV = contentHeight - div.size.cy;
		}
		div.scrollV = oldScrollV;
	}
};

/*
* 重绘图层
* div:视图
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawDiv = function (div, paint, clipRect) {
	if (div.backColor && div.backColor != "none") {
		paint.fillRoundRect(div.backColor, 0, 0, div.size.cx, div.size.cy, div.cornerRadius);
	}
	if (div.backImage && div.backImage.length > 0) {
		if (!div.image) {
			div.image = new Image();
			div.image.onload = function () { invalidateView(div); };
			div.image.src = div.backImage;
		} else {
			paint.drawImage(div.image, 0, 0, div.size.cx, div.size.cy);
		}
	}
};

/*
* 重绘图层边线
* div:视图
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawDivBorder = function (div, paint, clipRect) {
	if (div.borderColor && div.borderColor != "none") {
		paint.drawRoundRect(div.borderColor, div.borderWidth, 0, 0, 0, div.size.cx, div.size.cy, div.cornerRadius);
	}
};

/*
 * 快速添加表格列
 * grid:表格
 * columns:列名集合
 */
let fastAddGridColumns = function(grid, columns){
    let columnsSize = columns.length;
	for (let i = 0; i < columnsSize; i++) {
        let gridColumn = new FCGridColumn();
		gridColumn.text = columns[i];
		grid.columns.push(gridColumn);
	}
}

/*
 * 快速添加表格行
 * grid:表格
 * datas:数据集合
 */
let fastAddGridRow = function(grid, datas){
	let gridRow = new FCGridRow();
    let datasSize = datas.length;
	for (let i = 0; i < datasSize; i++) {
		let gridCell = new FCGridCell();
		gridCell.value = datas[i];
		gridRow.cells.push(gridCell);
	}
	return gridRow;
}

/*
 * 添加视图到单元格
 * view:视图
 * cell:单元格
 * grid:表格
 */
let addViewToGridCell = function(view, cell, grid) {
	view.displayOffset = false;
	view.visible = false;
	cell.view = view;
	addViewToParent(view, grid);
}

/*
* 绘制单元格
* grid:表格
* row:行
* column:列
* cell:单元格
* paint:绘图对象
* left:左侧坐标
* top:上方坐标
* right:右侧坐标
* bottom:下方坐标
*/
let drawGridCell = function (grid, row, column, cell, paint, left, top, right, bottom) {
	if (cell.backColor && cell.backColor != "none") {
		paint.fillRect(cell.backColor, left, top, right, bottom);
	}
	if (row.selected) {
		if (grid.selectedRowColor && grid.selectedRowColor != "none") {
			paint.fillRect(grid.selectedRowColor, left, top, right, bottom);
		}
	}else{
		if(row.alternate && grid.alternateRowColor && grid.alternateRowColor != "none"){
			paint.fillRect(grid.alternateRowColor, left, top, right, bottom);
		}
	}
	if (cell.borderColor && cell.borderColor != "none") {
		paint.drawRect(cell.borderColor, 1, 0, left, top, right, bottom);
	}
	if (cell.value || cell.value == 0) {
		let showText = cell.value.toString();
		if (column.colType == "double") {
			if (cell.digit >= 0) {
				let numValue = Number(showText);
				showText = numValue.toFixed(cell.digit);
			}
		}
		let tSize = paint.textSize(showText, cell.font);
		if (tSize.cx > column.width) {
			paint.drawTextAutoEllipsis(showText, cell.textColor, cell.font, left + 2, top + grid.rowHeight / 2 - tSize.cy / 2, left + 2 + column.width, top + grid.rowHeight / 2 - tSize.cy / 2);
		} else {
			if (column.cellAlign == "left") {
				paint.drawText(showText, cell.textColor, cell.font, left + 2, top + grid.rowHeight / 2 - tSize.cy / 2);
			} else if (column.cellAlign == "center") {
				paint.drawText(showText, cell.textColor, cell.font, left + (right - left - tSize.cx) / 2, top + grid.rowHeight / 2 - tSize.cy / 2);
			} else if (column.cellAlign == "right") {
				paint.drawText(showText, cell.textColor, cell.font, right - tSize.cx, top + grid.rowHeight / 2 - tSize.cy / 2);
			}
		}
	}
};

/*
* 绘制列
* grid:表格
* column:列
* paint:绘图对象
* left:左侧坐标
* top:上方坐标
* right:右侧坐标
* bottom:下方坐标
*/
let drawGridColumn = function (grid, column, paint, left, top, right, bottom) {
	let tSize = paint.textSize(column.text, column.font);
	if (column.backColor && column.backColor != "none") {
		paint.fillRect(column.backColor, left, top, right, bottom);
	}
	if (column.borderColor && column.borderColor != "none") {
		paint.drawRect(column.borderColor, 1, 0, left, top, right, bottom);
	}
	paint.drawText(column.text, column.textColor, column.font, left + (column.width - tSize.cx) / 2, top + grid.headerHeight / 2 - tSize.cy / 2);
	if (column.sort == "asc") {
		paint.beginPath();
		let cR = (bottom - top) / 4;
		let oX = right - cR * 2, oY = top + (bottom - top) / 2;
		paint.addLine(oX, oY - cR, oX - cR, oY + cR);
		paint.addLine(oX - cR, oY + cR, oX + cR, oY + cR);
		paint.addLine(oX + cR, oY + cR, oX, oY - cR);
		paint.fillPath(column.textColor);
		paint.closePath();
	}
	else if (column.sort == "desc") {
		paint.beginPath();
		let cR = (bottom - top) / 4;
		let oX = right - cR * 2, oY = top + (bottom - top) / 2;
		paint.addLine(oX, oY + cR, oX - cR, oY - cR);
		paint.addLine(oX - cR, oY - cR, oX + cR, oY - cR);
		paint.addLine(oX + cR, oY - cR, oX, oY + cR);
		paint.fillPath(column.textColor);
		paint.closePath();
	}
};

/*
* 绘制表格
* grid:表格
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawGrid = function (grid, paint, clipRect) {
	let cTop = -grid.scrollV + grid.headerHeight;
	//绘制行
	let colLeft = 0;
	if(grid.views){
		for (let i = 0; i < grid.views.length; i++) {
			grid.views[i].visible = false;
		}
	}
	for (let i = 0; i < grid.columns.length; i++) {
		if (grid.columns[i].widthStr.length > 0) {
			let newWidthStr = grid.columns[i].widthStr.replace("%", "");
			grid.columns[i].width = Number(newWidthStr) * grid.size.cx / 100;
		}
		let colRect = new FCRect(colLeft, 0, colLeft + grid.columns[i].width, grid.headerHeight);
		grid.columns[i].bounds = colRect;
		grid.columns[i].index = i;
		colLeft += grid.columns[i].width;
	}
	let visibleIndex = 0;
	for (let i = 0; i < grid.rows.length; i++) {
		let row = grid.rows[i];
		row.index = i;
		row.alternate = false;
		if (row.visible) {
			row.alternate = visibleIndex % 2 == 1;
			visibleIndex++;
			let rTop = cTop, rBottom = cTop + grid.rowHeight;
			if (rBottom >= 0 && cTop <= grid.size.cy) {
				for (let j = 0; j < row.cells.length; j++) {
					let cell = row.cells[j];
					let gridColumn = cell.column;
					if (!gridColumn) {
						gridColumn = grid.columns[j];
					}
					if (gridColumn.visible) {
						if (!gridColumn.frozen) {
							let cellWidth = gridColumn.width;
							let colSpan = cell.colSpan;
							if (colSpan > 1) {
								for (let n = 1; n < colSpan; n++) {
									let spanColumn = grid.columns[gridColumn.index + n];
									if (spanColumn && spanColumn.visible) {
										cellWidth += spanColumn.width;
									}
								}
							}
							let cellHeight = grid.rowHeight;
							let rowSpan = cell.rowSpan;
							if (rowSpan > 1) {
								for (let n = 1; n < rowSpan; n++) {
									let spanRow = grid.rows[i + n];
									if (spanRow && spanRow.visible) {
										cellHeight += grid.rowHeight;
									}
								}
							}
							let cRect = new FCRect(gridColumn.bounds.left - grid.scrollH, rTop, gridColumn.bounds.left + cellWidth - grid.scrollH, rTop + cellHeight);
							if (cRect.right >= 0 && cRect.left < grid.size.cx) {
								if(grid.onPaintGridCell){
									grid.onPaintGridCell(grid, row, gridColumn, cell, paint, cRect.left, cRect.top, cRect.right, cRect.bottom);
								}
								else if (paint.onPaintGridCell) {
									paint.onPaintGridCell(grid, row, gridColumn, cell, paint, cRect.left, cRect.top, cRect.right, cRect.bottom);
								} else {
									drawGridCell(grid, row, gridColumn, cell, paint, cRect.left, cRect.top, cRect.right, cRect.bottom);
								}
								if (cell.view) {
									cell.view.visible = true;
									cell.view.location = new FCPoint(cRect.left + grid.scrollH, cRect.top + grid.scrollV);
									cell.view.size = new FCSize(cRect.right - cRect.left, cRect.bottom - cRect.top);
								}
							}
						}
					}
				}
			}
			if (rBottom >= 0 && cTop <= grid.size.cy) {
				for (let j = 0; j < row.cells.length; j++) {
					let cell = row.cells[j];
					let gridColumn = cell.column;
					if (!gridColumn) {
						gridColumn = grid.columns[j];
					}
					if (gridColumn.visible) {
						if (gridColumn.frozen) {
							let cellWidth = gridColumn.width;
							let colSpan = cell.colSpan;
							if (colSpan > 1) {
								for (let n = 1; n < colSpan; n++) {
									let spanColumn = grid.columns[gridColumn.index + n];
									if (spanColumn && spanColumn.visible) {
										cellWidth += spanColumn.width;
									}
								}
							}
							let cellHeight = grid.rowHeight;
							let rowSpan = cell.rowSpan;
							if (rowSpan > 1) {
								for (let n = 1; n < rowSpan; n++) {
									let spanRow = grid.rows[i + n];
									if (spanRow && spanRow.visible) {
										cellHeight += grid.rowHeight;
									}
								}
							}
							let cRect = new FCRect(gridColumn.bounds.left, rTop, gridColumn.bounds.left + cellWidth, rTop + cellHeight);
							if (cRect.right >= 0 && cRect.left < grid.size.cx) {
								if(grid.onPaintGridCell){
									grid.onPaintGridCell(grid, row, gridColumn, cell, paint, cRect.left, cRect.top, cRect.right, cRect.bottom);
								}
								else if (paint.onPaintGridCell) {
									paint.onPaintGridCell(grid, row, gridColumn, cell, paint, cRect.left, cRect.top, cRect.right, cRect.bottom);
								} else {
									drawGridCell(grid, row, gridColumn, cell, paint, cRect.left, cRect.top, cRect.right, cRect.bottom);
								}
								if (cell.view) {
									cell.view.visible = true;
									cell.view.location = new FCPoint(cRect.left + grid.scrollH, cRect.top + grid.scrollV);
									cell.view.size = new FCSize(cRect.right - cRect.left, cRect.bottom - cRect.top);
								}
							}
						}
					}
				}
			}
			if (cTop > grid.size.cy) {
				break;
			}
			cTop += grid.rowHeight;
		}
	}
};

/*
* 绘制表格的滚动条
* grid:表格
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawGridScrollBar = function (grid, paint, clipRect) {
	grid.hScrollIsVisible = false;
	grid.vScrollIsVisible = false;
	if (grid.headerHeight > 0) {
		let cLeft = -grid.scrollH;
		//绘制列
		for (let i = 0; i < grid.columns.length; i++) {
			let gridColumn = grid.columns[i];
			if (grid.columns[i].visible) {
				if (!gridColumn.frozen) {
					if (grid.onPaintGridColumn) {
						grid.onPaintGridColumn(grid, grid.columns[i], paint, cLeft, 0, cLeft + gridColumn.width, grid.headerHeight);
					}
					else if (paint.onPaintGridColumn) {
						paint.onPaintGridColumn(grid, grid.columns[i], paint, cLeft, 0, cLeft + gridColumn.width, grid.headerHeight);
					} else {
						drawGridColumn(grid, grid.columns[i], paint, cLeft, 0, cLeft + gridColumn.width, grid.headerHeight);
					}
				}
				cLeft += gridColumn.width;
			}
		}
		cLeft = 0;
		for (let i = 0; i < grid.columns.length; i++) {
			let gridColumn = grid.columns[i];
			if (grid.columns[i].visible) {
				if (gridColumn.frozen) {
					if (grid.onPaintGridColumn) {
						grid.onPaintGridColumn(grid, grid.columns[i], paint, cLeft, 0, cLeft + gridColumn.width, grid.headerHeight);
					}
					else if (paint.onPaintGridColumn) {
						paint.onPaintGridColumn(grid, grid.columns[i], paint, cLeft, 0, cLeft + gridColumn.width, grid.headerHeight);
					} else {
						drawGridColumn(grid, grid.columns[i], paint, cLeft, 0, cLeft + gridColumn.width, grid.headerHeight);
					}
				}
				cLeft += gridColumn.width;
			}
		}
	}
	if (paint.isMobile) {
		if (paint.touchDownView == grid) {
		} else if (g_dragScrollView_Grid == grid && g_scrollAddSpeed_Grid != 0) {
		} else {
			return;
		}
	}
	if (grid.showHScrollBar) {
		let contentWidth = getGridContentWidth(grid);
		if (contentWidth > 0 && contentWidth > grid.size.cx) {
			let sLeft = grid.scrollH / contentWidth * grid.size.cx;
			let sRight = (grid.scrollH + grid.size.cx) / contentWidth * grid.size.cx;
			if (sRight - sLeft < grid.scrollSize) {
				sRight = sLeft + grid.scrollSize;
			}
			if (paint.touchMoveView == grid && (grid.hoverScrollHButton || grid.downScrollHButton)) {
				paint.fillRect(grid.scrollBarHoveredColor, sLeft, grid.size.cy - grid.scrollSize, sRight, grid.size.cy);
			} else {
				paint.fillRect(grid.scrollBarColor, sLeft, grid.size.cy - grid.scrollSize, sRight, grid.size.cy);
			}
			grid.hScrollIsVisible = true;
		}
	}
	if (grid.showVScrollBar) {
		let contentHeight = getGridContentHeight(grid);
		if (contentHeight > 0 && contentHeight > grid.size.cy - grid.headerHeight) {
			let sTop = grid.headerHeight + grid.scrollV / contentHeight * (grid.size.cy - grid.headerHeight - grid.scrollSize);
			let sBottom = sTop + ((grid.size.cy - grid.headerHeight - grid.scrollSize)) / contentHeight * (grid.size.cy - grid.headerHeight - grid.scrollSize);
			if (sBottom - sTop < grid.scrollSize) {
				sBottom = sTop + grid.scrollSize;
			}
			if (paint.touchMoveView == grid && (grid.hoverScrollVButton || grid.downScrollVButton)) {
				paint.fillRect(grid.scrollBarHoveredColor, grid.size.cx - grid.scrollSize, sTop, grid.size.cx, sBottom);
			} else {
				paint.fillRect(grid.scrollBarColor, grid.size.cx - grid.scrollSize, sTop, grid.size.cx, sBottom);
			}
			grid.vScrollIsVisible = true;
		}
	}
};

/*
* 获取内容的宽度
* grid:表格
*/
let getGridContentWidth = function (grid) {
	let cWidth = 0;
	for (let i = 0; i < grid.columns.length; i++) {
		if (grid.columns[i].visible) {
			cWidth += grid.columns[i].width;
		}
	}
	return cWidth;
};

/*
* 获取内容的高度
* grid:表格
*/
let getGridContentHeight = function (grid) {
	let cHeight = 0;
	for (let i = 0; i < grid.rows.length; i++) {
		if (grid.rows[i].visible) {
			cHeight += grid.rowHeight;
		}
	}
	return cHeight;
};

/*
* 表格的鼠标移动方法
* grid: 表格
* firstTouch:是否第一次触摸
* firstPoint:第一次触摸的坐标
* secondTouch:是否第二次触摸
* secondPoint:第二次触摸的坐标
*/
let touchMoveGrid = function (grid, firstTouch, firstPoint, secondTouch, secondPoint) {
	grid.hoverScrollHButton = false;
	grid.hoverScrollVButton = false;
	let mp = firstPoint;
	if (firstTouch) {   
		if (grid.paint.resizeColumnState != 0) {
			let gridColumn = grid.columns[grid.paint.resizeColumnIndex];
			let newWidth = grid.paint.resizeColumnBeginWidth + (mp.x - grid.startPoint.x);
			if (newWidth > 10) {
				gridColumn.width = newWidth;
			}
			return;
		}
		if (grid.showHScrollBar || grid.showVScrollBar) {
			if (grid.downScrollHButton) {
				let contentWidth = getGridContentWidth(grid);
				let subX = (mp.x - grid.startPoint.x) / grid.size.cx * contentWidth;
				let newScrollH = grid.startScrollH + subX;
				if (newScrollH < 0) {
					newScrollH = 0;
				} else if (newScrollH > contentWidth - grid.size.cx) {
					newScrollH = contentWidth - grid.size.cx;
				}
				grid.scrollH = newScrollH;
				grid.paint.cancelClick = true;
				return;

			} else if (grid.downScrollVButton) {
				let contentHeight = getGridContentHeight(grid);
				let subY = (mp.y - grid.startPoint.y) / (grid.size.cy - grid.headerHeight - grid.scrollSize) * contentHeight;
				let newScrollV = grid.startScrollV + subY;
				if (newScrollV < 0) {
					newScrollV = 0;
				} else if (newScrollV > contentHeight - (grid.size.cy - grid.headerHeight - grid.scrollSize)) {
					newScrollV = contentHeight - (grid.size.cy - grid.headerHeight - grid.scrollSize);
				}
				grid.scrollV = newScrollV;
				grid.paint.cancelClick = true;
				return;
			}
		}
		if (grid.allowDragScroll) {
			let contentWidth = getGridContentWidth(grid);
			if (contentWidth > grid.size.cx - grid.scrollSize) {
				let subX = grid.startPoint.x - mp.x;
				let newScrollH = grid.startScrollH + subX;
				if (newScrollH < 0) {
					newScrollH = 0;
				} else if (newScrollH > contentWidth - grid.size.cx) {
					newScrollH = contentWidth - grid.size.cx;
				}
				grid.scrollH = newScrollH;
				if (Math.abs(subX) > 5) {
					grid.paint.cancelClick = true;
				}
			}
			let contentHeight = getGridContentHeight(grid);
			if (contentHeight > grid.size.cy - grid.headerHeight - grid.scrollSize) {
				let subY = grid.startPoint.y - mp.y;
				let newScrollV = grid.startScrollV + subY;
				if (newScrollV < 0) {
					newScrollV = 0;
				} else if (newScrollV > contentHeight - (grid.size.cy - grid.headerHeight - grid.scrollSize)) {
					newScrollV = contentHeight - (grid.size.cy - grid.headerHeight - grid.scrollSize);
				}
				grid.scrollV = newScrollV;
				if (Math.abs(subY) > 5) {
					grid.paint.cancelClick = true;
				}
			}
		}
	} else {
		if (grid.showHScrollBar) {
			let contentWidth = getGridContentWidth(grid);
			if (contentWidth > 0 && contentWidth > grid.size.cx - grid.scrollSize) {
				let sLeft = grid.scrollH / contentWidth * grid.size.cx;
				let sRight = (grid.scrollH + grid.size.cx) / contentWidth * grid.size.cx;
				if (sRight - sLeft < grid.scrollSize) {
					sRight = sLeft + grid.scrollSize;
				}
				if (mp.x >= sLeft && mp.x <= sRight && mp.y >= grid.size.cy - grid.scrollSize && mp.y <= grid.size.cy) {
					grid.hoverScrollHButton = true;
					return;
				} else {
					grid.hoverScrollHButton = false;
				}
			}
		}
		if (grid.showVScrollBar) {
			let contentHeight = getGridContentHeight(grid);
			if (contentHeight > 0 && contentHeight > grid.size.cy - grid.headerHeight - grid.scrollSize) {
				let sTop = grid.headerHeight + grid.scrollV / contentHeight * (grid.size.cy - grid.headerHeight - grid.scrollSize);
				let sBottom = grid.headerHeight + (grid.scrollV + (grid.size.cy - grid.headerHeight - grid.scrollSize)) / contentHeight * (grid.size.cy - grid.headerHeight - grid.scrollSize);
				if (sBottom - sTop < grid.scrollSize) {
					sBottom = sTop + grid.scrollSize;
				}
				if (mp.x >= grid.size.cx - grid.scrollSize && mp.x <= grid.size.cx && mp.y >= sTop && mp.y <= sBottom) {
					grid.hoverScrollVButton = true;
					return;
				} else {
					grid.hoverScrollVButton = false;
				}
			}
		}
	}
};
	
/*
* 表格的鼠标按下方法
* grid: 表格
* firstTouch:是否第一次触摸
* firstPoint:第一次触摸的坐标
* secondTouch:是否第二次触摸
* secondPoint:第二次触摸的坐标
* clicks:点击次数
*/
let touchDownGrid = function (grid, firstTouch, firstPoint, secondTouch, secondPoint, clicks) {
	let mp = firstPoint;
	grid.touchDownTime = new Date().getTime();
	grid.startPoint = mp;
	grid.downScrollHButton = false;
	grid.downScrollVButton = false;
	grid.hoverScrollHButton = false;
	grid.hoverScrollVButton = false;
	g_dragScrollView_Grid = null;
	g_scrollAddSpeed_Grid = 0;
	g_scrollDirection_Grid = 0;
	if (grid.showHScrollBar) {
		let contentWidth = getGridContentWidth(grid);
		if (contentWidth > 0 && contentWidth > grid.size.cx - grid.scrollSize) {
			let sLeft = grid.scrollH / contentWidth * grid.size.cx;
			let sRight = (grid.scrollH + grid.size.cx) / contentWidth * grid.size.cx;
			if (sRight - sLeft < grid.scrollSize) {
				sRight = sLeft + grid.scrollSize;
			}
			if (mp.x >= sLeft && mp.x <= sRight && mp.y >= grid.size.cy - grid.scrollSize && mp.y <= grid.size.cy) {
				grid.downScrollHButton = true;
				grid.startScrollH = grid.scrollH;
				return;
			}
		}
	}
	if (grid.showVScrollBar) {
		let contentHeight = getGridContentHeight(grid);
		if (contentHeight > 0 && contentHeight > grid.size.cy - grid.headerHeight - grid.scrollSize) {
			let sTop = grid.headerHeight + grid.scrollV / contentHeight * (grid.size.cy - grid.headerHeight - grid.scrollSize);
			let sBottom = grid.headerHeight + (grid.scrollV + (grid.size.cy - grid.headerHeight - grid.scrollSize)) / contentHeight * (grid.size.cy - grid.headerHeight - grid.scrollSize);
			if (sBottom - sTop < grid.scrollSize) {
				sBottom = sTop + grid.scrollSize;
			}
			if (mp.x >= grid.size.cx - grid.scrollSize && mp.x <= grid.size.cx && mp.y >= sTop && mp.y <= sBottom) {
				grid.downScrollVButton = true;
				grid.startScrollV = grid.scrollV;
				return;
			}
		}
	}
	if (grid.allowDragScroll) {
		grid.startScrollH = grid.scrollH;
		grid.startScrollV = grid.scrollV;
	}
	let colLeft = 0;
	for (let i = 0; i < grid.columns.length; i++) {
		let colRect = new FCRect(colLeft, 0, colLeft + grid.columns[i].width, grid.headerHeight);
		grid.columns[i].bounds = colRect;
		grid.columns[i].index = i;
		colLeft += grid.columns[i].width;
	}
	grid.paint.resizeColumnState = 0;
	grid.paint.resizeColumnBeginWidth = 0;
	if (grid.headerHeight > 0 && mp.y <= grid.headerHeight) {
		//绘制列
		for (let i = 0; i < grid.columns.length; i++) {
			let gridColumn = grid.columns[i];
			if (gridColumn.visible) {
				let bounds = gridColumn.bounds;
				if (mp.x >= bounds.left - grid.scrollH && mp.x <= bounds.right - grid.scrollH) {
					if (gridColumn.index > 0 && mp.x < bounds.left + 5 - grid.scrollH) {
						grid.paint.resizeColumnState = 1;
						grid.paint.resizeColumnBeginWidth = grid.columns[gridColumn.index - 1].bounds.right - grid.columns[gridColumn.index - 1].bounds.left;
						grid.paint.resizeColumnIndex = gridColumn.index - 1;
						return;
					}
					else if (mp.x > bounds.right - 5 - grid.scrollH) {
						grid.paint.resizeColumnState = 2;
						grid.paint.resizeColumnBeginWidth = bounds.right - bounds.left;
						grid.paint.resizeColumnIndex = gridColumn.index;
						return;
					}
					break;
				}
			}
		}
	}
};

let g_dragScrollView_Grid = null;//正在滚动的表格
let g_scrollAddSpeed_Grid = 0;//滚动加速
let g_scrollDirection_Grid = 0; //滚动方向

/*
* 检查拖动滚动
*/
let checkGridDragScroll = function () {
	if (g_dragScrollView_Grid) {
		let sub = parseInt(g_scrollAddSpeed_Grid / 10);
		if (sub == 0 && g_scrollAddSpeed_Grid > 1) {
			sub = 1;
		} else if (sub == 0 && g_scrollAddSpeed_Grid < -1) {
			sub = -1;
		}
		g_scrollAddSpeed_Grid -= sub;
		if (Math.abs(sub) <= 1) {
			let viewCache = g_dragScrollView_Grid;
			g_dragScrollView_Grid = null;
			g_scrollAddSpeed_Grid = 0;
			if (viewCache.paint) {
				invalidateView(viewCache);
			}
		} else {
			let oldScrollV = parseInt(g_dragScrollView_Grid.scrollV + g_scrollAddSpeed_Grid);
			let oldScrollH = parseInt(g_dragScrollView_Grid.scrollH + g_scrollAddSpeed_Grid);
			if (g_scrollDirection_Grid == 0) {
				let contentHeight = getGridContentHeight(g_dragScrollView_Grid);
				if (contentHeight < g_dragScrollView_Grid.size.cy - g_dragScrollView_Grid.scrollSize) {
					g_dragScrollView_Grid.scrollV = 0;
				} else {
					if (oldScrollV < 0) {
						oldScrollV = 0;
					} else if (oldScrollV > contentHeight - g_dragScrollView_Grid.size.cy + g_dragScrollView_Grid.headerHeight + g_dragScrollView_Grid.scrollSize) {
						oldScrollV = contentHeight - g_dragScrollView_Grid.size.cy + g_dragScrollView_Grid.headerHeight + g_dragScrollView_Grid.scrollSize;
					}
					g_dragScrollView_Grid.scrollV = oldScrollV;
				}
			} else {
				let contentWidth = getGridContentWidth(g_dragScrollView_Grid);
				if (contentWidth < g_dragScrollView_Grid.size.cx - g_dragScrollView_Grid.headerHeight - g_dragScrollView_Grid.scrollSize) {
					g_dragScrollView_Grid.scrollH = 0;
				} else {
					if (oldScrollH < 0) {
						oldScrollH = 0;
					} else if (oldScrollH > contentWidth - g_dragScrollView_Grid.size.cx) {
						oldScrollH = contentWidth - g_dragScrollView_Grid.size.cx;
					}
					g_dragScrollView_Grid.scrollH = oldScrollH;
				}
			}
			if (g_dragScrollView_Grid.paint) {
				invalidateView(g_dragScrollView_Grid);
			}
		}
	}
};

/*
* 表格的鼠标抬起方法
* grid: 表格
* firstTouch:是否第一次触摸
* firstPoint:第一次触摸的坐标
* secondTouch:是否第二次触摸
* secondPoint:第二次触摸的坐标
* clicks:点击次数
*/
let touchUpGrid = function (grid, firstTouch, firstPoint, secondTouch, secondPoint, clicks) {
	if (grid.paint.resizeColumnState != 0) {
		grid.paint.resizeColumnState = 0;
		return;
	}
	grid.hoverScrollHButton = false;
	grid.hoverScrollVButton = false;
	if (firstTouch && firstPoint && grid.startPoint && !grid.downScrollHButton && !grid.downScrollVButton) {
		if (grid.allowDragScroll) {
			let touchUpTime = new Date().getTime();
			let diff = touchUpTime - grid.touchDownTime;
			//加速滚动
			if (diff < 250) {
				let sub1 = 100 * ((Math.abs(firstPoint.y - grid.startPoint.y)) / 20) / diff * 10;
				let sub2 = 100 * ((Math.abs(firstPoint.x - grid.startPoint.x)) / 20) / diff * 10;
				if ("A:" + sub1 != "A:NaN" && "A:" + sub2 != "A:NaN") {
					if (Math.abs(sub1) > Math.abs(sub2)) {
						if (firstPoint.y < grid.startPoint.y) {
							g_scrollAddSpeed_Grid += sub1;
						} else {
							g_scrollAddSpeed_Grid -= sub1;
						}
						g_scrollDirection_Grid = 0;
					} else {
						if (firstPoint.x < grid.startPoint.x) {
							g_scrollAddSpeed_Grid += sub2;
						} else {
							g_scrollAddSpeed_Grid -= sub2;
						}
						g_scrollDirection_Grid = 1;
					}
					if (Math.abs(g_scrollAddSpeed_Grid) > 0) {
						grid.paint.cancelClick = true;
					}
					g_dragScrollView_Grid = grid;
				} 
			}
		}
	}
	grid.downScrollHButton = false;
	grid.downScrollVButton = false;
	if(grid.paint.cancelClick){
		return;
	}
	let cTop = -grid.scrollV + grid.headerHeight;
	//绘制行
	let colLeft = 0;
	for (let i = 0; i < grid.columns.length; i++) {
		let colRect = new FCRect(colLeft, 0, colLeft + grid.columns[i].width, grid.headerHeight);
		grid.columns[i].bounds = colRect;
		grid.columns[i].index = i;
		colLeft += grid.columns[i].width;
	}
	if (grid.headerHeight > 0 && firstPoint.y <= grid.headerHeight) {
		let cLeft = 0;
		//绘制列
		for (let i = 0; i < grid.columns.length; i++) {
			let gridColumn = grid.columns[i];
			if (grid.columns[i].visible) {
				if (gridColumn.frozen) {
					if (firstPoint.x >= cLeft && firstPoint.x <= cLeft + gridColumn.width) {
						for (let j = 0; j < grid.columns.length; j++) {
							let tColumn = grid.columns[j];
							if (tColumn == gridColumn) {
								if (tColumn.allowSort) {
									if (tColumn.sort == "none" || tColumn.sort == "desc") {
										tColumn.sort = "asc";
										grid.rows.sort((m, n) => {
											if (m.cells.length > j && n.cells.length > j) {
												if (m.cells[j].value < n.cells[j].value) {
													return -1;
												}
												else if (m.cells[j].value > n.cells[j].value) {
													return 1;
												}
												else return 0;
											}
											else {
												return 0;
											}
										});
									} else {
										tColumn.sort = "desc";
										grid.rows.sort((m, n) => {
											if (m.cells.length > j && n.cells.length > j) {
												if (m.cells[j].value > n.cells[j].value) {
													return -1;
												}
												else if (m.cells[j].value < n.cells[j].value) {
													return 1;
												}
												else return 0;
											} else {
												return 0;
											}
										});
									}
								} else {
									tColumn.sort = "none";
								}
							} else {
								tColumn.sort = "none";
							}
						}
						if(grid.onClickGridColumn){
							grid.onClickGridColumn(grid, gridColumn, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
						}
						else if (grid.paint && grid.paint.onClickGridColumn) {
							grid.paint.onClickGridColumn(grid, gridColumn, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
						}
						return;
					}
				}
				cLeft += gridColumn.width;
			}
		}
		cLeft = -grid.scrollH;
		for (let i = 0; i < grid.columns.length; i++) {
			let gridColumn = grid.columns[i];
			if (grid.columns[i].visible) {
				if (!gridColumn.frozen) {
					if (firstPoint.x >= cLeft && firstPoint.x <= cLeft + gridColumn.width) {
						for (let j = 0; j < grid.columns.length; j++) {
							let tColumn = grid.columns[j];
							if (tColumn == gridColumn) {
								if (tColumn.allowSort) {
									if (tColumn.sort == "none" || tColumn.sort == "desc") {
										tColumn.sort = "asc";
										grid.rows.sort((m, n) => {
											if (m.cells.length > j && n.cells.length > j) {
												if (m.cells[j].value < n.cells[j].value) {
													return -1;
												}
												else if (m.cells[j].value > n.cells[j].value) {
													return 1;
												}
												else return 0;
											} else {
												return 0;
											}
										});
									} else {
										tColumn.sort = "desc";
										grid.rows.sort((m, n) => {
											if (m.cells.length > j && n.cells.length > j) {
												if (m.cells[j].value > n.cells[j].value) {
													return -1;
												}
												else if (m.cells[j].value < n.cells[j].value) {
													return 1;
												}
												else return 0;
											} else {
												return 0;
											}
										});
									}
								} else {
									tColumn.sort = "none";
								}
							} else {
								tColumn.sort = "none";
							}
						}
						if(grid.onClickGridColumn){
							grid.onClickGridColumn(grid, gridColumn, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
						}
						else if (grid.paint && grid.paint.onClickGridColumn) {
							grid.paint.onClickGridColumn(grid, gridColumn, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
						}
						return;
					}
				}
				cLeft += gridColumn.width;
			}
		}
	}
	for (let i = 0; i < grid.rows.length; i++) {
		let row = grid.rows[i];
		if (row.visible) {
			let rTop = cTop, rBottom = cTop + grid.rowHeight;
			if (rBottom >= 0 && cTop <= grid.size.cy) {
				for (let j = 0; j < row.cells.length; j++) {
					let cell = row.cells[j];
					let gridColumn = cell.column;
					if (!gridColumn) {
						gridColumn = grid.columns[j];
					}
					if (gridColumn.visible) {
						if (gridColumn.frozen) {
							let cellWidth = gridColumn.width;
							let colSpan = cell.colSpan;
							if (colSpan > 1) {
								for (let n = 1; n < colSpan; n++) {
									let spanColumn = grid.columns[gridColumn.index + n];
									if (spanColumn && spanColumn.visible) {
										cellWidth += spanColumn.width;
									}
								}
							}
							let cellHeight = grid.rowHeight;
							let rowSpan = cell.rowSpan;
							if (rowSpan > 1) {
								for (let n = 1; n < rowSpan; n++) {
									let spanRow = grid.rows[i + n];
									if (spanRow && spanRow.visible) {
										cellHeight += grid.rowHeight;
									}
								}
							}

							let cRect = new FCRect(gridColumn.bounds.left, rTop, gridColumn.bounds.left + cellWidth, rTop + cellHeight);
							if (cRect.right >= 0 && cRect.left < grid.size.cx) {
								if (firstPoint.x >= cRect.left && firstPoint.x <= cRect.right && firstPoint.y >= cRect.top && firstPoint.y <= cRect.bottom) {
									for (let r = 0; r < grid.rows.length; r++) {
										let subRow = grid.rows[r];
										if (subRow == row) {
											subRow.selected = true;
										} else {
											subRow.selected = false;
										}
									}
									if(grid.onClickGridCell){
										grid.onClickGridCell(grid, row, gridColumn, cell, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
									}
									else if (grid.paint && grid.paint.onClickGridCell) {
										grid.paint.onClickGridCell(grid, row, gridColumn, cell, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
									}
									return;
								}
							}
						}
					}
				}
			}
			if (rBottom >= 0 && cTop <= grid.size.cy) {
				for (let j = 0; j < row.cells.length; j++) {
					let cell = row.cells[j];
					let gridColumn = cell.column;
					if (!gridColumn) {
						gridColumn = grid.columns[j];
					}
					if (gridColumn.visible) {
						if (!gridColumn.frozen) {
							let cellWidth = gridColumn.width;
							let colSpan = cell.colSpan;
							if (colSpan > 1) {
								for (let n = 1; n < colSpan; n++) {
									let spanColumn = grid.columns[gridColumn.index + n];
									if (spanColumn && spanColumn.visible) {
										cellWidth += spanColumn.width;
									}
								}
							}
							let cellHeight = grid.rowHeight;
							let rowSpan = cell.rowSpan;
							if (rowSpan > 1) {
								for (let n = 1; n < rowSpan; n++) {
									let spanRow = grid.rows[i + n];
									if (spanRow && spanRow.visible) {
										cellHeight += grid.rowHeight;
									}
								}
							}
							let cRect = new FCRect(gridColumn.bounds.left - grid.scrollH, rTop, gridColumn.bounds.left + cellWidth - grid.scrollH, rTop + cellHeight);
							if (cRect.right >= 0 && cRect.left < grid.size.cx) {
								if (firstPoint.x >= cRect.left && firstPoint.x <= cRect.right && firstPoint.y >= cRect.top && firstPoint.y <= cRect.bottom) {
									for (let r = 0; r < grid.rows.length; r++) {
										let subRow = grid.rows[r];
										if (subRow == row) {
											subRow.selected = true;
										} else {
											subRow.selected = false;
										}
									}
									if(grid.onClickGridCell){
										grid.onClickGridCell(grid, row, gridColumn, cell, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
									}
									else if (grid.paint && grid.paint.onClickGridCell) {
										grid.paint.onClickGridCell(grid, row, gridColumn, cell, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
									}
									return;
								}
							}
						}
					}
				}
			}
			if (cTop > grid.size.cy) {
				break;
			}
			cTop += grid.rowHeight;
		}
	}
};

/*
* 表格的鼠标滚轮方法
* grid:表格
* delta:滚轮值
*/
let touchWheelGrid = function (grid, delta) {
	let oldScrollV = grid.scrollV;
	if (delta < 0) {
		oldScrollV -= 20;
	} else if (delta > 0) {
		oldScrollV += 20;
	}
	let contentHeight = getGridContentHeight(grid);
	if (contentHeight < grid.size.cy - grid.headerHeight - grid.scrollSize) {
		grid.scrollV = 0;
	} else {
		if (oldScrollV < 0) {
			oldScrollV = 0;
		} else if (oldScrollV > contentHeight - grid.size.cy + grid.headerHeight + grid.scrollSize) {
			oldScrollV = contentHeight - grid.size.cy + grid.headerHeight + grid.scrollSize;
		}
		grid.scrollV = oldScrollV;
	}
};

/*
* 创建文本框实体
* textBox:文本框
*/
let createInputTextBox = function (textBox) {
	let input = document.createElement("input");
	textBox.input = input;
	input.input = textBox;
	input.type = "text";
	input.style.position = "absolute";
	input.style.display = "none";
	input.style.boxSizing = "border-box";
	if (textBox.font && textBox.paint) {
		let strs = textBox.font.split(',');
		let fontFamily = strs[0];
		if (fontFamily == "Default") {
			fontFamily = textBox.paint.systemFont;
		}
		let sFont = strs[1] + "px " + fontFamily;
		if (textBox.paint.scaleFactorX != 1 || textBox.paint.scaleFactorY != 1) {
			sFont = Math.min(textBox.paint.scaleFactorX, textBox.paint.scaleFactorY) * parseFloat(strs[1]) + "px " + fontFamily;
		}
		input.style.font = sFont;
	} 
	document.body.appendChild(input);
	input.text = textBox.text;
};

/*
* 创建数值框实体
*/
let createInputComboBox = function (comboBox) {
	let input = document.createElement("select");
	input.input = comboBox;
	comboBox.input = input;
	input.style.position = "absolute";
	input.style.boxSizing = "border-box";
	if (comboBox.font && comboBox.paint) {
		let strs = comboBox.font.split(',');
		let fontFamily = strs[0];
		if (fontFamily == "Default") {
			fontFamily = comboBox.paint.systemFont;
		}
		let sFont = strs[1] + "px " + fontFamily;
		if (comboBox.paint.scaleFactorX != 1 || comboBox.paint.scaleFactorY != 1) {
			sFont = Math.min(comboBox.paint.scaleFactorX, comboBox.paint.scaleFactorY) * parseFloat(strs[1]) + "px " + fontFamily;
		}
		input.style.font = sFont;
	}
	document.body.appendChild(input);
	input.text = comboBox.text;
};

/*
* 创建图片框实体
*/
let createInputImage = function (image) {
	let input = document.createElement("img");
	image.input = input;
	input.input = image;
	input.style.position = "absolute";
	input.style.boxSizing = "border-box";
	document.body.appendChild(input);
	input.src = image.src;
};

/*
* 重置布局图层
* layout:布局层
*/
let resetLayoutDiv = function (layout) {
	let reset = false;
	let padding = new FCPadding(0, 0, 0, 0);
	if (layout.padding) {
		padding = layout.padding;
	}
	let vPos = 0, left = padding.left, top = padding.top, width = layout.size.cx - padding.left - padding.right, height = layout.size.cy - padding.top - padding.bottom;
	for (let i = 0; i < layout.views.length; i++) {
		let view = layout.views[i];
		if (view.visible) {
			let size = view.size;
			let margin = new FCPadding(0, 0, 0, 0);
			if (view.margin) {
				margin = view.margin;
			}
			let cLeft = view.location.x, cTop = view.location.y, cWidth = size.cx, cHeight = size.cy;
			let nLeft = cLeft, nTop = cTop, nWidth = cWidth, nHeight = cHeight;
			if (layout.layoutStyle == "bottomtotop") {
				if (i == 0) {
					top = height - padding.top;
				}
				let lWidth = 0;
				if (layout.autoWrap) {
					lWidth = size.cx;
					let lTop = top - margin.top - cHeight - margin.bottom;
					if (lTop < padding.top) {
						if (vPos != 0) {
							left += cWidth + margin.left;
						}
						top = height - padding.top;
					}
				}
				else {
					lWidth = width - margin.left - margin.right;
				}
				top -= cHeight + margin.bottom;
				nLeft = left + margin.left;
				nWidth = lWidth;
				nTop = top;
			} else if (layout.layoutStyle == "lefttoright") {
				let lHeight = 0;
				if (layout.autoWrap) {
					lHeight = size.cy;
					let lRight = left + margin.left + cWidth + margin.right;
					if (lRight > width) {
						left = padding.left;
						if (vPos != 0) {
							top += cHeight + margin.top;
						}
					}
				}
				else {
					lHeight = height - margin.top - margin.bottom;
				}
				left += margin.left;
				nLeft = left;
				nTop = top + margin.top;
				nHeight = lHeight;
				left += cWidth + margin.right;
			} else if (layout.layoutStyle == "righttoleft") {
				if (i == 0) {
					left = width - padding.left;
				}
				let lHeight = 0;
				if (layout.autoWrap) {
					lHeight = size.cy;
					let lLeft = left - margin.left - cWidth - margin.right;
					if (lLeft < padding.left) {
						left = width - padding.left;
						if (vPos != 0) {
							top += cHeight + margin.top;
						}
					}
				}
				else {
					lHeight = height - margin.top - margin.bottom;
				}
				left -= cWidth + margin.left;
				nLeft = left;
				nTop = top + margin.top;
				nHeight = lHeight;
			} else if (layout.layoutStyle == "toptobottom") {
				let lWidth = 0;
				if (layout.autoWrap) {
					lWidth = size.cx;
					let lBottom = top + margin.top + cHeight + margin.bottom;
					if (lBottom > height) {
						if (vPos != 0) {
							left += cWidth + margin.left + margin.right;
						}
						top = padding.top;
					}
				}
				else {
					lWidth = width - margin.left - margin.right;
				}
				top += margin.top;
				nTop = top;
				nLeft = left + margin.left;
				nWidth = lWidth;
				top += cHeight + margin.bottom;
			}
			if (cLeft != nLeft || cTop != nTop || cWidth != nWidth || cHeight != nHeight) {
				view.location = new FCPoint(nLeft, nTop);
				view.size = new FCSize(nWidth, nHeight);
				reset = true;
			}
			vPos++;
		}
	}
	return reset;
};

/*
添加视图到分割层
splitDiv: 分割层
firstView: 第一个视图
secondView: 第二个视图
pos: 位置
*/
let addViewToSplit = function(splitDiv, firstView, secondView, pos){
	let size = splitDiv.size;
	splitDiv.oldSize = new FCSize(size.cx, size.cy);
	addViewToParent(firstView, splitDiv);
	addViewToParent(secondView, splitDiv);
	splitDiv.firstView = firstView;
	splitDiv.secondView = secondView;
	let splitter = new FCView();
	splitter.parent = splitDiv;
	if (splitDiv.paint.defaultUIStyle == "dark"){
		splitter.backColor = "rgb(75,75,75)";
	}else if(splitDiv.paint.defaultUIStyle == "light"){
		splitter.backColor = "rgb(150,150,150)";
	}
	splitter.borderColor = "none";
	splitter.paint = splitDiv.paint;
	splitDiv.views.push(splitter);
	splitDiv.splitter = splitter;
	if (splitDiv.layoutStyle == "lefttoright" || splitDiv.layoutStyle == "righttoleft"){
		splitter.size = new FCSize(1, size.cy);
		splitter.location = new FCPoint(pos, 0);
	}else{
		splitter.size = new FCSize(size.cx, 1);
		splitter.location = new FCPoint(0, pos);
	}
};

/*
* 重置分割线的布局
* split:分割视图
*/
let resetSplitLayoutDiv = function (split) {
	let reset = false;
	let splitRect = new FCRect(0, 0, 0, 0);
	let width = split.size.cx, height = split.size.cy;
	let fRect = new FCRect(0, 0, 0, 0);
	let sRect = new FCRect(0, 0, 0, 0);
	let splitterSize = new FCSize(0, 0);
	if (split.splitter.visible) {
		splitterSize.cx = split.splitter.size.cx;
		splitterSize.cy = split.splitter.size.cy;
	}
	split.splitter.topMost = true;
	let layoutStyle = split.layoutStyle;
	if (layoutStyle == "bottomtotop") {
		if (split.splitMode == "absolutesize" || split.oldSize.cy == 0) {
			splitRect.left = 0;
			splitRect.top = height - (split.oldSize.cy - split.splitter.location.y);
			splitRect.right = width;
			splitRect.bottom = splitRect.top + splitterSize.cy;
		}
		else if (split.splitMode == "percentsize") {
			splitRect.left = 0;
			if (split.splitPercent == -1) {
				split.splitPercent = split.splitter.location.y / split.oldSize.cy;
			}
			splitRect.top = height * split.splitPercent;
			splitRect.right = width;
			splitRect.bottom = splitRect.top + splitterSize.cy;
		}
		fRect.left = 0;
		fRect.top = splitRect.bottom;
		fRect.right = width;
		fRect.bottom = height;
		sRect.left = 0;
		sRect.top = 0;
		sRect.right = width;
		sRect.bottom = splitRect.top;
	}
	else if (layoutStyle == "lefttoright") {
		if (split.splitMode == "absolutesize" || split.oldSize.cx == 0) {
			splitRect.left = split.splitter.location.x;
			splitRect.top = 0;
			splitRect.right = splitRect.left + splitterSize.cx;
			splitRect.bottom = height;
		}
		else if (split.splitMode == "percentsize") {
			if (split.splitPercent == -1) {
				split.splitPercent = split.splitter.location.x / split.oldSize.cx;
			}
			splitRect.left = width * split.splitPercent;
			splitRect.top = 0;
			splitRect.right = splitRect.left + splitterSize.cx;
			splitRect.bottom = height;
		}
		fRect.left = 0;
		fRect.top = 0;
		fRect.right = splitRect.left;
		fRect.bottom = height;
		sRect.left = splitRect.right;
		sRect.top = 0;
		sRect.right = width;
		sRect.bottom = height;
	}
	else if (layoutStyle == "righttoleft") {
		if (split.splitMode == "absolutesize" || split.oldSize.cx == 0) {
			splitRect.left = width - (split.oldSize.cx - split.splitter.location.x);
			splitRect.top = 0;
			splitRect.right = splitRect.left + splitterSize.cx;
			splitRect.bottom = height;
		}
		else if (split.splitMode == "percentsize") {
			if (split.splitPercent == -1) {
				split.splitPercent = split.splitter.location.x / split.oldSize.cx;
			}
			splitRect.left = width * split.splitPercent;
			splitRect.top = 0;
			splitRect.right = splitRect.left + splitterSize.cx;
			splitRect.bottom = height;
		}
		fRect.left = splitRect.right;
		fRect.top = 0;
		fRect.right = width;
		fRect.bottom = height;
		sRect.left = 0;
		sRect.top = 0;
		sRect.right = splitRect.left;
		sRect.bottom = height;
	}
	else if (layoutStyle == "toptobottom") {
		if (split.splitMode == "absolutesize" || split.oldSize.cy == 0) {
			splitRect.left = 0;
			splitRect.top = split.splitter.location.y;
			splitRect.right = width;
			splitRect.bottom = splitRect.top + splitterSize.cy;
		}
		else if (split.splitMode == "percentsize") {
			splitRect.left = 0;
			if (split.splitPercent == -1) {
				split.splitPercent = split.splitter.location.y / split.oldSize.cy;
			}
			splitRect.top = height * split.splitPercent;
			splitRect.right = width;
			splitRect.bottom = splitRect.top + splitterSize.cy;
		}
		fRect.left = 0;
		fRect.top = 0;
		fRect.right = width;
		fRect.bottom = splitRect.top;
		sRect.left = 0;
		sRect.top = splitRect.bottom;
		sRect.right = width;
		sRect.bottom = height;
	}
	if (split.splitter.visible) {
		let spRect = new FCRect(split.splitter.location.x, split.splitter.location.y, split.splitter.location.x + split.splitter.size.cx, split.splitter.location.y + split.splitter.size.cy);
		if (spRect.left != splitRect.left || spRect.top != splitRect.top || spRect.right != splitRect.right || spRect.bottom != splitRect.bottom) {
			split.splitter.location = new FCPoint(splitRect.left, splitRect.top);
			split.splitter.size = new FCSize(Math.ceil(splitRect.right - splitRect.left), Math.ceil(splitRect.bottom - splitRect.top));
			reset = true;
		}
	}
	let fcRect = new FCRect(split.firstView.location.x, split.firstView.location.y, split.firstView.location.x + split.firstView.size.cx, split.firstView.location.y + split.firstView.size.cy);
	if (fcRect.left != fRect.left || fcRect.top != fRect.top || fcRect.right != fRect.right || fcRect.bottom != fRect.bottom) {
		reset = true;
		split.firstView.location = new FCPoint(fRect.left, fRect.top);
		split.firstView.size = new FCSize(fRect.right - fRect.left, fRect.bottom - fRect.top);
	}
	let scRect = new FCRect(split.secondView.location.x, split.secondView.location.y, split.secondView.location.x + split.secondView.size.cx, split.secondView.location.y + split.secondView.size.cy);
	if (scRect.left != sRect.left || scRect.top != sRect.top || scRect.right != sRect.right || scRect.bottom != sRect.bottom) {
		reset = true;
		split.secondView.location = new FCPoint(sRect.left, sRect.top);
		split.secondView.size = new FCSize(sRect.right - sRect.left, sRect.bottom - sRect.top);
	}
	split.oldSize = new FCSize(width, height);
	return reset;
};

/*
* 更新页的布局
* tabView:多页夹
* tabPage:页
* left:左侧坐标
* top:上方坐标
* width:宽度
* height:高度
* tw:页头按钮的宽度
* th:页头按钮的高度
*/
let updataPageLayout = function (tabView, tabPage, left, top, width, height, tw, th) {
	let newBounds = new FCRect(0, 0, 0, 0);
	if (tabView.layout == "bottom") {
		newBounds.left = 0;
		newBounds.top = 0;
		newBounds.right = width;
		newBounds.bottom = height - th;
		tabPage.headerButton.location = new FCPoint(left, height - th);
	} else if (tabView.layout == "left") {
		newBounds.left = tw;
		newBounds.top = 0;
		newBounds.right = width;
		newBounds.bottom = height;
		tabPage.headerButton.location = new FCPoint(0, top);
	} else if (tabView.layout == "right") {
		newBounds.left = 0;
		newBounds.top = 0;
		newBounds.right = width - tw;
		newBounds.bottom = height;
		tabPage.headerButton.location = new FCPoint(width - tw, top);
	} else if (tabView.layout == "top") {
		newBounds.left = 0;
		newBounds.top = th;
		newBounds.right = width;
		newBounds.bottom = height;
		tabPage.headerButton.location = new FCPoint(left, 0);
	}
	tabPage.location = new FCPoint(newBounds.left, newBounds.top);
	tabPage.size = new FCSize(newBounds.right - newBounds.left, newBounds.bottom - newBounds.top);
};

/*
* 更新多页夹的布局
* tabView:多页夹
*/
let updateTabLayout = function (tabView) {
	let width = tabView.size.cx;
	let height = tabView.size.cy;
	let left = 0, top = 0;
	for (let i = 0; i < tabView.tabPages.length; i++) {
		let tabPage = tabView.tabPages[i];
		let headerButton = tabView.tabPages[i].headerButton;
		if (headerButton.visible) {
			let tw = headerButton.size.cx;
			let th = headerButton.size.cy;
			updataPageLayout(tabView, tabPage, left, top, width, height, tw, th);
			left += tw;
			top += th;
		} else {
			tabPage.visible = false;
		}
	}
};

/*
* 添加页
* tabView:多页夹
* tabPage:页
* tabButton:页头按钮
*/
let addTabPage = function (tabView, tabPage, tabButton) {
	tabPage.headerButton = tabButton;
	tabPage.parent = tabView;
	tabPage.paint = tabView.paint;
	tabButton.parent = tabView;
	tabButton.paint = tabView.paint;
	tabView.tabPages.push(tabPage);
	tabView.views.push(tabPage);
	tabView.views.push(tabButton);
};

/*
* 移除页
* tabView:多页夹
* tabPage:页
*/
let removeTabPage = function (tabView, pageOrButton) {
	for (let i = 0; i < tabView.tabPages.length; i++) {
		let tabPage = tabView.tabPages[i];
		if(tabPage.headerButton == pageOrButton || tabPage == pageOrButton){
			tabView.tabPages.splice(i, 1);
			removeViewFromParent(tabPage.headerButton, tabView);
			removeViewFromParent(tabPage, tabView);
			break;
		}
	}
	if(tabView.tabPages.length > 0){
		selectTabPage(tabView, tabView.tabPages[0]);
	}
	updateTabLayout(tabView);
};

/*
* 选中页
* tabView:多页夹
* tabPage:页
*/
let selectTabPage = function (tabView, tabPage) {
	for (let i = 0; i < tabView.tabPages.length; i++) {
		let tp = tabView.tabPages[i];
		if (tp == tabPage) {
			tp.visible = true;
		} else {
			tp.visible = false;
		}
	}
	updateTabLayout(tabView);
};

//动画中的页夹
let animationTabPages = new Array();

/*
* 检查页的动画
*/
let checkTabPageAnimation = function () {
	if (animationTabPages.length > 0) {
		for (let i = 0; i < animationTabPages.length; i++) {
			let tp = animationTabPages[i];
			if (tp.parent) {
				if (tp.parent.underPoint) {
					let location = tp.headerButton.location;
					if (location.x > tp.parent.underPoint.x) {
						tp.parent.underPoint.x += tp.parent.animationSpeed;
					}
					else if (location.x < tp.parent.underPoint.x) {
						tp.parent.underPoint.x -= tp.parent.animationSpeed;
					}
					if (location.y > tp.parent.underPoint.y) {
						tp.parent.underPoint.y += tp.parent.animationSpeed;
					}
					else if (location.y < tp.parent.underPoint.y) {
						tp.parent.underPoint.y -= tp.parent.animationSpeed;
					}
					if (Math.abs(location.x - tp.parent.underPoint.x) <= tp.parent.animationSpeed && Math.abs(location.y - tp.parent.underPoint.y) <= tp.parent.animationSpeed) {
						tp.parent.underPoint = null;
						animationTabPages.splice(i, 1);
					}
				}
				if (tp.parent.paint) {
					invalidateView(tp.parent);
				}
			} else {
				animationTabPages.splice(i, 1);
			}
			break;
		}
	}
};

/*
* 开始页夹的动画
*/
let startTabPageAnimation = function (newPage, oldPage) {
	if (newPage.parent) {
		if (newPage == oldPage) {
			newPage.parent.underPoint = null;
			if (newPage.parent.paint) {
				invalidateView(newPage.parent);
			}
		} else {
			if (newPage.parent.useAnimation) {
				newPage.parent.underPoint = new FCPoint(oldPage.headerButton.location.x, oldPage.headerButton.location.y);
				let hasTabPage = false;
				for (let i = 0; i < animationTabPages.length; i++) {
					let tp = animationTabPages[i];
					if (tp == newPage) {
						hasTabPage = true;
						break;
					}
				}
				if (!hasTabPage) {
					animationTabPages.push(newPage);
				}
			}
		}
	}
};

/*
* 重绘多页夹
* tabView:多页夹
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawTabViewBorder = function (tabView, paint, clipRect) {
	if (tabView.underLineColor && tabView.underLineColor != "none") {
		for (let i = 0; i < tabView.tabPages.length; i++) {
			let tp = tabView.tabPages[i];
			if (tp.visible) {
				let headerButton = tp.headerButton;
				let location = new FCPoint(headerButton.location.x, headerButton.location.y);
				let size = headerButton.size;
				if (tabView.useAnimation) {
					if (tabView.underPoint) {
						location.x = tabView.underPoint.x;
						location.y = tabView.underPoint.y;
					}
				}
				if (tabView.layout == "bottom") {
					paint.fillRect(tabView.underLineColor, location.x, location.y, location.x + size.cx, location.y + tabView.underLineSize);
				} else if (tabView.layout == "left") {
					paint.fillRect(tabView.underLineColor, location.x + size.cx - tabView.underLineSize, location.y, location.x + size.cx, location.y + size.cy);
				} else if (tabView.layout == "top") {
					paint.fillRect(tabView.underLineColor, location.x, location.y + size.cy - tabView.underLineSize, location.x + size.cx, location.y + size.cy);
				}
				else if (tabView.layout == "right") {
					paint.fillRect(tabView.underLineColor, location.x, location.y, location.x + tabView.underLineSize, location.y + size.cy);
				}
				break;
			}
		}
	}
};

/*
 * 获取总的偏移量
 * node:树节点
 */
let getTotalIndent = function (node) {
	if (node.parentNode) {
		return node.indent + getTotalIndent(node.parentNode);
	} else {
		return node.indent;
	}
};

/*
* 绘制单元格
* tree:树
* row:行
* column:列
* node:节点
* paint:绘图对象
* left:左侧坐标
* top:上方坐标
* right:右侧坐标
* bottom:下方坐标
*/
let drawTreeNode = function (tree, row, column, node, paint, left, top, right, bottom) {
	if (node.backColor && node.backColor != "none") {
		paint.fillRect(node.backColor, left, top, right, bottom);
	}
	if (row.selected) {
		if (tree.selectedRowColor && tree.selectedRowColor != "none") {
			paint.fillRect(tree.selectedRowColor, left, top, right, bottom);
		}
	}else{
		if(row.alternate && tree.alternateRowColor && tree.alternateRowColor != "none"){
			paint.fillRect(tree.alternateRowColor, left, top, right, bottom);
		}
	}
	if (node.value) {
		let tSize = paint.textSize(node.value, node.font);
		let tLeft = left + 2 + getTotalIndent(node);
		let wLeft = tLeft;
		let cR = tree.checkBoxWidth / 3;
		if (tree.showCheckBox) {
			wLeft += tree.checkBoxWidth;
			if (node.checked) {
				paint.fillRect(node.textColor, tLeft + (tree.checkBoxWidth - cR) / 2, top + (tree.rowHeight - cR) / 2, tLeft + (tree.checkBoxWidth + cR) / 2, top + (tree.rowHeight + cR) / 2);
			} else {
				paint.drawRect(node.textColor, 1, 0, tLeft + (tree.checkBoxWidth - cR) / 2, top + (tree.rowHeight - cR) / 2, tLeft + (tree.checkBoxWidth + cR) / 2, top + (tree.rowHeight + cR) / 2);
			}
		}
		if (node.childNodes.length > 0) {
			paint.beginPath();
			if (node.collapsed) {
				paint.addLine(wLeft + (tree.collapsedWidth + cR) / 2, top + tree.rowHeight / 2, wLeft + (tree.collapsedWidth - cR) / 2, top + (tree.rowHeight - cR) / 2);
				paint.addLine(wLeft + (tree.collapsedWidth - cR) / 2, top + (tree.rowHeight - cR) / 2, wLeft + (tree.collapsedWidth - cR) / 2, top + (tree.rowHeight + cR) / 2);
				paint.addLine(wLeft + (tree.collapsedWidth - cR) / 2, top + (tree.rowHeight + cR) / 2, wLeft + (tree.collapsedWidth + cR) / 2, top + tree.rowHeight / 2);
			} else {
				paint.addLine(wLeft + (tree.collapsedWidth - cR) / 2, top + (tree.rowHeight - cR) / 2, wLeft + (tree.collapsedWidth + cR) / 2, top + (tree.rowHeight - cR) / 2);
				paint.addLine(wLeft + (tree.collapsedWidth + cR) / 2, top + (tree.rowHeight - cR) / 2, wLeft + tree.collapsedWidth / 2, top + (tree.rowHeight + cR) / 2);
				paint.addLine(wLeft + tree.collapsedWidth / 2, top + (tree.rowHeight + cR) / 2, wLeft + (tree.collapsedWidth - cR) / 2, top + (tree.rowHeight - cR) / 2);
			}
			paint.fillPath(node.textColor);
			paint.closePath();
			wLeft += tree.collapsedWidth;
		}
		if (tSize.cx > column.width) {
			paint.drawTextAutoEllipsis(node.value, node.textColor, node.font, wLeft, top + tree.rowHeight / 2 - tSize.cy / 2, wLeft + column.width, top + tree.rowHeight / 2 - tSize.cy / 2);
		} else {
			paint.drawText(node.value, node.textColor, node.font, wLeft, top + tree.rowHeight / 2 - tSize.cy / 2);
		}
	}
};

/*
* 绘制树
* tree:树
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawTree = function (tree, paint, clipRect) {
	let cLeft = -tree.scrollH;
	let cTop = -tree.scrollV + tree.headerHeight;
	//绘制行
	let colLeft = 0;
	for (let i = 0; i < tree.columns.length; i++) {
		if (tree.columns[i].widthStr.length > 0) {
			let newWidthStr = tree.columns[i].widthStr.replace("%", "");
			tree.columns[i].width = Number(newWidthStr) * tree.size.cx / 100;
		}
		let colRect = new FCRect(colLeft, 0, colLeft + tree.columns[i].width, tree.headerHeight);
		tree.columns[i].bounds = colRect;
		tree.columns[i].index = i;
		colLeft += tree.columns[i].width;
	}
	updateTreeRowIndex(tree);
	let visibleIndex = 0;
	for (let i = 0; i < tree.rows.length; i++) {
		let row = tree.rows[i];
		row.index = i;
		row.alternate = false;
		if (row.visible) {
			row.alternate = visibleIndex % 2 == 1;
			visibleIndex++;
			let rTop = cTop, rBottom = cTop + tree.rowHeight;
			if (rBottom >= 0 && cTop <= tree.size.cy) {
				for (let j = 0; j < row.cells.length; j++) {
					let node = row.cells[j];
					let treeColumn = node.column;
					if (!treeColumn) {
						treeColumn = tree.columns[j];
					}
					if (treeColumn.visible) {
						let nodeWidth = treeColumn.width;
						let nodeHeight = tree.rowHeight;
						let cRect = new FCRect(treeColumn.bounds.left - tree.scrollH, rTop, treeColumn.bounds.left + nodeWidth - tree.scrollH, rTop + nodeHeight);
						if (cRect.right >= 0 && cRect.left < tree.size.cx) {
							if(tree.onPaintTreeNode){
								tree.onPaintTreeNode(tree, row, treeColumn, node, paint, cRect.left, cRect.top, cRect.right, cRect.bottom);
							}
							else if (paint.onPaintTreeNode) {
								paint.onPaintTreeNode(tree, row, treeColumn, node, paint, cRect.left, cRect.top, cRect.right, cRect.bottom);
							} else {
								drawTreeNode(tree, row, treeColumn, node, paint, cRect.left, cRect.top, cRect.right, cRect.bottom);
							}
						}
					}
				}
			}
			if (cTop > tree.size.cy) {
				break;
			}
			cTop += tree.rowHeight;
		}
	}
};

/*
* 绘制滚动条
* tree:树
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawTreeScrollBar = function (tree, paint, clipRect) {
	tree.hScrollIsVisible = false;
	tree.vScrollIsVisible = false;
	if (paint.isMobile) {
		if (paint.touchDownView == tree) {
		} else if (g_dragScrollView_Tree == tree && g_scrollAddSpeed_Tree != 0) {
		} else {
			return;
		}
	}
	if (tree.showHScrollBar) {
		let contentWidth = getTreeContentWidth(tree);
		if (contentWidth > 0 && contentWidth > tree.size.cx) {
			let sLeft = tree.scrollH / contentWidth * tree.size.cx;
			let sRight = (tree.scrollH + tree.size.cx) / contentWidth * tree.size.cx;
			if (sRight - sLeft < tree.scrollSize) {
				sRight = sLeft + tree.scrollSize;
			}
			if (paint.touchMoveView == tree && (tree.hoverScrollHButton || tree.downScrollHButton)) {
				paint.fillRect(tree.scrollBarHoveredColor, sLeft, tree.size.cy - tree.scrollSize, sRight, tree.size.cy);
			}else {
				paint.fillRect(tree.scrollBarColor, sLeft, tree.size.cy - tree.scrollSize, sRight, tree.size.cy);
			}
			tree.hScrollIsVisible = true;
		}
	}
	if (tree.showVScrollBar) {
		let contentHeight = getTreeContentHeight(tree);
		if (contentHeight > 0 && contentHeight > tree.size.cy) {
			let sTop = tree.headerHeight + tree.scrollV / contentHeight * (tree.size.cy - tree.headerHeight - tree.scrollSize);
			let sBottom = sTop + ((tree.size.cy - tree.headerHeight)) / contentHeight * (tree.size.cy - tree.headerHeight - tree.scrollSize);
			if (sBottom - sTop < tree.scrollSize) {
				sBottom = sTop + tree.scrollSize;
			}
			if (paint.touchMoveView == tree && (tree.hoverScrollVButton || tree.downScrollVButton)) {
				paint.fillRect(tree.scrollBarHoveredColor, tree.size.cx - tree.scrollSize, sTop, tree.size.cx, sBottom);
			} else {
				paint.fillRect(tree.scrollBarColor, tree.size.cx - tree.scrollSize, sTop, tree.size.cx, sBottom);
			}
			tree.vScrollIsVisible = true;
		}
	}
};

/*
* 获取内容的宽度
* tree:树
*/
let getTreeContentWidth = function (tree) {
	let cWidth = 0;
	for (let i = 0; i < tree.columns.length; i++) {
		if (tree.columns[i].visible) {
			cWidth += tree.columns[i].width;
		}
	}
	return cWidth;
};

/*
* 获取内容的高度
* tree:树
*/
let getTreeContentHeight = function (tree) {
	let cHeight = 0;
	for (let i = 0; i < tree.rows.length; i++) {
		if (tree.rows[i].visible) {
			cHeight += tree.rowHeight;
		}
	}
	return cHeight;
};

/*
* 树的鼠标移动方法
* tree: 树
* firstTouch:是否第一次触摸
* firstPoint:第一次触摸的坐标
* secondTouch:是否第二次触摸
* secondPoint:第二次触摸的坐标
*/
let touchMoveTree = function (tree, firstTouch, firstPoint, secondTouch, secondPoint) {
	tree.hoverScrollHButton = false;
	tree.hoverScrollVButton = false;
	let mp = firstPoint;
	if (firstTouch) {   
		if (tree.showHScrollBar || tree.showVScrollBar) {
			if (tree.downScrollHButton) {
				let contentWidth = getTreeContentWidth(tree);
				let subX = (mp.x - tree.startPoint.x) / tree.size.cx * contentWidth;
				let newScrollH = tree.startScrollH + subX;
				if (newScrollH < 0) {
					newScrollH = 0;
				} else if (newScrollH > contentWidth - tree.size.cx) {
					newScrollH = contentWidth - tree.size.cx;
				}
				tree.scrollH = newScrollH;
				tree.paint.cancelClick = true;
				return;

			} else if (tree.downScrollVButton) {
				let contentHeight = getTreeContentHeight(tree);
				let subY = (mp.y - tree.startPoint.y) / (tree.size.cy - tree.headerHeight - tree.scrollSize) * contentHeight;
				let newScrollV = tree.startScrollV + subY;
				if (newScrollV < 0) {
					newScrollV = 0;
				} else if (newScrollV > contentHeight - (tree.size.cy - tree.headerHeight - tree.scrollSize)) {
					newScrollV = contentHeight - (tree.size.cy - tree.headerHeight - tree.scrollSize);
				}
				tree.scrollV = newScrollV;
				tree.paint.cancelClick = true;
				return;
			}
		}
		if (tree.allowDragScroll) {
			let contentWidth = getTreeContentWidth(tree);
			if (contentWidth > tree.size.cx) {
				let subX = tree.startPoint.x - mp.x;
				let newScrollH = tree.startScrollH + subX;
				if (newScrollH < 0) {
					newScrollH = 0;
				} else if (newScrollH > contentWidth - tree.size.cx) {
					newScrollH = contentWidth - tree.size.cx;
				}
				tree.scrollH = newScrollH;
				if (Math.abs(subX) > 5) {
					tree.paint.cancelClick = true;
				}
			}
			let contentHeight = getTreeContentHeight(tree);
			if (contentHeight > tree.size.cy) {
				let subY = tree.startPoint.y - mp.y;
				let newScrollV = tree.startScrollV + subY;
				if (newScrollV < 0) {
					newScrollV = 0;
				} else if (newScrollV > contentHeight - (tree.size.cy - tree.headerHeight - tree.scrollSize)) {
					newScrollV = contentHeight - (tree.size.cy - tree.headerHeight - tree.scrollSize);
				}
				tree.scrollV = newScrollV;
				if (Math.abs(subY) > 5) {
					tree.paint.cancelClick = true;
				}
			}
		}
	} else {
		if (tree.showHScrollBar) {
			let contentWidth = getTreeContentWidth(tree);
			if (contentWidth > 0 && contentWidth > tree.size.cx) {
				let sLeft = tree.scrollH / contentWidth * tree.size.cx;
				let sRight = (tree.scrollH + tree.size.cx) / contentWidth * tree.size.cx;
				if (sRight - sLeft < tree.scrollSize) {
					sRight = sLeft + tree.scrollSize;
				}
				if (mp.x >= sLeft && mp.x <= sRight && mp.y >= tree.size.cy - tree.scrollSize && mp.y <= tree.size.cy) {
					tree.hoverScrollHButton = true;
					return;
				} else {
					tree.hoverScrollHButton = false;
				}
			}
		}
		if (tree.showVScrollBar) {
			let contentHeight = getTreeContentHeight(tree);
			if (contentHeight > 0 && contentHeight > tree.size.cy) {
				let sTop = tree.headerHeight + tree.scrollV / contentHeight * (tree.size.cy - tree.headerHeight - tree.scrollSize);
				let sBottom = tree.headerHeight + (tree.scrollV + (tree.size.cy - tree.headerHeight - tree.scrollSize)) / contentHeight * (tree.size.cy - tree.headerHeight - tree.scrollSize);
				if (sBottom - sTop < tree.scrollSize) {
					sBottom = sTop + tree.scrollSize;
				}
				if (mp.x >= tree.size.cx - tree.scrollSize && mp.x <= tree.size.cx && mp.y >= sTop && mp.y <= sBottom) {
					tree.hoverScrollVButton = true;
					return;
				} else {
					tree.hoverScrollVButton = false;
				}
			}
		}
	}
};

/*
* 树的鼠标按下方法
* tree: 树
* firstTouch:是否第一次触摸
* firstPoint:第一次触摸的坐标
* secondTouch:是否第二次触摸
* secondPoint:第二次触摸的坐标
* clicks:点击次数
*/
let touchDownTree = function (tree, firstTouch, firstPoint, secondTouch, secondPoint, clicks) {
	let mp = firstPoint;
	tree.touchDownTime = new Date().getTime();
	tree.startPoint = mp;
	tree.downScrollHButton = false;
	tree.downScrollVButton = false;
	g_dragScrollView_Tree = null;
	g_scrollAddSpeed_Tree = 0;
	g_scrollDirection_Tree = 0; 
	if (tree.showHScrollBar) {
		let contentWidth = getTreeContentWidth(tree);
		if (contentWidth > 0 && contentWidth > tree.size.cx) {
			let sLeft = tree.scrollH / contentWidth * tree.size.cx;
			let sRight = (tree.scrollH + tree.size.cx) / contentWidth * tree.size.cx;
			if (sRight - sLeft < tree.scrollSize) {
				sRight = sLeft + tree.scrollSize;
			}
			if (mp.x >= sLeft && mp.x <= sRight && mp.y >= tree.size.cy - tree.scrollSize && mp.y <= tree.size.cy) {
				tree.downScrollHButton = true;
				tree.startScrollH = tree.scrollH;
				return;
			}
		}
	}
	if (tree.showVScrollBar) {
		let contentHeight = getTreeContentHeight(tree);
		if (contentHeight > 0 && contentHeight > tree.size.cy) {
			let sTop = tree.headerHeight + tree.scrollV / contentHeight * (tree.size.cy - tree.headerHeight - tree.scrollSize);
			let sBottom = tree.headerHeight + (tree.scrollV + (tree.size.cy - tree.headerHeight - tree.scrollSize)) / contentHeight * (tree.size.cy - tree.headerHeight - tree.scrollSize);
			if (sBottom - sTop < tree.scrollSize) {
				sBottom = sTop + tree.scrollSize;
			}
			if (mp.x >= tree.size.cx - tree.scrollSize && mp.x <= tree.size.cx && mp.y >= sTop && mp.y <= sBottom) {
				tree.downScrollVButton = true;
				tree.startScrollV = tree.scrollV;
				return;
			}
		}
	}
	if (tree.allowDragScroll) {
		tree.startScrollH = tree.scrollH;
		tree.startScrollV = tree.scrollV;
	}
};

let g_dragScrollView_Tree = null;//正在滚动的表格
let g_scrollAddSpeed_Tree = 0;//滚动加速
let g_scrollDirection_Tree = 0; //滚动方向

/*
* 检查拖动滚动
*/
let checkDragScroll_Tree = function () {
	if (g_dragScrollView_Tree) {
		let sub = parseInt(g_scrollAddSpeed_Tree / 10);
		if (sub == 0 && g_scrollAddSpeed_Tree > 1) {
			sub = 1;
		} else if (sub == 0 && g_scrollAddSpeed_Tree < -1) {
			sub = -1;
		}
		g_scrollAddSpeed_Tree -= sub;
		if (Math.abs(sub) <= 1) {
			let viewCache = g_dragScrollView_Tree;
			g_scrollAddSpeed_Tree = 0;
			g_dragScrollView_Tree = null;
			if (viewCache.paint) {
				invalidateView(viewCache);
			}

		} else {
			let oldScrollV = parseInt(g_dragScrollView_Tree.scrollV + g_scrollAddSpeed_Tree);
			let oldScrollH = parseInt(g_dragScrollView_Tree.scrollH + g_scrollAddSpeed_Tree);
			if (g_scrollDirection_Tree == 0) {
				let contentHeight = getTreeContentHeight(g_dragScrollView_Tree);
				if (contentHeight < g_dragScrollView_Tree.size.cy) {
					g_dragScrollView_Tree.scrollV = 0;
				} else {
					if (oldScrollV < 0) {
						oldScrollV = 0;
					} else if (oldScrollV > contentHeight - g_dragScrollView_Tree.size.cy + g_dragScrollView_Tree.headerHeight + g_dragScrollView_Tree.scrollSize) {
						oldScrollV = contentHeight - g_dragScrollView_Tree.size.cy + g_dragScrollView_Tree.headerHeight + g_dragScrollView_Tree.scrollSize;
					}
					g_dragScrollView_Tree.scrollV = oldScrollV;
				}
			} else {
				let contentWidth = getTreeContentWidth(g_dragScrollView_Tree);
				if (contentWidth < g_dragScrollView_Tree.size.cx) {
					g_dragScrollView_Tree.scrollH = 0;
				} else {
					if (oldScrollH < 0) {
						oldScrollH = 0;
					} else if (oldScrollH > contentWidth - g_dragScrollView_Tree.size.cx) {
						oldScrollH = contentWidth - g_dragScrollView_Tree.size.cx;
					}
					g_dragScrollView_Tree.scrollH = oldScrollH;
				}
			}
			if (g_dragScrollView_Tree.paint) {
				invalidateView(g_dragScrollView_Tree);
			}
		}
	}
};

/*
* 表格的鼠标抬起方法
* tree: 树
* firstTouch:是否第一次触摸
* firstPoint:第一次触摸的坐标
* secondTouch:是否第二次触摸
* secondPoint:第二次触摸的坐标
* clicks:点击次数
*/
let touchUpTree = function (tree, firstTouch, firstPoint, secondTouch, secondPoint, clicks) {
	tree.hoverScrollHButton = false;
	tree.hoverScrollVButton = false;
	if (firstTouch && firstPoint && tree.startPoint && !tree.downScrollHButton && !tree.downScrollVButton) {
		if (tree.allowDragScroll) {
			let touchUpTime = new Date().getTime();
			let diff = touchUpTime - tree.touchDownTime;
			//加速滚动
			if (diff < 250) {
				let sub1 = 100 * ((Math.abs(firstPoint.y - tree.startPoint.y)) / 20) / diff * 10;
				let sub2 = 100 * ((Math.abs(firstPoint.x - tree.startPoint.x)) / 20) / diff * 10;
				if ("A:" + sub1 != "A:NaN" && "A:" + sub2 != "A:NaN") {
					if (Math.abs(sub1) > Math.abs(sub2)) {
						if (firstPoint.y < tree.startPoint.y) {
							g_scrollAddSpeed_Tree += sub1;
						} else {
							g_scrollAddSpeed_Tree -= sub1;
						}
						g_scrollDirection_Tree = 0;
					} else {
						if (firstPoint.x < tree.startPoint.x) {
							g_scrollAddSpeed_Tree += sub2;
						} else {
							g_scrollAddSpeed_Tree -= sub2;
						}
						g_scrollDirection_Tree = 1;
					}
					g_dragScrollView_Tree = tree;
					if (Math.abs(g_scrollAddSpeed_Tree) > 0) {
						tree.paint.cancelClick = true;
					}
				}
			}
		}
	}
	tree.downScrollHButton = false;
	tree.downScrollVButton = false;
	if(tree.paint.cancelClick){
		return;
	}
	let cLeft = -tree.scrollH;
	let cTop = -tree.scrollV + tree.headerHeight;
	for (let i = 0; i < tree.rows.length; i++) {
		let row = tree.rows[i];
		if (row.visible) {
			if (firstPoint.y >= cTop && firstPoint.y <= cTop + tree.rowHeight) {
				let node = row.cells[0];
				let tLeft = cLeft + 2 + getTotalIndent(node);
				let wLeft = tLeft;
				for (let r = 0; r < tree.rows.length; r++) {
					let subRow = tree.rows[r];
					if (subRow == row) {
						subRow.selected = true;
					} else {
						subRow.selected = false;
					}
				}
				if (tree.showCheckBox) {
					wLeft += tree.checkBoxWidth;
					if (firstPoint.x < wLeft) {
						checkOrUnCheckTreeNode(node, !node.checked);
						if (tree.paint) {
							invalidateView(tree);
						}
						break;
					}
				}
				if (node.childNodes.length > 0) {
					wLeft += tree.collapsedWidth;
					if (firstPoint.x < wLeft) {
						node.collapsed = !node.collapsed;
						hideOrShowTreeNode(node, !node.collapsed);
						if (tree.paint) {
							invalidateView(tree);
						}
						break;
					}
				}
				if(tree.onClickTreeNode){
					tree.onClickTreeNode(tree, node, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
				}
				else if (tree.paint && tree.paint.onClickTreeNode) {
					tree.paint.onClickTreeNode(tree, node, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
				}
			}
			cTop += tree.rowHeight;
		}
	}
};

/*
 * 更新行的索引
 * tree:树
 */
let updateTreeRowIndex = function (tree) {
	for (let i = 0; i < tree.rows.length; i++) {
		tree.rows[i].index = i;
	}
};

/*
 * 获取最后一行的索引 
 * node:树节点
 */
let getTreeLastNodeRowIndex = function (node) {
	let rowIndex = node.row.index;
	for (let i = 0; i < node.childNodes.length; i++) {
		let rIndex = getTreeLastNodeRowIndex(node.childNodes[i]);
		if (rowIndex < rIndex) {
			rowIndex = rIndex;
		}
	}
	return rowIndex;
};

/*
 * 添加节点
 * tree:树
 * node:要添加的节点
 * parentNode:父节点
 */
let appendTreeNode = function (tree, node, parentNode) {
	if (!parentNode) {
		let newRow = new FCTreeRow();
		tree.rows.push(newRow);
		node.row = newRow;
		newRow.cells.push(node)
		tree.childNodes.push(node);
	} else {
		let newRow = new FCTreeRow();
		if (parentNode.childNodes.length == 0) {
			tree.rows.splice(parentNode.row.index + 1, 0, newRow);
		} else {
			tree.rows.splice(getTreeLastNodeRowIndex(parentNode) + 1, 0, newRow);
		}
		node.parentNode = parentNode;
		node.indent = tree.indent;
		node.row = newRow;
		newRow.cells.push(node);
		parentNode.childNodes.push(node);
		if (parentNode.collapsed) {
			newRow.visible = false;
		}
	}
	updateTreeRowIndex(tree);
};

/*
 * 移除节点
 * tree:树
 * node:要添加的节点
 */
let removeTreeNode = function (tree, node) {
	//移除相互关系
	if (!node.parentNode) {
		let nodesSize = tree.childNodes.length;
		for (let i = 0; i < nodesSize; i++) {
			if (tree.childNodes[i] == node) {
				tree.childNodes.splice(i, 1);
				break;
			}
		}
	} else {
		let nodesSize = node.parentNode.childNodes.length;
		for (let i = 0; i < nodesSize; i++) {
			if (node.parentNode.childNodes[i] == node) {
				node.parentNode.childNodes.splice(i, 1);
				break;
			}
		}
	}
	//移除行
	tree.rows.splice(node.row.index, 1);
	updateTreeRowIndex(tree);
};

/*
 * 展开或折叠节点
 * node:节点
 * visible:是否可见
 */
let hideOrShowTreeNode = function (node, visible) {
	if (node.childNodes.length > 0) {
		for (let i = 0; i < node.childNodes.length; i++) {
			node.childNodes[i].row.visible = visible;
			if (visible){
				if (node.childNodes[i].collapsed == false){
					hideOrShowTreeNode(node.childNodes[i], visible);
				}
			}else{
				hideOrShowTreeNode(node.childNodes[i], visible);
			}
		}
	}
};

/*
 * 选中或反选节点
 * node:节点
 * checked:是否选中
 */
let checkOrUnCheckTreeNode = function (node, checked) {
	node.checked = checked;
	if (node.childNodes.length > 0) {
		for (let i = 0; i < node.childNodes.length; i++) {
			checkOrUnCheckTreeNode(node.childNodes[i], checked);
		}
	}
};

/*
*展开树的节点
*tree:树
*/
let expendTree = function(tree){
	if(tree.childNodes.length > 0){
		for(let i = 0; i < tree.childNodes.length; i++){
			tree.childNodes[i].collapsed = false;
			hideOrShowTreeNode(tree.childNodes[i], true);
		}
	}
};

/*
*折叠树的节点
*tree:树
*/
let collapseTree = function(tree){
	if(tree.childNodes.length > 0){
		for(let i = 0; i < tree.childNodes.length; i++){
			tree.childNodes[i].collapsed = true;
			hideOrShowTreeNode(tree.childNodes[i], false);
		}
	}
};

/*
* 树的鼠标滚轮方法
* tree:树
* delta:滚轮值
*/
let touchWheelTree = function (tree, delta) {
	let oldScrollV = tree.scrollV;
	if (delta < 0) {
		oldScrollV -= 20;
	} else if (delta > 0) {
		oldScrollV += 20;
	}
	let contentHeight = getTreeContentHeight(tree);
	if (contentHeight < tree.size.cy) {
		tree.scrollV = 0;
	} else {
		if (oldScrollV < 0) {
			oldScrollV = 0;
		} else if (oldScrollV > contentHeight - tree.size.cy + tree.headerHeight + tree.scrollSize) {
			oldScrollV = contentHeight - tree.size.cy + tree.headerHeight + tree.scrollSize;
		}
		tree.scrollV = oldScrollV;
	}
};

/*
 * 自动适应位置和大小
 * menu:菜单
 */
let adjustMenu = function (menu) {
	resetLayoutDiv(menu);
	if (menu.autoSize) {
		let contentHeight = getDivContentHeight(menu);
		let maximumHeight = menu.maximumSize.cy;
		menu.size.cy = Math.min(contentHeight, maximumHeight);
	}
    let mPoint = menu.location;
	let mSize = menu.size;
	let paint = menu.paint;
	let nSize = new FCSize((paint.canvas.width / paint.ratio / paint.scaleFactorX), (paint.canvas.height / paint.ratio / paint.scaleFactorY));
	if (mPoint.x < 0) {
		mPoint.x = 0;
	}
	if (mPoint.y < 0) {
		mPoint.y = 0;
	}
	if (mPoint.x + mSize.cx > nSize.cx) {
		mPoint.x = nSize.cx - mSize.cx;
	}
	if (mPoint.y + mSize.cy > nSize.cy) {
		mPoint.y = nSize.cy - mSize.cy;
	}
	menu.location = mPoint;
	menu.scrollV = 0;
};

/*
 * 添加菜单项
 * item:菜单项
 * parent:菜单
 */
let addMenuItem = function(item, parent) {
	if (parent.viewType == "menu"){
		let menu = parent;
		addViewToParent(item, menu);
		item.parentMenu = menu;
		menu.items.push(item);
	}else if(parent.viewType == "combobox"){
		let comboBox = parent;
		let menu = new FCMenu()
		if (comboBox.dropDownMenu != null)
			menu = comboBox.dropDownMenu;
		else{
			comboBox.dropDownMenu = menu;
			menu.comboBox = comboBox;
			addView(menu, comboBox.paint);
		}
		addViewToParent(item, menu);
		item.parentMenu = menu;
		menu.items.push(item);
	}
};

/*
 * 添加菜单项
 * item:菜单项
 * parentItem:父菜单项
 */
let addMenuItemToParent = function (item, parentItem) {
	item.parentItem = parentItem;
	if (!parentItem.dropDownMenu) {
		parentItem.dropDownMenu = new FCMenu();
		addView(parentItem.dropDownMenu, parentItem.paint)
	}
	item.parentMenu = parentItem.dropDownMenu;
	addViewToParent(item, parentItem.dropDownMenu);
	parentItem.items.push(item);
	parentItem.dropDownMenu.items.push(item);
};

/*
 * 控制菜单的显示隐藏
 * paint:绘图对象
 */
let checkShowMenu = function (paint) {
	let paintAll = false;
	let clickItem = false;
	for (let i = 0; i < paint.views.length; i++) {
		let view = paint.views[i];
		if (view.viewType == "menu") {
			if (view.visible) {
				if (view == paint.touchDownView) {
					clickItem = true;
                }
				for (let j = 0; j < view.items.length; j++) {
					let item = view.items[j];
					if (item == paint.touchDownView) {
						clickItem = true;
						break;
                    }
				}
            }
        }
	}
	if (!clickItem) {
		for (let i = 0; i < paint.views.length; i++) {
			let view = paint.views[i];
			if (view.viewType == "menu") {
				view.visible = false;
				paintAll = true;
			}
		}
	}
	if (paintAll) {
		invalidate(paint);
    }
};

/*
 * 关闭网格视图
 * items:菜单集合
 */ 
let closeMenus = function (items) {
	let itemSize = items.length;
    let close = false;
	for (let i = 0; i < itemSize; i++) {
        let item = items[i];
		let subItems = item.items;
		if (closeMenus(subItems)) {
			close = true;
		}
		let dropDownMenu = item.dropDownMenu;
		if (dropDownMenu && dropDownMenu.visible) {
			dropDownMenu.visible = false;
			close = true;
		}
	}
	return close;
};

/*
 * 鼠标移动到菜单项
 * item 菜单项
 */
let touchMoveMenuItem = function (item) {
	let parentItem = item.parentItem;
	let items = [];
	if (parentItem) {
		if (parentItem.dropDownMenu) {
			items = parentItem.dropDownMenu.items;
		}
	} else {
		if (item.parentMenu) {
			items = item.parentMenu.items;
		}
	}
	let close = closeMenus(items);
	if (item.items.length > 0) {
		let dropDownMenu = item.dropDownMenu;
		//获取位置和大小
		if (dropDownMenu && !dropDownMenu.visible) {
			let layoutStyle = dropDownMenu.layoutStyle;
            let location = new FCPoint(clientX(item) + item.size.cx, clientY(item));
			if (layoutStyle == "lefttoright" || layoutStyle == "righttoleft") {
				location.x = clientX(item);
				location.y = clientY(item) + item.size.cy;
			}
			//设置弹出位置
			dropDownMenu.location = location;
			dropDownMenu.visible = true;
			adjustMenu(dropDownMenu);
			invalidate(item.paint);
			return;
		}
	}
	invalidate(item.paint);
};

/*
* 重绘按钮
* item:菜单项
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawMenuItem = function (item, paint, clipRect) {
	if (item == paint.touchDownView) {
		if (item.pushedColor && item.pushedColor != "none") {
			paint.fillRect(item.pushedColor, 0, 0, item.size.cx, item.size.cy);
		} else {
			if (item.backColor && item.backColor != "none") {
				paint.fillRect(item.backColor, 0, 0, item.size.cx, item.size.cy);
			}
		}
	} else if (item == paint.touchMoveView) {
		if (item.hoveredColor && item.hoveredColor != "none") {
			paint.fillRect(item.hoveredColor, 0, 0, item.size.cx, item.size.cy);
		} else {
			if (item.backColor && item.backColor != "none") {
				paint.fillRect(item.backColor, 0, 0, item.size.cx, item.size.cy);
			}
		}
	}
	else if (item.backColor && item.backColor != "none") {
		paint.fillRect(item.backColor, 0, 0, item.size.cx, item.size.cy);
	}
	if (item.backImage && item.backImage.length > 0) {
		if (!item.image) {
			item.image = new Image();
			item.image.onload = function () { invalidateView(item); };
			item.image.src = item.backImage;
		} else {
			paint.drawImage(item.image, 0, 0, item.size.cx, item.size.cy);
		}
	}
	if (item.textColor && item.textColor != "none" && item.text) {
		let tSize = paint.textSize(item.text, item.font);
		paint.drawText(item.text, item.textColor, item.font, (item.size.cx - tSize.cx) / 2, item.size.cy / 2 + 1 - tSize.cy / 2);
	}
	if (item.borderColor && item.borderColor != "none") {
		paint.drawRect(item.borderColor, item.borderWidth, 0, 0, 0, item.size.cx, item.size.cy);
	}
	if (item.items.length > 0) {
		let tR = 5;
		paint.beginPath();
		paint.addLine(item.size.cx - 2, item.size.cy / 2, item.size.cx - 2 - tR * 2, item.size.cy / 2 - tR);
		paint.addLine(item.size.cx - 2 - tR * 2, item.size.cy / 2 - tR, item.size.cx - 2 - tR * 2, item.size.cy / 2 + tR);
		paint.addLine(item.size.cx - 2 - tR * 2, item.size.cy / 2 + tR, item.size.cx - 2, item.size.cy / 2);
		paint.fillPath(item.textColor);
		paint.closePath();
	}
};

/*
 * 点击菜单项
 * item:菜单项
 */
let clickMenuItem = function (item) {
	let paintAll = false;
	if (item.parentMenu) {
		if (item.parentMenu.comboBox) {
			let index = -1;
			for (let i = 0; i < item.parentMenu.items.length; i++) {
				if (item.parentMenu.items[i] == item) {
					index = i;
					break;
				}
			}
			item.parentMenu.comboBox.selectedIndex = index;
			item.parentMenu.comboBox.text = item.parentMenu.items[index].text;
			paintAll = true;
		}
	}
	if (item.items.length == 0) {
		for (let i = 0; i < item.paint.views.length; i++) {
			let subView = item.paint.views[i];
			if (subView.viewType == "menu") {
				if (subView.visible) {
					subView.visible = false;
					paintAll = true;
				}
			}
		}
	}
	if (paintAll) {
		invalidate(item.paint);
	}
};

/*
* 重绘按钮
* comboBox:下拉列表
* paint:绘图对象
* clipRect:裁剪区域
*/
let drawComboBox = function (comboBox, paint, clipRect) {
	if (comboBox.backColor && comboBox.backColor != "none") {
		paint.fillRect(comboBox.backColor, 0, 0, comboBox.size.cx, comboBox.size.cy);
	}
	if (comboBox.textColor && comboBox.textColor != "none" && comboBox.text) {
		let tSize = paint.textSize(comboBox.text, comboBox.font);
		paint.drawText(comboBox.text, comboBox.textColor, comboBox.font, 5, comboBox.size.cy / 2 + 1 - tSize.cy / 2);
	}
	if (comboBox.borderColor && comboBox.borderColor != "none") {
		paint.drawRect(comboBox.borderColor, comboBox.borderWidth, 0, 0, 0, comboBox.size.cx, comboBox.size.cy);
	}
	let tR = 5;
	paint.beginPath();
	paint.addLine(comboBox.size.cx - 5 - tR * 2, comboBox.size.cy / 2 - tR, comboBox.size.cx - 5, comboBox.size.cy / 2 - tR);
	paint.addLine(comboBox.size.cx - 5, comboBox.size.cy / 2 - tR, comboBox.size.cx - 5 - tR, comboBox.size.cy / 2 + tR);
	paint.addLine(comboBox.size.cx - 5 - tR, comboBox.size.cy / 2 + tR, comboBox.size.cx - 5 - tR * 2, comboBox.size.cy / 2 - tR);
	paint.fillPath(comboBox.textColor);
	paint.closePath();
};

/*
 * 点击下拉菜单
 * comboBox:下拉菜单
 */
let clickComboBox = function (comboBox) {
	let showX = clientX(comboBox);
	let showY = clientY(comboBox) + comboBox.size.cy;
	comboBox.dropDownMenu.location = new FCPoint(showX, showY);
	comboBox.dropDownMenu.visible = true;
	adjustMenu(comboBox.dropDownMenu);
	invalidate(comboBox.paint);
};

/*
* 显示或隐藏输入框
*/
let showOrHideInput = function (views) {
    for (let i = 0; i < views.length; i++) {
        let view = views[i];
		let paintVisible = isPaintVisible(view);
		if (view.views) {
			showOrHideInput(view.views);
		}
        if (view.input) {
            let clipRect = view.clipRect;
			if (clipRect) {
				let canvas = view.paint.canvas;
				let rect = canvas.getBoundingClientRect();
				let newTop = rect.top + document.documentElement.scrollTop;
				let newLeft = rect.left + document.documentElement.scrollLeft;
				let relativeRect = new FCRect(newLeft + clipRect.left * view.paint.scaleFactorX, newTop + clipRect.top * view.paint.scaleFactorY, newLeft + clipRect.right * view.paint.scaleFactorX, newTop + clipRect.bottom * view.paint.scaleFactorY);
				view.input.style.left = relativeRect.left + "px";
				view.input.style.top = relativeRect.top + "px";
				view.input.style.width = (relativeRect.right - relativeRect.left) + "px";
				view.input.style.height = (relativeRect.bottom - relativeRect.top) + "px";
				view.input.style.backgroundColor = convertColor(view.backColor);
				view.input.style.border = "1px solid " + convertColor(view.borderColor);
				view.input.style.color = convertColor(view.textColor);
				if (paintVisible) {
					view.input.style.display = "block";
				} else {
					view.input.style.display = "none";
				}
            }
        }
    }
};

/*
* 是否移动端
*/
let isMobileMode = function () {
    let ua = navigator.userAgent;
    let ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
        isIphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
        isAndroid = ua.match(/(Android)\s+([\d.]+)/),
        isMobile = isIphone || isAndroid;
    return isMobile;
};

/*
* 设置属性
* view:视图
* node:xml节点
*/
let setAttributeDefault = function (view, node) {
	if (view.paint) {
		if (view.paint.defaultUIStyle == "dark") {
			view.backColor = "rgb(0,0,0)";
			view.borderColor = "rgb(100,100,100)";
			view.textColor = "rgb(255,255,255)";
			view.scrollBarColor = "rgb(100,100,100)";
		} else if (view.paint.defaultUIStyle == "light") {
			view.backColor = "rgb(255,255,255)";
			view.borderColor = "rgb(150,150,150)";
			view.textColor = "rgb(0,0,0)";
			view.scrollBarColor = "rgb(200,200,200)";
		}
	}
	if (!view.location) {
		view.location = new FCPoint(0, 0);
	}
	if (!view.size) {
		view.size = new FCSize(100, 30);
	}
	for (let i = 0; i < node.attributes.length; i++) {
		let name = node.attributes[i].nodeName.toLowerCase();
		let value = node.attributes[i].nodeValue;
		if (name && value) {
			if (name == "location") {
				let xStr = value.split(',')[0];
				let yStr = value.split(',')[1];
				if (xStr.indexOf("%") != -1) {
					if (!view.exAttributes) {
						view.exAttributes = new Map();
					}
					view.exAttributes.set("leftstr", xStr);
				}
				else {
					view.location.x = parseInt(xStr);
				}
				if (yStr.indexOf("%") != -1) {
					if (!view.exAttributes) {
						view.exAttributes = new Map();
					}
					view.exAttributes.set("topstr", yStr);
				}
				else {
					view.location.y = parseInt(yStr);
				}
			}
			else if (name == "size") {
				let xStr = value.split(',')[0];
				let yStr = value.split(',')[1];
				if (xStr.indexOf("%") != -1) {
					if (!view.exAttributes) {
						view.exAttributes = new Map();
					}
					view.exAttributes.set("widthstr", xStr);
				}
				else {
					view.size.cx = parseInt(xStr);
				}
				if (yStr.indexOf("%") != -1) {
					if (!view.exAttributes) {
						view.exAttributes = new Map();
					}
					view.exAttributes.set("heightstr", yStr);
				}
				else {
					view.size.cy = parseInt(yStr);
				}
			} else if (name == "text") {
				view.text = value;
			} else if (name == "backcolor") {
				let lowerStr = value.toLowerCase();
				if (lowerStr.indexOf("rgb") == 0) {
					view.backColor = value;
				} else {
					view.backColor = null;
				}
			} else if (name == "bordercolor") {
				let lowerStr = value.toLowerCase();
				if (lowerStr.indexOf("rgb") == 0) {
					view.borderColor = value;
				} else {
					view.borderColor = null;
				}
			} else if (name == "textcolor") {
				let lowerStr = value.toLowerCase();
				if (lowerStr.indexOf("rgb") == 0) {
					view.textColor = value;
				} else {
					view.textColor = null;
				}
			} else if (name == "textalign") {
				view.textAlign = value.toLowerCase();
			} else if (name == "layoutstyle") {
				view.layoutStyle = value.toLowerCase();
			} else if (name == "align") {
				view.align = value.toLowerCase();
			}  else if (name == "cursor") {
				view.cursor = value.toLowerCase();
			} else if (name == "vertical-align") {
				view.verticalAlign = value.toLowerCase();
			} else if (name == "dock") {
				view.dock = value.toLowerCase();
			} else if (name == "font") {
				view.font = value;
			} else if (name == "headerheight") {
				view.headerHeight = parseFloat(value);
			} else if (name == "cornerradius") {
				view.cornerRadius = parseFloat(value);
			} else if (name == "borderwidth") {
				view.borderWidth = parseFloat(value);
			} else if (name == "splitmode") {
				view.splitMode = value.toLowerCase();
			}else if (name == "autowrap") {
				view.autoWrap = value.toLowerCase() == "true";
			}else if (name == "name") {
				view.viewName = value;
			}else if (name == "tabindex") {
				view.tabIndex = parseInt(value);
			}else if (name == "tabstop") {
				view.tabStop = value.toLowerCase() == "true";
			}else if (name == "enabled") {
				view.enabled = value.toLowerCase() == "true";
			} else if (name == "showvscrollbar") {
				view.showVScrollBar = value.toLowerCase() == "true";
			} else if (name == "showhscrollbar") {
				view.showHScrollBar = value.toLowerCase() == "true";
			} else if (name == "visible") {
				view.visible = value.toLowerCase() == "true";
			} else if (name == "displayoffset") {
				view.displayOffset = value.toLowerCase() == "true";
			} else if (name == "checked") {
				view.checked = value.toLowerCase() == "true";
			} else if (name == "buttonsize") {
				view.buttonSize = new FCSize(parseInt(value.split(',')[0]), parseInt(value.split(',')[1]));
			} else if (name == "topmost") {
				view.topMost = value.toLowerCase() == "true";
			} else if (name == "selectedindex") {
				view.selectedIndex = parseInt(value);
			} else if (name == "src") {
				view.src = value;
			} else if (name == "backimage") {
				view.backImage = value;
			} else if (name == "groupname") {
				view.groupName = value;
			} else if (name == "allowdragscroll") {
				view.allowDragScroll = value.toLowerCase() == "true";
			} else if (name == "allowpreviewsevent") {
				view.allowPreviewsEvent = value.toLowerCase() == "true";
			} else if (name == "allowdrag") {
				view.allowDrag = value.toLowerCase() == "true";
			} else if (name == "allowresize") {
				view.allowResize = value.toLowerCase() == "true";
			} else if (name == "indent") {
				view.indent = parseFloat(value);
			} else if (name == "showcheckbox") {
				view.showCheckBox = value.toLowerCase() == "true";
			} else if (name == "padding") {
				view.padding = new FCPadding(parseInt(value.split(',')[0]), parseInt(value.split(',')[1]), parseInt(value.split(',')[2]), parseInt(value.split(',')[3]));
			} else if (name == "margin") {
				view.margin = new FCPadding(parseInt(value.split(',')[0]), parseInt(value.split(',')[1]), parseInt(value.split(',')[2]), parseInt(value.split(',')[3]));
			} else if (name == "hoveredcolor") {
				let lowerStr = value.toLowerCase();
				if (lowerStr.indexOf("rgb") == 0) {
					view.hoveredColor = value;
				} else {
					view.hoveredColor = null;
				}
			} else if (name == "pushedcolor") {
				let lowerStr = value.toLowerCase();
				if (lowerStr.indexOf("rgb") == 0) {
					view.pushedColor = value;
				} else {
					view.pushedColor = null;
				}
			} else if (name == "layout") {
				view.layout = value;
			} else if (name == "width") {
				if (value.indexOf("%") != -1) {
					if (!view.exAttributes) {
						view.exAttributes = new Map();
					}
					view.exAttributes.set("widthstr", value);
				}
				else {
					view.size.cx = parseInt(value);
				}
			}
			else if (name == "height") {
				if (value.indexOf("%") != -1) {
					if (!view.exAttributes) {
						view.exAttributes = new Map();
					}
					view.exAttributes.set("heightstr", value);
				}
				else {
					view.size.cy = parseInt(value);
				}
			}
			else if (name == "top") {
				if (value.indexOf("%") != -1) {
					if (!view.exAttributes) {
						view.exAttributes = new Map();
					}
					view.exAttributes.set("topstr", value);
				}
				else {
					view.location.y = parseInt(value);
				}
			}
			else if (name == "left") {
				if (value.indexOf("%") != -1) {
					if (!view.exAttributes) {
						view.exAttributes = new Map();
					}
					view.exAttributes.set("leftstr", value);
				}
				else {
					view.location.x = parseInt(value);
				}
			}else{
				view.exAttributes.set(name, value);
			}
		}
	}
};

/*
* 读取Xml中的树节点
* tree 树
* parentNode 父节点
* xmlNode Xml节点
*/
let readTreeXmlNodeDefault = function (tree, parentNode, xmlNode) {
	let subNodes = xmlNode.childNodes;
	let treeNode = new FCTreeNode();
	treeNode.value = xmlNode.getAttribute("text");
	appendTreeNode(tree, treeNode, parentNode);
	for (let i = 0; i < subNodes.length; i++) {
		let child = subNodes[i];
		if (child.nodeType == 1) {
			let nodeName = child.nodeName.toLowerCase();
			if (nodeName == "node") {
				readTreeXmlNodeDefault(tree, treeNode, child);
			}
		}
	}
};

/*
* 读取Xml
* paint 绘图对象
* node节点
* parent 父视图
*/
let readXmlNodeDefault = function (paint, node, parent) {
	let subNodes = node.childNodes;
	for (let i = 0; i < subNodes.length; i++) {
		let child = subNodes[i];
		if (child.nodeType == 1) {
			let view = null;
			let type = "";
			let nodeName = child.nodeName.toLowerCase();
			if (nodeName == "div" || nodeName == "view") {
				type = child.getAttribute("type");
				if (type == "splitlayout") {
					view = new FCSplitLayoutDiv();
				}
				else if (type == "layout") {
					view = new FCLayoutDiv();
				}
				else if (type == "tab") {
					view = new FCTabView();
				}
				else if (type == "tabpage") {
					view = new FCTabPage();
				}
				else if (type == "radio") {
					view = new FCRadioButton();
				}
				else if (type == "text") {
					view = new FCTextBox();
				}
				else if (type == "checkbox") {
					view = new FCCheckBox();
				} else if (type == "range") {
					view = new FCTextBox();
				}else if(type == "custom"){
					let cid = child.getAttribute("cid");
					view = new FCDiv();
					view.viewType = cid;
				}
				else {
					view = new FCDiv();
				}
			}
			else if (nodeName == "select") {
				view = new FCComboBox();
			}
			else if (nodeName == "input") {
				type = child.getAttribute("type");
				if (type == "radio") {
					view = new FCRadioButton();
				}
				else if (type == "text") {
					view = new FCTextBox();
				}
				else if (type == "checkbox") {
					view = new FCCheckBox();
				} else if (type == "range") {
					view = new FCTextBox();
				} else if (type == "custom") {
					let cid = child.getAttribute("cid");
					view = new FCView();
					view.viewType = cid;
				}  else {
					view = new FCButton();
				}
			}
			else if (nodeName == "chart") {
				view = new FCChart();
			}
			else if (nodeName == "img") {
				view = new FCImage();
			}
			else if (nodeName == "calendar") {
				view = new FCCalendar();
			}
			else if (nodeName == "table") {
				view = new FCGrid();
			} else if (nodeName == "tree") {
				view = new FCTree();
			} else if (nodeName == "label") {
				view = new FCLabel();
			}
			else {
				view = new FCView();
			}
			view.views = new Array();
			view.paint = paint;
			view.parent = parent;
			setAttributeDefault(view, child);
			if(paint.editMode == 0){
				if (type == "text") {
					createInputTextBox(view);
				}
				else if (nodeName == "select") {
					if (paint.viewMode == 1) {
						createInputComboBox(view);
					}
				}
				else if (type == "range") {
					createInputTextBox(view);
				}
			}
			if (view) {
				if (type == "tabpage") {
					let tabButton = new FCView();
					tabButton.viewType = "tabbutton";
					let atrHeaderSize = child.getAttribute("headersize");
					if (atrHeaderSize) {
						tabButton.size = new FCSize(parseInt(atrHeaderSize.split(',')[0]), parseInt(atrHeaderSize.split(',')[1]));
					} else {
						tabButton.size = new FCSize(100, 20);
					}
					if (view.paint.defaultUIStyle == "dark") {
						tabButton.backColor = "rgb(0,0,0)";
						tabButton.borderColor = "rgb(100,100,100)";
						tabButton.textColor = "rgb(255,255,255)";
						tabButton.selectedBackColor = "rgb(50,50,50)";
					} else if (view.paint.defaultUIStyle == "light") {
						tabButton.backColor = "rgb(255,255,255)";
						tabButton.borderColor = "rgb(150,150,150)";
						tabButton.textColor = "rgb(0,0,0)";
						tabButton.selectedBackColor = "rgb(230,230,230)";
					}
					tabButton.text = view.text;
					addTabPage(view.parent, view, tabButton);
				} else {
					if (parent) {
						if (!parent.views) {
							parent.views = new Array();
						}
						parent.views.push(view);
					} else {
						paint.views.push(view);
					}
				}
				if (type == "splitlayout") {
					let atrDatum = child.getAttribute("datumsize");
					if (atrDatum) {
						view.size = new FCSize(parseInt(atrDatum.split(',')[0]), parseInt(atrDatum.split(',')[1]));
					}
					let splitter = new FCView();
					splitter.parent = view;
					if (view.paint.defaultUIStyle == "dark") {
						splitter.backColor = "rgb(75,75,75)";
					} else if (view.paint.defaultUIStyle == "light") {
						splitter.backColor = "rgb(150,150,150)";
					}
					splitter.borderColor = "none";
					splitter.paint = paint;
					let canDragSplitter = child.getAttribute("candragsplitter");
					if (canDragSplitter) {
						if (canDragSplitter == "true") {
							splitter.allowDrag = true;
						}
					}
					view.views.push(splitter);
					view.splitter = splitter;
					let splitterposition = child.getAttribute("splitterposition");
					let splitStr = splitterposition.split(',');
					if (splitStr.length >= 4) {
						let splitRect = new FCRect(parseFloat(splitStr[0]), parseFloat(splitStr[1]), parseFloat(splitStr[2]), parseFloat(splitStr[3]));
						splitter.location = new FCPoint(splitRect.left, splitRect.top);
						splitter.size = new FCSize(splitRect.right - splitRect.left, splitRect.bottom - splitRect.top);
					} else {
						let sSize = parseFloat(splitStr[1]);
						let sPosition = parseFloat(splitStr[0]);
						if (view.layoutStyle == "lefttoright" || view.layoutStyle == "righttoleft") {
							splitter.location = new FCPoint(sPosition, 0);
							splitter.size = new FCSize(sSize, view.size.cy);
						} else {
							splitter.location = new FCPoint(0, sPosition);
							splitter.size = new FCSize(view.size.cx, sSize);
						}
					}
					readXmlNodeDefault(paint, child, view);
					view.firstView = view.views[1];
					view.secondView = view.views[2];
					view.oldSize = view.size;
					resetSplitLayoutDiv(view);

				} else if (type == "tab") {
					readXmlNodeDefault(paint, child, view);
					if (view.tabPages.length > 0) {
						let strSelectedIndex = child.getAttribute("selectedindex");
						if (strSelectedIndex) {
							let selectedIndex = parseInt(strSelectedIndex);
							if (selectedIndex >= 0 && selectedIndex < view.tabPages.length) {
								view.tabPages[selectedIndex].visible = true;
							} else {
								view.tabPages[view.tabPages.length - 1].visible = true;
							}
						} else {
							view.tabPages[view.tabPages.length - 1].visible = true;
						}
					}
				} else if (nodeName == "table") {
					let tSubNodes = child.childNodes;
					for (let n = 0; n < tSubNodes.length; n++) {
						let tChild = tSubNodes[n];
						if (tChild.nodeType == 1) {
							if (tChild.nodeName == "tr") {
								let gridRow = null;
								let tsunNodes = tChild.childNodes;
								for (let j = 0; j < tsunNodes.length; j++) {
									let sunNodeName = tsunNodes[j].nodeName.toLowerCase();
									if (sunNodeName.toLowerCase() == "th") {
										let gridColumn = new FCGridColumn;
										if (view.paint.defaultUIStyle == "light") {
											gridColumn.backColor = "rgb(230,230,230)";
											gridColumn.borderColor = "rgb(150,150,150)";
											gridColumn.textColor = "rgb(0,0,0)";
										} else if (view.paint.defaultUIStyle == "dark") {
											gridColumn.backColor = "rgb(50,50,50)";
											gridColumn.borderColor = "rgb(100,100,100)";
											gridColumn.textColor = "rgb(255,255,255)";
										}
										gridColumn.width = 100;
										let widthAttr = tsunNodes[j].getAttribute("width");
										if (widthAttr) {
											if (widthAttr.indexOf("%") != -1) {
												gridColumn.widthStr = widthAttr;
											}
											else {
												gridColumn.width = parseFloat(widthAttr);
											}
										}
										let backColorAttr = tsunNodes[j].getAttribute("backcolor");
										if (backColorAttr) {
											gridColumn.backColor = backColorAttr;
										}
										let textColorAttr = tsunNodes[j].getAttribute("textcolor");
										if (textColorAttr) {
											gridColumn.textColor = textColorAttr;
										}
										let borderColorAttr = tsunNodes[j].getAttribute("bordercolor");
										if (borderColorAttr) {
											gridColumn.borderColor = borderColorAttr;
										}
										let fontAttr = tsunNodes[j].getAttribute("font");
										if (fontAttr) {
											gridColumn.font = fontAttr;
										}
										let colTypeAttr = tsunNodes[j].getAttribute("coltype");
										if(colTypeAttr){
											gridColumn.colType = colTypeAttr;
										}
										let allowSortAttr = tsunNodes[j].getAttribute("allowsort");
										if(allowSortAttr){
											gridColumn.allowSort = allowSortAttr.toLowerCase() == "true";
										}
										let allowResizeAttr = tsunNodes[j].getAttribute("allowresize");
										if(allowResizeAttr){
											gridColumn.allowResize = allowResizeAttr.toLowerCase() == "true";
										}
										gridColumn.text = tsunNodes[j].getAttribute("text");
										view.columns.push(gridColumn);
									} else if (sunNodeName.toLowerCase() == "td") {
										if (!gridRow) {
											gridRow = new FCGridRow();
											view.rows.push(gridRow);
										}
										let gridCell = new FCGridCell();
										gridCell.value = tsunNodes[j].textContent;
										gridRow.cells.push(gridCell);
									}
								}
							}
						}
					}
				} else if (nodeName == "tree") {
					let treeColumn = new FCTreeColumn();
					view.columns.push(treeColumn);
					let tSubNodes = child.childNodes;
					let columnWidth = 0;
					for (let n = 0; n < tSubNodes.length; n++) {
						let tChild = tSubNodes[n];
						if (tChild.nodeType == 1) {
							if (tChild.nodeName == "nodes") {
								let gridRow = null;
								let tsunNodes = tChild.childNodes;
								for (let j = 0; j < tsunNodes.length; j++) {
									let sunNodeName = tsunNodes[j].nodeName.toLowerCase();
									if (sunNodeName.toLowerCase() == "node") {
										readTreeXmlNodeDefault(view, null, tsunNodes[j]);
									}
								}
							} else if (tChild.nodeName == "tr") {
								let tsunNodes = tChild.childNodes;
								for (let j = 0; j < tsunNodes.length; j++) {
									let sunNodeName = tsunNodes[j].nodeName.toLowerCase();
									if (sunNodeName.toLowerCase() == "th") {
										let widthAttr = tsunNodes[j].getAttribute("width");
										if (widthAttr) {
											if (widthAttr.indexOf("%") != -1) {
												treeColumn.widthStr = widthAttr;
											}
											else {
												columnWidth = parseFloat(widthAttr);
											}
										}
									}
								}
							}
						}
					}
					if (columnWidth > 0) {
						treeColumn.width = columnWidth;
					}
				}
				else if (nodeName == "calendar") {
					initCalendar(view);
					view.selectedDay = getYear(view.years, 2022).months.get(10).days.get(1);
					updateCalendar(view);
				}
				else if (nodeName == "select") {
					if (paint.viewMode == 1) {
						let tSubNodes = child.childNodes;
						for (let n = 0; n < tSubNodes.length; n++) {
							let tChild = tSubNodes[n];
							if (tChild.nodeType == 1) {
								if (tChild.nodeName == "option") {
									let optionText = tChild.getAttribute("text");
									let option = document.createElement('option');
									option.text = optionText;
									option.label = optionText;
									view.input.add(option, null);
								}
							}
						}
					} else {
						view.dropDownMenu = new FCMenu();
						view.dropDownMenu.comboBox = view;
						addView(view.dropDownMenu, paint);
						view.dropDownMenu.size.cx = view.size.cx;
						let tSubNodes = child.childNodes;
						for (let n = 0; n < tSubNodes.length; n++) {
							let tChild = tSubNodes[n];
							if (tChild.nodeType == 1) {
								if (tChild.nodeName == "option") {
									let menuItem = new FCMenuItem();
									addMenuItem(menuItem, view.dropDownMenu);
									setAttributeDefault(menuItem, tChild);
								}
							}
						}
						if (view.dropDownMenu.items.length > 0) {
							let strSelectedIndex = child.getAttribute("selectedindex");
							if (strSelectedIndex) {
								let selectedIndex = parseInt(strSelectedIndex);
								if (selectedIndex >= 0 && selectedIndex < view.dropDownMenu.items.length) {
									view.selectedIndex = selectedIndex;
									view.text = view.dropDownMenu.items[selectedIndex].text;
								} else {
									view.selectedIndex = 0;
									view.text = view.dropDownMenu.items[0].text;
								}
							} else {
								view.selectedIndex = 0;
								view.text = view.dropDownMenu.items[0].text;
							}
						}
					}
				}
				else {
					if (view.viewType != "chart") {
						readXmlNodeDefault(paint, child, view);
					}
				}
			}
		}
	}
};	

/*
* 点击方法
* view:视图
* firstTouch:是否第一次触摸
* firstPoint:第一次触摸的坐标
* secondTouch:是否第二次触摸
* secondPoint:第二次触摸的坐标
* clicks:点击次数
*/
let onClickDefault = function (view, firstTouch, firstPoint, secondTouch, secondPoint, clicks) {
	if(view.onClick){
		view.onClick(view, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
		return;
	}
	if (view.viewType == "tabbutton") {
		let tabView = view.parent;
		let oldPage = null;
		for (let i = 0; i < tabView.tabPages.length; i++) {
			if (tabView.tabPages[i].visible) {
				oldPage = tabView.tabPages[i];
				break;
			}
		}
		for (let i = 0; i < tabView.tabPages.length; i++) {
			if (tabView.tabPages[i].headerButton == view) {
				selectTabPage(tabView, tabView.tabPages[i]);
				if (oldPage) {
					startTabPageAnimation(tabView.tabPages[i], oldPage);
				}
				break;
			}
		}
		invalidateView(tabView);
	}
	else if (view.viewType == "radiobutton") {
		clickRadioButton(view, firstPoint);
		invalidate(view.paint);
	}
	else if (view.viewType == "checkbox") {
		clickCheckBox(view, firstPoint);
		invalidateView(view.parent);
	} else if (view.viewType == "menuitem") {
		clickMenuItem(view);
	} else if (view.viewType == "combobox") {
		clickComboBox(view);
    }
};

/*
* 鼠标按下实现方法
* view:视图
* mp:坐标
* button:按钮
* clicks:点击次数
* delta:滚轮值
*/
let onMouseDownDefault = function (view, mp, buttons, clicks, delta) {
	if(view.onMouseDown){
		view.onMouseDown(view, mp, buttons, clicks, delta);
		return;
	}
	let firstTouch = false, secondTouch = false;
	let firstPoint = mp, secondPoint = mp;
	if (buttons == 1) {
		firstTouch = true;
	}else if(buttons == 2){
		secondTouch = true;
	}
	if (view.viewType == "tree") {
		touchDownTree(view, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
	}
	else if (view.viewType == "grid") {
		touchDownGrid(view, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
	}
	else if (view.viewType == "div" || view.viewType == "layout" || view.viewType == "menu") {
		touchDownDiv(view, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
	}
	else if (view.viewType == "calendar") {
		clickCalendar(view, mp);
	}
	else if (view.viewType == "button") {
		invalidateView(view);
	}else if (view.viewType == "chart") {
		touchDownChart(view, firstTouch, firstPoint, secondTouch, secondPoint);
	}
};

/*
* 鼠标移动实现方法
* view:视图
* mp:坐标
* button:按钮
* clicks:点击次数
* delta:滚轮值
*/
let onMouseMoveDefault = function (view, mp, buttons, clicks, delta) {
	if(view.onMouseMove){
		view.onMouseMove(view, mp, buttons, clicks, delta);
		return;
	}
	let firstTouch = false, secondTouch = false;
	let firstPoint = mp, secondPoint = mp;
	if (buttons == 1) {
		firstTouch = true;
	} else if (buttons == 2) {
		secondTouch = true;
	}
	if (view.viewType == "tree") {
		touchMoveTree(view, firstTouch, firstPoint, secondTouch, secondPoint);
		invalidateView(view);
	}else if (view.viewType == "grid") {
		touchMoveGrid(view, firstTouch, firstPoint, secondTouch, secondPoint);
		invalidateView(view);
	}
	else if (view.viewType == "div" || view.viewType == "layout" || view.viewType == "menu") {
		touchMoveDiv(view, firstTouch, firstPoint, secondTouch, secondPoint);
		invalidateView(view);
	}else if (view.viewType == "chart") {
		touchMoveChart(view, firstTouch, firstPoint, secondTouch, secondPoint);
		invalidateView(view);
	}else if (view.viewType == "button") {
		invalidateView(view);
	}else if (view.viewType == "menuitem") {
		touchMoveMenuItem(view);
	}else{
		if(view.allowDrag && view.parent && view.parent.viewType == "split" && view.parent.splitter == view){
			if(view.parent.layoutStyle == "lefttoright" || view.parent.layoutStyle == "righttoleft"){
				if (view.paint != null && view.paint.canvas) {
					view.paint.canvas.style.cursor = "ew-resize";
				}
			}
			else{
				if (view.paint != null && view.paint.canvas) {
					view.paint.canvas.style.cursor = "ns-resize";
				}
			}
		}
		invalidateView(view);
	}
};

/*
* 鼠标滚动实现方法
* view:视图
* mp:坐标
* button:按钮
* clicks:点击次数
* delta:滚轮值
*/
let onMouseWheelDefault = function (view, mp, buttons, clicks, delta) {
	if(view.onMouseWheel){
		view.onMouseWheel(view, mp, buttons, clicks, delta);
		return;
	}
	if (view.viewType == "tree") {
		touchWheelTree(view, delta);
		invalidateView(view);
	}
	else if (view.viewType == "grid") {
		touchWheelGrid(view, delta);
		invalidateView(view);
	}
	else if (view.viewType == "div" || view.viewType == "layout" || view.viewType == "menu") {
		touchWheelDiv(view, delta);
		invalidateView(view);
	} else if (view.viewType == "chart") {
		if (delta < 0) {
			zoomOutChart(view);
		} else if (delta > 0) {
			zoomInChart(view);
		}
		invalidateView(view);
	}
};

/*
* 鼠标抬起实现方法
* view:视图
* mp:坐标
* button:按钮
* clicks:点击次数
* delta:滚轮值
*/
let onMouseUpDefault = function (view, mp, buttons, clicks, delta) {
	if(view.onMouseUp){
		view.onMouseUp(view, mp, buttons, clicks, delta);
		return;
	}
	let firstTouch = false, secondTouch = false;
	let firstPoint = mp, secondPoint = mp;
	if (buttons == 1) {
		firstTouch = true;
	} else if (buttons == 2) {
		secondTouch = true;
	}
	if (view.viewType == "tree") {
		touchUpTree(view, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
	}
	else if (view.viewType == "grid") {
		touchUpGrid(view, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
	}
	else if (view.viewType == "div" || view.viewType == "layout" || view.viewType == "menu") {
		touchUpDiv(view, firstTouch, firstPoint, secondTouch, secondPoint, clicks);
	}
	else if (view.viewType == "chart") {
		touchUpChart(view, firstTouch, firstPoint, secondTouch, secondPoint);
	}
	invalidateView(view);
};

/*
* 触摸开始方法
* view:视图
* firstTouch:是否第一次触摸
* firstPoint:第一次触摸的坐标
* secondTouch:是否第二次触摸
* secondPoint:第二次触摸的坐标
*/
let onTouchBeginDefault = function (view, firstTouch, firstPoint, secondTouch, secondPoint) {
	if(view.onTouchBegin){
		view.onTouchBegin(view, firstTouch, firstPoint, secondTouch, secondPoint);
		return;
	}
	if (view.viewType == "tree") {
		touchDownTree(view, firstTouch, firstPoint, secondTouch, secondPoint, 1);
	}
	else if (view.viewType == "grid") {
		touchDownGrid(view, firstTouch, firstPoint, secondTouch, secondPoint, 1);
	}
	else if (view.viewType == "div" || view.viewType == "layout" || view.viewType == "menu") {
		touchDownDiv(view, firstTouch, firstPoint, secondTouch, secondPoint, 1);
	}
	else if (view.viewType == "calendar") {
		clickCalendar(view, firstPoint);
	}
	else if (view.viewType == "button") {
		invalidateView(view);
	}else if (view.viewType == "chart") {
		touchDownChart(view, firstTouch, firstPoint, secondTouch, secondPoint);
	}
};

/*
* 触摸移动方法
* view:视图
* firstTouch:是否第一次触摸
* firstPoint:第一次触摸的坐标
* secondTouch:是否第二次触摸
* secondPoint:第二次触摸的坐标
*/
let onTouchMoveDefault = function (view, firstTouch, firstPoint, secondTouch, secondPoint) {
	if(view.onTouchMove){
		view.onTouchMove(view, firstTouch, firstPoint, secondTouch, secondPoint);
		return;
	}
	if (view.viewType == "tree") {
		touchMoveTree(view, firstTouch, firstPoint, secondTouch, secondPoint);
		invalidateView(view);
	}
	else if (view.viewType == "grid") {
		touchMoveGrid(view, firstTouch, firstPoint, secondTouch, secondPoint);
		invalidateView(view);
	}
	else if (view.viewType == "div" || view.viewType == "layout" || view.viewType == "menu") {
		touchMoveDiv(view, firstTouch, firstPoint, secondTouch, secondPoint);
		invalidateView(view);
	}
	else if (view.viewType == "chart") {
		touchMoveChart(view, firstTouch, firstPoint, secondTouch, secondPoint);
		invalidateView(view);
	} else if (view.viewType == "menuitem") {
		touchMoveMenuItem(view);
	}else{
		invalidateView(view);
	}
};

/*
* 触摸结束方法
* view:视图
* firstTouch:是否第一次触摸
* firstPoint:第一次触摸的坐标
* secondTouch:是否第二次触摸
* secondPoint:第二次触摸的坐标
*/
let onTouchEndDefault = function (view, firstTouch, firstPoint, secondTouch, secondPoint) {
	if(view.onTouchEnd){
		view.onTouchEnd(view, firstTouch, firstPoint, secondTouch, secondPoint);
		return;
	}
	if (view.viewType == "tree") {
		touchUpTree(view, firstTouch, firstPoint, secondTouch, secondPoint, 1);
	}
	else if (view.viewType == "grid") {
		touchUpGrid(view, firstTouch, firstPoint, secondTouch, secondPoint, 1);
	}
	else if (view.viewType == "div" || view.viewType == "layout" || view.viewType == "menu") {
		touchUpDiv(view, firstTouch, firstPoint, secondTouch, secondPoint, 1);
	}
	else if (view.viewType == "chart") {
		touchUpChart(view, firstTouch, firstPoint, secondTouch, secondPoint);
	}
	invalidateView(view);
};

/*
* 重绘背景的实现方法
* view:视图
* paint:绘图对象
* clipRect:裁剪区域
*/
let onPaintDefault = function (view, paint, clipRect) {
	if(view.onPaint){
		view.onPaint(view, paint, clipRect);
		return;
	}
	if (view.viewType == "chart") {
		drawChart(view, paint, clipRect);
	}
	else if (view.viewType == "div" || view.viewType == "layout" || view.viewType == "tabpage") {
		drawDiv(view, paint, clipRect);
	}
	else if (view.viewType == "grid") {
		drawDiv(view, paint, clipRect);
		drawGrid(view, paint, clipRect);
	}
	else if (view.viewType == "tree") {
		drawDiv(view, paint, clipRect);
		drawTree(view, paint, clipRect);
	}
	else if (view.viewType == "calendar") {
		drawCalendar(view, paint);
	}
	else if (view.viewType == "label") {
		if (view.textColor && view.textColor != "none") {
			let tSize = paint.textSize(view.text, view.font);
			if(view.textAlign != null && view.textAlign.length > 0){
				if(view.textAlign == "middleleft"){
					paint.drawText(view.text, view.textColor, view.font, 0, view.size.cy / 2 + 1 - tSize.cy / 2);
				}else if(view.textAlign == "middlecenter"){
					paint.drawText(view.text, view.textColor, view.font, (view.size.cx - tSize.cx) / 2, view.size.cy / 2 + 1 - tSize.cy / 2);
				}else if(view.textAlign == "middleright"){
					paint.drawText(view.text, view.textColor, view.font, view.size.cx - tSize.cx, view.size.cy / 2 + 1 - tSize.cy / 2);
				}
			}else{
				paint.drawText(view.text, view.textColor, view.font, 0, view.size.cy / 2 + 1 - tSize.cy / 2);
			}
		}
	}else if (view.viewType == "textbox" && !view.input) {
        drawDiv(view, paint, clipRect);
		if (view.textColor && view.textColor != "none") {
			let tSize = paint.textSize(view.text, view.font);
			paint.drawText(view.text, view.textColor, view.font, 2, view.size.cy / 2 + 1 - tSize.cy / 2);
		}
	}
	else if (view.viewType == "radiobutton") {
		drawRadioButton(view, paint, clipRect);
	}
	else if (view.viewType == "checkbox") {
		drawCheckBox(view, paint, clipRect);
	}
	else if (view.viewType == "menuitem") {
		drawMenuItem(view, paint, clipRect);
	} else if (view.viewType == "combobox") {
		drawComboBox(view, paint, clipRect);
	}
	else {
		drawButton(view, paint, clipRect);
	}
};

/*
* 重绘边框的实现方法
* view:视图
* paint:绘图对象
* clipRect:裁剪区域
*/
let onPaintBorderDefault = function (view, paint, clipRect) {
	if(view.onPaintBorder){
		view.onPaintBorder(view, paint, clipRect);
		return;
	}
	if (view.viewType == "grid") {
		drawGridScrollBar(view, paint, clipRect);
		drawDivBorder(view, paint, clipRect);
	}
	else if (view.viewType == "tree") {
		drawTreeScrollBar(view, paint, clipRect);
		drawDivBorder(view, paint, clipRect);
	}
	else if (view.viewType == "div" || view.viewType == "layout" || view.viewType == "tabpage" || view.viewType == "menu") {
		drawDivScrollBar(view, paint, clipRect);
		drawDivBorder(view, paint, clipRect);
	}
	else if (view.viewType == "tabview") {
		drawTabViewBorder(view, paint, clipRect);
	}else if (view.viewType == "textbox" && !view.input) {
        drawDivBorder(view, paint, clipRect);
    }
};

/*
* 键盘按下方法
* view:视图
* key:按键
*/
let onKeyDownDefault = function(view, key){
	if(view.onKeyDown){
		view.onKeyDown(view, key);
		return;
	}
	if(view.viewType == "chart"){
		keyDownChart(view, key);
		invalidateView(view);
	}
};

/*
* 键盘抬起方法
* view:视图
* key:按键
*/
let onKeyUpDefault = function(view, key){
	if(view.onKeyUp){
		view.onKeyUp(view, key);
		return;
	}
};

/*
 * 缩放Canvas
 */
let scaleCanvas = function (paint) {
	//缩放高清模式
	if (window.devicePixelRatio && !isMobileMode()) {
		let canvas = paint.canvas;
		canvas.style.width = canvas.width + 'px';
		canvas.style.height = canvas.height + 'px';
		canvas.height = canvas.height * window.devicePixelRatio;
		canvas.width = canvas.width * window.devicePixelRatio;
		let context = canvas.getContext("2d"); //绘图上下文
		context.scale(window.devicePixelRatio, window.devicePixelRatio);
		paint.ratio = window.devicePixelRatio;
	}
};

/*
* 显示输入框
* view:视图
* lastView:上次的视图
*/
let showTextInput = function(view, lastView){
	let paint = view.paint;
	if(paint.textBox && paint.editingTextBox){
		if (lastView && lastView != view && lastView.viewType == "textbox"){
			lastView.text = paint.textBox.value;
			invalidateView(lastView);
		}
	}
	if(!paint.textBox){
		let input = document.createElement("input");
		paint.textBox = input;
		input.type = "text";
		input.style.position = "absolute";
		input.style.boxSizing = "border-box";
		document.body.appendChild(input);
	}
	paint.editingTextBox = view;
	if (view.font && view.paint) {
		let strs = view.font.split(',');
		let fontFamily = strs[0];
		if (fontFamily == "Default") {
			fontFamily = paint.systemFont;
		}
		let sFont = strs[1] + "px " + fontFamily;
		if (paint.scaleFactorX != 1 || paint.scaleFactorY != 1) {
			sFont = Math.min(paint.scaleFactorX, paint.scaleFactorY) * parseFloat(strs[1]) + "px " + fontFamily;
		}
		paint.textBox.style.font = sFont;
	} 
	paint.textBox.style.backgroundColor = convertColor(view.backColor);
	paint.textBox.style.border = "1px solid " + convertColor(view.borderColor);
	paint.textBox.style.color = convertColor(view.textColor);
	paint.textBox.style.display = "block";
	paint.textBox.value = view.text;
	invalidateEdit(paint);
	focusingTextBox = paint.textBox;
};

let focusingTextBox = null;

/*
* 隐藏输入框
* view:视图
*/
let hideTextInput = function(view){
	let paint = view.paint;
	if(paint.textBox && paint.editingTextBox){
		paint.textBox.style.display = "none";
		paint.editingTextBox.text = paint.textBox.value;
		paint.textBox.style.left = "-100000px";
		paint.textBox.style.top = "-100000px";
		paint.editingTextBox = null;
		invalidate(paint);
	}
};