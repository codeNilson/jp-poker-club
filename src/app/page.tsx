import { HomeCarousel } from "@/components/layout/home-carousel"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createSupabaseServerClient()

  const { data } = await supabase
    .from("carousel_items")
    .select(
      "id,title,description,desktop_image_url,mobile_image_url,action_text,link_url"
    )
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  const items = (data ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    desktopImageUrl: item.desktop_image_url,
    mobileImageUrl: item.mobile_image_url,
    actionText: item.action_text,
    linkUrl: item.link_url,
  }))

  return (
    <main className="py-5 sm:py-8">
      <HomeCarousel items={items} />
    </main>
  )
}
