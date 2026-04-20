export interface Profile {
  id: string
  name: string
  email: string
  is_admin: boolean
  created_at: string
}

export interface ClientStats {
  id: string
  client_id: string
  tiktok_views: number
  instagram_views: number
  followers_gained: number
  google_maps_clicks: number
  uber_eats_orders: number
  estimated_clients: number
  new_clients_month: number
  custom_message: string
  updated_at: string
}

export interface MonthlyStats {
  id: string
  client_id: string
  month_label: string
  month_order: number
  tiktok_views: number
  instagram_views: number
  followers_gained: number
  google_maps_clicks: number
  estimated_clients: number
}

// Supabase renvoie les relations en tableau même avec UNIQUE — on prend [0]
export interface ClientWithStats extends Profile {
  client_stats: ClientStats[] | null
}
