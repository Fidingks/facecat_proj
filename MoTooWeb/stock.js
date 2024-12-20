
/*
 * 数据缓存
 */
class ClientTickDataCache {
    constructor() {
        this.code = ""; // 初始化代码
        this.lastAmount = 0; // 初始化上次成交额
        this.lastDate = 0; // 初始化上次日期
        this.lastVolume = 0; // 初始化上次成交量
    }
};

/*
 * 复权因子
 */
class ADJUSTMENTFACTOR {
    constructor() {
        this.dwDate = 0; // 初始化日期
        this.f1 = 0; // 每10股派现
        this.f2 = 0; // 配股价
        this.f3 = 0; // 每10股送股
        this.f4 = 0; // 每10股配股
    }
};

/**
 * 获取日期的时间戳
 * @param {number} year - 年份
 * @param {number} month - 月份
 * @param {number} day - 日
 * @param {number} hour - 小时
 * @param {number} minute - 分钟
 * @param {number} second - 秒
 * @param {number} millisecond - 毫秒
 * @returns {number} - 返回日期的时间戳
 */
let getDateNum = function(year, month, day, hour, minute, second, millisecond) {
    let date = new Date(year, month - 1, day, hour, minute, second, millisecond);
    return date.getTime();
};

/**
 * 时间戳转日期
 * @param {number} num - 时间戳
 * @returns {Date} - 返回日期对象
 */
let numToDate = function(num) {
    let date = new Date(num);
    return date;
};

/**
 * 获取季度
 * @param {number} month - 月份
 * @returns {number} - 返回季度
 */
let getSeason = function(month) {
    if (month >= 1 && month <= 3) {
        return 1;
    } else if (month >= 4 && month <= 6) {
        return 2;
    } else if (month >= 7 && month <= 9) {
        return 3;
    } else {
        return 4;
    }
};

/**
 * 拷贝数据
 * @param {SecurityData} data - 原来的数据
 * @returns {SecurityData} - 新数据
 */
let copySecurityData = function(data){
    let newData = new SecurityData();
    newData.date = data.date;
    newData.high = data.high;
    newData.low = data.low;
    newData.open = data.open;
    newData.close = data.close;
    newData.amount = data.amount;
    newData.volume = data.volume;
    return newData;
};

/**
 * 多分钟数据处理
 * @param {Array} newDatas - 新数据数组
 * @param {Array} minuteDatas - 分钟数据数组
 * @param {number} cycle - 周期
 */
let multiMinuteSecurityDatas = function(newDatas, minuteDatas, cycle) {
    let lastMinutes = 0;
    for (let i = 0; i < minuteDatas.length; i++) {
        let minuteData = minuteDatas[i];
        let minutes = Math.floor(minuteData.date / 1000 / 60);
        if (lastMinutes === 0) {
            lastMinutes = minutes;
        }
        // 更新
        if (newDatas.length > 0 && minutes - lastMinutes < cycle) {
            let lastData = newDatas[newDatas.length - 1];
            lastData.close = minuteData.close;
            if (minuteData.high > lastData.high) {
                lastData.high = minuteData.high;
            }
            if (minuteData.low < lastData.low) {
                lastData.low = minuteData.low;
            }
            lastData.amount += minuteData.amount;
            lastData.volume += minuteData.volume;
        } else {
			let newData = new SecurityData();
            newData.date = minuteData.date;
			newData.high = minuteData.high;
			newData.low = minuteData.low;
			newData.open = minuteData.open;
			newData.close = minuteData.close;
			newData.amount = minuteData.amount;
			newData.volume = minuteData.volume;
            newDatas.push(newData);
            lastMinutes = minutes;
        }
    }
};

/**
 * 获取历史周数据
 * @param {Array} weekDatas - 周数据数组
 * @param {Array} dayDatas - 日数据数组
 * @returns {number} - 返回操作结果
 */
