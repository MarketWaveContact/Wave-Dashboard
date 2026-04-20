'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

const WaveLogo = () => (
  <svg width="42" height="36" viewBox="0 0 46 40" fill="none">
    <defs>
      <linearGradient id="lg-l" x1="0" y1="40" x2="46" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#00E0C4"/>
        <stop offset="55%" stopColor="#0077DD"/>
        <stop offset="100%" stopColor="#0038BB"/>
      </linearGradient>
      <linearGradient id="ar-l" x1="6" y1="38" x2="42" y2="4" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0050BB"/>
        <stop offset="100%" stopColor="#00DDFF"/>
      </linearGradient>
    </defs>
    <path d="M2 38 L2 29 L9 26.5 L9 35.5 Z"  fill="url(#lg-l)" opacity="0.95"/>
    <path d="M11 38 L11 22 L18 19.5 L18 35.5 Z" fill="url(#lg-l)" opacity="0.85"/>
    <path d="M20 38 L20 15 L27 12.5 L27 35.5 Z" fill="url(#lg-l)" opacity="0.75"/>
    <path d="M29 38 L29 7  L36 4.5  L36 35.5 Z" fill="url(#lg-l)" opacity="0.68"/>
    <path d="M2 29 L9 26.5 L11 27.5 L4 30 Z"    fill="#00EED8" opacity="0.4"/>
    <path d="M11 22 L18 19.5 L20 20.5 L13 23 Z"  fill="#00BBEE" opacity="0.35"/>
    <path d="M20 15 L27 12.5 L29 13.5 L22 16 Z"  fill="#0099DD" opacity="0.3"/>
    <path d="M1 25 C6 17 13 13 21 15.5 C27 17.5 30 22 36 17.5"
          stroke="url(#lg-l)" strokeWidth="3.8" strokeLinecap="round" fill="none"/>
    <path d="M5 36 C14 27 25 16 37 6"
          stroke="url(#ar-l)" strokeWidth="5" strokeLinecap="round" fill="none"/>
    <path d="M33 3 L43 5.5 L40.5 14.5 Z" fill="url(#ar-l)"/>
  </svg>
)

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const router   = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect.')
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <main className="min-h-screen bg-[#080C14] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-60 -right-60 w-[600px] h-[600px] rounded-full"
             style={{background:'radial-gradient(circle, rgba(0,116,217,0.18) 0%, transparent 70%)'}}/>
        <div className="absolute -bottom-60 -left-60 w-[500px] h-[500px] rounded-full"
             style={{background:'radial-gradient(circle, rgba(0,224,184,0.12) 0%, transparent 70%)'}}/>
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{backgroundImage:'linear-gradient(rgba(0,194,255,1) 1px, transparent 1px),linear-gradient(90deg, rgba(0,194,255,1) 1px, transparent 1px)',backgroundSize:'60px 60px'}}/>
      </div>

      <div className="relative w-full max-w-[420px] animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <WaveLogo />
            <div className="text-left">
              <div className="font-display font-bold text-xl leading-tight"
                   style={{background:'linear-gradient(135deg,#0074D9,#00AAFF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
                Market Wave
              </div>
              <div className="text-[0.5rem] tracking-[0.25em] uppercase text-[#00E0B8] font-semibold">
                Agency
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
               style={{background:'rgba(0,194,255,0.07)',border:'1px solid rgba(0,194,255,0.2)'}}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00C2FF]">Wave Dashboard</span>
          </div>

          <h1 className="text-2xl font-display font-bold text-white">Bienvenue</h1>
          <p className="text-[#8892A4] text-sm mt-1">Connectez-vous pour accéder à vos stats</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8"
             style={{background:'#0F1620',border:'1px solid rgba(0,194,255,0.14)',boxShadow:'0 0 60px rgba(0,194,255,0.07)'}}>
          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#8892A4] mb-2">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-[#4a5568] outline-none transition-all"
                style={{background:'#080C14',border:'1px solid rgba(255,255,255,0.08)'}}
                onFocus={e => (e.currentTarget.style.border = '1px solid rgba(0,194,255,0.5)')}
                onBlur={e  => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)')}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-widest text-[#8892A4] mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg px-4 py-3 text-sm text-white placeholder-[#4a5568] outline-none transition-all"
                style={{background:'#080C14',border:'1px solid rgba(255,255,255,0.08)'}}
                onFocus={e => (e.currentTarget.style.border = '1px solid rgba(0,194,255,0.5)')}
                onBlur={e  => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)')}
              />
            </div>

            {error && (
              <div className="rounded-lg px-4 py-3 text-sm text-red-400 flex items-center gap-2"
                   style={{background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)'}}>
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-sm text-black transition-all disabled:opacity-60 hover:-translate-y-0.5 active:translate-y-0"
              style={{background:'linear-gradient(135deg,#00C2FF,#00E0B8)',boxShadow:'0 0 25px rgba(0,194,255,0.3)'}}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/>
                  Connexion...
                </span>
              ) : 'Se connecter →'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#8892A4] text-xs mt-5">
          Accès réservé aux clients <span className="text-[#00C2FF]">Market Wave Agency</span>
        </p>
      </div>
    </main>
  )
}
