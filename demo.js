(function(){
  const priceDom = document.getElementById('_spanLastPrice');
  if (!priceDom) return
  priceDom.style.position = 'fixed'
  priceDom.style.zIndex = 7777777
  priceDom.style.left = '27px'
  priceDom.style.top = '27px'
  priceDom.style.color = '#777'

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
      <p style="margin-top: 20px; text-align: center;"><button id="toggleWarning77">开始监听</button></p>
    </div>
  `
  document.body.appendChild(panel.children[0]);

  sendPriceNotification();

  // 设置监听事件
  let inter
  const maxPrice77 = document.getElementById('maxPrice77');
  const minPrice77 = document.getElementById('minPrice77');
  const warningOffset77 = document.getElementById('warningOffset77');
  const toggleWarning77 = document.getElementById('toggleWarning77');
  const seconds = 3
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
        }
      }, seconds * 1000);
      toggleWarning77.innerText = '停止监听'
    } else {
      clearInterval(inter)
      toggleWarning77.innerText = '开始监听'
    }
  })

  function sendPriceNotification(msg) {
    if (Notification.requestPermission) {
      Notification.requestPermission(function(status) {
        console.log(status); // 仅当值为 "granted" 时显示通知
        var n = new Notification("消息", {body: msg || "已经开启消息通知！"}); // 显示通知
      });
    } else if (msg){
      alert(msg)
    }
  };
})();
