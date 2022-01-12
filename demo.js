(function(){
  if (!document.getElementById('_spanLastPrice')) return;

  addPanel();
  fixedDom();
  addEventListener();

  // 加遮罩面板
  function addPanel() {
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
        <p><label>Max Price: <input type="text" id="maxPrice77"/></label></p>
        <p><label>Min Price: <input type="text" id="minPrice77"/></label></p>
        <p><label>Warning Offset: <input type="text" id="warningOffset77"/></label></p>
        <p style="margin-top: 20px; text-align: center;"><button style="font-size: 14px; padding: 7px 14px;" id="toggleWarning77">开始监听</button></p>
        <p style="margin-top: 20px; text-align: center;" id="priceMessage"></p>
        <iframe style="width:0;height:0;" id="iframeWindow" src="https://himalaya.exchange"/>
      </div>
    `
    document.body.appendChild(panel.children[0]);
  };

  // 浮动元素
  function fixedDom() {
    const priceDom = document.getElementById('_spanLastPrice');
    priceDom.setAttribute('style', `
      position:fixed;
      z-index:7777777;
      left:27px;
      top:27px;
      color:#777;
    `)
  };

  // 设置监听事件
  function addEventListener() {
    let inter
    const maxPrice77 = document.getElementById('maxPrice77');
    const minPrice77 = document.getElementById('minPrice77');
    const warningOffset77 = document.getElementById('warningOffset77');
    const toggleWarning77 = document.getElementById('toggleWarning77');
    const seconds = 3

    sendPriceNotification('消息通知已经开启！');
    toggleWarning77.addEventListener('click', () => {
      const text = toggleWarning77.innerText
      if (text === '开始监听') {
        inter = setInterval(() => {
          const lastPrice = Number(priceDom.innerText || 0)
          const maxPrice = Number(maxPrice77.value || 7777777)
          const minPrice = Number(minPrice77.value || 0)
          const warningOffset = Number(warningOffset77.value || 0.005)
      
          if (lastPrice > maxPrice) {
            sendPriceNotification('价格 超出 大值！')
          } else if (lastPrice < minPrice) {
            sendPriceNotification('价格 低于 小值！')
          } else if (lastPrice >= maxPrice - warningOffset) {
            sendPriceNotification('价格 接近 大值！')
          } else if (lastPrice <= minPrice + warningOffset) {
            sendPriceNotification('价格 接近 小值！')
          } else {
            sendPriceNotification()
          }
        }, seconds * 1000);
        toggleWarning77.innerText = '停止监听'
      } else {
        clearInterval(inter)
        toggleWarning77.innerText = '开始监听'
      }
      priceMessage.innerText = ''
    })
  };

  // 发消息
  function sendPriceNotification(msg='') {
    const priceMessage = document.getElementById('priceMessage');
    const iframeWindow = document.getElementById('iframeWindow');
    const win = iframeWindow.contentWindow || iframeWindow
    if (msg && win.Notification && win.Notification.requestPermission) {
      win.Notification.requestPermission(function(status) {
        console.log(status); // 仅当值为 "granted" 时显示通知
        var n = new win.Notification("消息", {body: msg}); // 显示通知
      });
    }
    priceMessage.innerText = msg
  };
})();
