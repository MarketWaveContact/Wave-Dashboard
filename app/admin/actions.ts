'use server'

import { createAdminClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createClientAction(formData: FormData) {
  const supabase = createAdminClient()

  const name     = (formData.get('name') as string).trim()
  const email    = (formData.get('email') as string).trim()
  const password = (formData.get('password') as string).trim()

  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email,
    password,
    user_metadata: { name },
    email_confirm: true,
  })

  if (error) throw new Error(error.message)
  if (!user)  throw new Error('Erreur création utilisateur')

  // Stats initiales
  await supabase.from('client_stats').insert({
    client_id:          user.id,
    tiktok_views:       0,
    instagram_views:    0,
    followers_gained:   0,
    google_maps_clicks: 0,
    uber_eats_orders:   0,
    estimated_clients:  0,
    new_clients_month:  0,
    custom_message:     '',
  })

  revalidatePath('/admin')
}

export async function updateStatsAction(formData: FormData) {
  const supabase   = createAdminClient()
  const client_id  = formData.get('client_id') as string

  const payload = {
    tiktok_views:       Number(formData.get('tiktok_views'))       || 0,
    instagram_views:    Number(formData.get('instagram_views'))    || 0,
    followers_gained:   Number(formData.get('followers_gained'))   || 0,
    google_maps_clicks: Number(formData.get('google_maps_clicks')) || 0,
    uber_eats_orders:   Number(formData.get('uber_eats_orders'))   || 0,
    estimated_clients:  Number(formData.get('estimated_clients'))  || 0,
    new_clients_month:  Number(formData.get('new_clients_month'))  || 0,
    custom_message:     (formData.get('custom_message') as string) || '',
    updated_at:         new Date().toISOString(),
  }

  const { error } = await supabase
    .from('client_stats')
    .upsert({ client_id, ...payload }, { onConflict: 'client_id' })

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function addMonthlyStatAction(formData: FormData) {
  const supabase  = createAdminClient()
  const client_id = formData.get('client_id') as string

  const payload = {
    client_id,
    month_label:        (formData.get('month_label') as string) || '',
    month_order:        Number(formData.get('month_order'))      || 0,
    tiktok_views:       Number(formData.get('tiktok_views'))     || 0,
    instagram_views:    Number(formData.get('instagram_views'))  || 0,
    followers_gained:   Number(formData.get('followers_gained')) || 0,
    google_maps_clicks: Number(formData.get('google_maps_clicks')) || 0,
    estimated_clients:  Number(formData.get('estimated_clients')) || 0,
  }

  const { error } = await supabase.from('monthly_stats').insert(payload)
  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function deleteClientAction(formData: FormData) {
  const supabase  = createAdminClient()
  const client_id = formData.get('client_id') as string

  await supabase.auth.admin.deleteUser(client_id)
  revalidatePath('/admin')
}
