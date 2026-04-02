import { ArrowUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return <main>
    <h1 className="text-2xl font-bold">Bem-vindo ao JP Poker Club!</h1>
    <div className="flex flex-wrap items-center gap-2 md:flex-row">
      <Button variant="destructive">Button</Button>
      <Button variant="ghost" size="icon" aria-label="Submit">
        <ArrowUpIcon />
      </Button>
      <Button variant="ghost" className="dark" size="icon" aria-label="Submit">
        <ArrowUpIcon />
      </Button>
    </div>
  </main>;
}
