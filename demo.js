(function(){
  if (!document.getElementById('_spanLastPrice')) return;

  addMainPanel();
  fixedLastPriceDom();
  setTimeout(() => {
    checkSellPrice();
    checkBuyPrice();
    addEventsListener();
  }, 77);

  // 加遮罩面板
  function addMainPanel() {
    const panel = document.createElement('div');
    panel.innerHTML = `
      <div id="monitorMainPanel" style="
        position: fixed; 
        top: 0; 
        bottom: 0; 
        left: 0; 
        right:0;  
        background-color: #fff; 
        z-index:777777;
        padding: 100px 27px;
        text-align: center;
        "
      >
        <p id="sellPriceItem"><label>Sell: <input type="text" id="sellPriceInput"/></label></p>
        <p id="buyPriceItem"><label>Buy: <input type="text" id="buyPriceInput"/></label></p>
        <p id="debugMsg"></p>
      </div>
      <button id="toggleBtn" style="position: fixed; z-index: 7777777; bottom: 77px; right: 77px; font-size: 14px; padding: 7px 14px;">开关</button>
    `
    document.body.appendChild(panel.children[0]);
    document.body.appendChild(panel.children[1]);
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
    `)
  };

  // 检查卖出价格
  function checkSellPrice() {
    const lastPriceDom = document.getElementById('_spanLastPrice');
    const sellPriceInput = document.getElementById('sellPriceInput');
    sellPriceInput.value = localStorage.getItem('sellPriceInput');
    setInterval(() => {
      const lastPrice = Number(lastPriceDom.innerText)
      const sellPrice = Number(sellPriceInput.value||0)
      localStorage.setItem('sellPriceInput', sellPrice)
      
      if (!sellPrice || lastPrice < sellPrice) {
        setStatusColor(sellPriceInput, 'none')
      } else if (lastPrice >= sellPrice + 0.5) {
        setStatusColor(sellPriceInput, 'danger')
      } else if (lastPrice >= sellPrice) {
        setStatusColor(sellPriceInput, 'success')
      }
    }, 1000);
  };

  // 检查买入价格
  function checkBuyPrice() {
    const lastPriceDom = document.getElementById('_spanLastPrice');
    const buyPriceInput = document.getElementById('buyPriceInput');
    buyPriceInput.value = localStorage.getItem('buyPriceInput');
    setInterval(() => {
      const lastPrice = Number(lastPriceDom.innerText)
      const buyPrice = Number(buyPriceInput.value||0)
      localStorage.setItem('buyPriceInput', buyPrice)
      
      if(!buyPrice || lastPrice > buyPrice) {
        setStatusColor(buyPriceInput, 'none')
      } else if (lastPrice <= buyPrice - 0.3) {
        setStatusColor(buyPriceInput, 'warning')
      } else if (lastPrice <= buyPrice) {
        setStatusColor(buyPriceInput, 'success')
      }
    }, 1000);
  };

  // 根据状态设置边框阴影颜色
  function setStatusColor(dom, type) {
    const colorGroup = {
      success: '3px solid #409EFF',
      warning: '3px solid #E6A23C',
      danger: '3px solid #F56C6C',
      none: 'none'
    }
    dom.style.outline = colorGroup[type];
    showDebugMsg(`请查看状态：${type}`)
  }

  // debug显示信息
  function showDebugMsg(msg) {
    document.getElementById('debugMsg').innerText = msg
  }

  // 加上监听事件
  function addEventsListener() {
    let showPanel = true
    document.getElementById('toggleBtn').addEventListener('click', () => {
      showPanel = !showPanel
      toggleShowPanel(showPanel)
    })
  }

  // 显示/隐藏监听面板
  function toggleShowPanel(showPanel) {
    const lastPriceDom = document.getElementById('_spanLastPrice');
    const monitorMainPanel = document.getElementById('monitorMainPanel')
    if (showPanel) {
      lastPriceDom.style.position = 'fixed'
      monitorMainPanel.style.display = 'block'
    } else {
      lastPriceDom.style.position = 'relative'
      monitorMainPanel.style.display = 'none'
    }
  }
})();
