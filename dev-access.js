(() => {
  'use strict';
  const passwordHash = 'b40f9cef06cfaef88afd0e885121b19073cd397f5fb291dd21cf4bb7ff37cf73';
  const storageKey = 'abhayk:dev-unlocked:v1';
  async function matches(value) {
    if (value.length !== 8) return false;
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('') === passwordHash;
  }
  function remember() { try { sessionStorage.setItem(storageKey, 'true'); } catch {} }
  function hasAccess() { try { return sessionStorage.getItem(storageKey) === 'true'; } catch { return false; } }
  const gate = document.getElementById('dev-gate');
  if (!gate) {
    let buffer = '';
    let revision = 0;
    window.addEventListener('keydown', async event => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing || event.repeat) return;
      if (event.key === 'Escape') { buffer = ''; revision++; return; }
      if (event.key === 'Backspace') { buffer = buffer.slice(0, -1); revision++; return; }
      if (event.key.length !== 1) return;
      buffer = (buffer + event.key).slice(-8);
      const currentRevision = ++revision;
      try {
        if (await matches(buffer) && currentRevision === revision) {
          buffer = '';
          remember();
          location.assign('/dev/');
        }
      } catch {}
    });
    return;
  }
  const workspace = document.getElementById('dev-workspace');
  const password = document.getElementById('dev-password');
  const error = document.getElementById('dev-error');
  function render() {
    const unlocked = hasAccess();
    gate.hidden = unlocked;
    workspace.hidden = !unlocked;
  }
  render();
  window.addEventListener('pageshow', render);
  document.getElementById('dev-form').addEventListener('submit', async event => {
    event.preventDefault();
    error.textContent = '';
    try {
      if (await matches(password.value)) {
        remember();
        password.value = '';
        render();
        if (workspace.hidden) error.textContent = 'Allow session storage in your browser to open this page.';
        else document.getElementById('workspace-title').focus();
      } else {
        error.textContent = 'That password didn’t match. Try again.';
        password.select();
      }
    } catch { error.textContent = 'Unable to unlock. Try reloading this page.'; }
  });
  document.getElementById('lock-dev').addEventListener('click', () => {
    try { sessionStorage.removeItem(storageKey); } catch {}
    render();
    location.replace('/');
  });
})();
