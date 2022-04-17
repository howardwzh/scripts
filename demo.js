(function(){
  if (!document.getElementById('_spanLastPrice')) return;
  const FIRST_DATE_TIME = new Date('2022/2/22').getTime() // Starting time
  const ALL_PLANS = ['planA','planB','planS'] // can add more, if need
  const FEE_RATE = 0.0025
  const DEFAULT_COLOR = '#333'
  const INFO_COLOR = '#909399'
  const SUCCESS_COLOR = '#5384ec'
  const DANGER_COLOR = '#d85140'
  const WARNING_COLOR = '#E6A23C'
  const COUNT_DEFAULT_TEXT = "计时器"
  const SUGGEST_NUMBER_GROUP = [0, -0.04] // -4%
  const ONE_S = 1000
  const ONE_M = 60 * ONE_S
  const ONE_H = 60 * ONE_M
  const ONE_D = 24 * ONE_H
  const HISTORY_LENGTH = 7 // 7 price histories
  const offsetNumber = {}
  const buyedTotalNumber = {}
  const totalNumber = {}
  const totalMoney = {}
  const soldRecord = {}

  addMainPanel();
  fixedLastPriceDom();
  setTimeout(() => {
    // init all plans
    for (let i = 0; i < ALL_PLANS.length; i++) {
      checkBuyPrice(ALL_PLANS[i]);
      previewSellHighResult(ALL_PLANS[i]);
      previewResult(ALL_PLANS[i]);
      addEventToCountTimeBox(ALL_PLANS[i]);
      addEventToConfirmDoneBtn(ALL_PLANS[i]);
    }
    // global
    checkAllSellPrices();
    setTotalDays();
    pushPriceToHistory();
    addEventToClosePanel();
    addEventToEditRemark();
    addEventToCompleteRecord();
    addEventToIncrease('totalIncrease', 'saveForever')
    addEventToIncrease('monthIncrease', `${new Date().getMonth()}`)
    addEventToIncrease('todayIncrease', `${new Date().getDate()}`)
  }, 277);

  // 加遮罩面板
  function addMainPanel() {
    const panel = document.createElement('div');
    panel.innerHTML = `
      <div>
        <div id="monitorMainPanel" style="
          position: fixed; 
          top: 0; 
          bottom: 0; 
          left: 0; 
          right:0;  
          background-color: #fff; 
          z-index: 777777;
          padding: 60px 27px;
          text-align: center;
          font-size: 14px;
          font-family: Arial;
          "
        >
          <div id="monitorHistory" style="font-size: 14px; text-align: left; position: absolute; top: 22px; line-height: 20px"></div>
          <p style="margin:16px 0 0"><label><span>Sell List</span><textarea style="width: 100%;font-size: 14px;vertical-align: top;font-family: Arial;font-weight: 400;" rows="7" id="sellPriceInput"></textarea></label></p>
          ${
            ALL_PLANS.map((plan) => {
              return `
                <p style="margin:16px 0 0">
                  <div style="text-align: left">${plan.slice(-1)}<b id="${plan}TotalBox" style="margin-left: 12px; color: ${INFO_COLOR}"></b><b id="${plan}SuggestList" style="margin-left: 12px"></b></div>
                  <div style="display: flex">
                    <input placeholder="buy low" style="width: 100%; min-height: 26px;height: 26px;font-family: Arial;font-size: 14px;font-weight: 400;" type="text" id="${plan}Input"/>
                    <input placeholder="part" style="width: 60px; min-height: 26px;height: 26px;font-family: Arial;font-size: 14px;font-weight: 400;" type="text" id="${plan}PartInput"/>
                    <input placeholder="sell high" style="width: 100%; min-height: 26px;height: 26px;font-family: Arial;font-size: 14px;font-weight: 400;" type="text" id="${plan}SellHighInput"/>
                    <span id="${plan}CountTimeBox" style="display: flex;flex-direction: column;justify-content: center;padding-left: 10px; white-space: nowrap; font-weight: 700;color:${DEFAULT_COLOR}">${COUNT_DEFAULT_TEXT}</span>
                    <button id="${plan}DoneBtn" style="white-space: nowrap; margin-left: 10px; border-radius: 3px;">完成</button>
                  </div>
                  <p style="margin:4px 0 0;text-align: left" id="${plan}WinNumber"></p>
                  <p style="margin:4px 0 0;text-align: left" id="${plan}SellHighResult"></p>
                </p>
              `
            }).join('')
          }
          <p>
            <span id="totalIncreaseBox" style="display: inline-block; width: 32%"><span id="totalIncreaseLabel"><span id="totalDaysBox"></span>日:</span> <b id="totalIncrease">0</b><input id="totalIncreaseInput" style="display: none; width: 50px;font-size: 14px;" type="text" /></span>
            <span id="monthIncreaseBox" style="display: inline-block; width: 32%"><span id="monthIncreaseLabel">本月:</span> <b id="monthIncrease">0</b><input id="monthIncreaseInput" style="display: none; width: 50px;font-size: 14px;" type="text" /></span>
            <span id="todayIncreaseBox" style="display: inline-block; width: 32%"><span id="todayIncreaseLabel">今日:</span> <b id="todayIncrease">0</b><input id="todayIncreaseInput" style="display: none; width: 50px;font-size: 14px;" type="text" /></span>
          </p>
          <p id="debugMsg"></p>
          <div id="monitorRemark" style="padding: 0; text-align: left;">备注</div>
          <textarea id="monitorRemarkTextarea" style="display: none;font-size: 14px; width: 100%;" rows="5"></textarea>
          <div id="completeRecordPopup" style="box-sizing: border-box; display: none; position: absolute; width: 100%; height: 100%; top: 0; left: 0; background-color: #fff">
            <div id="completeRecordContent" style="padding: 12px;overflow: auto; height: 100%"></div>
            <button id="completeRecordCloseBtn" style="display: none;position: absolute; width: 28px; height: 28px; line-height: 28px; right: 10px; top: 10px; font-size: 28px; text-align: center; padding: 0; background-color: rgba(0,0,0,.3); color: #fff; border: none; border-radius: 14px;">×</button>
          </div>
        </div>
        <button id="toggleBtn" style="position: fixed; z-index: 7777777; width: 54px; height: 54px; opacity: 0.2; top: 98px; right: 27px; font-size: 14px; padding: 7px 14px;background-color:#eef05b;border:none"></button>
      </div>
    `;
    document.body.appendChild(panel.children[0]);
  };

  // 浮动元素
  function fixedLastPriceDom() {
    const lastPriceDom = document.getElementById('_spanLastPrice');
    lastPriceDom.setAttribute('style', `
      position:fixed;
      z-index:7777777;
      right:26px;
      top: 44px;
      background-color:#777;
      padding: 2px 7px;
      border-radius: 3px;
      font-size: 22px;
    `);
  };

  // 设置总天数
  function setTotalDays() {
    const totalDaysBox = document.getElementById('totalDaysBox')
    const firstTime = Number(localStorage.getItem(`increaseFirstTime`) || new Date(new Date().toLocaleDateString()).getTime());
    const nowTime = new Date().getTime()
    totalDaysBox.innerText = Math.ceil((nowTime-firstTime)/ONE_D)
    localStorage.setItem(`increaseFirstTime`, firstTime)
  }

  // 不同价格历史记录
  function pushPriceToHistory() {
    const lastPriceDom = document.getElementById('_spanLastPrice');
    const monitorHistory = document.getElementById('monitorHistory');
    let historyList = JSON.parse(localStorage.getItem('monitorHistory') || '[]');
    monitorHistory.innerHTML = makeHistoryHtml(historyList);
    setInterval(() => {
      const lastPrice = lastPriceDom.innerText;
      if (localStorage.getItem('isMock') || Number(lastPrice) !== Number(historyList[historyList.length - 1])) {
        historyList.push(lastPrice);
        historyList = historyList.slice(-1 * HISTORY_LENGTH);
        monitorHistory.innerHTML = makeHistoryHtml(historyList);
        localStorage.setItem('monitorHistory', JSON.stringify(historyList));
        // speakHelper.speak(lastPrice)
      }
    }, 1000);
  };

  // 拼接历史记录html
  function makeHistoryHtml(historyList) {
    let result = '<div style="font-size: 14px;">'
    for(let i = 0; i < historyList.length; i++) {
      const offset = i > 0 ? Math.round((historyList[i] - historyList[i-1]) * 1000) / 1000 : 0
      const criticalValue = i > 0 ? Math.min(historyList[i], historyList[i-1]) / 100 : 999999
      result += `
        ${i > 0 ? `<span style="background-color: ${ Math.abs(offset) < criticalValue ? INFO_COLOR : WARNING_COLOR};margin: 0 7px; border-radius: 3px; color: #fff; font-size: 12px; padding: 0 2px;">${offset}</span>` : ''}
        ${i < historyList.length - 1 ? `<span>${historyList[i]}</span>` : ''}
      `
    }
    result += '</div>'
    return result
  }

  // 检查卖出价格
  function checkAllSellPrices() {
    const sellPriceInput = document.getElementById('sellPriceInput');
    sellPriceInput.value = localStorage.getItem('sellPriceInput');
    sellPriceInput.addEventListener('change', handleSellListChange)
    sellPriceInput.dispatchEvent(new Event('change'));
    function handleSellListChange() {
      const lastPrice = Number(document.getElementById('_spanLastPrice').innerText);
      const sellPrices = sellPriceInput.value.split('\n').filter((el) => {
        return el;
      }).sort((a,b) => {
        const aMatch = a.match(/^(#)?(-|_)?([a-zA-Z])?([0-9.]+)/)
        const bMatch = b.match(/^(#)?(-|_)?([a-zA-Z])?([0-9.]+)/)
        const aHaveHash = aMatch[1] ? 1 : 0
        const bHaveHash = bMatch[1] ? 1 : 0
        const aPlan = (aMatch[3] || 'A').toUpperCase()
        const bPlan = (bMatch[3] || 'A').toUpperCase()
        const aPrice = Number(aMatch[4])
        const bPrice = Number(bMatch[4])

        if (aPlan === bPlan && aHaveHash === bHaveHash) {
          return aPrice - bPrice
        } else if (aPlan === bPlan) {
          return aHaveHash - bHaveHash
        } else {
          return aPlan > bPlan ? 1 : -1
        }
      })
      const newSellPrices = []
      let hasSold = false
      let lastPlan
      for (let x = 0; x < ALL_PLANS.length; x++) {
        totalNumber[ALL_PLANS[x]] = 0
        totalMoney[ALL_PLANS[x]] = 0
      }
      for (let i = 0; i < sellPrices.length; i++) {
        const newItem = checkSellPrice(sellPrices[i], lastPrice)
        const newPlan = newItem.match(/^(#)?(-|_)?([a-zA-Z])?/)[3]
        if (lastPlan !== newPlan) {
          newSellPrices.push('')
        }
        newSellPrices.push(newItem)
        lastPlan = newPlan
      }
      for (let y = 0; y < ALL_PLANS.length; y++) {
        document.getElementById(`${ALL_PLANS[y]}TotalBox`).innerText = totalMoney[ALL_PLANS[y]] ? `${setNumberOfDigits(totalMoney[ALL_PLANS[y]])} | ${totalNumber[ALL_PLANS[y]]}` : ''
        computeSuggestPrice(ALL_PLANS[y])
        document.getElementById(`${ALL_PLANS[y]}Input`).dispatchEvent(new Event('change'));
        hasSold = hasSold || !!totalMoney[ALL_PLANS[y]]
      }
      if(hasSold) {
        setStatusColor(sellPriceInput, 'success');
      } else {
        setStatusColor(sellPriceInput, 'none');
      }
      sellPriceInput.value = newSellPrices.join('\n')
      localStorage.setItem('sellPriceInput', sellPriceInput.value);
    }
  };

  // 检查卖出价格
  function checkSellPrice(sellPrice, lastPrice) {
    let result = sellPrice
    sellPrice.replace(/^(#)?(-|_)?([a-zA-Z])?([0-9.]+)\*?([0-9.]+)?(\([0-9.]+\))?(\+?-?[0-9\.]+)?(=?)/, (all, hash, buySign, whatPlan, price, number=10, buyPartSource, extraMoney = 0, equalSign) => {
      const plan = `plan${(whatPlan || 'A').toUpperCase()}`
      const needCount = price && number && (equalSign || lastPrice >= price)
      const _buyPartSource = buyPartSource ? Number(buyPartSource.slice(1, -1)) : buyPartSource
      const sign = {
        '-': -1,
        '_': 0,
        'undefined': 1
      }[buySign]
      result = `${hash||''}${buySign||''}${plan.slice(-1)}${setNumberOfDigits(price)}*${number}${buyPartSource||''}${extraMoney || ''}`
      if (needCount) {
        const lumpSum = setNumberOfDigits(price * number * (1 - sign * FEE_RATE) + Number(extraMoney))
        result += `=${lumpSum}`
        if (!hash) {
          const _number = buySign === '_' ? _buyPartSource : number
          totalNumber[plan] += (buySign ? -1 : 1) * _number
          totalMoney[plan] += (buySign ? -1 : 1) * lumpSum
          soldRecord[plan] = soldRecord[plan] ? `${soldRecord[plan]}<br/>${result.split('=')[0]}` : result.split('=')[0]
        }
      }
      return 'success'
    })
    return result
  };

  // 检查买入价格
  function checkBuyPrice(plan) {
    const lastPriceDom = document.getElementById('_spanLastPrice');
    const buyPriceInput = document.getElementById(`${plan}Input`);
    buyPriceInput.value = localStorage.getItem(`${plan}Input`);
    setInterval(() => {
      const lastPrice = Number(lastPriceDom.innerText);
      const buyPrice = Number(buyPriceInput.value||0);
      localStorage.setItem(`${plan}Input`, buyPrice || '');
      
      if(!buyPrice || lastPrice > buyPrice) {
        setStatusColor(buyPriceInput, 'none');
      } else if (lastPrice <= buyPrice - 0.2) {
        setStatusColor(buyPriceInput, 'warning');
      } else if (lastPrice <= buyPrice) {
        setStatusColor(buyPriceInput, 'success');
      }
    }, 1000);
  };

  // 根据状态设置边框阴影颜色
  function setStatusColor(dom, status) {
    const colorGroup = {
      success: `3px solid ${SUCCESS_COLOR}`,
      warning: `3px solid ${WARNING_COLOR}`,
      danger: `3px solid ${DANGER_COLOR}`,
      none: 'none'
    };
    dom.style.outline = colorGroup[status];
    showDebugMsg(`🙏🍀❤️BB自由❤️🍀🙏`);
  }

  // debug显示信息
  function showDebugMsg(msg) {
    document.getElementById('debugMsg').innerText = msg;
  }

  // 打开/关闭 面板
  function addEventToClosePanel() {
    let showPanel = true;
    document.getElementById('toggleBtn').addEventListener('dblclick', () => {
      showPanel = !showPanel;
      toggleShowPanel(showPanel);
    });  
  }

  // 打开/关闭 编辑备注
  function addEventToEditRemark() {
    let isEditRemark = false;
    const monitorRemark = document.getElementById('monitorRemark');
    const monitorRemarkTextarea = document.getElementById('monitorRemarkTextarea');
    monitorRemark.innerText = localStorage.getItem('monitorRemark') || '备注';

    monitorRemark.addEventListener('dblclick', () => { 
      isEditRemark = !isEditRemark;
      if (isEditRemark) {
        monitorRemarkTextarea.style.display = 'block'
        monitorRemarkTextarea.value = monitorRemark.innerText;
        monitorRemark.innerText = '编辑完成后双击保存';
      } else {
        monitorRemarkTextarea.style.display = 'none';
        monitorRemark.innerText = monitorRemarkTextarea.value || '备注';
        localStorage.setItem('monitorRemark', monitorRemark.innerText);
      }
    })    
  }

  // 监听 总计/本月/今日 新增
  function addEventToIncrease(increaseScope, nowDate) {
    let isEditIncrease = false;
    const lastDate = localStorage.getItem(`${increaseScope}LastDate`);
    const increaseBox = document.getElementById(`${increaseScope}Box`);
    const increase = document.getElementById(`${increaseScope}`);
    const increaseInput = document.getElementById(`${increaseScope}Input`);
    if (nowDate !== lastDate) {
      increase.innerText = 0
      localStorage.setItem(increaseScope, 0);
      localStorage.setItem(`${increaseScope}LastDate`, nowDate);
    } else {
      increase.innerHTML = makeSuccessOrDangerHtml(localStorage.getItem(increaseScope) || '0');
    }

    increaseBox.addEventListener('dblclick', () => { 
      isEditIncrease = !isEditIncrease;
      if (isEditIncrease) {
        increase.style.display = 'none'
        increaseInput.style.display = 'inline-block'
        increaseInput.value = increase.innerText;
      } else {
        increase.style.display = 'inline-block'
        increaseInput.style.display = 'none';
        increase.innerHTML = makeSuccessOrDangerHtml(increaseInput.value || '0');
        localStorage.setItem(increaseScope, increase.innerText);
      }
    })    
  }

  // 监听 完成
  function addEventToConfirmDoneBtn(plan) {
    const confirmDoneBtn = document.getElementById(`${plan}DoneBtn`);
    const buyPriceInput = document.getElementById(`${plan}Input`);
    const buyPartInput = document.getElementById(`${plan}PartInput`);
    const totalIncrease = document.getElementById('totalIncrease');
    const monthIncrease = document.getElementById('monthIncrease');
    const todayIncrease = document.getElementById('todayIncrease');
    

    confirmDoneBtn.addEventListener('dblclick', () => {
      const _offsetNumber = (buyPartInput.value ? Number(buyPartInput.value) / buyedTotalNumber[plan] : 1) * offsetNumber[plan]
      if (!buyPriceInput.value || !_offsetNumber) return
      const totalIncreaseValue = Number(totalIncrease.innerText) + _offsetNumber
      const monthIncreaseValue = Number(monthIncrease.innerText) + _offsetNumber
      const todayIncreaseValue = Number(todayIncrease.innerText) + _offsetNumber
      totalIncrease.innerHTML = makeSuccessOrDangerHtml(totalIncreaseValue);
      monthIncrease.innerHTML = makeSuccessOrDangerHtml(monthIncreaseValue);
      todayIncrease.innerHTML = makeSuccessOrDangerHtml(todayIncreaseValue);
      localStorage.setItem('totalIncrease', totalIncrease.innerText);
      localStorage.setItem('monthIncrease', monthIncrease.innerText);
      localStorage.setItem('todayIncrease', todayIncrease.innerText);
      localStorage.setItem(`${plan}Input`, '');
      const duration = countTime(plan, 'destroy');
      if (buyPartInput.value) {
        insertBuyPartToSellPriceInput(plan, buyPriceInput.value, buyPartInput.value)
        buyPartInput.value = '';
      } else {
        addCompletedRecord(plan, buyPriceInput.value, duration)
      }
      buyPriceInput.value = '';
      document.getElementById(`${plan}Input`).dispatchEvent(new Event('change'));
      
    })    
  }

  // 追加交易完成记录
  function addCompletedRecord(plan, buyPrice, duration) {
    const completedRecord = JSON.parse(localStorage.getItem('completedRecord')||'[]');
    completedRecord.push({
      soldText: soldRecord[plan],
      buyedText: `${totalMoney[plan]} / ${buyPrice}<br/>${totalNumber[plan]}${offsetNumber[plan] > 0 ? ` + <b style="color:${SUCCESS_COLOR}">${offsetNumber[plan]}</b>` : ` - <b style="color:${DANGER_COLOR}">${Math.abs(offsetNumber[plan])}</b>`}`,
      time: `${formatDate(new Date())}<br/>${duration}`
    })
    localStorage.setItem('completedRecord', JSON.stringify(completedRecord))
  }

  // 展示已完成交易记录
  function showCompletedRecord(type) {
    let completedRecord = JSON.parse(localStorage.getItem('completedRecord')||'[]');
    let _completedRecord = [...completedRecord]
    const completeRecordPopup = document.getElementById('completeRecordPopup')
    const completeRecordContent = document.getElementById('completeRecordContent')
    if (type) {
      const keyDate = type === 'month' ? formatDate(new Date(), "YYYY-MM") : formatDate(new Date(), "YYYY-MM-DD")
      _completedRecord = []
      completedRecord.map(c => {
        if (c.time.indexOf(keyDate) === 0) {
          _completedRecord.push(c)
        }
      })
    }
    const _html = `<table style="border-collapse: collapse;">
        ${_completedRecord.map(c => (
          `<tr>
            <td style="width:32vw; text-align: left; border: 1px solid #ddd; padding: 7px;font-size:13px">${c.soldText}</td>
            <td style="width:42vw; text-align: left; border: 1px solid #ddd; padding: 7px;font-size:13px">${c.buyedText}</td>
            <td style="width:26vw; text-align: left; border: 1px solid #ddd; padding: 7px;font-size:13px">${c.time.slice(2)}</td>
          </tr>`
        )).join('')}
      </table>`
    completeRecordContent.innerHTML = _completedRecord.length ? _html : '<b style="margin-top: calc(50vh - 50px); font-size: 18px; display: block;font-weight: normal">暂无记录</b>'
    completeRecordPopup.style.display = 'block'
  }

  // 点击关闭已完成交易记录
  function addEventToCompleteRecord() {
    const totalIncreaseLabel = document.getElementById('totalIncreaseLabel')
    const monthIncreaseLabel = document.getElementById('monthIncreaseLabel')
    const todayIncreaseLabel = document.getElementById('todayIncreaseLabel')
    const completeRecordPopup = document.getElementById('completeRecordPopup')
    // const completeRecordCloseBtn = document.getElementById('completeRecordCloseBtn')
    const lastPriceDom = document.getElementById('_spanLastPrice');
    const toggleBtn = document.getElementById('toggleBtn')
    totalIncreaseLabel.addEventListener('click', () => {
      showCompletedRecord()
      lastPriceDom.style.display = 'none'
      toggleBtn.style.display = 'none'
    })    
    monthIncreaseLabel.addEventListener('click', () => {
      showCompletedRecord('month')
      lastPriceDom.style.display = 'none'
      toggleBtn.style.display = 'none'
    })    
    todayIncreaseLabel.addEventListener('click', () => {
      showCompletedRecord('today')
      lastPriceDom.style.display = 'none'
      toggleBtn.style.display = 'none'
    })    
    // completeRecordCloseBtn.addEventListener('click', () => {
      completeRecordPopup.addEventListener('dblclick', () => {
      completeRecordPopup.style.display = 'none'
      lastPriceDom.style.display = 'block'
      toggleBtn.style.display = 'block'
    })    
  }

  function insertBuyPartToSellPriceInput(plan, price, number) {
    const sellPriceInput = document.getElementById('sellPriceInput')
    sellPriceInput.value = `_${plan.slice(-1)}${price}*${number}(${setNumberOfDigits(totalNumber[plan] * Number(number) / buyedTotalNumber[plan])})=\n` + sellPriceInput.value
    sellPriceInput.dispatchEvent(new Event('change'));
  }

  // 根据value生成对应颜色的html
  function makeSuccessOrDangerHtml(value) {
    return `<b style="color: ${Number(value) > 0 ? SUCCESS_COLOR : DANGER_COLOR}">${setNumberOfDigits(value)}</b>`
  }

  // 根据value生成对应颜色的html
  function setNumberOfDigits(value, pos = 3) {
    return Number(value).toFixed(pos+1).slice(0, -1)
  }

  // 显示/隐藏监听面板
  function toggleShowPanel(showPanel) {
    const lastPriceDom = document.getElementById('_spanLastPrice');
    const monitorMainPanel = document.getElementById('monitorMainPanel');
    if (showPanel) {
      lastPriceDom.style.position = 'fixed';
      monitorMainPanel.style.display = 'block';
    } else {
      lastPriceDom.style.position = 'static';
      monitorMainPanel.style.display = 'none';
    }
  }

  // 购买价格预计的结果
  function previewResult(plan) {
    const winNumber = document.getElementById(`${plan}WinNumber`)
    const buyPriceInput = document.getElementById(`${plan}Input`);
    buyPriceInput.value = localStorage.getItem(`${plan}Input`) || '';
    
    buyPriceInput.addEventListener('change', () => {
      if (!totalMoney[plan] || !buyPriceInput.value) {
        winNumber.innerHTML = ''
      } else {
        const buyPrice = buyPriceInput.value
        const fee = Number(setNumberOfDigits(totalMoney[plan]*FEE_RATE/buyPrice))
        buyedTotalNumber[plan] = Number(setNumberOfDigits(totalMoney[plan]/buyPrice))
        offsetNumber[plan] = Number(setNumberOfDigits(buyedTotalNumber[plan]-totalNumber[plan]-fee))
        winNumber.innerHTML = buyPrice ? `${totalNumber[plan]} + ${fee}(fee) ${offsetNumber[plan] > 0 ? `+ <b style="color:${SUCCESS_COLOR}">${offsetNumber[plan]}</b>` : `- <b style="color:${DANGER_COLOR}">${Math.abs(offsetNumber[plan])}</b>`} = ${buyedTotalNumber[plan]}` : ''
      }
      document.getElementById(`${plan}SellHighInput`).dispatchEvent(new Event('change'));
    })
  }

  // 高价格卖再回购当前低价格买的预计结果
  function previewSellHighResult(plan) {
    const sellHighInput = document.getElementById(`${plan}SellHighInput`)
    const planBSellHighResult = document.getElementById(`${plan}SellHighResult`);
    const buyPriceInput = document.getElementById(`${plan}Input`);
    sellHighInput.value = localStorage.getItem(`${plan}SellHighInput`) || '';
    
    sellHighInput.addEventListener('change', () => {
      const sellHightPrice = Number(sellHighInput.value)
      if (!totalMoney[plan] || !buyPriceInput.value || !sellHightPrice) {
        planBSellHighResult.innerHTML  = ''
      } else {
        const sellHighTotalMoney = Number(setNumberOfDigits(sellHightPrice * (totalNumber[plan] + offsetNumber[plan]) * (1-FEE_RATE)))
        planBSellHighResult.innerHTML = `${setNumberOfDigits(totalMoney[plan])} ${sellHighTotalMoney > totalMoney[plan] ? '+' : '-'} <b style="color: ${sellHighTotalMoney > totalMoney[plan] ? SUCCESS_COLOR : DANGER_COLOR}">${setNumberOfDigits(Math.abs(sellHighTotalMoney-totalMoney[plan]))}(${setNumberOfDigits(Math.abs(sellHighTotalMoney-totalMoney[plan])*(1-FEE_RATE)/Number(buyPriceInput.value))}HC)</b> = ${sellHighTotalMoney}`
      }
      localStorage.setItem(`${plan}SellHighInput`,sellHighInput.value);
    })
  }

  // 价格建议
  function computeSuggestPrice(plan) {
    const suggestPriceListDom = document.getElementById(`${plan}SuggestList`)
    if (!totalNumber[plan] || !totalMoney[plan]) {
      suggestPriceListDom.innerHTML = ''
      return
    }
    const suggestPriceList = []
    for(let i = 0; i < SUGGEST_NUMBER_GROUP.length; i++) {
      const price = setNumberOfDigits(totalMoney[plan]*(1-FEE_RATE)/(totalNumber[plan]*(1+SUGGEST_NUMBER_GROUP[i])))
      suggestPriceList.push(`<b style="color: ${SUGGEST_NUMBER_GROUP[i] < 0 ? WARNING_COLOR : DEFAULT_COLOR}">${price}${SUGGEST_NUMBER_GROUP[i] !== 0 ? `(${SUGGEST_NUMBER_GROUP[i] > 0 ? '+' : ''}${Math.floor(totalNumber[plan]*SUGGEST_NUMBER_GROUP[i])})` : ''}</b>`)
    }
    suggestPriceListDom.innerHTML = `<span style="margin-right: 15px;white-space: nowrap">${suggestPriceList.join('</span><span style="margin-right: 15px;white-space: nowrap">')}</span>`
  }

  // 绑定事件 计时器
  function addEventToCountTimeBox(plan) {
    countTime(plan); // 检查是否默认开启
    const countTimeBox = document.getElementById(`${plan}CountTimeBox`)
    countTimeBox.addEventListener('dblclick', () => {
      if (countTimeBox.innerHTML === COUNT_DEFAULT_TEXT) {
        countTime(plan, 'new')
      } else {
        countTime(plan, 'destroy')
      }
    })    
  }

  // 开启/关闭 计时器
  let countTimeInters = {}
  function countTime(plan, type) {
    const countTimeBox = document.getElementById(`${plan}CountTimeBox`)
    let startDemoTime = Number(localStorage.getItem(`${plan}StartTime`) || 0)
    let lastDuration = ''
    if (type === 'new') {
      startDemoTime = new Date().getTime()
    } else if (type === 'destroy') {
      lastDuration = startDemoTime ? formatTime(new Date().getTime() - startDemoTime) : ''
      startDemoTime = 0
    }
    if (startDemoTime) {
      countTimeInters[plan] = setInterval(() => {
        const duration = startDemoTime ? formatTime(new Date().getTime() - startDemoTime) : ''
        countTimeBox.innerHTML = `<span style="color:${duration > ONE_D ? WARNING_COLOR : DEFAULT_COLOR}">${duration}</span>`
      }, 1000);
    } else {
      countTimeInters[plan] && clearInterval(countTimeInters[plan])
      countTimeBox.innerHTML = COUNT_DEFAULT_TEXT
    }
    localStorage.setItem(`${plan}StartTime`, startDemoTime)
    return lastDuration
  }

  // 格式化时间格式
  function formatTime(time) {
    const all = []
    const hs = Math.floor((time) / ONE_H)
    const ms = Math.floor((time - hs * ONE_H) / ONE_M)
    const ss = Math.floor((time - hs * ONE_H - ms * ONE_M) / ONE_S)

    all.push(`00${hs}`.slice(-3))
    all.push(`0${ms}`.slice(-2))
    all.push(`0${ss}`.slice(-2))

    return all.join(':')
  }

  // 格式化时间格式
  function formatDate(date, format='YYYY-MM-DD hh:mm') {
    const year = date.getFullYear()
    const month = `0${date.getMonth() + 1}`.slice(-2)
    const day = `0${date.getDate()}`.slice(-2)
    const hours = `0${date.getHours()}`.slice(-2)
    const minute = `0${date.getMinutes()}`.slice(-2)
    const seconds = `0${date.getSeconds()}`.slice(-2)
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('hh', hours)
      .replace('mm', minute)
      .replace('ss', seconds)
  }

  // 朗读
  const speakHelper = (function() {
    const speech = new SpeechSynthesisUtterance();
    const SPEAK_TIMES = 3
    let times = 0
    let interval

    function speakTimes() {
      times = 0
      interval && clearInterval(interval)
      interval = setInterval(() => {
        if (!speechSynthesis.paused) return
        times += 1
        if (times > SPEAK_TIMES) {
          clearInterval(interval)
        } else {
          speechSynthesis.resume();
        }
      }, 500)
    }

    // 播放
    function speak(msg) {
      // speech.pitch = 1 // 获取并设置话语的音调(值越大越尖锐,越低越低沉)
      // speech.rate  = 5 // 获取并设置说话的速度(值越大语速越快,越小语速越慢)
      // speech.voice = 10 // 获取并设置说话的声音
      // speech.volume = 1 // 获取并设置说话的音量
      // speech.lang = speechSynthesis.getVoices()[0] // 设置播放语言，测试没效果
      // speech.lang = 'zh-CN'
      // speech.cancel() // 删除队列中所有的语音.如果正在播放,则直接停止
      speech.text = msg // 获取并设置说话时的文本
      speechSynthesis.speak(speech);
      speakTimes();
    }

    // 暂停
    function pause() {
      speechSynthesis.pause()
    }
    // 继续播放
    function resume() {
      speechSynthesis.resume()
    }

    // 取消播放
    function cancel() {
      speechSynthesis.cancel()
    }

    return {
      speak,
      pause,
      resume,
      cancel
    }
  })()
})();
