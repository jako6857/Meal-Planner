import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const manifestLink = document.querySelector('link[rel="manifest"]') ?? document.createElement('link')
manifestLink.setAttribute('rel', 'manifest')
manifestLink.setAttribute('href', new URL('manifest.webmanifest', document.baseURI).toString())
if (!manifestLink.parentElement) {
  document.head.appendChild(manifestLink)
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: 'none' })
      .then((registration) => registration.update())
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)