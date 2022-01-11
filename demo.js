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
    </div>
  `
  document.body.appendChild(panel.children[0]);

  // 每秒检测价格
  setInterval(() => {
    const lastPrice = Number(priceDom.innerText||0)
    const maxPrice = Number(document.getElementById('maxPrice77').value || 7777777)
    const minPrice = Number(document.getElementById('minPrice77').value || 0)
    const warningOffset = Number(document.getElementById('warningOffset77').value || 0.005)

    if (lastPrice > maxPrice) {
      sendNotification('价格 超出 大值！')
    } else if (lastPrice < minPrice) {
      sendNotification('价格 低于 小值！')
    } else if (lastPrice >= maxPrice - warningOffset) {
      sendNotification('价格 接近 大值！')
    } else if (lastPrice <= minPrice + warningOffset) {
      sendNotification('价格 接近 小值！')
    }
  }, 1000)
})()

function sendNotification(msg) {
  Notification.requestPermission( function(status) {
    console.log(status); // 仅当值为 "granted" 时显示通知
    var n = new Notification("消息", {body: msg || "已经开启消息通知！"}); // 显示通知
  });
}