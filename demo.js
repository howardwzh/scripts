(function(){
  if (!document.getElementById('_spanLastPrice')) return;
  let totalNumber = 0
  let totalMoney = 0
  const FEE_RATE = 0.0025
  const DEFAULT_COLOR = '#333'
  const INFO_COLOR = '#909399'
  const SUCCESS_COLOR = '#5384ec'
  const DANGER_COLOR = '#d85140'
  const WARNING_COLOR = '#E6A23C'
  const COUNT_DEFAULT_TEXT = "开始计时"
  let offsetNumber = 0

  addMainPanel();
  fixedLastPriceDom();
  setTimeout(() => {
    pushPriceToHistory();
    checkAllSellPrices();
    checkBuyPrice();
    addEventToClosePanel();
    addEventToEditRemark();
    computeSuggestPrice();
    addEventToCountTimeBox();
    addEventToIncrease('totalIncrease', 'saveForever')
    addEventToIncrease('todayIncrease', `${new Date().getDate()}`)
    addEventToIncrease('monthIncrease', `${new Date().getMonth()}`)
    addEventToConfirmDoneBtn();
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
          padding: 137px 27px;
          text-align: center;
          font-size: 14px;
          font-family: Arial;
          "
        >
          <div id="monitorHistory" style="font-size: 14px; text-align: left; position: absolute; top: 27px;"></div>
          <p style="margin:16px 0 0"><label><span>SellPrices</span><textarea style="width: 100%;min-height: 77px;font-size: 14px;vertical-align: top;font-family: Arial;font-weight: 400;" rows="5" id="sellPriceInput"></textarea></label></p>
          <p style="margin:4px 0 0"><label>Total Number：<b id="totalNumberBox" style="margin-right: 24px"></b>Total Money：<b id="totalMoneyBox"></b></label></p>
          <p style="margin:54px 0 0">
            <span>BuyPrice</span>
            <div style="display: flex">
              <input style="width: 100%; min-height: 28px;font-family: Arial;font-size: 14px;font-weight: 400;" type="text" id="buyPriceInput"/>
              <button id="confirmDoneBtn" style="white-space: nowrap; margin-left: 10px; border-radius: 3px;">完成</button>
              <span id="countTimeBox" style="display: flex;flex-direction: column;justify-content: center;padding-left: 10px; white-space: nowrap; font-weight: 700;color:${DEFAULT_COLOR}">${COUNT_DEFAULT_TEXT}</span>
            </div>
          </p>
          <p style="margin:4px 0 0" id="winNumber"></p>
          <p id="suggestPriceListDom" style="word-break: break-all;text-align: left;"></p>
          <p>
            <span id="totalIncreaseBox" style="display: inline-block; width: 32%">总计：<b id="totalIncrease">0</b><input id="totalIncreaseInput" style="display: none; width: 50px;font-size: 14px;" type="text" /></span>
            <span id="monthIncreaseBox" style="display: inline-block; width: 32%">本月：<b id="monthIncrease">0</b><input id="monthIncreaseInput" style="display: none; width: 50px;font-size: 14px;" type="text" /></span>
            <span id="todayIncreaseBox" style="display: inline-block; width: 32%">今日：<b id="todayIncrease">0</b><input id="todayIncreaseInput" style="display: none; width: 50px;font-size: 14px;" type="text" /></span>
          </p>
          <p id="debugMsg"></p>
          <div id="monitorRemark" style="padding: 12px 0; text-align: left;">备注</div>
          <textarea id="monitorRemarkTextarea" style="display: none;font-size: 14px; width: 100%;" rows="5"></textarea>
        </div>
        <button id="toggleBtn" style="position: fixed; z-index: 7777777; width: 54px; height: 54px; opacity: 0.2; top: 289px; left: 50%; margin-left: -27px; font-size: 14px; padding: 7px 14px;background-color:#eef05b;border:none"></button>
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
      left:27px;
      top: 97px;
      background-color:#777;
      padding: 2px 7px;
      border-radius: 3px;
    `);
  };

  // 不同价格历史记录
  function pushPriceToHistory() {
    const lastPriceDom = document.getElementById('_spanLastPrice');
    const monitorHistory = document.getElementById('monitorHistory');
    let historyList = JSON.parse(localStorage.getItem('monitorHistory') || '[]');
    monitorHistory.innerHTML = makeHistoryHtml(historyList);
    setInterval(() => {
      const lastPrice = lastPriceDom.innerText;
      if (lastPrice !== historyList[historyList.length - 1]) {
        historyList.push(lastPrice);
        historyList = historyList.slice(-10);
        monitorHistory.innerHTML = makeHistoryHtml(historyList);
        localStorage.setItem('monitorHistory', JSON.stringify(historyList));
        speakHelper.speak(lastPrice)
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
    setInterval(() => {
      if (sellPriceInput === document.activeElement) return
      const lastPrice = Number(document.getElementById('_spanLastPrice').innerText);
      const sellPrices = sellPriceInput.value.split('\n')
      totalNumber = 0
      totalMoney = 0
      for (let i = 0; i < sellPrices.length; i++) {
        sellPrices[i] = checkSellPrice(sellPrices[i], lastPrice)
      }
      if(totalNumber) {
        setStatusColor(sellPriceInput, 'success');
      } else {
        setStatusColor(sellPriceInput, 'none');
      }
      document.getElementById('totalNumberBox').innerText = totalNumber.toFixed(4).slice(0, -1)
      document.getElementById('totalMoneyBox').innerText = totalMoney.toFixed(4).slice(0, -1)
      sellPriceInput.value = sellPrices.join('\n')
      localStorage.setItem('sellPriceInput', sellPriceInput.value);
    }, 1000);
  };

  // 检查卖出价格
  function checkSellPrice(sellPrice, lastPrice) {
    const [price, other=''] = sellPrice.split('*')
    const [number] = other.split("=")
    const needCount = /^[^#].+=/.test(sellPrice)
    let result = sellPrice
    if (number && (needCount || lastPrice >= price)) {
      const lumpSum = (price*number*(1-FEE_RATE)).toFixed(4).slice(0, -1)
      totalNumber += Number(number)
      totalMoney += Number(lumpSum)
      result = `${price}*${number}=${lumpSum} (Fee removed)`
    }
    return result
  };

  // 检查买入价格
  function checkBuyPrice() {
    const lastPriceDom = document.getElementById('_spanLastPrice');
    const buyPriceInput = document.getElementById('buyPriceInput');
    buyPriceInput.value = localStorage.getItem('buyPriceInput');
    setInterval(() => {
      const lastPrice = Number(lastPriceDom.innerText);
      const buyPrice = Number(buyPriceInput.value||0);
      localStorage.setItem('buyPriceInput', buyPrice || '');
      
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
    showDebugMsg(`🙏🍀💰财富自由💰🍀🙏`);
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
  function addEventToConfirmDoneBtn() {
    const confirmDoneBtn = document.getElementById('confirmDoneBtn');
    const totalIncrease = document.getElementById('totalIncrease');
    const monthIncrease = document.getElementById('monthIncrease');
    const todayIncrease = document.getElementById('todayIncrease');
    const buyPriceInput = document.getElementById('buyPriceInput')

    confirmDoneBtn.addEventListener('dblclick', () => {
      if (!buyPriceInput.value) return
      const totalIncreaseValue = Number(totalIncrease.innerText) + offsetNumber
      const monthIncreaseValue = Number(monthIncrease.innerText) + offsetNumber
      const todayIncreaseValue = Number(todayIncrease.innerText) + offsetNumber
      totalIncrease.innerHTML = makeSuccessOrDangerHtml(totalIncreaseValue);
      monthIncrease.innerHTML = makeSuccessOrDangerHtml(monthIncreaseValue);
      todayIncrease.innerHTML = makeSuccessOrDangerHtml(todayIncreaseValue);
      localStorage.setItem('totalIncrease', totalIncrease.innerText);
      localStorage.setItem('monthIncrease', monthIncrease.innerText);
      localStorage.setItem('todayIncrease', todayIncrease.innerText);
      buyPriceInput.value = '';
      localStorage.setItem('buyPriceInput', '');
      countTime('destroy');
    })    
  }

  // 根据value生成对应颜色的html
  function makeSuccessOrDangerHtml(value) {
    return `<b style="color: ${Number(value) > 0 ? SUCCESS_COLOR : DANGER_COLOR}">${Number(value).toFixed(4).slice(0, -1)}</b>`
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

  // 价格建议
  const WIN_NUMBER_GROUP = [1,10,50,100]
  function computeSuggestPrice() {
    const winNumber = document.getElementById('winNumber')
    const suggestPriceListDom = document.getElementById('suggestPriceListDom')
    setInterval(() => {
      const buyPrice = Number(localStorage.getItem('buyPriceInput')||0);
      if (!totalNumber || !totalMoney) {
        suggestPriceListDom.innerHTML = ''
        winNumber.innerHTML = ''
        return
      }
      const suggestPriceList = []
      for(let i = 0; i < WIN_NUMBER_GROUP.length; i++) {
        const price = (totalMoney*(1-FEE_RATE)/(totalNumber+WIN_NUMBER_GROUP[i])).toFixed(4).slice(0, -1)
        suggestPriceList.push(`${price}(+${WIN_NUMBER_GROUP[i]})`)
      }
      suggestPriceListDom.innerHTML = `<span style="margin-right: 15px;white-space: nowrap">${suggestPriceList.join('</span><span style="margin-right: 15px;white-space: nowrap">')}</span>`
      const buyedTotalNumber = Number((totalMoney/buyPrice).toFixed(4).slice(0, -1))
      const fee = Number((totalMoney*FEE_RATE/buyPrice).toFixed(4).slice(0, -1))
      offsetNumber = Number((buyedTotalNumber-totalNumber-fee).toFixed(4).slice(0, -1))
      winNumber.innerHTML = buyPrice ? `${totalNumber} + ${fee}(fee) ${offsetNumber > 0 ? `+ <b style="color:${SUCCESS_COLOR}">${offsetNumber}</b>` : `- <b style="color:${DANGER_COLOR}">${Math.abs(offsetNumber)}</b>`} = ${buyedTotalNumber}` : ''
    }, 1000);
  }

  // 绑定事件 计时器
  function addEventToCountTimeBox() {
    countTime(); // 检查是否默认开启
    const countTimeBox = document.getElementById('countTimeBox')
    countTimeBox.addEventListener('dblclick', () => {
      if (countTimeBox.innerHTML === COUNT_DEFAULT_TEXT) {
        countTime('new')
      } else {
        countTime('destroy')
      }
    })    
  }

  // 开启/关闭 计时器
  const ONE_S = 1000
  const ONE_M = 60 * ONE_S
  const ONE_H = 60 * ONE_M
  const WARNING_HOURS = 24
  let countTimeInter
  function countTime(type) {
    const countTimeBox = document.getElementById('countTimeBox')
    let startDemoTime = Number(localStorage.getItem('startDemoTime') || 0)
    let durationTime = 0
    if (type === 'new') {
      startDemoTime = new Date().getTime()
    } else if (type === 'destroy') {
      startDemoTime = 0
    }
    if (startDemoTime) {
      countTimeInter = setInterval(() => {
        durationTime = new Date().getTime() - startDemoTime
        countTimeBox.innerHTML = `<span style="color:${durationTime > WARNING_HOURS * ONE_H ? WARNING_COLOR : DEFAULT_COLOR}">${formatTime(durationTime)}</span>`
      }, 1000);
    } else {
      countTimeInter && clearInterval(countTimeInter)
      countTimeBox.innerHTML = COUNT_DEFAULT_TEXT
    }
    localStorage.setItem('startDemoTime', startDemoTime)
  }

  // 格式化时间格式
  function formatTime(time) {
    const all = []
    const hs = Math.floor((time) / ONE_H)
    const ms = Math.floor((time - hs * ONE_H) / ONE_M)
    const ss = Math.floor((time - hs * ONE_H - ms * ONE_M) / ONE_S)

    all.push(`0${hs}`.slice(-2))
    all.push(`0${ms}`.slice(-2))
    all.push(`0${ss}`.slice(-2))

    return all.join(':')
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
