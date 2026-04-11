import "server-only"

import { createSupabaseServerClient } from "@/lib/supabase/server"

export type AdminCarouselItem = {
  id: string
  title: string
  description: string | null
  desktop_image_url: string
  mobile_image_url: string
  action_text: string
  link_url: string
  is_active: boolean
  sort_order: number
  created_at: string
}

export async function getAdminCarouselItems() {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("carousel_items")
    .select("id,title,description,desktop_image_url,mobile_image_url,action_text,link_url,is_active,sort_order,created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error || !data) {
    return [] as AdminCarouselItem[]
  }

  return data as AdminCarouselItem[]
}
