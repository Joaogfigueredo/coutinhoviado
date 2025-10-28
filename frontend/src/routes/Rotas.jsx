import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Home from '../pages/Home.jsx';
import Login from '../pages/Login.jsx';
import Registrar from '../pages/Registrar.jsx';
import NotFound from '../pages/NotFound.jsx';
import Unauthorized from '../pages/Unauthorized.jsx';
import Forbidden from '../pages/Forbidden.jsx';

import Dashboard from '../pages/Dashboard.jsx';
import Transacoes from '../pages/Transacoes.jsx';
import Transferencias from '../pages/Transferencias.jsx';
import Metas from '../pages/Metas.jsx';
import Relatorios from '../pages/Relatorios.jsx';
import Educacao from '../pages/Educacao.jsx';
import ArtigoDetalhes from '../pages/ArtigoDetalhes.jsx';
import Configuracoes from '../pages/Configuracoes.jsx';
import Budgets from '../pages/Budgets.jsx';
import Debts from '../pages/Debts.jsx';
import Notificacoes from '../pages/Notificacoes.jsx';
import CalculadorasExtras from '../pages/CalculadorasExtras.jsx';

import PublicLayout from '../layouts/PublicLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

// ============================================================================
// 🔐 ROTA PRIVADA (aceita login real ou modo demonstração)
// ============================================================================
function Privado({ children, permissoesNecessarias = [] }) {
  const { token, permissoes } = useAuth();
  const demo = localStorage.getItem('demoMode') === 'true';
  if (!token && !demo) {
    return <Navigate to="/401" replace />;
  }

  if (demo) {
    return children;
  }

  if (permissoesNecessarias.length) {
    const possui = permissoesNecessarias.every((permissao) => permissoes.includes(permissao));
    if (!possui) {
      return <Navigate to="/403" replace />;
    }
  }

  return children;
}

// ============================================================================
// 🚀 ROTA DE DEMONSTRAÇÃO AUTOMÁTICA
// ============================================================================
function DemoRoute() {
  const navigate = useNavigate();

  useEffect(() => {
    // Ativa o modo demonstração no navegador
    localStorage.setItem('demoMode', 'true');
    // Redireciona diretamente para o dashboard
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return null;
}

// ============================================================================
// 📍 ROTAS PRINCIPAIS
// ============================================================================
export default function Rotas() {
  return (
    <Routes>
      {/* Layout público */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<Registrar />} />
        {/* 🔹 Nova rota de demonstração */}
        <Route path="/demo" element={<DemoRoute />} />
      </Route>

      {/* Layout privado (Dashboard e páginas internas) */}
      <Route
        element={(
          <Privado>
            <DashboardLayout />
          </Privado>
        )}
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transacoes" element={<Transacoes />} />
        <Route path="/transferencias" element={<Transferencias />} />
        <Route path="/notificacoes" element={<Notificacoes />} />
        <Route path="/metas" element={<Metas />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/debts" element={<Debts />} />
        <Route path="/calculadoras" element={<CalculadorasExtras />} />
        <Route
          path="/relatorios"
          element={(
            <Privado permissoesNecessarias={['reports:read']}>
              <Relatorios />
            </Privado>
          )}
        />
        <Route path="/educacao" element={<Educacao />} />
        <Route path="/educacao/artigo/:id" element={<ArtigoDetalhes />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Route>

      {/* 404 */}
      <Route path="/401" element={<Unauthorized />} />
      <Route path="/403" element={<Forbidden />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
