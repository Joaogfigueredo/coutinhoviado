import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import UserProfile from "../components/UserProfile.jsx";
import { Bell, Menu } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle.jsx";
import api from "../services/api.js";
import { dadosDemo } from "../data/dadosDemo.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const { token, sair, usuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true;

    const loadCount = async () => {
      if (!mounted) return;
      const demo = localStorage.getItem("demoMode") === "true";
      if (demo) {
        let source = dadosDemo.notificacoes ?? [];
        if (typeof window !== "undefined") {
          try {
            const stored = localStorage.getItem("mm_demo_notifications");
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed)) {
                source = parsed;
              }
            }
          } catch (error) {
            console.warn("Falha ao carregar notificações demo: ", error);
          }
        }

        const count = source.filter((item) => !item.readAt).length;
        setUnreadNotifications(count);
        return;
      }

      try {
        const { data } = await api.notifications.listar({ status: "unread", perPage: 1 });
        const count = data?.meta?.unreadCount ?? (data?.notifications?.length ?? 0);
        setUnreadNotifications(count);
      } catch (error) {
        console.error("notifications badge load error", error);
      }
    };

    const handler = () => {
      loadCount();
    };

    loadCount();
    window.addEventListener("moneymapp:notifications:refresh", handler);

    return () => {
      mounted = false;
      window.removeEventListener("moneymapp:notifications:refresh", handler);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex h-screen w-screen overflow-hidden bg-slate-100 transition-colors duration-300 ease-out dark:bg-slate-950">
      {/* Sidebar fixa (desktop) + gaveta (mobile) */}
      <Sidebar aberto={mobileOpen} onFechar={() => setMobileOpen(false)} />

      {/* Conteúdo principal */}
      <div className="flex flex-col flex-1 h-full md:ml-20">
        {/* Topbar */}
        <header className="z-20 flex items-center justify-between px-6 py-3 shadow-sm backdrop-blur-md transition-colors duration-300 border-b border-slate-200/70 bg-white/85 dark:border-slate-700 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to="/dashboard"
              className="text-lg font-semibold tracking-wide text-slate-900 dark:text-slate-100"
            >
              MoneyMapp
            </Link>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              • Área logada
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/notificacoes"
              className="relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-violet-400 hover:text-violet-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-violet-500"
            >
              <Bell className="h-4 w-4" />
              Alertas
              {unreadNotifications ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-violet-600 px-1 text-xs font-semibold text-white">
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </span>
              ) : null}
            </Link>
            <ThemeToggle floating={false} className="relative hover:scale-105" />
            <div className="border-l border-slate-200 dark:border-slate-700 pl-2 ml-2">
              <UserProfile />
            </div>
          </div>
        </header>

        {/* Conteúdo da página (dashboard) */}
        <main className="flex-1 h-full overflow-y-auto p-2 md:p-4">
          <div className="h-full w-full rounded-2xl border border-slate-200/70 bg-white/90 p-3 shadow-lg transition-colors duration-300 backdrop-blur-sm md:p-4 dark:border-slate-700 dark:bg-slate-900/70">
            <div className="min-h-full flex flex-col justify-start">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
