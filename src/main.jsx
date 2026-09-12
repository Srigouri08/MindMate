import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './mindmate-final-fix.js'
import './mindmate-interaction-fix.js'
import './mindmate-card-fix.js'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
