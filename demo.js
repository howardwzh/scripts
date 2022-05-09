(function () {
  if (!document.getElementById('_spanLastPrice')) return;
  const FIRST_DATE_TIME = new Date('2022/2/22').getTime() // Starting time
  const ALL_PLANS = ['planA', 'planB', 'planS', 'planV'] // can add more
  const AUTO_SIGN = 'V'
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
      addEventToCopyNumber(ALL_PLANS[i]);
    }
    // global
    checkAllSellPrices();
    setTotalDays();
    pushPriceToHistory();
    addEventToClosePanel();
    addEventToCompleteRecord();
    toggleContenteditable('prayerToGod', '🙏🍀定价与等待的艺术🍀🙏');
    toggleContenteditable('monitorRemark');
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
          padding: 80px 20px 20px;
          text-align: center;
          font-size: 14px;
          font-family: Arial;
          overflow: auto;
          -webkit-text-size-adjust: 100%;
          "
        >
          <div id="monitorHistory" style="font-size: 14px; text-align: left; position: absolute; top: 16px; line-height: 20px"></div>
          <div><textarea style="width: 100%;font-size: 14px;vertical-align: top;font-family: Arial;font-weight: 400;" rows="7" id="sellPriceInput"></textarea></div>
          ${ALL_PLANS.map((plan) => {
      return `
                <div style="margin:10px 0 0">
                  <div style="text-align: left">${plan.slice(-1)}<b id="${plan}TotalBox" style="margin-left: 12px; color: ${INFO_COLOR}"></b><b id="${plan}SuggestList" style="margin-left: 12px"></b></div>
                  <div style="display: flex">
                    <input placeholder="buy low" style="width: 100%; min-height: 26px;height: 26px;font-family: Arial;font-size: 14px;font-weight: 400;" type="text" id="${plan}Input"/>
                    <input placeholder="part" style="width: 60px; min-height: 26px;height: 26px;font-family: Arial;font-size: 14px;font-weight: 400;" type="text" id="${plan}PartInput"/>
                    <input placeholder="sell high" style="width: 100%; min-height: 26px;height: 26px;font-family: Arial;font-size: 14px;font-weight: 400;" type="text" id="${plan}SellHighInput"/>
                    <span id="${plan}CountTimeBox" style="display: flex;flex-direction: column;justify-content: center;padding-left: 10px; white-space: nowrap; font-weight: 700;color:${DEFAULT_COLOR}">${COUNT_DEFAULT_TEXT}</span>
                    <button id="${plan}DoneBtn" style="white-space: nowrap; margin-left: 10px; border-radius: 3px;">完成</button>
                  </div>
                  <p style="margin:4px 0 0;text-align: left" id="${plan}WinNumber"></p>
                  <p style="margin: 0;text-align: left" id="${plan}SellHighResult"></p>
                </div>
              `
    }).join('')
      }
          <p>
            <span id="totalIncreaseBox" style="user-select: none;display: inline-block; width: 32%"><span id="totalIncreaseLabel"><span id="totalDaysBox"></span>日:</span> <b id="totalIncrease">0</b></span>
            <span id="monthIncreaseBox" style="user-select: none;display: inline-block; width: 32%"><span id="monthIncreaseLabel">本月:</span> <b id="monthIncrease">0</b></span>
            <span id="todayIncreaseBox" style="user-select: none;display: inline-block; width: 32%"><span id="todayIncreaseLabel">今日:</span> <b id="todayIncrease">0</b></span>
          </p>
          <div id="prayerToGod"></div>
          <div id="monitorRemark" style="user-select: none;padding: 0; text-align: left; margin-top: 20px;">备注</div>
          <div id="completeRecordPopup" style="box-sizing: border-box; display: none; position: absolute; width: 100%; height: 100%; top: 0; left: 0; background-color: #fff">
            <div id="completeRecordContent" style="padding: 12px;overflow: auto; height: 100%"></div>
            <button id="completeRecordCloseBtn" style="display: none;position: absolute; width: 28px; height: 28px; line-height: 28px; right: 10px; top: 10px; font-size: 28px; text-align: center; padding: 0; background-color: rgba(0,0,0,.3); color: #fff; border: none; border-radius: 14px;">×</button>
          </div>
        </div>
        <button id="toggleBtn" style="position: fixed; z-index: 7777777; width: 54px; height: 54px; opacity: 0.2; top: 82px; right: 20px; font-size: 14px; padding: 7px 14px;background-color:#eef05b;border:none"></button>
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
      right:20px;
      top: 40px;
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
    totalDaysBox.innerText = Math.ceil((nowTime - firstTime) / ONE_D)
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
    for (let i = 0; i < historyList.length; i++) {
      const offset = i > 0 ? Math.round((historyList[i] - historyList[i - 1]) * 1000) / 1000 : 0
      const criticalValue = i > 0 ? Math.min(historyList[i], historyList[i - 1]) / 100 : 999999
      result += `
        ${i > 0 ? `<span style="background-color: ${Math.abs(offset) < criticalValue ? INFO_COLOR : WARNING_COLOR};margin: 0 7px; border-radius: 3px; color: #fff; font-size: 12px; padding: 0 2px;">${offset}</span>` : ''}
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
      }).sort((a, b) => {
        const aMatch = a.match(/^(#)?(-|_)?([a-zA-Z])?([0-9.]+)/)
        const bMatch = b.match(/^(#)?(-|_)?([a-zA-Z])?([0-9.]+)/)
        const aHaveHash = aMatch[1] ? 1 : 0
        const bHaveHash = bMatch[1] ? 1 : 0
        const aPlan = (aMatch[3] || AUTO_SIGN).toUpperCase()
        const bPlan = (bMatch[3] || AUTO_SIGN).toUpperCase()
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
        soldRecord[ALL_PLANS[x]] = ''
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
        document.getElementById(`${ALL_PLANS[y]}TotalBox`).innerText = totalMoney[ALL_PLANS[y]] ? `${setNumberOfDigits(totalMoney[ALL_PLANS[y]])} | ${setNumberOfDigits(totalNumber[ALL_PLANS[y]])}` : ''
        computeSuggestPrice(ALL_PLANS[y])
        document.getElementById(`${ALL_PLANS[y]}Input`).dispatchEvent(new Event('change'));
        hasSold = hasSold || !!totalMoney[ALL_PLANS[y]]
      }
      if (hasSold) {
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
    sellPrice.replace(/^(#)?(-)?([a-zA-Z])?([0-9.]+)\*?([0-9.]+)?(\([0-9.]+\))?(\+?-?[0-9\.]+)?(=?)/, (all, hash, buySign, whatPlan, price, number = 10, buyPartSource, extraMoney = 0, equalSign) => {
      const plan = `plan${(whatPlan || AUTO_SIGN).toUpperCase()}`
      const needCount = price && number && (equalSign || lastPrice >= price)
      const _buyPartSource = buyPartSource ? Number(buyPartSource.slice(1, -1)) : buyPartSource
      const sign = buySign ? 0 : 1
      result = `${hash || ''}${buySign || ''}${plan.slice(-1)}${setNumberOfDigits(price)}*${number}${buyPartSource || ''}${extraMoney || ''}`
      if (needCount) {
        const lumpSum = price * number * (1 - sign * FEE_RATE) + Number(extraMoney)
        result += `=${setNumberOfDigits(lumpSum)}`
        if (!hash) {
          const _number = buySign === '-' ? _buyPartSource : number
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
      const buyPrice = Number(buyPriceInput.value || 0);
      localStorage.setItem(`${plan}Input`, buyPrice || '');

      if (!buyPrice || lastPrice > buyPrice) {
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
  }

  // 打开/关闭 面板
  function addEventToClosePanel() {
    let showPanel = true;
    document.getElementById('toggleBtn').addEventListener('dblclick', () => {
      showPanel = !showPanel;
      toggleShowPanel(showPanel);
    });
  }

  // 监听 总计/本月/今日 新增
  function addEventToIncrease(increaseScope, nowDate) {
    const lastDate = localStorage.getItem(`${increaseScope}LastDate`);
    const increase = document.getElementById(`${increaseScope}`);
    toggleContenteditable(increaseScope)
    if (nowDate !== lastDate) {
      increase.innerText = 0
      localStorage.setItem(increaseScope, 0);
      localStorage.setItem(`${increaseScope}LastDate`, nowDate);
    } else {
      increase.innerText = setNumberOfDigits(localStorage.getItem(increaseScope) || 0)
      setSuccessOrDangerStyleToDom(increase);
    }
  }

  // 切换dom contenteditable
  function toggleContenteditable(ids, placeholder = '') {
    const _ids = typeof ids === 'string' ? [ids] : ids
    for(let i = 0; i < _ids.length; i++) {
      const id = _ids[i]
      const dom = document.getElementById(id);
      dom.innerText = localStorage.getItem(id) || placeholder;
      dom.addEventListener('dblclick', () => {
        dom.setAttribute('contenteditable', true)
        dom.style.border = "1px solid #aaa"
        dom.style.padding = "5px"
        dom.style.borderRadius = "3px"
        setTimeout(() => dom.focus(), 300)
      })
      dom.addEventListener('blur', () => {
        dom.setAttribute('contenteditable', false)
        localStorage.setItem(id, dom.innerText);
        dom.style.border = "none"
        dom.style.padding = "initial"
      })
    }
  }

  // 监听 完成
  function addEventToConfirmDoneBtn(plan) {
    const confirmDoneBtn = document.getElementById(`${plan}DoneBtn`);
    const buyPriceInput = document.getElementById(`${plan}Input`);
    const buyPartInput = document.getElementById(`${plan}PartInput`);


    confirmDoneBtn.addEventListener('dblclick', () => {
      const _offsetNumber = (buyPartInput.value ? buyPartInput.value / buyedTotalNumber[plan] : 1) * offsetNumber[plan]
      if (!buyPriceInput.value || !_offsetNumber) return
      const duration = document.getElementById(`${plan}CountTimeBox`).innerText
      updateIncreaseNumber(_offsetNumber)
      localStorage.setItem(`${plan}Input`, '');
      if (buyPartInput.value) {
        const sourceNumber = totalNumber[plan] * buyPartInput.value / buyedTotalNumber[plan]
        addCompletedRecord(
          'part', 
          buyPriceInput.value,
           /^[0-9:]+$/.test(duration) ? duration : '',
          {
            totalMoney: buyPriceInput.value * buyPartInput.value,
            totalNumber: sourceNumber,
            offsetNumber: _offsetNumber,
            buyPrice: buyPriceInput.value
           }
          )
        insertBuyPartToSellPriceInput(plan, buyPriceInput.value, buyPartInput.value)
        buyPartInput.value = '';
      } else {
        addCompletedRecord(plan, buyPriceInput.value, /^[0-9:]+$/.test(duration) ? duration : '')
        countTime(plan, 'destroy');
      }
      buyPriceInput.value = '';
      document.getElementById(`${plan}Input`).dispatchEvent(new Event('change'));
    })
  }

  // 更新总计的数量
  function updateIncreaseNumber (offsetNumber, nowStr) {
    const monthStr = formatDate(new Date(), "YYYY-MM")
    const todayStr = formatDate(new Date(), "YYYY-MM-DD")
    const totalIncrease = document.getElementById('totalIncrease');
    const monthIncrease = document.getElementById('monthIncrease');
    const todayIncrease = document.getElementById('todayIncrease');
    const oldTotalIncreaseNumber = localStorage.getItem('totalIncrease');
    const oldMonthIncreaseNumber = localStorage.getItem('monthIncrease');
    const oldTodayIncreaseNumber = localStorage.getItem('todayIncrease');
    const totalIncreaseNumber = Number(oldTotalIncreaseNumber) + offsetNumber
    const monthIncreaseNumber = Number(oldMonthIncreaseNumber) + ((!nowStr || nowStr.indexOf(monthStr) === 0) ? offsetNumber : 0)
    const todayIncreaseNumber = Number(oldTodayIncreaseNumber) + ((!nowStr || nowStr.indexOf(todayStr) === 0) ? offsetNumber : 0)
    totalIncrease.innerText = setNumberOfDigits(totalIncreaseNumber)
    monthIncrease.innerText = setNumberOfDigits(monthIncreaseNumber)
    todayIncrease.innerText = setNumberOfDigits(todayIncreaseNumber)
    setSuccessOrDangerStyleToDom(totalIncrease);
    setSuccessOrDangerStyleToDom(monthIncrease);
    setSuccessOrDangerStyleToDom(todayIncrease);
    localStorage.setItem('totalIncrease', totalIncreaseNumber);
    localStorage.setItem('monthIncrease', monthIncreaseNumber);
    localStorage.setItem('todayIncrease', todayIncreaseNumber);
  }

  // 监听复制数量
  function addEventToCopyNumber(plan) {
    const buyWinNumber = document.getElementById(`${plan}WinNumber`);
    buyWinNumber.addEventListener('click', e => {
      if (e.target.className === 'copyMe') {
        const copyText = e.target.innerText;
        navigator.clipboard.writeText(copyText);

        e.target.style.border = `1px solid ${SUCCESS_COLOR}`
        setTimeout(() => {
          e.target.style.border = `1px solid transparent`
        }, 1000)
      }
    })
  }

  // 追加交易完成记录
  function addCompletedRecord(plan, buyPrice, duration, buyedInfo) {
    const completedRecord = JSON.parse(localStorage.getItem('completedRecord') || '[]');
    if (plan === 'part') {
      completedRecord.push({
        soldText: 'buy part',
        time: `${formatDate(new Date())}<br/>${duration}`,
        buyedInfo
      })
    } else {
      completedRecord.push({
        soldText: soldRecord[plan],
        time: `${formatDate(new Date())}<br/>${duration}`,
        buyedInfo: {
          totalMoney: totalMoney[plan],
          totalNumber: totalNumber[plan],
          offsetNumber: offsetNumber[plan],
          buyPrice
        },
      })
    }
    localStorage.setItem('completedRecord', JSON.stringify(completedRecord))
  }

  // makeBuyerText
  function makeBuyerText({totalMoney, totalNumber, offsetNumber, buyPrice}) {
    return `${setNumberOfDigits(totalMoney)} / ${buyPrice}<br/>${setNumberOfDigits(totalNumber)}${makePositiveOrNegative(offsetNumber)}`
  }

  // 生成正负数值html
  function makePositiveOrNegative(number, bigFontSize, smallFontSize, unit) {
    return number > 0 ? `<b style="color:${SUCCESS_COLOR}"> + ${makeBiggerInteger(setNumberOfDigits(number), bigFontSize, smallFontSize)}</b>` : `<b style="color:${DANGER_COLOR}"> - ${makeBiggerInteger(Math.abs(setNumberOfDigits(number)), bigFontSize, smallFontSize)}${unit||''}</b>`
  }

  // makeBiggerInteger
  function makeBiggerInteger(number, bigFontSize = '20px', smallFontSize = '13px') { 
    const [integer,  decimal] = setNumberOfDigits(number).split('.')
    return `<span style="font-size: ${bigFontSize}">${integer}</span>.<span style="font-size: ${smallFontSize}">${decimal}</span>`
   }

  // 展示已完成交易记录
  function showCompletedRecord(type = 'total') {
    const completedRecord = JSON.parse(localStorage.getItem('completedRecord') || '[]').reverse();
    const keyDate = type === 'total' ? '' : formatDate(new Date(), (type === 'month' ? "YYYY-MM" : "YYYY-MM-DD"))
    const completeRecordPopup = document.getElementById('completeRecordPopup')
    const completeRecordContent = document.getElementById('completeRecordContent')
    const increaseGroup = {
      total: localStorage.getItem('totalIncrease'),
      month: localStorage.getItem('monthIncrease'),
      today: localStorage.getItem('todayIncrease'),
    }
    const _html = `<div style="padding-top: 48px">
      <h5 id="recordTitleDom" style="position: fixed;width: 100%;background: #fff;top: 0;margin: 0;padding: 10px 0;left: 0;border-bottom: 2px solid #ccc" data-type="${type}">${makePositiveOrNegative(increaseGroup[type])}</h5>
      <table id="completedRecordDom" style="border-collapse: collapse;">
        ${completedRecord.map((c, i) => {
          return (!keyDate || c.time.indexOf(keyDate) === 0) ? (
            `<tr>
              <td style="width:40vw; text-align: left; border: 1px solid #ddd; padding: 7px;font-size:13px">${c.soldText}</td>
              <td style="width:40vw; text-align: left; border: 1px solid #ddd; padding: 7px;font-size:13px">${c.buyedInfo ? makeBuyerText(c.buyedInfo) : c.buyedText}</td>
              <td style="width:20vw; text-align: left; border: 1px solid #ddd; padding: 7px;font-size:13px" class="date-td">${c.time.slice(2)}<b class="delete-btn" style="display: none; color:${DANGER_COLOR};font-weight:normal" data-index="${i}">删除</b></td>
            </tr>`
          ) : ''
        }).join('')}
      </table>
    </div>`
    completeRecordContent.innerHTML = completedRecord.length ? _html : '<b style="margin-top: calc(50vh - 50px); font-size: 18px; display: block;font-weight: normal">暂无记录</b>'
    completeRecordPopup.style.display = 'block'

    const completedRecordDom = document.getElementById('completedRecordDom')
    const allDeleteBtns = document.getElementsByClassName('date-td')
    completedRecordDom.addEventListener('click', (e) => {
      for (const btn of allDeleteBtns) {
        btn.getElementsByClassName('delete-btn')[0].style.display = 'none';
      }
      const dateDom = e.target.className === 'date-td' ? e.target : ''
      if (!dateDom) return
      const deleteBtn = dateDom.getElementsByClassName('delete-btn')[0]
      deleteBtn.style.display = "block"
      deleteBtn.removeEventListener('click', deleteItem)
      deleteBtn.addEventListener('click', deleteItem)
    })

    function deleteItem(e) {
      const result = confirm('删除无法恢复，是否继续！')
      if (!result) return
      const recordTitleDom = document.getElementById('recordTitleDom')
      const index = e.target.dataset.index
      const newCompletedRecord = []
      completedRecord[index].deleted = true
      for(let i = 0; i < completedRecord.length; i++) {
        if (!completedRecord[i].deleted) {
          newCompletedRecord.push(completedRecord[i])
        }
      }
      localStorage.setItem('completedRecord', JSON.stringify(newCompletedRecord.reverse()))
      e.target.parentElement.parentElement.style.display = "none"
      // 更新总计
      updateIncreaseNumber(
        -1 * completedRecord[index].buyedInfo.offsetNumber,
        completedRecord[index].time.split(' ')[0]
      )
      const increaseGroup = {
        total: localStorage.getItem('totalIncrease'),
        month: localStorage.getItem('monthIncrease'),
        today: localStorage.getItem('todayIncrease'),
      }
      recordTitleDom.innerHTML = makePositiveOrNegative(increaseGroup[recordTitleDom.dataset.type])
    }
  }

  // 点击关闭已完成交易记录
  function addEventToCompleteRecord() {
    const totalIncreaseLabel = document.getElementById('totalIncreaseLabel')
    const monthIncreaseLabel = document.getElementById('monthIncreaseLabel')
    const todayIncreaseLabel = document.getElementById('todayIncreaseLabel')
    const completeRecordPopup = document.getElementById('completeRecordPopup')
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
    completeRecordPopup.addEventListener('dblclick', () => {
      completeRecordPopup.style.display = 'none'
      lastPriceDom.style.display = 'block'
      toggleBtn.style.display = 'block'
    })
  }

  function insertBuyPartToSellPriceInput(plan, price, number) {
    const sellPriceInput = document.getElementById('sellPriceInput')
    const buyPartStr = `-${plan.slice(-1)}${price}*${number}(${setNumberOfDigits(totalNumber[plan] * Number(number) / buyedTotalNumber[plan])})`
    sellPriceInput.value = `${buyPartStr}=\n` + sellPriceInput.value
    sellPriceInput.dispatchEvent(new Event('change'));
  }

  // 根据value生成对应颜色的html
  function setSuccessOrDangerStyleToDom(dom) {
    dom.setAttribute('style',`color: ${Number(dom.innerText) > 0 ? SUCCESS_COLOR : DANGER_COLOR}`)
  }

  // 根据value生成对应颜色的html
  function setNumberOfDigits(value, pos = 3) {
    return Number(value).toFixed(pos + 1).slice(0, -1)
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
        const fee = Number(totalMoney[plan] * FEE_RATE / buyPrice)
        buyedTotalNumber[plan] = Number(totalMoney[plan] / buyPrice)
        offsetNumber[plan] = Number(buyedTotalNumber[plan] - totalNumber[plan] - fee)
        winNumber.innerHTML = buyPrice ? `${setNumberOfDigits(totalNumber[plan])} + ${setNumberOfDigits(fee)}(fee) ${makePositiveOrNegative(setNumberOfDigits(offsetNumber[plan]), '18px')} = <span class="copyMe">${setNumberOfDigits(buyedTotalNumber[plan])}</span>` : ''
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
        planBSellHighResult.innerHTML = ''
      } else {
        const sellHighTotalMoney = Number(setNumberOfDigits(sellHightPrice * (totalNumber[plan] + offsetNumber[plan]) * (1 - FEE_RATE)))
        planBSellHighResult.innerHTML = `${setNumberOfDigits(totalMoney[plan])} ${makePositiveOrNegative(sellHighTotalMoney - totalMoney[plan], '18px', '13px')}(${makePositiveOrNegative((sellHighTotalMoney - totalMoney[plan]) * (1 - FEE_RATE) / Number(buyPriceInput.value), '18px', '13px', 'HC')})</b> = ${sellHighTotalMoney}`
      }
      localStorage.setItem(`${plan}SellHighInput`, sellHighInput.value);
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
    for (let i = 0; i < SUGGEST_NUMBER_GROUP.length; i++) {
      const price = setNumberOfDigits(totalMoney[plan] * (1 - FEE_RATE) / (totalNumber[plan] * (1 + SUGGEST_NUMBER_GROUP[i])))
      suggestPriceList.push(`<b style="color: ${SUGGEST_NUMBER_GROUP[i] < 0 ? WARNING_COLOR : DEFAULT_COLOR}">${price}${SUGGEST_NUMBER_GROUP[i] !== 0 ? `(${SUGGEST_NUMBER_GROUP[i] > 0 ? '+' : ''}${Math.floor(totalNumber[plan] * SUGGEST_NUMBER_GROUP[i])})` : ''}</b>`)
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
    if (type === 'new') {
      startDemoTime = new Date().getTime()
    } else if (type === 'destroy') {
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
  function formatDate(date, format = 'YYYY-MM-DD hh:mm') {
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
  const speakHelper = (function () {
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