let getHistoryWeekDatas = function(weekDatas, dayDatas) {
    let dayDatasSize = dayDatas.length;
    if (dayDatasSize > 0) {
        let firstDate = getDateNum(1970, 1, 5, 0, 0, 0, 0);
        let weekData = copySecurityData(dayDatas[0]);
        let lWeeks = Math.floor((weekData.date - firstDate) / 1000 / 86400 / 7);
        for (let i = 0; i < dayDatasSize; i++) {
            let dayData = copySecurityData(dayDatas[i]);
            let weeks = Math.floor((dayData.date - firstDate) / 1000 / 86400 / 7);
            let isNextWeek = false;
            if (weeks > lWeeks) {
                isNextWeek = true;
            }
            if (isNextWeek) {
                weekDatas.push(weekData);
                weekData = copySecurityData(dayData);
                if (i === dayDatasSize - 1) {
                    weekDatas.push(weekData);
                }
            } else {
                if (i > 0) {
                    weekData.close = dayData.close;
                    weekData.amount += dayData.amount;
                    weekData.volume += dayData.volume;
                    if (weekData.high < dayData.high) {
                        weekData.high = dayData.high;
                    }
                    if (weekData.low > dayData.low) {
                        weekData.low = dayData.low;
                    }
                }
                if (i === dayDatasSize - 1) {
                    weekDatas.push(weekData);
                }
            }
            lWeeks = weeks;
        }
    }
    return 1;
};

/**
 * 获取历史月数据
 * @param {Array} monthDatas - 月数据数组
 * @param {Array} dayDatas - 日数据数组
 * @returns {number} - 返回操作结果
 */
let getHistoryMonthDatas = function(monthDatas, dayDatas) {
    let dayDatasSize = dayDatas.length;
    if (dayDatasSize > 0) {
        let monthData = copySecurityData(dayDatas[0]);
        let ldate = numToDate(monthData.date);
        let lYear = ldate.getFullYear(); 
        let lMonth = ldate.getMonth() + 1; 
        let lDay = ldate.getDate(); 
        for (let i = 0; i < dayDatasSize; i++) {
            let dayData = copySecurityData(dayDatas[i]);
            let date = numToDate(dayData.date);
            let year = date.getFullYear(); 
            let month = date.getMonth() + 1; 
            let day = date.getDate(); 
            let ms = date.getMilliseconds();
            let isNextMonth = year * 12 + month > lYear * 12 + lMonth;
            if (isNextMonth) {
                monthDatas.push(monthData);
                monthData = copySecurityData(dayData);
                if (i === dayDatasSize - 1) {
                    monthDatas.push(monthData);
                }
            } else {
                if (i > 0) {
                    monthData.close = dayData.close;
                    monthData.amount += dayData.amount;
                    monthData.volume += dayData.volume;
                    if (monthData.high < dayData.high) {
                        monthData.high = dayData.high;
                    }
                    if (monthData.low > dayData.low) {
                        monthData.low = dayData.low;
                    }
                }
                if (i === dayDatasSize - 1) {
                    monthDatas.push(monthData);
                }
            }
            lYear = year;
            lMonth = month;
            lDay = day;
        }
    }
    return 1;
};

/**
 * 获取历史季节数据
 * @param {Array} seasonDatas - 季节数据数组
 * @param {Array} dayDatas - 日数据数组
 * @returns {number} - 返回操作结果
 */
let getHistorySeasonDatas = function(seasonDatas, dayDatas) {
    let dayDatasSize = dayDatas.length;
    if (dayDatasSize > 0) {
        let seasonData = copySecurityData(dayDatas[0]);
        let ldate = numToDate(seasonData.date);
        let lYear = ldate.getFullYear(); 
        let lMonth = ldate.getMonth() + 1; 
        let lDay = ldate.getDate(); 
        for (let i = 0; i < dayDatasSize; i++) {
            let dayData = copySecurityData(dayDatas[i]);
            let date = numToDate(dayData.date);
            let year = date.getFullYear(); 
            let month = date.getMonth() + 1; 
            let day = date.getDate(); 
            let isNextSeason = year * 4 + getSeason(month) > lYear * 4 + getSeason(lMonth);
            if (isNextSeason) {
                seasonDatas.push(seasonData);
                seasonData = copySecurityData(dayData);
                if (i === dayDatasSize - 1) {
                    seasonDatas.push(seasonData);
                }
            } else {
                if (i > 0) {
                    seasonData.close = dayData.close;
                    seasonData.amount += dayData.amount;
                    seasonData.volume += dayData.volume;
                    if (seasonData.high < dayData.high) {
                        seasonData.high = dayData.high;
                    }
                    if (seasonData.low > dayData.low) {
                        seasonData.low = dayData.low;
                    }
                }
                if (i === dayDatasSize - 1) {
                    seasonDatas.push(seasonData);
                }
            }
            lYear = year;
            lMonth = month;
            lDay = day;
        }
    }
    return 1;
};

