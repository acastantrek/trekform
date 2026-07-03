import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from './router/AppRouter'
import './styles/index.css'

const root = document.getElementById('root')
if (!root) throw new Error('No se ha encontrado el elemento raíz de la aplicación')
createRoot(root).render(<StrictMode><BrowserRouter><AppRouter /></BrowserRouter></StrictMode>)
