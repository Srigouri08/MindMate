import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './mindmate-theme.css'
import './mindmate-ui-fixes.js'
import './mindmate-interaction-fix.js'
import './stickerToolbarFix.js'
import './mindmate-final-fix.js'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