/**
 * 获取历史半年数据
 * @param {Array} halfYearDatas - 半年数据数组
 * @param {Array} dayDatas - 日数据数组
 * @returns {number} - 返回操作结果
 */
let getHistoryHalfYearDatas = function(halfYearDatas, dayDatas) {
    let dayDatasSize = dayDatas.length;
    if (dayDatasSize > 0) {
        let yearData = copySecurityData(dayDatas[0]);
        let ldate = numToDate(yearData.date);
        let lyear = ldate.getFullYear(); 
        let lmonth = ldate.getMonth() + 1; 
        let lday = ldate.getDate(); 
        for (let i = 0; i < dayDatasSize; i++) {
            let dayData = copySecurityData(dayDatas[i]);
            let date = numToDate(dayData.date);
            let year = date.getFullYear(); 
            let month = date.getMonth() + 1; 
            let day = date.getDate(); 
            let isNextHalfYear = year * 2 + Math.floor((month - 1) / 6) > lyear * 2 + Math.floor((lmonth - 1) / 6);
            if (isNextHalfYear) {
                halfYearDatas.push(yearData);
                yearData = copySecurityData(dayData);
                if (i === dayDatasSize - 1) {
                    halfYearDatas.push(yearData);
                }
            } else {
                if (i > 0) {
                    yearData.close = dayData.close;
                    yearData.amount += dayData.amount;
                    yearData.volume += dayData.volume;
                    if (yearData.high < dayData.high) {
                        yearData.high = dayData.high;
                    }
                    if (yearData.low > dayData.low) {
                        yearData.low = dayData.low;
                    }
                }
                if (i === dayDatasSize - 1) {
                    halfYearDatas.push(yearData);
                }
            }
            lyear = year;
            lmonth = month;
            lday = day;
        }
    }
    return 1;
};

/**
 * 获取历史年数据
 * @param {Array} yearDatas - 年数据数组
 * @param {Array} dayDatas - 日数据数组
 * @returns {number} - 返回操作结果
 */
let getHistoryYearDatas = function(yearDatas, dayDatas) {
    let dayDatasSize = dayDatas.length;
    if (dayDatasSize > 0) {
        let yearData = copySecurityData(dayDatas[0]);
        let ldate = numToDate(yearData.date);
        let lyear = ldate.getFullYear(); 
        let lmonth = ldate.getMonth() + 1; 
        let lday = ldate.getDate(); 
        for (let i = 0; i < dayDatasSize; i++) {
            let dayData = copySecurityData(dayDatas[i]);
            let date = numToDate(dayData.date);
            let year = date.getFullYear(); 
            let month = date.getMonth() + 1; 
            let day = date.getDate(); 
            let isNextYear = year > lyear;
            if (isNextYear) {
                yearDatas.push(yearData);
                yearData = copySecurityData(dayData);
                if (i === dayDatasSize - 1) {
                    yearDatas.push(yearData);
                }
            } else {
                if (i > 0) {
                    yearData.close = dayData.close;
                    yearData.amount += dayData.amount;
                    yearData.volume += dayData.volume;
                    if (yearData.high < dayData.high) {
                        yearData.high = dayData.high;
                    }
                    if (yearData.low > dayData.low) {
                        yearData.low = dayData.low;
                    }
                }
                if (i === dayDatasSize - 1) {
                    yearDatas.push(yearData);
                }
            }
            lyear = year;
            lmonth = month;
            lday = day;
        }
    }
    return 1;
};

/**
 * 合并最新数据
 * @param {string} code - 代码
 * @param {Array} oldDatas - 老数据数组
 * @param {Object} latestData - 新数据对象
 * @param {Object} tickDataCache - TICK数据缓存对象
 * @param {number} dCycle - 周期
 */
