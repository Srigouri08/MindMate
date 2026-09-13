(()=>{
  const STYLE='mindmate-toolbar-scope-style';
  const css=`
    .book-area{position:relative!important}
    .mm-toolbar[data-mm-final].mm-scoped-toolbar{position:absolute!important;right:-62px!important;top:50%!important;transform:translateY(-50%)!important;margin:0!important;transition:none!important;animation:none!important;}
    .mm-toolbar[data-mm-final].mm-scoped-toolbar .mm-tool{transition:none!important;animation:none!important;}
    .app.dark-mode .mm-toolbar[data-mm-final].mm-scoped-toolbar{background:rgba(38,33,53,.98)!important;border-color:#514668!important;box-shadow:0 12px 30px rgba(0,0,0,.38)!important}
    .app.dark-mode .mm-toolbar[data-mm-final].mm-scoped-toolbar .mm-tool{background:#3b3150!important;border-color:#55496d!important;color:#eee7fa!important}
    .app.dark-mode .mm-toolbar[data-mm-final].mm-scoped-toolbar .mm-tool:hover{background:#514169!important;border-color:#76629a!important}
    .app.dark-mode .mm-toolbar[data-mm-final].mm-scoped-toolbar .mm-tool.add{background:#7655d3!important;border-color:#7655d3!important;color:#fff!important}
    .mm-toolbar[data-mm-final].mm-scoped-toolbar{background:rgba(255,255,255,.98)!important;border-color:#d8ccef!important;box-shadow:0 10px 26px rgba(60,40,110,.15)!important}
    @media(max-width:700px){.mm-toolbar[data-mm-final].mm-scoped-toolbar{right:-48px!important}.mm-toolbar[data-mm-final].mm-scoped-toolbar .mm-tool{width:34px!important;height:34px!important}}
  `;
  function install(){if(document.getElementById(STYLE))return;const s=document.createElement('style');s.id=STYLE;s.textContent=css;document.head.appendChild(s)}
  function isNewEntry(){const h=document.querySelector('.welcome-row h2');return !!h && h.textContent.includes('How was your day?')}
  function sync(){
    install();
    const toolbars=[...document.querySelectorAll('.mm-toolbar')];
    const allowed=isNewEntry() && document.querySelector('.book-area') && document.querySelector('.book-page');
    toolbars.forEach(t=>{
      if(!allowed){t.remove();return}
      if(!t.dataset.mmFinal){t.remove();return}
      t.classList.add('mm-scoped-toolbar');
      const area=document.querySelector('.book-area');
      if(area && t.parentElement!==area) area.appendChild(t);
    });
  }
  function start(){
    install();
    sync();
    new MutationObserver(()=>requestAnimationFrame(sync)).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    setInterval(sync,500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();