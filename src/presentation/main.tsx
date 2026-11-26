import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Presentation } from './Presentation'
import '../index.css'
import '../shop.css'
import './presentation.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Presentation />
  </StrictMode>,
)
