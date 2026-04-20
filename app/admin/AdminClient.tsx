'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import {
  createClientAction,
  updateStatsAction,
  deleteClientAction,
  addMonthlyStatAction,
} from './actions'
import type { ClientWithStats, ClientStats } from '@/lib/types'

/* ─── Champs stats courantes ─────────────────────────────────────── */
const STATS_FIELDS = [
  { key: 'tiktok_views',       label: 'Vues TikTok',             icon: '🎵' },
  { key: 'instagram_views',    label: 'Vues Instagram',           icon: '📸' },
  { key: 'followers_gained',   label: 'Abonnés gagnés',           icon: '👥' },
  { key: 'google_maps_clicks', label: 'Clics Google Maps',        icon: '📍' },
  { key: 'uber_eats_orders',   label: 'Commandes Uber Eats',      icon: '🛵' },
  { key: 'estimated_clients',  label: 'Clients estimés (total)',  icon: '🎯' },
  { key: 'new_clients_month',  label: 'Nouveaux clients ce mois', icon: '🚀' },
]

const MONTHS_FR = [
  'Jan','Fév','Mar','Avr','Mai','Juin',
  'Juil','Août','Sep','Oct','Nov','Déc',
]

interface Props { clients: ClientWithStats[] }
type TabType = 'stats' | 'monthly'

