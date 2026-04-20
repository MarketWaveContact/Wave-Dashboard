'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase-browser'
import StatCard from '@/components/StatCard'
import type { Profile, ClientStats, MonthlyStats } from '@/lib/types'

const GrowthChart = dynamic(() => import('@/components/GrowthChart'), { ssr: false })

const WaveLogo = () => (
  <svg width="34" height="29" viewBox="0 0 46 40" fill="none">
    <defs>
      <linearGradient id="lg-d" x1="0" y1="40" x2="46" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#00E0C4"/><stop offset="55%" stopColor="#0077DD"/><stop offset="100%" stopColor="#0038BB"/>
      </linearGradient>
      <linearGradient id="ar-d" x1="6" y1="38" x2="42" y2="4" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0050BB"/><stop offset="100%" stopColor="#00DDFF"/>
      </linearGradient>
    </defs>
    <path d="M2 38 L2 29 L9 26.5 L9 35.5 Z"  fill="url(#lg-d)" opacity="0.95"/>
    <path d="M11 38 L11 22 L18 19.5 L18 35.5 Z" fill="url(#lg-d)" opacity="0.85"/>
    <path d="M20 38 L20 15 L27 12.5 L27 35.5 Z" fill="url(#lg-d)" opacity="0.75"/>
    <path d="M29 38 L29 7  L36 4.5  L36 35.5 Z" fill="url(#lg-d)" opacity="0.68"/>
    <path d="M1 25 C6 17 13 13 21 15.5 C27 17.5 30 22 36 17.5" stroke="url(#lg-d)" strokeWidth="3.8" strokeLinecap="round" fill="none"/>
    <path d="M5 36 C14 27 25 16 37 6" stroke="url(#ar-d)" strokeWidth="5" strokeLinecap="round" fill="none"/>
    <path d="M33 3 L43 5.5 L40.5 14.5 Z" fill="url(#ar-d)"/>
  </svg>
)

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0','') + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace('.0','') + 'K'
  return n.toString()
}

interface Props {
  profile: Profile
  stats: ClientStats | null
  monthlyStats: MonthlyStats[]
}

