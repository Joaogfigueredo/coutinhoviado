import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  ArrowLeftRight,
  Target,
  BarChart3,
  BookOpen,
  Settings,
  PiggyBank,
  LogOut,
  X,
  CircleDollarSign,
  Bell,
  Calculator,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const itens = [
  { to: '/dashboard', rotulo: 'Dashboard', icone: LayoutDashboard },
  { to: '/transacoes', rotulo: 'Transações', icone: CreditCard },
  { to: '/transferencias', rotulo: 'Transferências', icone: ArrowLeftRight },
  { to: '/notificacoes', rotulo: 'Notificações', icone: Bell },
  { to: '/metas', rotulo: 'Metas', icone: Target },
  { to: '/budgets', rotulo: 'Orçamentos', icone: PiggyBank },
  { to: '/debts', rotulo: 'Dívidas', icone: CircleDollarSign },
  { to: '/calculadoras', rotulo: 'Calculadoras', icone: Calculator },
  { to: '/relatorios', rotulo: 'Relatórios', icone: BarChart3 },
  { to: '/educacao', rotulo: 'Educação', icone: BookOpen },
  { to: '/configuracoes', rotulo: 'Configurações', icone: Settings },
];

export default function Sidebar({ aberto, onFechar }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { sair } = useAuth();

  const handleLogout = () => {
    sair?.();
    localStorage.removeItem('demoMode');
    navigate('/home');
  };

  return (
    <>
      {/* overlay mobile */}
      {aberto && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onFechar} />}

      {/* DESKTOP: colapsa/expande no hover */}
      <aside
        className={`
          group hidden md:flex md:flex-col
          fixed left-0 top-0 h-full z-30
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg
          transition-[width] duration-300 ease-in-out
          w-20 hover:w-64
        `}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* logo */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white via-blue-50/60 to-blue-100/60 shadow-[0_12px_35px_-20px_rgba(37,99,235,0.55)] ring-1 ring-blue-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700/80 dark:ring-slate-600 flex-shrink-0">
              <PiggyBank className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </div>
            <div className={`ml-3 overflow-hidden transition-all ${expanded ? 'opacity-100 max-w-[999px]' : 'opacity-0 max-w-0'}`}>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">MoneyMapp</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Plataforma Financeira</p>
            </div>
          </div>
        </div>

        {/* menu */}
        <nav className="flex-1 py-4">
          <ul className="space-y-2">
            {itens.map((item) => {
              const Icone = item.icone;
              return (
                <li key={item.to} className="px-3">
                  <NavLink
                    to={item.to}
                    onClick={onFechar}
                    className={({ isActive }) => `
                      flex items-center px-3 py-3 rounded-xl transition-all duration-200
                      group/menu relative overflow-visible
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <Icone className="w-6 h-6 flex-shrink-0" />
                    <span className={`ml-3 font-medium whitespace-nowrap transition-all ${expanded ? 'opacity-100 max-w-[999px]' : 'opacity-0 max-w-0'}`}>
                      {item.rotulo}
                    </span>

                    {!expanded && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover/menu:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                        {item.rotulo}
                        <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-900 dark:border-r-gray-700 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                      </div>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* sair */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-3 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group/menu relative"
          >
            <LogOut className="w-6 h-6 flex-shrink-0" />
            <span className={`ml-3 font-medium whitespace-nowrap transition-all ${expanded ? 'opacity-100 max-w-[999px]' : 'opacity-0 max-w-0'}`}>
              Sair
            </span>
            {!expanded && (
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover/menu:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Sair
                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-r-4 border-r-gray-900 dark:border-r-gray-700 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* MOBILE: gaveta */}
      <aside
        className={`
          md:hidden fixed left-0 top-0 h-full w-80 max-w-[85vw]
          bg-white dark:bg-gray-800 shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${aberto ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-white via-blue-50/60 to-blue-100/60 shadow-[0_12px_35px_-20px_rgba(37,99,235,0.55)] ring-1 ring-blue-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700/80 dark:ring-slate-600">
              <PiggyBank className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">MoneyMapp</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Plataforma Financeira</p>
            </div>
          </div>
          <button onClick={onFechar} className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 py-6">
          <ul className="space-y-2">
            {itens.map((item) => {
              const Icone = item.icone;
              return (
                <li key={item.to} className="px-6">
                  <NavLink
                    to={item.to}
                    onClick={onFechar}
                    className={({ isActive }) => `
                      flex items-center px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <Icone className="w-6 h-6" />
                    <span className="ml-4 font-medium">{item.rotulo}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
          >
            <LogOut className="w-6 h-6" />
            <span className="ml-4 font-medium">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
