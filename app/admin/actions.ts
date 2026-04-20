'use server'

import { createAdminClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

const MONTH_NAMES = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc']

export async function createClientAction(formData: FormData) {
  const supabase = createAdminClient()

  const name     = (formData.get('name') as string).trim()
  const email    = (formData.get('email') as string).trim()
  const password = (formData.get('password') as string).trim()

  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email, password, user_metadata: { name }, email_confirm: true,
  })

  if (error) throw new Error(error.message)
  if (!user) throw new Error('Erreur création utilisateur')

  await supabase.from('client_stats').insert({
    client_id: user.id,
    tiktok_views: 0, instagram_views: 0, followers_gained: 0,
    google_maps_clicks: 0, uber_eats_orders: 0,
    estimated_clients: 0, new_clients_month: 0, custom_message: '',
  })

  revalidatePath('/admin')
}

export async function updateStatsAction(formData: FormData) {
  const supabase  = createAdminClient()
  const client_id = formData.get('client_id') as string
  const stat_date = (formData.get('stat_date') as string) || new Date().toISOString().split('T')[0]

  const payload = {
    tiktok_views:       Number(formData.get('tiktok_views'))       || 0,
    instagram_views:    Number(formData.get('instagram_views'))    || 0,
    followers_gained:   Number(formData.get('followers_gained'))   || 0,
    google_maps_clicks: Number(formData.get('google_maps_clicks')) || 0,
    uber_eats_orders:   Number(formData.get('uber_eats_orders'))   || 0,
    estimated_clients:  Number(formData.get('estimated_clients'))  || 0,
    new_clients_month:  Number(formData.get('new_clients_month'))  || 0,
    custom_message:     (formData.get('custom_message') as string) || '',
  }

  const { error } = await supabase
    .from('client_stats')
    .upsert({ client_id, ...payload, updated_at: new Date().toISOString() }, { onConflict: 'client_id' })

  if (error) throw new Error(error.message)

  const d = new Date(stat_date)
  await supabase.from('monthly_stats').insert({
    client_id,
    stat_date,
    month_label:        MONTH_NAMES[d.getMonth()],
    month_order:        d.getMonth() + 1,
    tiktok_views:       payload.tiktok_views,
    instagram_views:    payload.instagram_views,
    followers_gained:   payload.followers_gained,
    google_maps_clicks: payload.google_maps_clicks,
    uber_eats_orders:   payload.uber_eats_orders,
    estimated_clients:  payload.estimated_clients,
    new_clients:        payload.new_clients_month,
    custom_message:     payload.custom_message,
  })

  revalidatePath('/admin')
  revalidatePath('/dashboard')
}

export async function deleteEntryAction(formData: FormData) {
  const supabase  = createAdminClient()
  const entry_id  = formData.get('entry_id') as string
  await supabase.from('monthly_stats').delete().eq('id', entry_id)
  revalidatePath('/admin')
}

export async function deleteClientAction(formData: FormData) {
  const supabase  = createAdminClient()
  const client_id = formData.get('client_id') as string
  await supabase.auth.admin.deleteUser(client_id)
  revalidatePath('/admin')
}
