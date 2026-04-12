import { NewsEditorialSection } from "@/components/layout/news-editorial-section"

export const revalidate = 3600

export default async function NewsPage() {
  return <NewsEditorialSection />
}
