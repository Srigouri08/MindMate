import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './mindmate-theme.css'
import './mindmate-interaction-fix.js'
import './stickerToolbarFix.js'
import './mindmate-final-fix.js'
import './littleMomentsSection.js'
import './mindmate-toolbar-scope.js'
import './final-polish.js'
import './wellnessFix.js'
import './phaseOnePolish.js'
import './loginReadabilityFix.js'
import './loginFix.js'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
