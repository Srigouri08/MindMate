import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './mindmate-final-fix.js'
import './phaseOne.js'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
