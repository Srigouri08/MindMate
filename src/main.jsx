import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './stickerToolbarFix.js'
import './mindmate-ui-fixes.js'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