let mergeLatestData = function(code, oldDatas, latestData, tickDataCache, dCycle) {
    let cycle = dCycle;
    if (cycle === 0) {
        cycle = 1;
    }
    if (latestData.open <= 0 || latestData.volume <= 0 || latestData.amount <= 0) {
        return;
    }
    let newDate = numToDate(latestData.date);
    let hourMinute = newDate.getHours() * 60 + newDate.getMinutes();
    if (hourMinute < 570) {
        newDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 9, 30);
        latestData.date = newDate.getTime();
    } else if (hourMinute < 571) {
        newDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 9, 31);
        latestData.date = newDate.getTime();
    } else if (hourMinute > 900) {
        newDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 15, 0);
        latestData.date = newDate.getTime();
    } else if (hourMinute > 690 && hourMinute < 780) {
        newDate = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), 11, 30);
        latestData.date = newDate.getTime();
    }
    let isNextCycle = true;
    if (dCycle === 0) {
        isNextCycle = false;
    } else if (cycle < 1440) {
        if (oldDatas.length > 0) {
            let newMinutes = Math.floor(latestData.date / 1000 / 60);
            let lastData = oldDatas[oldDatas.length - 1];
            let lastMinutes = Math.floor(lastData.date / 1000 / 60);
            isNextCycle = newMinutes - lastMinutes >= cycle;
        }
    } else {
        if (cycle == 1440)
        {
            if (oldDatas.length > 0)
            {
                let lastDate = numToDate(oldDatas[oldDatas.length - 1].date);
                isNextCycle = getDateNum(newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), 0, 0, 0, 0)
                != getDateNum(lastDate.getFullYear(), lastDate.getMonth() + 1, lastDate.getDate(), 0, 0, 0, 0);
            }
        }
        else if (cycle == 10080)
        {
            if (oldDatas.length > 0)
            {
                let firstDate = getDateNum(1970, 1, 5, 0, 0, 0, 0);
                let lWeeks = Math.floor((oldDatas[oldDatas.length - 1].date - firstDate) / 1000 / 86400 / 7);
                let weeks = Math.floor((latestData.date - firstDate) / 1000 / 86400 / 7);
                if (weeks > lWeeks)
                {
                    isNextCycle = true;
                }
                else
                {
                    isNextCycle = false;
                }
            }
        }
        else if (cycle == 43200)
        {
            if (oldDatas.length > 0)
            {
                let lastDate = numToDate(oldDatas[oldDatas.length - 1].date);
                isNextCycle = (newDate.getFullYear() * 12 + newDate.getMonth() + 1 != lastDate.getFullYear() * 12 + lastDate.getMonth() + 1);
            }
        }
        else if (cycle == 129600)
        {
            if (oldDatas.length > 0)
            {
                let lastDate = numToDate(oldDatas.get(oldDatas.length - 1).date);
                isNextCycle = newDate.getFullYear() * 4 + getSeason(newDate.getMonth() + 1) != lastDate.getFullYear() * 4 + getSeason(lastDate.getMonth() + 1);
            }
        }
        else if (cycle == 259200)
        {
            if (oldDatas.length > 0)
            {
                let lastDate = numToDate(oldDatas.get(oldDatas.length - 1).date);
                isNextCycle = newDate.getFullYear() * 2 + Math.floor((newDate.getMonth() + 1 - 1) / 6) != lastDate.getFullYear() * 2 + Math.floor((lastDate.getMonth() + 1 - 1) / 6);
            }
        }
        else if (cycle == 518400)
        {
            if (oldDatas.length > 0)
            {
                let lastDate = numToDate(oldDatas.get(oldDatas.length - 1).date);
                isNextCycle = newDate.getFullYear() != lastDate.getFullYear();
            }
        }
    }
    if (isNextCycle) {
        let newCycleData = new SecurityData();
		newCycleData.date = latestData.date;
		newCycleData.open = latestData.close;
		newCycleData.high = latestData.close;
		newCycleData.low = latestData.close;
		newCycleData.close = latestData.close;
		newCycleData.volume = latestData.volume - tickDataCache.lastVolume;
		newCycleData.amount = latestData.amount - tickDataCache.lastAmount;
        oldDatas.push(newCycleData);
    } else {
        if (oldDatas.length > 0) {
            let lastCycleData = oldDatas[oldDatas.length - 1];
            if (dCycle == 0)
            {
                let thisDate = getDateNum(newDate.getFullYear(), newDate.getMonth() + 1, newDate.getDate(), newDate.getHours(), newDate.getMinutes(), 0, 0);
                for (let i = 0; i < oldDatas.length; i++)
                {
                    let oData = oldDatas[i];
                    if (oData.date == thisDate)
                    {
                        if(oData.open == 0){
                            oData.open = latestData.open;
                        }
                        lastCycleData = oData;
                        break;
                    }
                }
            }
            lastCycleData.close = latestData.close;
            if (lastCycleData.high < latestData.close) {
                lastCycleData.high = latestData.close;
            }
            if (lastCycleData.low > latestData.close) {
                lastCycleData.low = latestData.close;
            }
            lastCycleData.amount += latestData.amount - tickDataCache.lastAmount;
            lastCycleData.volume += latestData.volume - tickDataCache.lastVolume;
        }
    }
    tickDataCache.code = code;
    tickDataCache.lastAmount = latestData.amount;
    tickDataCache.lastDate = latestData.date;
    tickDataCache.lastVolume = latestData.volume;
};

