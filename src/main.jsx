import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './mindmate-theme.css'
import './mindmate-toolbar-theme.css'
import './hydrationCard.js'
import './sidebarFeatures.js'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
