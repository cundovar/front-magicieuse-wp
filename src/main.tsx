import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tailwind.css'
import './styles/main.scss'
import './styles/wp-content.scss'
import './themes/theme-magicieuse.scss'
import './themes/theme-magicieuse-clair.scss'
import './themes/theme-field-folio.scss'
import './themes/clients/magicieuse-wp.scss'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
