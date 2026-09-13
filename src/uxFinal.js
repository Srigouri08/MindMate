function removeSidebarAsk() {
  document.querySelectorAll('.sidebar .side-item').forEach((button) => {
    if (/Ask MindMate/i.test(button.textContent || '')) button.remove();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    removeSidebarAsk();
    setInterval(removeSidebarAsk, 500);
  });
} else {
  removeSidebarAsk();
  setInterval(removeSidebarAsk, 500);
}