// 创建一个存储调整因子的Map
var factorsMap = new Map();

/**
 * 前复权价格计算函数
 * @param {number} price - 股票价格
 * @param {Object} factor - 调整因子
 * @returns {number} - 调整后的价格
 */
let fq_price_func = function(price, factor) {
    let cash_bt = factor.f1;
    let bonus_shr = factor.f3;
    let allot_pct = factor.f4;
    let allot_price = factor.f2;
    return (10.0 * price - cash_bt + allot_pct * allot_price) / (10.0 + allot_pct + bonus_shr);
};

/**
 * 后复权价格计算函数
 * @param {number} price - 股票价格
 * @param {Object} factor - 调整因子
 * @returns {number} - 调整后的价格
 */
let fq_price_func2 = function(price, factor) {
    let cash_bt = factor.f1;
    let bonus_shr = factor.f3;
    let allot_pct = factor.f4;
    let allot_price = factor.f2;
    return (price * (10.0 + allot_pct + bonus_shr) - allot_pct * allot_price + cash_bt) / 10.0;
};

/**
 * 转换前复权
 * @param {Object} kd - 数据
 * @param {number} trade_date - 交易日期
 * @param {Array} factor - 调整因子数组
 */
let convertXDRBeforePrice = function(kd, trade_date, factor) {
    let size = factor.length;
    if (size > 0) {
        let pos = 0;
        let date = kd.date;
        if (kd.date < factor[size - 1].dwDate) {
            for (let i = 0; i < size; i++) {
                if (trade_date > 0 && trade_date < factor[i].dwDate) {
                    continue;
                }
                pos = i;
                if (date < factor[i].dwDate) {
                    break;
                }
            }
            for (let i = pos; i < size; i++) {
                if (trade_date > 0 && trade_date < factor[i].dwDate) {
                    continue;
                }
                kd.open = fq_price_func(kd.open, factor[i]);
                kd.high = fq_price_func(kd.high, factor[i]);
                kd.low = fq_price_func(kd.low, factor[i]);
                kd.close = fq_price_func(kd.close, factor[i]);
            }
        }
    }
};

/**
 * 转换后复权
 * @param {Object} kd - 数据
 * @param {number} trade_date - 交易日期
 * @param {Array} factor - 调整因子数组
 */
let convertXDRAfterPrice = function(kd, trade_date, factor) {
    let size = factor.length;
    if (size > 0) {
        let date = kd.date;
        let factors = [];
        for (let i = 0; i < size; i++) {
            if (date < factor[i].dwDate) {
                break;
            } else {
                factors.unshift(factor[i]);
            }
        }
        for (let i = 0; i < factors.length; i++) {
            kd.open = fq_price_func2(kd.open, factors[i]);
            kd.high = fq_price_func2(kd.high, factors[i]);
            kd.low = fq_price_func2(kd.low, factors[i]);
            kd.close = fq_price_func2(kd.close, factors[i]);
        }
        factors.length = 0;
    }
};

/**
 * 转换XDR
 * @param {string} code - 股票代码
 * @param {number} rights_offering - 权利发行类型
 * @param {Array} datas - 数据数组
 */
let convertXDR = function(code, rights_offering, datas) {
    if (factorsMap.has(code)) {
        let factor = factorsMap.get(code);
        let datasSize = datas.length;
        if (datasSize > 0) {
            let trade_date = datas[datasSize - 1].date;
            // 复权K线
            for (let i = 0; i < datasSize; ++i) {
                let kd = datas[i];
                if (rights_offering === 1) {
                    convertXDRBeforePrice(kd, trade_date, factor);
                } else if (rights_offering === 2) {
                    convertXDRAfterPrice(kd, trade_date, factor);
                }
            }
        }
    }
};