export default function AdminClient({ clients: initial }: Props) {
  const [clients, setClients]       = useState(initial)
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [activeTab, setActiveTab]   = useState<Record<string, TabType>>({})
  const [showCreate, setShowCreate] = useState(false)
  const [createError, setCreateError]     = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [saving, setSaving]               = useState<string | null>(null)
  const [savingMonth, setSavingMonth]     = useState<string | null>(null)
  const [isPending, startTransition]      = useTransition()
  const router   = useRouter()
  const supabase = createClient()

  /* ─── Utils ─── */
  // Supabase renvoie client_stats comme tableau (relation 1-to-many)
  const getSt = (c: ClientWithStats): ClientStats | null =>
    Array.isArray(c.client_stats) ? (c.client_stats[0] ?? null) : null

  const getTab = (id: string): TabType => activeTab[id] ?? 'stats'
  const setTab = (id: string, t: TabType) =>
    setActiveTab(prev => ({ ...prev, [id]: t }))

  /* ─── Handlers ─── */
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreateError('')
    setCreateSuccess('')
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await createClientAction(fd)
        setCreateSuccess(`✅ Client "${fd.get('name')}" créé avec succès !`)
        ;(e.target as HTMLFormElement).reset()
        router.refresh()
      } catch (err: unknown) {
        setCreateError(err instanceof Error ? err.message : 'Erreur inconnue')
      }
    })
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, clientId: string) => {
    e.preventDefault()
    setSaving(clientId)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try { await updateStatsAction(fd); router.refresh() }
      finally { setSaving(null) }
    })
  }

  const handleAddMonth = async (e: React.FormEvent<HTMLFormElement>, clientId: string) => {
    e.preventDefault()
    setSavingMonth(clientId)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await addMonthlyStatAction(fd)
        ;(e.target as HTMLFormElement).reset()
        router.refresh()
      } finally { setSavingMonth(null) }
    })
  }

  const handleDelete = async (clientId: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ? Cette action est irréversible.`)) return
    const fd = new FormData()
    fd.set('client_id', clientId)
    startTransition(async () => {
      await deleteClientAction(fd)
      setClients(c => c.filter(x => x.id !== clientId))
    })
  }

  /* ─── UI ─── */
  return (
    <div className="min-h-screen bg-[#080C14]">

      {/* ── Header ── */}
      <header className="sticky top-0 z-20 px-4 sm:px-8 py-4 flex items-center justify-between"
              style={{background:'rgba(8,12,20,0.95)',borderBottom:'1px solid rgba(0,194,255,0.09)',backdropFilter:'blur(20px)'}}>
        <div>
          <h1 className="font-display font-bold text-lg text-white">Admin Panel</h1>
          <p className="text-[10px] text-[#8892A4] uppercase tracking-widest">Wave Dashboard — Market Wave Agency</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/dashboard"
             className="hidden sm:block text-xs text-[#8892A4] hover:text-[#00C2FF] transition-colors px-3 py-1.5 rounded-lg"
             style={{border:'1px solid rgba(255,255,255,0.07)'}}>
            ← Mon dashboard
          </a>
          <button onClick={handleLogout}
                  className="text-xs text-[#8892A4] hover:text-white transition-colors px-3 py-1.5 rounded-lg"
                  style={{border:'1px solid rgba(255,255,255,0.07)'}}>
            Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Compteur ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Clients actifs', value: clients.length, icon: '👤' },
            { label: 'Stats à jour', value: clients.filter(c => getSt(c)?.updated_at).length, icon: '✅' },
            { label: 'Sans données', value: clients.filter(c => !getSt(c)).length, icon: '⚠️' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 text-center"
                 style={{background:'#0F1620',border:'1px solid rgba(0,194,255,0.1)'}}>
              <div className="text-2xl font-display font-black gradient-text">{s.icon} {s.value}</div>
              <div className="text-[#8892A4] text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Créer un client ── */}
        <section className="rounded-2xl overflow-hidden"
                 style={{background:'#0F1620',border:'1px solid rgba(0,194,255,0.12)'}}>
          <button onClick={() => setShowCreate(v => !v)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-black"
                    style={{background:'linear-gradient(135deg,#00C2FF,#00E0B8)'}}>+</span>
              <span className="font-semibold text-white">Créer un nouveau client</span>
            </div>
            <span className="text-[#8892A4]">{showCreate ? '▲' : '▼'}</span>
          </button>

          {showCreate && (
            <form onSubmit={handleCreate}
                  className="px-6 pb-6 border-t"
                  style={{borderColor:'rgba(0,194,255,0.08)'}}>
              <div className="grid sm:grid-cols-3 gap-4 pt-4">
                {[
                  { name:'name',     label:'Nom du commerce',  type:'text',     placeholder:'Ex : La Bella Pizza' },
                  { name:'email',    label:'Email',            type:'email',    placeholder:'client@email.com' },
                  { name:'password', label:'Mot de passe',     type:'password', placeholder:'Min. 8 caractères' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-[10px] uppercase tracking-widest text-[#8892A4] mb-1.5">{f.label}</label>
                    <input name={f.name} type={f.type} required placeholder={f.placeholder}
                           minLength={f.name==='password' ? 8 : undefined}
                           className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none transition-all"
                           style={{background:'#080C14',border:'1px solid rgba(255,255,255,0.08)'}}
                           onFocus={e=>(e.currentTarget.style.border='1px solid rgba(0,194,255,0.45)')}
                           onBlur={e=>(e.currentTarget.style.border='1px solid rgba(255,255,255,0.08)')}/>
                  </div>
                ))}
              </div>

              {createError   && <div className="mt-3 text-red-400 text-sm bg-red-500/10 rounded-lg px-4 py-2.5 border border-red-500/20">⚠️ {createError}</div>}
              {createSuccess && <div className="mt-3 text-emerald-400 text-sm bg-emerald-500/10 rounded-lg px-4 py-2.5 border border-emerald-500/20">{createSuccess}</div>}

              <div className="mt-4">
                <button type="submit" disabled={isPending}
                        className="px-6 py-2.5 rounded-lg font-bold text-sm text-black disabled:opacity-60 transition-all hover:-translate-y-0.5"
                        style={{background:'linear-gradient(135deg,#00C2FF,#00E0B8)',boxShadow:'0 0 20px rgba(0,194,255,0.25)'}}>
                  {isPending ? 'Création en cours...' : 'Créer le client →'}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* ── Liste clients ── */}
        <section>
          <h2 className="font-display font-bold text-white mb-3">
            Clients <span className="text-[#8892A4] font-normal text-sm">({clients.length})</span>
          </h2>

          {clients.length === 0 ? (
            <div className="text-center py-16 text-[#8892A4] rounded-2xl"
                 style={{background:'#0F1620',border:'1px solid rgba(0,194,255,0.1)'}}>
              <div className="text-4xl mb-3">👤</div>
              <p className="font-semibold text-white mb-1">Aucun client pour l'instant</p>
              <p className="text-sm">Créez votre premier client ci-dessus.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map(client => {
                const st    = getSt(client)
                const isOpen = expanded === client.id
                const tab    = getTab(client.id)

                return (
                  <div key={client.id} className="rounded-2xl overflow-hidden transition-all"
                       style={{background:'#0F1620',border:`1px solid ${isOpen?'rgba(0,194,255,0.3)':'rgba(0,194,255,0.1)'}`,transition:'border-color 0.2s'}}>

                    {/* ─ Header client ─ */}
                    <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors"
                         onClick={() => setExpanded(isOpen ? null : client.id)}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-black shrink-0"
                             style={{background:'linear-gradient(135deg,#00C2FF,#00E0B8)'}}>
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-white text-sm truncate">{client.name}</div>
                          <div className="text-[#8892A4] text-xs truncate">{client.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {st && (
                          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-[#00E0B8]"
                               style={{background:'rgba(0,224,184,0.08)',border:'1px solid rgba(0,224,184,0.18)'}}>
                            🚀 +{st.new_clients_month}
                          </div>
                        )}
                        {!st && (
                          <span className="text-xs text-amber-400 px-2 py-0.5 rounded-full"
                                style={{background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.2)'}}>
                            Sans stats
                          </span>
                        )}
                        <span className="text-[#8892A4] text-xs"
                              style={{transform:isOpen?'rotate(180deg)':'rotate(0)',display:'inline-block',transition:'transform 0.2s'}}>▼</span>
                      </div>
                    </div>

                    {/* ─ Panneau ouvert ─ */}
                    {isOpen && (
                      <div className="border-t" style={{borderColor:'rgba(0,194,255,0.08)'}}>

                        {/* Tabs */}
                        <div className="flex gap-1 px-5 pt-4 pb-2">
                          {(['stats','monthly'] as TabType[]).map(t => (
                            <button key={t}
                                    onClick={() => setTab(client.id, t)}
                                    className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                    style={tab===t
                                      ? {background:'rgba(0,194,255,0.12)',color:'#00C2FF',border:'1px solid rgba(0,194,255,0.3)'}
                                      : {background:'transparent',color:'#8892A4',border:'1px solid rgba(255,255,255,0.06)'}}>
                              {t==='stats' ? '📊 Stats actuelles' : '📅 Stats mensuelles'}
                            </button>
                          ))}
                        </div>

                        {/* ── Tab : stats actuelles ── */}
                        {tab === 'stats' && (
                          <form onSubmit={e => handleUpdate(e, client.id)} className="px-5 pb-6">
                            <input type="hidden" name="client_id" value={client.id}/>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4 mt-2">
                              {STATS_FIELDS.map(f => (
                                <div key={f.key}>
                                  <label className="block text-[10px] uppercase tracking-widest text-[#8892A4] mb-1.5">
                                    {f.icon} {f.label}
                                  </label>
                                  <input type="number" name={f.key} min={0}
                                         defaultValue={(st as unknown as Record<string,number>)?.[f.key] ?? 0}
                                         className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none transition-all"
                                         style={{background:'#080C14',border:'1px solid rgba(255,255,255,0.08)'}}
                                         onFocus={e=>(e.currentTarget.style.border='1px solid rgba(0,194,255,0.4)')}
                                         onBlur={e=>(e.currentTarget.style.border='1px solid rgba(255,255,255,0.08)')}/>
                                </div>
                              ))}
                            </div>

                            <div className="mb-4">
                              <label className="block text-[10px] uppercase tracking-widest text-[#8892A4] mb-1.5">
                                💬 Message personnalisé
                              </label>
                              <textarea name="custom_message" rows={3}
                                        defaultValue={st?.custom_message ?? ''}
                                        placeholder="Ex : Super mois ! Vos vidéos ont cartonné sur TikTok..."
                                        className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none resize-none transition-all"
                                        style={{background:'#080C14',border:'1px solid rgba(255,255,255,0.08)'}}
                                        onFocus={e=>(e.currentTarget.style.border='1px solid rgba(0,194,255,0.4)')}
                                        onBlur={e=>(e.currentTarget.style.border='1px solid rgba(255,255,255,0.08)')}/>
                            </div>

                            <div className="flex items-center gap-3">
                              <button type="submit" disabled={saving===client.id}
                                      className="px-5 py-2.5 rounded-lg font-bold text-sm text-black disabled:opacity-60 transition-all hover:-translate-y-0.5"
                                      style={{background:'linear-gradient(135deg,#00C2FF,#00E0B8)',boxShadow:'0 0 18px rgba(0,194,255,0.25)'}}>
                                {saving===client.id ? '⏳ Mise à jour...' : '✓ Enregistrer'}
                              </button>
                              <button type="button" onClick={() => handleDelete(client.id, client.name)}
                                      className="px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                                      style={{border:'1px solid rgba(239,68,68,0.2)'}}>
                                🗑 Supprimer
                              </button>
                            </div>
                          </form>
                        )}

                        {/* ── Tab : stats mensuelles ── */}
                        {tab === 'monthly' && (
                          <div className="px-5 pb-6">
                            <p className="text-[#8892A4] text-xs mb-4 mt-2">
                              Ajoutez un point de données par mois pour alimenter le graphique d'évolution.
                            </p>
                            <form onSubmit={e => handleAddMonth(e, client.id)}>
                              <input type="hidden" name="client_id" value={client.id}/>

                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                                {/* Mois */}
                                <div className="sm:col-span-3 grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-[#8892A4] mb-1.5">📅 Mois</label>
                                    <select name="month_label" required
                                            className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                                            style={{background:'#080C14',border:'1px solid rgba(255,255,255,0.08)'}}>
                                      {MONTHS_FR.map((m,i) => (
                                        <option key={m} value={m}>{m}</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-[#8892A4] mb-1.5">🔢 Ordre (1–12)</label>
                                    <input type="number" name="month_order" min={1} max={12} required
                                           placeholder="Ex : 1 pour Jan"
                                           className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                                           style={{background:'#080C14',border:'1px solid rgba(255,255,255,0.08)'}}/>
                                  </div>
                                </div>

                                {/* Champs data */}
                                {[
                                  { key:'tiktok_views',       label:'Vues TikTok',      icon:'🎵' },
                                  { key:'instagram_views',    label:'Vues Instagram',   icon:'📸' },
                                  { key:'followers_gained',   label:'Abonnés gagnés',   icon:'👥' },
                                  { key:'google_maps_clicks', label:'Clics Maps',       icon:'📍' },
                                  { key:'estimated_clients',  label:'Clients estimés',  icon:'🎯' },
                                ].map(f => (
                                  <div key={f.key}>
                                    <label className="block text-[10px] uppercase tracking-widest text-[#8892A4] mb-1.5">
                                      {f.icon} {f.label}
                                    </label>
                                    <input type="number" name={f.key} min={0} defaultValue={0}
                                           className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                                           style={{background:'#080C14',border:'1px solid rgba(255,255,255,0.08)'}}/>
                                  </div>
                                ))}
                              </div>

                              <button type="submit" disabled={savingMonth===client.id}
                                      className="px-5 py-2.5 rounded-lg font-bold text-sm text-black disabled:opacity-60 transition-all hover:-translate-y-0.5"
                                      style={{background:'linear-gradient(135deg,#7B61FF,#00C2FF)',boxShadow:'0 0 18px rgba(123,97,255,0.25)'}}>
                                {savingMonth===client.id ? '⏳ Ajout...' : '+ Ajouter ce mois'}
                              </button>
                            </form>
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}
