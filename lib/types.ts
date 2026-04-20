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
  stat_date: string
  month_label: string
  month_order: number
  tiktok_views: number
  instagram_views: number
  followers_gained: number
  google_maps_clicks: number
  uber_eats_orders: number
  estimated_clients: number
  new_clients: number
  custom_message: string
  created_at: string
}

export interface ClientWithStats extends Profile {
  client_stats: ClientStats[] | null
  monthly_stats?: MonthlyStats[] | null
}
