// Prevent sticker-control button presses from starting the sticker drag handler.
// The controls live inside the draggable sticker, so pointerdown would otherwise
// bubble to .placed-sticker and make the sticker move while resizing/rotating.
document.addEventListener("pointerdown", (event) => {
  if (event.target.closest?.(".sticker-controls")) {
    event.stopPropagation();
  }
}, true);
