import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase-server'
import type { ClientWithStats } from '@/lib/types'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Vérifier que l'utilisateur est admin (admin client bypass RLS)
  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')
  const { data: clients } = await admin
    .from('profiles')
    .select('*, client_stats(*), monthly_stats(*)')
    .eq('is_admin', false)
    .order('created_at', { ascending: false })

  return <AdminClient clients={(clients ?? []) as ClientWithStats[]}/>
}
