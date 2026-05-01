import Link from "next/link";
import { MedalIcon, TrendingUpIcon } from "lucide-react";

import { createSupabaseServerPublicClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

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

const ELO_TIER_COLORS: Record<string, string> = {
  bronze: "#cd7f32",
  prata: "#c0c0c0",
  ouro: "#ffd700",
  platina: "#e5e4e2",
  diamante: "#00d9ff",
};

const ELO_TIER_LABELS: Record<string, string> = {
  bronze: "Bronze",
  prata: "Prata",
  ouro: "Ouro",
  platina: "Platina",
  diamante: "Diamante",
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
    <main className="ranking-page">
      {/* Background decorativo */}
      <div className="ranking-bg" aria-hidden="true">
        <div className="ranking-bg-glow" />
      </div>

      <section className="ranking-container">
        {/* Header */}
        <div className="ranking-header">
          <div className="ranking-header-content">
            <MedalIcon size={32} className="ranking-header-icon" />
            <div className="ranking-header-text">
              <h1 className="ranking-title">Ranking Geral</h1>
              <p className="ranking-subtitle">Top 10 melhores jogadores</p>
            </div>
          </div>
        </div>

        {/* Rankings List */}
        {rankedPlayers.length > 0 ? (
          <div className="ranking-list">
            {rankedPlayers.map((player, index) => {
              const position = calculatePosition(index, rankedPlayers);
              const tierColor =
                ELO_TIER_COLORS[player.elo_tier] || "#666666";
              const tierLabel =
                ELO_TIER_LABELS[player.elo_tier] || "Bronze";
              const medal = MEDAL_ICONS[position];

              return (
                <div key={player.id} className="ranking-item">
                  <div className="ranking-position-wrapper">
                    {medal ? (
                      <span className="ranking-medal">{medal}</span>
                    ) : (
                      <span className="ranking-position">#{position}</span>
                    )}
                  </div>

                  <div className="ranking-player-info">
                    <div className="ranking-player-avatar">
                      {player.avatar_url ? (
                        <img
                          src={player.avatar_url}
                          alt={player.display_name}
                          className="ranking-player-avatar-image"
                        />
                      ) : (
                        <div className="ranking-player-avatar-placeholder">
                          {player.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="ranking-player-details">
                      <p className="ranking-player-name">
                        {player.display_name}
                      </p>
                      <div
                        className="ranking-player-tier"
                        style={{ "--tier-color": tierColor } as React.CSSProperties}
                      >
                        {tierLabel}
                      </div>
                    </div>
                  </div>

                  <div className="ranking-player-stats">
                    <div className="ranking-points">
                      <TrendingUpIcon size={16} />
                      <span>{player.elo_points} pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="ranking-empty">
            <p>Nenhum jogador registrado ainda</p>
          </div>
        )}

      </section>

      <style>{`
        /* ================================================================ */
        /* Layout                                                           */
        /* ================================================================ */
        .ranking-page {
          min-height: 100dvh;
          background: var(--background, #070707);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 2rem 1rem 4rem;
          position: relative;
          overflow: hidden;
        }

        .ranking-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .ranking-bg-glow {
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 640px;
          height: 640px;
          background: radial-gradient(
            ellipse at center,
            rgba(50, 224, 53, 0.08) 0%,
            transparent 70%
          );
          border-radius: 50%;
        }

        .ranking-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 640px;
        }

        /* ================================================================ */
        /* Header                                                           */
        /* ================================================================ */
        .ranking-header {
          margin-bottom: 2rem;
        }

        .ranking-header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .ranking-header-icon {
          color: #ffd700;
          flex-shrink: 0;
        }

        .ranking-header-text {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .ranking-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        .ranking-subtitle {
          font-size: 0.875rem;
          color: #999999;
          margin: 0;
        }

        /* ================================================================ */
        /* Rankings List                                                    */
        /* ================================================================ */
        .ranking-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .ranking-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--card, #121217);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          transition: all 0.2s ease-in-out;
        }

        .ranking-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateX(4px);
        }

        .ranking-position-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ranking-medal {
          font-size: 1.75rem;
          line-height: 1;
        }

        .ranking-position {
          font-size: 1rem;
          font-weight: 700;
          color: #ffd700;
        }

        .ranking-player-info {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          min-width: 0;
        }

        .ranking-player-avatar {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          background: rgba(50, 224, 53, 0.12);
          border: 1px solid rgba(50, 224, 53, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          position: relative;
        }

        .ranking-player-avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ranking-player-avatar-placeholder {
          font-size: 1.25rem;
          font-weight: 700;
          color: #32e035;
        }

        .ranking-player-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
        }

        .ranking-player-name {
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ranking-player-tier {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.5rem;
          background: rgba(var(--tier-color-rgb, 50, 224, 53), 0.12);
          border: 1px solid rgba(var(--tier-color-rgb, 50, 224, 53), 0.3);
          border-radius: 4px;
          color: var(--tier-color, #32e035);
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          width: fit-content;
        }

        .ranking-player-stats {
          display: flex;
          gap: 1rem;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .ranking-points {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(50, 224, 53, 0.12);
          border: 1px solid rgba(50, 224, 53, 0.3);
          border-radius: 8px;
          color: #32e035;
          font-size: 0.85rem;
          font-weight: 600;
        }

        /* ================================================================ */
        /* Empty State                                                      */
        /* ================================================================ */
        .ranking-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: #999999;
          margin-bottom: 2rem;
        }

        .ranking-empty p {
          font-size: 1.1rem;
          margin: 0;
        }

        /* ================================================================ */
        /* Action Button                                                    */
        /* ================================================================ */
        .ranking-action {
          display: flex;
          gap: 1rem;
        }

        .ranking-btn-back {
          width: 100%;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #32e035;
          color: #070707;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }

        .ranking-btn-back:hover {
          background: #2ac82b;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(50, 224, 53, 0.3);
        }

        /* ================================================================ */
        /* Responsive                                                       */
        /* ================================================================ */
        @media (max-width: 640px) {
          .ranking-page {
            padding: 1.5rem 1rem 3rem;
          }

          .ranking-title {
            font-size: 1.5rem;
          }

          .ranking-item {
            padding: 0.875rem;
            gap: 0.75rem;
          }

          .ranking-position-wrapper,
          .ranking-player-avatar {
            width: 44px;
            height: 44px;
          }

          .ranking-player-name {
            font-size: 0.9rem;
          }

          .ranking-points {
            font-size: 0.75rem;
            padding: 0.375rem 0.5rem;
            gap: 0.375rem;
          }

          .ranking-points svg {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>
    </main>
  );
}
