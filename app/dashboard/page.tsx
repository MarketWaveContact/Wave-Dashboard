import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import type { Profile, ClientStats, MonthlyStats } from '@/lib/types'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: stats }, { data: monthly }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('client_stats').select('*').eq('client_id', user.id).single(),
    supabase.from('monthly_stats').select('*').eq('client_id', user.id).order('month_order'),
  ])

  return (
    <DashboardClient
      profile={profile as Profile}
      stats={stats as ClientStats | null}
      monthlyStats={(monthly ?? []) as MonthlyStats[]}
    />
  )
}
