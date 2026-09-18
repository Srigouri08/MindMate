import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./mindmate-theme.css";
import "./mindmate-toolbar-theme.css";
import "./responsive-fixes.css";
import "./responsive-final.css";
import "./mindmate-screen-toolbar.js";
import "./stickerToolbarFix.js";
import "./stickerControlsInteractionFix.js";
import "./creativeToolsFix.js";
import "./creativePolishFix.js";
import "./hydrationCard.js";
import "./sidebarFeatures.js";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
