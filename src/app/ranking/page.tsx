import Image from "next/image";
import { MedalIcon, TrendingUpIcon } from "lucide-react";

import { createSupabaseServerPublicClient } from "@/lib/supabase/server";

export const revalidate = 3600; // Cache por 1 hora

export const metadata = {
  title: "Ranking | JP Poker Club",
  description: "Veja o ranking dos melhores jogadores do JP Poker Club.",
};

type PlayerRanking = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  elo_points: number;
  elo_tier: string;
};

const ELO_TIER_LABELS: Record<string, string> = {
  bronze: "Bronze",
  prata: "Prata",
  ouro: "Ouro",
  platina: "Platina",
  diamante: "Diamante",
};

const ELO_TIER_CLASSES: Record<string, string> = {
  bronze: "border-amber-700/40 bg-amber-500/10 text-amber-300",
  prata: "border-slate-300/40 bg-slate-200/10 text-slate-200",
  ouro: "border-yellow-400/40 bg-yellow-400/10 text-yellow-300",
  platina: "border-zinc-200/40 bg-zinc-200/10 text-zinc-100",
  diamante: "border-cyan-300/40 bg-cyan-400/10 text-cyan-300",
};

const MEDAL_ICONS: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

function calculatePosition(index: number, players: PlayerRanking[]): number {
  if (index === 0) return 1;

  // Verifica se o atual tem os mesmos pontos que o anterior
  if (players[index].elo_points === players[index - 1].elo_points) {
    // Retorna a mesma posição do anterior
    return calculatePosition(index - 1, players);
  }

  // Caso contrário, a posição é o index + 1
  return index + 1;
}

export default async function RankingPage() {
  const supabase = createSupabaseServerPublicClient();

  // Fetch only the top 10 players ranked by elo_points
  const { data: players, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, elo_points, elo_tier")
    .order("elo_points", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Erro ao buscar ranking:", error);
  }

  const rankedPlayers = (players || []) as PlayerRanking[];

  return (
    <main className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-[#070707] px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 -top-[20%] h-160 w-160 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(50,224,53,0.08)_0%,transparent_70%)]" />
      </div>

      <section className="relative z-10 w-full max-w-2xl">
        <div className="mb-8 flex items-center gap-4">
          <MedalIcon size={32} className="shrink-0 text-[#ffd700]" />
          <div className="flex flex-col gap-1">
            <h1 className="text-[1.5rem] font-bold leading-tight text-white sm:text-[1.75rem]">
              Ranking Geral
            </h1>
            <p className="text-sm text-[#999999]">Top 10 melhores jogadores</p>
          </div>
        </div>

        {rankedPlayers.length > 0 ? (
          <div className="mb-8 flex flex-col gap-3">
            {rankedPlayers.map((player, index) => {
              const position = calculatePosition(index, rankedPlayers);
              const tierLabel = ELO_TIER_LABELS[player.elo_tier] || "Bronze";
              const tierClasses =
                ELO_TIER_CLASSES[player.elo_tier] || ELO_TIER_CLASSES.bronze;
              const medal = MEDAL_ICONS[position];

              return (
                <div
                  key={player.id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121217] p-3 transition duration-200 ease-in-out hover:border-white/15 hover:bg-white/5 hover:translate-x-1 sm:gap-4 sm:p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-white/10 bg-white/5 sm:h-12 sm:w-12">
                    {medal ? (
                      <span className="text-[1.75rem] leading-none">
                        {medal}
                      </span>
                    ) : (
                      <span className="text-base font-bold text-[#ffd700]">
                        #{position}
                      </span>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[10px] border border-[#32e035]/30 bg-[#32e035]/10 sm:h-12 sm:w-12">
                      {player.avatar_url ? (
                        <Image
                          src={player.avatar_url}
                          alt={player.display_name}
                          width={48}
                          height={48}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-xl font-bold text-[#32e035]">
                          {player.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex flex-col gap-1">
                      <p className="truncate text-[0.95rem] font-semibold text-white sm:text-sm">
                        {player.display_name}
                      </p>
                      <div
                        className={`inline-flex w-fit items-center rounded border px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-wide ${tierClasses}`}
                      >
                        {tierLabel}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 whitespace-nowrap">
                    <div className="flex items-center gap-2 rounded-lg border border-[#32e035]/30 bg-[#32e035]/10 px-3 py-2 text-sm font-semibold text-[#32e035] sm:text-[0.85rem]">
                      <TrendingUpIcon size={16} className="shrink-0" />
                      <span>{player.elo_points} pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mb-8 py-12 text-center text-[#999999]">
            <p className="m-0 text-lg">Nenhum jogador registrado ainda</p>
          </div>
        )}
      </section>
    </main>
  );
}
