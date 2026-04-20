export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import type { Profile, ClientStats, MonthlyStats } from '@/lib/types'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Utilise le client admin pour bypass RLS (lecture serveur uniquement)
  const admin = createAdminClient()
  const [{ data: profile }, { data: stats }, { data: monthly }] = await Promise.all([
    admin.from('profiles').select('*').eq('id', user.id).single(),
    admin.from('client_stats').select('*').eq('client_id', user.id).single(),
    admin.from('monthly_stats').select('*').eq('client_id', user.id).order('month_order'),
  ])

  return (
    <DashboardClient
      profile={profile as Profile}
      stats={stats as ClientStats | null}
      monthlyStats={(monthly ?? []) as MonthlyStats[]}
    />
  )
}