export default function DashboardClient({ profile, stats, monthlyStats }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const updatedAt = stats?.updated_at
    ? new Date(stats.updated_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  const statCards = [
    { label: 'Vues TikTok',          value: stats?.tiktok_views       ?? 0, icon: '🎵', accent: '#FF2D55' },
    { label: 'Vues Instagram',        value: stats?.instagram_views    ?? 0, icon: '📸', accent: '#E1306C' },
    { label: 'Abonnés gagnés',        value: stats?.followers_gained   ?? 0, icon: '👥', accent: '#00E0B8' },
    { label: 'Clics Google Maps',     value: stats?.google_maps_clicks ?? 0, icon: '📍', accent: '#4285F4' },
    { label: 'Commandes Uber Eats',   value: stats?.uber_eats_orders   ?? 0, icon: '🛵', accent: '#06C167' },
    { label: 'Clients estimés',       value: stats?.estimated_clients  ?? 0, icon: '🎯', accent: '#00C2FF' },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b" style={{borderColor:'rgba(0,194,255,0.08)'}}>
        <div className="flex items-center gap-3">
          <WaveLogo/>
          <div>
            <div className="font-display font-bold text-sm leading-tight"
                 style={{background:'linear-gradient(135deg,#0074D9,#00AAFF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
              Market Wave
            </div>
            <div className="text-[0.42rem] tracking-[0.25em] uppercase text-[#00E0B8] font-semibold">Agency</div>
          </div>
        </div>
        <div className="mt-3 pt-3" style={{borderTop:'1px solid rgba(0,194,255,0.07)'}}>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8892A4]">Wave Dashboard</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-[#00C2FF]"
             style={{background:'rgba(0,194,255,0.07)',border:'1px solid rgba(0,194,255,0.12)'}}>
          <span>📊</span> Performances
        </div>
      </nav>

      {/* User */}
      <div className="p-4" style={{borderTop:'1px solid rgba(0,194,255,0.08)'}}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black shrink-0"
               style={{background:'linear-gradient(135deg,#00C2FF,#00E0B8)'}}>
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate">{profile?.name}</div>
            <div className="text-[10px] text-[#8892A4] truncate">{profile?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full text-left text-xs text-[#8892A4] hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
          ← Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#080C14] flex">

      {/* ── Sidebar desktop ── */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 fixed top-0 left-0 h-full"
             style={{background:'#0B0F1A',borderRight:'1px solid rgba(0,194,255,0.09)'}}>
        <SidebarContent/>
      </aside>

      {/* ── Sidebar mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}/>
          <aside className="absolute left-0 top-0 h-full w-72 z-50 flex flex-col"
                 style={{background:'#0B0F1A',borderRight:'1px solid rgba(0,194,255,0.12)'}}>
            <button onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-4 text-[#8892A4] hover:text-white text-xl">✕</button>
            <SidebarContent/>
          </aside>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-64 min-h-screen">

        {/* Top bar mobile */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
             style={{background:'rgba(8,12,20,0.95)',borderBottom:'1px solid rgba(0,194,255,0.08)',backdropFilter:'blur(20px)'}}>
          <button onClick={() => setSidebarOpen(true)} className="flex flex-col gap-1.5 p-1">
            <span className="block w-5 h-0.5 bg-white rounded"/>
            <span className="block w-5 h-0.5 bg-white rounded"/>
            <span className="block w-5 h-0.5 bg-white rounded"/>
          </button>
          <div className="flex items-center gap-2">
            <WaveLogo/>
            <span className="font-display font-bold text-sm"
                  style={{background:'linear-gradient(135deg,#0074D9,#00AAFF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
              Wave Dashboard
            </span>
          </div>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black"
               style={{background:'linear-gradient(135deg,#00C2FF,#00E0B8)'}}>
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 animate-slide-up">
            <div>
              <h1 className="font-display font-bold text-xl sm:text-2xl text-white">
                Bonjour, <span className="gradient-text">{profile?.name?.split(' ')[0]}</span> 👋
              </h1>
              {updatedAt && (
                <p className="text-[#8892A4] text-xs sm:text-sm mt-1">Dernière mise à jour : {updatedAt}</p>
              )}
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full self-start sm:self-auto"
                 style={{background:'rgba(0,224,184,0.07)',border:'1px solid rgba(0,224,184,0.25)'}}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E0B8] animate-pulse"/>
              <span className="text-[#00E0B8] text-xs font-semibold">Données à jour</span>
            </div>
          </div>

          {/* ── Hero bloc nouveaux clients ── */}
          <div className="rounded-2xl p-5 sm:p-7 mb-5 relative overflow-hidden animate-slide-up"
               style={{background:'linear-gradient(145deg,rgba(0,116,217,0.14),rgba(0,224,184,0.06))',border:'1px solid rgba(0,194,255,0.28)',boxShadow:'0 0 60px rgba(0,194,255,0.1)'}}>
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
                 style={{background:'radial-gradient(circle, rgba(0,194,255,0.1) 0%, transparent 70%)'}}/>
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#00E0B8] mb-1">Ce mois-ci</div>
                <div className="font-display font-black text-5xl sm:text-6xl gradient-text leading-none">
                  +{fmt(stats?.new_clients_month ?? 0)}
                </div>
                <div className="text-lg font-semibold text-white mt-1">nouveaux clients</div>
                <div className="text-[#8892A4] text-sm mt-1">estimés via votre stratégie digitale</div>
              </div>
              <div className="text-5xl sm:text-6xl">🚀</div>
            </div>
          </div>

          {/* ── Message agence ── */}
          {stats?.custom_message && (
            <div className="rounded-xl p-4 mb-5 flex gap-3 animate-slide-up"
                 style={{background:'rgba(0,194,255,0.05)',border:'1px solid rgba(0,194,255,0.18)'}}>
              <span className="text-xl shrink-0">💬</span>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#00C2FF] mb-1">
                  Message de votre agence
                </div>
                <p className="text-white/80 text-sm leading-relaxed">{stats.custom_message}</p>
              </div>
            </div>
          )}

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-5">
            {statCards.map((card, i) => (
              <div key={card.label} style={{animationDelay:`${i * 60}ms`}} className="animate-slide-up">
                <StatCard {...card} formatted={fmt(card.value)}/>
              </div>
            ))}
          </div>

          {/* ── Graphique ── */}
          {monthlyStats.length > 0 && (
            <div className="rounded-2xl p-5 sm:p-6 animate-slide-up"
                 style={{background:'#0F1620',border:'1px solid rgba(0,194,255,0.11)'}}>
              <div className="mb-5">
                <h2 className="font-display font-bold text-base sm:text-lg text-white">Évolution mensuelle</h2>
                <p className="text-[#8892A4] text-xs mt-0.5">Vos performances sur les derniers mois</p>
              </div>
              <GrowthChart data={monthlyStats}/>
            </div>
          )}

          {!stats && (
            <div className="text-center py-20 text-[#8892A4]">
              <div className="text-4xl mb-3">📊</div>
              <p className="font-semibold text-white mb-1">Données en cours de préparation</p>
              <p className="text-sm">Votre agence mettra à jour vos statistiques très prochainement.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
