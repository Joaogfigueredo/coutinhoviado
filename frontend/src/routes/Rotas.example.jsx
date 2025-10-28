// src/routes/Rotas.jsx (exemplo de como adicionar a rota)
// IMPORTANTE: não sobrescreva seu arquivo caso já tenha muitas rotas.
// Apenas garanta que exista a linha de import e a <Route path="/registrar" .../>
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home.jsx'
import Login from '../pages/Login.jsx'
import Registrar from '../pages/Registrar.jsx' // <--- adicione isso

export default function Rotas() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registrar" element={<Registrar />} /> {/* <--- e isso */}
    </Routes>
  )
}
