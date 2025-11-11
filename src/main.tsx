import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/app.css'
import App from './App.tsx'
import ConvexWrapper from './lib/convex-provider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConvexWrapper>
      <App />
    </ConvexWrapper>
  </StrictMode>,
)
