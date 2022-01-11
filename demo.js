(function(){
  const priceDom = document.getElementById('_spanLastPrice');
  alert(priceDom)
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
      z-index:777777
      "
    />
  `
  document.body.appendChild(panel.children[0]);
})()