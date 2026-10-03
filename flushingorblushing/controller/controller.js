(() => {
  'use strict';
  const key = 'flushing-or-blushing:spent:v1';
  const names = ['see', 'add', 'take'];
  let spent = new Set();
  try { const saved = JSON.parse(sessionStorage.getItem(key) || '[]'); if (Array.isArray(saved)) spent = new Set(saved.filter(n => names.includes(n))); } catch {}
  const buttons = new Map([...document.querySelectorAll('[data-card]')].map(b => [b.dataset.card, b]));
  const announcement = document.getElementById('announcement');
  function render(name) {
    const button = buttons.get(name);
    button.disabled = true;
    button.classList.add('used');
    button.setAttribute('aria-label', `${name.toUpperCase()} — already used this session`);
  }
  spent.forEach(render);
  function useCard(name) {
    if (!names.includes(name)) throw new Error('Choose see, add, or take.');
    if (spent.has(name)) return {card:name, used:true, changed:false};
    spent.add(name);
    try { sessionStorage.setItem(key, JSON.stringify([...spent])); } catch {}
    render(name);
    announcement.textContent = `${name.toUpperCase()} used. This card cannot be played again this session.`;
    return {card:name, used:true, changed:true};
  }
  buttons.forEach((button,name) => button.addEventListener('click', () => useCard(name)));
  const dialog = document.getElementById('help-dialog');
  document.getElementById('help').addEventListener('click', () => {if (!dialog.open) dialog.showModal();});
  document.getElementById('close-help').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {const r=dialog.getBoundingClientRect(); if(event.target===dialog && (event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();});
  const newGameDialog = document.getElementById('new-game-dialog');
  document.getElementById('new-game').addEventListener('click', () => newGameDialog.showModal());
  document.getElementById('cancel-new-game').addEventListener('click', () => newGameDialog.close());
  document.getElementById('confirm-new-game').addEventListener('click', () => {
    spent.clear();
    try { sessionStorage.removeItem(key); } catch {}
    buttons.forEach((button,name) => {
      button.disabled = false;
      button.classList.remove('used');
      button.setAttribute('aria-label', `Use ${name.toUpperCase()}. One-time use.`);
    });
    newGameDialog.close();
    announcement.textContent = 'New game started. All three action cards are ready.';
  });
  const context=document.modelContext;
  if(context?.registerTool){
    const lifecycle=new AbortController();
    const register=tool=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
    register({name:'get_action_cards',description:'Read which action cards have been used in this local player session.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>({cards:names.map(card=>({card,used:spent.has(card)}))})});
    register({name:'use_action_card',description:'Permanently spend one action card for this local session and flip it to its used state. The physical action must still be performed at the table.',inputSchema:{type:'object',properties:{card:{type:'string',enum:names}},required:['card'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:async input=>{if(!input||typeof input!=='object'||Object.keys(input).some(k=>k!=='card')||!names.includes(input.card))throw new Error('Choose see, add, or take.');const result=useCard(input.card);await new Promise(resolve=>requestAnimationFrame(resolve));return result;}});
    window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  }
})();
