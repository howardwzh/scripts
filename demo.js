(function(){
  if (!document.getElementById('_spanLastPrice')) return;

  addMainPanel();
  fixedLastPriceDom();
  setTimeout(() => {
    pushPriceToHistory();
    checkSellPrice();
    checkBuyPrice();
    addEventToClosePanel();
    addEventToEditRemark();
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
          z-index:777777;
          padding: 88px 27px;
          text-align: center;
          font-size: 14px;
          "
        >
          <div id="monitorHistory" style="font-size: 14px; text-align: left;"></div>
          <p id="sellPriceItem"><label>Sell: <input type="text" id="sellPriceInput"/></label></p>
          <p id="buyPriceItem"><label>Buy: <input type="text" id="buyPriceInput"/></label></p>
          <p id="debugMsg"></p>
          <div id="monitorRemark" style="padding: 12px 0; text-align: left;">备注</div>
          <textarea id="monitorEditRemark" style="display: none;font-size: 14px; width: 100%;" rows="5"></textarea>
        </div>
        <button id="toggleBtn" style="position: fixed; z-index: 7777777; width: 77px; height: 77px; opacity: 0; bottom: 77px; right: 27px; font-size: 14px; padding: 7px 14px;">开关</button>
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
      top:27px;
      background-color:#777;
      padding: 2px 7px;
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
      if (lastPrice !== historyList[0]) {
        historyList.unshift(lastPrice);
        historyList = historyList.slice(0,10);
        monitorHistory.innerHTML = makeHistoryHtml(historyList);
        localStorage.setItem('monitorHistory', JSON.stringify(historyList));
      }
    }, 1000);
  };

  // 拼接历史记录html
  function makeHistoryHtml(historyList) {
    let result = '<div style="font-size: 14px;">'
    for(let i = 1; i < historyList.length; i++) {
      const offset = Math.round((historyList[i] - historyList[i-1]) * 1000) / 1000
      result += `
        <span style="background-color: ${ Math.abs(offset) < 0.5 ? '#909399' : '#E6A23C'}; color: #fff; font-size: 12px; padding: 0 2px;">${offset.toFixed(3)}</span>
        <span style="margin: 0 7px;">${historyList[i]}</span>
      `
    }
    result += '</div>'
    return result
  }

  // 检查卖出价格
  function checkSellPrice() {
    const lastPriceDom = document.getElementById('_spanLastPrice');
    const sellPriceInput = document.getElementById('sellPriceInput');
    sellPriceInput.value = localStorage.getItem('sellPriceInput');
    setInterval(() => {
      const lastPrice = Number(lastPriceDom.innerText);
      const sellPrice = Number(sellPriceInput.value||0);
      localStorage.setItem('sellPriceInput', sellPrice);
      
      if (!sellPrice || lastPrice < sellPrice) {
        setStatusColor(sellPriceInput, 'none');
      } else if (lastPrice >= sellPrice + 0.5) {
        setStatusColor(sellPriceInput, 'danger');
      } else if (lastPrice >= sellPrice) {
        setStatusColor(sellPriceInput, 'success');
      }
    }, 1000);
  };

  // 检查买入价格
  function checkBuyPrice() {
    const lastPriceDom = document.getElementById('_spanLastPrice');
    const buyPriceInput = document.getElementById('buyPriceInput');
    buyPriceInput.value = localStorage.getItem('buyPriceInput');
    setInterval(() => {
      const lastPrice = Number(lastPriceDom.innerText);
      const buyPrice = Number(buyPriceInput.value||0);
      localStorage.setItem('buyPriceInput', buyPrice);
      
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
      success: '3px solid #409EFF',
      warning: '3px solid #E6A23C',
      danger: '3px solid #F56C6C',
      none: 'none'
    };
    dom.style.outline = colorGroup[status];
    showDebugMsg(`🍀🎉💰恭喜发财💰🎉🍀`);
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
    const monitorEditRemark = document.getElementById('monitorEditRemark');
    monitorRemark.innerText = localStorage.getItem('monitorRemark') || '备注';

    monitorRemark.addEventListener('dblclick', () => { 
      isEditRemark = !isEditRemark;
      if (isEditRemark) {
        monitorEditRemark.style.display = 'block'
        monitorEditRemark.value = monitorRemark.innerText;
        monitorRemark.innerText = '编辑完成后双击保存';
      } else {
        monitorEditRemark.style.display = 'none';
        monitorRemark.innerText = monitorEditRemark.value || '备注';
        localStorage.setItem('monitorRemark', monitorRemark.innerText);
      }
    })    
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
})();
