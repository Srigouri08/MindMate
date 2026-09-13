(() => {
  function wireStickerButton() {
    const toolbar = document.querySelector('.mm-toolbar');
    const stickerTool = toolbar?.querySelector('.mm-tool[title="Stickers"]');
    const pickerButton = document.querySelector('.top-actions .icon-button[title="Add stickers"]');
    if (!stickerTool || !pickerButton) return;

    stickerTool.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      pickerButton.click();
    };
  }

  wireStickerButton();
  const observer = new MutationObserver(() => wireStickerButton());
  observer.observe(document.body, { childList: true, subtree: true });
})();
