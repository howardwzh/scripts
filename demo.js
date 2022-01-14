(function(){
  if (!document.getElementById('_spanLastPrice')) return;

  addMainPanel();
  fixedLastPriceDom();
  setTimeout(() => {
    checkSellPrice();
    checkBuyPrice();
  }, 100);

  // 加遮罩面板
  function addMainPanel() {
    const panel = document.createElement('div');
    panel.innerHTML = `
      <div style="
        position: fixed; 
        top: 0; 
        bottom: 0; 
        left: 0; 
        right:0;  
        background-color: #fff; 
        z-index:777777;
        padding: 100px 27px;
        "
      >
        <p><label>Sell: <input type="text" id="sellPriceInput"/></label></p>
        <p><label>Buy: <input type="text" id="buyPriceInput"/></label></p>
      </div>
    `
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
      color:#777;
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
  function checkSellPrice() {
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
      success: '0px 0px 0px 3px #67C23A',
      warning: '0px 0px 0px 3px #E6A23C',
      danger: '0px 0px 0px 3px #F56C6C',
      none: 'none'
    }
    dom.style.boxShadow = colorGroup[type];
  }
})();
