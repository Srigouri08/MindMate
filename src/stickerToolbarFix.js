function keepStickerToolbarStraight() {
  document.querySelectorAll('.placed-sticker').forEach((sticker) => {
    const controls = sticker.querySelector('.sticker-controls');
    if (!controls) return;

    const style = sticker.getAttribute('style') || '';
    const match = style.match(/rotate\((-?[\d.]+)deg\)/);
    const angle = match ? Number(match[1]) : 0;

    controls.style.transform = `translateX(-50%) rotate(${-angle}deg)`;
    controls.style.transformOrigin = 'center';
  });
}

const observer = new MutationObserver((mutations) => {
  const relevant = mutations.some((mutation) =>
    mutation.type === 'childList' ||
    (mutation.type === 'attributes' && mutation.target.classList?.contains('placed-sticker'))
  );
  if (relevant) requestAnimationFrame(keepStickerToolbarStraight);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['style'],
});

requestAnimationFrame(keepStickerToolbarStraight);
