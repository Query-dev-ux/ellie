import React from 'react'
import ReactDOM from 'react-dom/client'
import FlirtGame from './components/FlirtGame'
import TelegramProvider from './components/TelegramProvider'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TelegramProvider>
      <FlirtGame />
    </TelegramProvider>
  </React.StrictMode>,
) 