'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { createClientAction, updateStatsAction, deleteEntryAction, deleteClientAction } from './actions'
import type { ClientWithStats, ClientStats, MonthlyStats } from '@/lib/types'

const FIELDS = [
  { key: 'tiktok_views',       label: 'Vues TikTok',             icon: '🎵' },
  { key: 'instagram_views',    label: 'Vues Instagram',           icon: '📸' },
  { key: 'followers_gained',   label: 'Abonnés gagnés',           icon: '👥' },
  { key: 'google_maps_clicks', label: 'Clics Google Maps',        icon: '📍' },
  { key: 'uber_eats_orders',   label: 'Commandes Uber Eats',      icon: '🛵' },
  { key: 'estimated_clients',  label: 'Clients estimés (total)',  icon: '🎯' },
  { key: 'new_clients_month',  label: 'Nouveaux clients ce mois', icon: '🚀' },
]

function getSt(c: ClientWithStats): ClientStats | null {
  return Array.isArray(c.client_stats) ? (c.client_stats[0] ?? null) : null
}

function getHistory(c: ClientWithStats): MonthlyStats[] {
  const entries = Array.isArray(c.monthly_stats) ? c.monthly_stats : []
  return [...entries].sort((a, b) =>
    new Date(b.stat_date || b.created_at).getTime() - new Date(a.stat_date || a.created_at).getTime()
  )
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.0', '') + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace('.0', '') + 'K'
  return n.toString()
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

interface Props { clients: ClientWithStats[] }

export default function AdminClient({ clients: initial }: Props) {
  const [clients, setClients]     = useState(initial)
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [createError, setCreateError]     = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [saving, setSaving]   = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router   = useRouter()
  const supabase = createClient()

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

  const handleDeleteEntry = async (entryId: string) => {
    const fd = new FormData()
    fd.set('entry_id', entryId)
    startTransition(async () => {
      await deleteEntryAction(fd)
      router.refresh()
    })
  }

  const handleDeleteClient = async (clientId: string, name: string) => {
    if (!confirm(`Supprimer "${name}" ? Cette action est irréversible.`)) return
    const fd = new FormData()
    fd.set('client_id', clientId)
    startTransition(async () => {
      await deleteClientAction(fd)
      setClients(c => c.filter(x => x.id !== clientId))
    })
  }

  return (
    <div className="min-h-screen bg-[#080C14]">

      {/* Header */}
      <header className="sticky top-0 z-20 px-4 sm:px-8 py-4 flex items-center justify-between"
              style={{background:'rgba(8,12,20,0.95)',borderBottom:'1px solid rgba(0,194,255,0.09)',backdropFilter:'blur(20px)'}}>
        <div>
          <h1 className="font-display font-bold text-lg text-white">Admin Panel</h1>
          <p className="text-[10px] text-[#8892A4] uppercase tracking-widest">Wave Dashboard — Market Wave Agency</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="hidden sm:block text-xs text-[#8892A4] hover:text-[#00C2FF] transition-colors px-3 py-1.5 rounded-lg"
             style={{border:'1px solid rgba(255,255,255,0.07)'}}>← Mon dashboard</a>
          <button onClick={handleLogout} className="text-xs text-[#8892A4] hover:text-white transition-colors px-3 py-1.5 rounded-lg"
                  style={{border:'1px solid rgba(255,255,255,0.07)'}}>Déconnexion</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Compteurs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Clients actifs', value: clients.length,                                          icon: '👤', color: '#00C2FF' },
            { label: 'Stats à jour',   value: clients.filter(c => getSt(c)?.updated_at).length,        icon: '✅', color: '#00E0B8' },
            { label: 'Sans données',   value: clients.filter(c => !getSt(c)).length,                   icon: '⚠️', color: '#FBBF24' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4 text-center"
                 style={{background:'#0F1620',border:'1px solid rgba(0,194,255,0.1)'}}>
              <div className="text-2xl font-display font-black" style={{color: s.color}}>{s.value}</div>
              <div className="text-[#8892A4] text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Créer un client */}
        <section className="rounded-2xl overflow-hidden" style={{background:'#0F1620',border:'1px solid rgba(0,194,255,0.12)'}}>
          <button onClick={() => setShowCreate(v => !v)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-black"
                    style={{background:'linear-gradient(135deg,#00C2FF,#00E0B8)'}}>+</span>
              <span className="font-semibold text-white">Créer un nouveau client</span>
            </div>
            <span className="text-[#8892A4] text-xs">{showCreate ? '▲' : '▼'}</span>
          </button>

          {showCreate && (
            <form onSubmit={handleCreate} className="px-6 pb-6 border-t" style={{borderColor:'rgba(0,194,255,0.08)'}}>
              <div className="grid sm:grid-cols-3 gap-4 pt-5">
                {[
                  { name:'name',     label:'Nom du commerce', type:'text',     ph:'Ex : La Bella Pizza' },
                  { name:'email',    label:'Email',           type:'email',    ph:'client@email.com' },
                  { name:'password', label:'Mot de passe',    type:'password', ph:'Min. 8 caractères' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block text-[10px] uppercase tracking-widest text-[#8892A4] mb-1.5">{f.label}</label>
                    <input name={f.name} type={f.type} required placeholder={f.ph}
                           minLength={f.name === 'password' ? 8 : undefined}
                           className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                           style={{background:'#080C14',border:'1px solid rgba(255,255,255,0.08)'}}
                           onFocus={e => (e.currentTarget.style.border = '1px solid rgba(0,194,255,0.45)')}
                           onBlur={e  => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)')}/>
                  </div>
                ))}
              </div>
              {createError   && <p className="mt-3 text-red-400 text-sm bg-red-500/10 rounded-lg px-4 py-2.5 border border-red-500/20">⚠️ {createError}</p>}
              {createSuccess && <p className="mt-3 text-emerald-400 text-sm bg-emerald-500/10 rounded-lg px-4 py-2.5 border border-emerald-500/20">{createSuccess}</p>}
              <button type="submit" disabled={isPending} className="mt-5 px-6 py-2.5 rounded-lg font-bold text-sm text-black disabled:opacity-60 transition-all hover:-translate-y-0.5"
                      style={{background:'linear-gradient(135deg,#00C2FF,#00E0B8)',boxShadow:'0 0 20px rgba(0,194,255,0.25)'}}>
                {isPending ? 'Création...' : 'Créer le client →'}
              </button>
            </form>
          )}
        </section>

        {/* Liste clients */}
        <section>
          <h2 className="font-display font-bold text-white mb-3">
            Clients <span className="text-[#8892A4] font-normal text-sm">({clients.length})</span>
          </h2>

          {clients.length === 0 ? (
            <div className="text-center py-16 text-[#8892A4] rounded-2xl" style={{background:'#0F1620',border:'1px solid rgba(0,194,255,0.1)'}}>
              <div className="text-4xl mb-3">👤</div>
              <p className="font-semibold text-white mb-1">Aucun client pour l'instant</p>
              <p className="text-sm">Créez votre premier client ci-dessus.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map(client => {
                const st      = getSt(client)
                const history = getHistory(client)
                const isOpen  = expanded === client.id

                return (
                  <div key={client.id} className="rounded-2xl overflow-hidden"
                       style={{background:'#0F1620',border:`1px solid ${isOpen ? 'rgba(0,194,255,0.3)' : 'rgba(0,194,255,0.1)'}`,transition:'border-color 0.2s'}}>

                    {/* Header client */}
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
                        {st ? (
                          <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#00E0B8]"
                                style={{background:'rgba(0,224,184,0.08)',border:'1px solid rgba(0,224,184,0.18)'}}>
                            🚀 +{st.new_clients_month} • {fmt(st.tiktok_views)} vues
                          </span>
                        ) : (
                          <span className="text-xs text-amber-400 px-2 py-0.5 rounded-full"
                                style={{background:'rgba(251,191,36,0.1)',border:'1px solid rgba(251,191,36,0.2)'}}>
                            Sans stats
                          </span>
                        )}
                        <span className="text-[#8892A4] text-xs transition-transform duration-200"
                              style={{display:'inline-block',transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
                      </div>
                    </div>

                    {/* Panneau ouvert */}
                    {isOpen && (
                      <div className="border-t" style={{borderColor:'rgba(0,194,255,0.08)'}}>
                        <form onSubmit={e => handleUpdate(e, client.id)} className="px-5 py-5">
                          <input type="hidden" name="client_id" value={client.id}/>

                          {/* Date */}
                          <div className="mb-5">
                            <label className="block text-[10px] uppercase tracking-widest text-[#8892A4] mb-1.5">📅 Date des stats</label>
                            <input type="date" name="stat_date" defaultValue={today()}
                                   className="rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                                   style={{background:'#080C14',border:'1px solid rgba(0,194,255,0.3)',colorScheme:'dark'}}/>
                            <p className="text-[10px] text-[#8892A4] mt-1">Chaque enregistrement crée une entrée datée dans l'historique.</p>
                          </div>

                          {/* Stats fields — pre-filled */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                            {FIELDS.map(f => (
                              <div key={f.key}>
                                <label className="block text-[10px] uppercase tracking-widest text-[#8892A4] mb-1.5">
                                  {f.icon} {f.label}
                                </label>
                                <input type="number" name={f.key} min={0}
                                       defaultValue={(st as unknown as Record<string,number>)?.[f.key] ?? 0}
                                       className="w-full rounded-lg px-3 py-2 text-sm text-white outline-none"
                                       style={{background:'#080C14',border:'1px solid rgba(255,255,255,0.08)'}}
                                       onFocus={e => (e.currentTarget.style.border = '1px solid rgba(0,194,255,0.4)')}
                                       onBlur={e  => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)')}/>
                              </div>
                            ))}
                          </div>

                          {/* Message */}
                          <div className="mb-4">
                            <label className="block text-[10px] uppercase tracking-widest text-[#8892A4] mb-1.5">💬 Message personnalisé</label>
                            <textarea name="custom_message" rows={2} defaultValue={st?.custom_message ?? ''}
                                      placeholder="Ex : Super mois ! Vos vidéos ont cartonné sur TikTok..."
                                      className="w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none resize-none"
                                      style={{background:'#080C14',border:'1px solid rgba(255,255,255,0.08)'}}
                                      onFocus={e => (e.currentTarget.style.border = '1px solid rgba(0,194,255,0.4)')}
                                      onBlur={e  => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)')}/>
                          </div>

                          <div className="flex items-center gap-3">
                            <button type="submit" disabled={saving === client.id}
                                    className="px-5 py-2.5 rounded-xl font-bold text-sm text-black disabled:opacity-60 transition-all hover:-translate-y-0.5"
                                    style={{background:'linear-gradient(135deg,#00C2FF,#00E0B8)',boxShadow:'0 0 18px rgba(0,194,255,0.25)'}}>
                              {saving === client.id ? '⏳ Enregistrement...' : '✓ Enregistrer'}
                            </button>
                            <button type="button" onClick={() => handleDeleteClient(client.id, client.name)}
                                    className="px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                                    style={{border:'1px solid rgba(239,68,68,0.2)'}}>
                              🗑 Supprimer le client
                            </button>
                          </div>
                        </form>

                        {/* Historique des entrées */}
                        {history.length > 0 && (
                          <div className="px-5 pb-5 border-t" style={{borderColor:'rgba(0,194,255,0.06)'}}>
                            <h3 className="text-[10px] uppercase tracking-widest text-[#8892A4] font-bold mt-4 mb-3">
                              📋 Historique ({history.length} entrées)
                            </h3>
                            <div className="space-y-2">
                              {history.map(entry => (
                                <div key={entry.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                                     style={{background:'rgba(0,194,255,0.04)',border:'1px solid rgba(0,194,255,0.08)'}}>
                                  <div className="flex items-center gap-4 min-w-0 flex-wrap">
                                    <span className="text-xs font-bold text-[#00C2FF] shrink-0">
                                      {entry.stat_date
                                        ? new Date(entry.stat_date).toLocaleDateString('fr-FR', {day:'numeric',month:'short',year:'numeric'})
                                        : entry.month_label}
                                    </span>
                                    <span className="text-xs text-[#8892A4]">🎵 {fmt(entry.tiktok_views)}</span>
                                    <span className="text-xs text-[#8892A4]">👥 {fmt(entry.followers_gained)}</span>
                                    <span className="text-xs text-[#8892A4]">🎯 {fmt(entry.estimated_clients)} clients</span>
                                    {entry.new_clients > 0 && (
                                      <span className="text-xs text-[#00E0B8]">🚀 +{entry.new_clients}</span>
                                    )}
                                  </div>
                                  <button type="button" onClick={() => handleDeleteEntry(entry.id)}
                                          className="text-[#8892A4] hover:text-red-400 transition-colors text-xs px-2 py-1 rounded shrink-0 ml-2">
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
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
