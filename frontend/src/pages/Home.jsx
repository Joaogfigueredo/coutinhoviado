import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PiggyBank,
  TrendingUp,
  Shield,
  Target,
  BookOpen,
  Users,
  Zap,
  Star,
  ArrowRight,
  ChevronRight,
  BarChart3,
  CheckCircle,
  Sparkles,
  Lock,
  Trophy,
  Globe
} from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDemoAccess = async () => {
    setLoading(true);
    localStorage.setItem("demoMode", "true");
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 600);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Fundo premium */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-sky-400 to-blue-500 dark:from-zinc-950 dark:via-violet-950/30 dark:to-purple-950/50" />
        <div className="absolute -top-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-r from-violet-400/30 to-purple-500/30 blur-3xl" />
        <div
          className="absolute -bottom-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-r from-indigo-400/20 to-sky-500/20 blur-3xl"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute left-1/3 top-1/4 h-64 w-64 animate-pulse rounded-full bg-gradient-to-r from-purple-400/10 to-fuchsia-400/10 blur-2xl"
          style={{ animationDelay: '4s' }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Header premium */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/10 backdrop-blur-xl shadow-lg"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg">
              <PiggyBank className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">MoneyMapp</span>
          </motion.div>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleDemoAccess}
              disabled={loading}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-2.5 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  Carregando...
                </div>
              ) : (
                'Demonstração'
              )}
            </motion.button>
            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              Fazer Login
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Hero premium */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative px-6 py-32 text-center text-white"
      >
        <div className="relative z-10 mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 flex items-center justify-center gap-2"
          >
            <Sparkles className="h-6 w-6 text-yellow-300" />
            <span className="rounded-full bg-white/10 px-4 py-1 text-sm font-medium backdrop-blur-sm">
              Plataforma Premium de Finanças
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-6 bg-gradient-to-r from-white via-white to-blue-100 bg-clip-text text-5xl font-extrabold text-transparent md:text-7xl"
          >
            MoneyMapp
          </motion.h1>
          
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-6 text-2xl font-semibold md:text-4xl"
          >
            A plataforma de educação financeira que{' '}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              transforma sua vida
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mx-auto mb-12 max-w-3xl text-lg opacity-90 leading-relaxed"
          >
            Controle suas finanças, defina metas e aprenda a investir com uma experiência
            simples, moderna e intuitiva — feita especialmente para jovens estudantes e profissionais.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <motion.button
              onClick={handleDemoAccess}
              disabled={loading}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-indigo-600 shadow-2xl transition-all hover:shadow-white/25"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600/30 border-t-indigo-600"></div>
                  Carregando...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  Entrar em demonstração
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
            
            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 rounded-2xl border-2 border-white/20 bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <Lock className="h-5 w-5" />
              Fazer login
            </motion.button>
          </motion.div>
        </div>
      </motion.section>

      {/* Features premium */}
      <section className="relative px-6 py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-indigo-50/50 to-blue-50/80 backdrop-blur-sm dark:from-zinc-900/90 dark:via-violet-950/30 dark:to-purple-950/50"></div>
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h3 className="mb-4 text-4xl font-bold text-zinc-800 dark:text-white md:text-5xl">
              O que você encontra no{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                MoneyMapp
              </span>
            </h3>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
              Descubra todas as ferramentas que vão revolucionar sua relação com o dinheiro
            </p>
          </motion.div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { 
                icon: PiggyBank, 
                title: "Controle de Finanças", 
                desc: "Monitore receitas e despesas em tempo real com dashboards intuitivos.",
                color: "from-blue-500 to-cyan-400",
                bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30"
              },
              { 
                icon: Target, 
                title: "Metas Financeiras", 
                desc: "Defina objetivos claros e acompanhe seu progresso de forma gamificada.",
                color: "from-emerald-500 to-teal-400",
                bgColor: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30"
              },
              { 
                icon: TrendingUp, 
                title: "Relatórios Visuais", 
                desc: "Gráficos e dashboards inteligentes para insights financeiros rápidos.",
                color: "from-purple-500 to-violet-400",
                bgColor: "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30"
              },
              { 
                icon: BookOpen, 
                title: "Educação Financeira", 
                desc: "Aprenda com artigos, dicas e cursos de especialistas em finanças.",
                color: "from-orange-500 to-amber-400",
                bgColor: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group rounded-3xl border border-white/20 bg-gradient-to-br ${feature.bgColor} p-8 text-center shadow-lg backdrop-blur-sm transition-all hover:shadow-2xl`}
              >
                <div className="mb-6 flex justify-center">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg transition-transform group-hover:scale-110`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h4 className="mb-3 text-xl font-bold text-zinc-800 dark:text-white">{feature.title}</h4>
                <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats premium */}
      <section className="relative px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative mx-auto max-w-7xl text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h3 className="mb-4 text-4xl font-bold md:text-5xl">Resultados que importam</h3>
            <p className="mx-auto max-w-2xl text-lg opacity-90">
              Números reais de uma plataforma que realmente funciona
            </p>
          </motion.div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { number: "+5.000", label: "Usuários impactados", icon: Users, color: "from-blue-400 to-cyan-300" },
              { number: "92%", label: "Atingiram suas metas", icon: Trophy, color: "from-emerald-400 to-teal-300" },
              { number: "+R$ 1M", label: "Economizados pelos usuários", icon: PiggyBank, color: "from-purple-400 to-violet-300" }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:bg-white/10"
              >
                <div className="mb-4 flex justify-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg transition-transform group-hover:scale-110`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h4 className="mb-2 text-5xl font-extrabold">{stat.number}</h4>
                <p className="text-white/80">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos premium */}
      <section className="relative px-6 py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-blue-50/30 to-indigo-50/60 backdrop-blur-sm dark:from-zinc-900/95 dark:via-violet-950/20 dark:to-purple-950/40"></div>
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h3 className="mb-4 text-4xl font-bold text-zinc-800 dark:text-white md:text-5xl">
              O que nossos{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                usuários dizem
              </span>
            </h3>
            <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-300">
              Histórias reais de transformação financeira
            </p>
          </motion.div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { 
                name: "Maria Silva", 
                desc: "Estudante de Administração", 
                color: "from-blue-500 to-cyan-400", 
                text: "O MoneyMapp transformou completamente minha forma de economizar e entender meu dinheiro! Consegui economizar R$ 2.000 em 6 meses." 
              },
              { 
                name: "João Santos", 
                desc: "Desenvolvedor", 
                color: "from-emerald-500 to-teal-400", 
                text: "As metas e relatórios visuais me ajudaram a ter clareza total sobre minhas finanças. Nunca foi tão fácil controlar meus gastos!" 
              },
              { 
                name: "Ana Costa", 
                desc: "Recém-formada", 
                color: "from-purple-500 to-violet-400", 
                text: "Consegui juntar para minha primeira casa usando o MoneyMapp! A gamificação das metas foi o diferencial. Simplesmente incrível." 
              }
            ].map((user, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group rounded-3xl border border-white/20 bg-white/60 p-8 shadow-lg backdrop-blur-sm transition-all hover:shadow-2xl dark:bg-zinc-900/60"
              >
                <div className="mb-4 flex">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-6 text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                  "{user.text}"
                </p>
                <div className="flex items-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${user.color} text-white font-bold shadow-lg transition-transform group-hover:scale-110`}>
                    {user.name[0]}
                  </div>
                  <div className="ml-4">
                    <p className="font-bold text-zinc-800 dark:text-white">{user.name}</p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{user.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA premium */}
      <section className="relative px-6 py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative mx-auto max-w-4xl text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h3 className="mb-6 text-4xl font-bold md:text-5xl">
              Pronto para{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                mudar sua vida financeira?
              </span>
            </h3>
            <p className="mb-12 text-lg opacity-90 leading-relaxed">
              Experimente agora o MoneyMapp e descubra como organizar seu dinheiro pode ser 
              simples, motivador e transformador para o seu futuro.
            </p>
            
            <motion.button
              onClick={handleDemoAccess}
              disabled={loading}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 rounded-2xl bg-white px-10 py-5 text-lg font-bold text-indigo-600 shadow-2xl transition-all hover:shadow-white/25"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600/30 border-t-indigo-600"></div>
                  Preparando experiência...
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6" />
                  Comece agora gratuitamente
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
            
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="mt-6 text-sm opacity-75"
            >
              ✨ Sem cadastro necessário • Demonstração completa • Dados fictícios
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Footer premium */}
      <footer className="relative border-t border-white/10 bg-gradient-to-br from-zinc-900 via-gray-900 to-black px-6 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600">
                <PiggyBank className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold">MoneyMapp</span>
            </div>
            
            <div className="mb-4 space-y-2">
              <p className="text-white/80">© 2025 MoneyMapp. Todos os direitos reservados.</p>
              <p className="text-sm text-white/60">
                Plataforma completa de educação e gestão financeira
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-white/50">
              <Globe className="h-4 w-4" />
              <span>Uma solução brasileira para educação financeira</span>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
