import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRightIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  WalletIcon,
} from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "./logout-button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Meu Perfil | JP Poker Club",
  description: "Visualize e gerencie seus dados de perfil no JP Poker Club.",
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

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  past_due: "Vencido",
  canceled: "Cancelado",
};

const SUBSCRIPTION_STATUS_COLORS: Record<string, string> = {
  active: "#32e035",
  inactive: "#666666",
  past_due: "#ff6b6b",
  canceled: "#999999",
};

export default async function PerfilPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile data
  const [profileResult, walletResult, subscriptionResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, avatar_url, elo_points, elo_tier, is_subscriber")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("subscriptions")
      .select("status, current_period_end, canceled_at")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const profile = profileResult.data;
  const wallet = walletResult.data;
  const subscription = subscriptionResult.data;

  const displayName = profile?.display_name || user.email || "Usuário";
  const eloTier = profile?.elo_tier || "bronze";
  const eloPoints = profile?.elo_points || 0;
  const isSubscriber = profile?.is_subscriber || false;
  const balance = wallet?.balance || 0;
  const subscriptionStatus = subscription?.status || "inactive";

  const tierColor = ELO_TIER_COLORS[eloTier] || "#666666";
  const tierLabel = ELO_TIER_LABELS[eloTier] || "Bronze";
  const statusLabel = SUBSCRIPTION_STATUS_LABELS[subscriptionStatus] || "Inativo";
  const statusColor = SUBSCRIPTION_STATUS_COLORS[subscriptionStatus] || "#666666";

  return (
    <main className="perfil-page">
      {/* Background decorativo */}
      <div className="perfil-bg" aria-hidden="true">
        <div className="perfil-bg-glow" />
      </div>

      <section className="perfil-container">
        {/* Header Section */}
        <div className="perfil-card perfil-header">
          <div className="perfil-header-content">
            <div className="perfil-avatar-wrapper">
              <div className="perfil-avatar">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={displayName}
                    className="perfil-avatar-image"
                    fill
                    sizes="96px"
                  />
                ) : (
                  <div className="perfil-avatar-placeholder">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="perfil-header-text">
              <h1 className="perfil-display-name">{displayName}</h1>
              <p className="perfil-email">{user.email}</p>
              {isSubscriber && (
                <div className="perfil-subscriber-badge">
                  <ShieldCheckIcon size={16} />
                  <span>Assinante Premium</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="perfil-grid">
          {/* Elo Stats Card */}
          <div className="perfil-card perfil-stat-card">
            <div className="perfil-stat-header">
              <TrendingUpIcon size={24} className="perfil-stat-icon" />
              <h3>Ranking Elo</h3>
            </div>
            <div className="perfil-stat-content">
              <div
                className="perfil-tier-badge"
                style={{ "--tier-color": tierColor } as React.CSSProperties}
              >
                {tierLabel}
              </div>
              <p className="perfil-stat-value">{eloPoints} pontos</p>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="perfil-card perfil-stat-card">
            <div className="perfil-stat-header">
              <WalletIcon size={24} className="perfil-stat-icon" />
              <h3>Saldo</h3>
            </div>
            <div className="perfil-stat-content">
              <p className="perfil-stat-value">
                R$ {balance.toFixed(2).replace(".", ",")}
              </p>
              <Link href="/depositar">
                <Button
                  size="sm"
                  variant="outline"
                  className="perfil-action-btn"
                >
                  <ArrowUpRightIcon size={16} />
                  Adicionar
                </Button>
              </Link>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="perfil-card perfil-stat-card">
            <div className="perfil-stat-header">
              <ShieldCheckIcon size={24} className="perfil-stat-icon" />
              <h3>Assinatura</h3>
            </div>
            <div className="perfil-stat-content">
              <div
                className="perfil-subscription-badge"
                style={{ "--status-color": statusColor } as React.CSSProperties}
              >
                {statusLabel}
              </div>
              {subscription?.current_period_end && (
                <p className="perfil-stat-detail">
                  Válida até{" "}
                  {new Date(subscription.current_period_end).toLocaleDateString(
                    "pt-BR"
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="perfil-actions">
          <Link href="/carteira">
            <Button className="perfil-btn-primary">
              <WalletIcon size={20} />
              Ver Carteira
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </section>

      <style>{`
        /* ================================================================ */
        /* Layout                                                           */
        /* ================================================================ */
        .perfil-page {
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

        .perfil-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .perfil-bg-glow {
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

        .perfil-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 640px;
        }

        /* ================================================================ */
        /* Cards                                                            */
        /* ================================================================ */
        .perfil-card {
          background: var(--card, #121217);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 2rem 1.75rem;
          box-shadow: 0 0 0 1px rgba(50, 224, 53, 0.05),
            0 24px 64px rgba(0, 0, 0, 0.6);
        }

        .perfil-card + .perfil-card {
          margin-top: 1.5rem;
        }

        /* ================================================================ */
        /* Header Section                                                  */
        /* ================================================================ */
        .perfil-header {
          margin-bottom: 1.75rem;
        }

        .perfil-header-content {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }

        .perfil-avatar-wrapper {
          flex-shrink: 0;
        }

        .perfil-avatar {
          width: 96px;
          height: 96px;
          border-radius: 16px;
          background: rgba(50, 224, 53, 0.12);
          border: 2px solid rgba(50, 224, 53, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          position: relative;
        }

        .perfil-avatar-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .perfil-avatar-placeholder {
          font-size: 2.5rem;
          font-weight: 700;
          color: #32e035;
        }

        .perfil-header-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .perfil-display-name {
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.2;
          color: #ffffff;
          margin: 0;
        }

        .perfil-email {
          font-size: 0.875rem;
          color: #999999;
          margin: 0;
        }

        .perfil-subscriber-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.875rem;
          background: rgba(50, 224, 53, 0.12);
          border: 1px solid rgba(50, 224, 53, 0.3);
          border-radius: 8px;
          color: #32e035;
          font-size: 0.75rem;
          font-weight: 600;
          width: fit-content;
        }

        /* ================================================================ */
        /* Stats Grid                                                       */
        /* ================================================================ */
        .perfil-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (min-width: 768px) {
          .perfil-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }

          .perfil-grid .perfil-card:nth-child(3) {
            grid-column: span 2;
          }
        }

        /* ================================================================ */
        /* Stat Cards                                                       */
        /* ================================================================ */
        .perfil-stat-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .perfil-stat-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #999999;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .perfil-stat-icon {
          color: #32e035;
          flex-shrink: 0;
        }

        .perfil-stat-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          justify-content: space-between;
        }

        .perfil-stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          line-height: 1.2;
        }

        .perfil-stat-detail {
          font-size: 0.75rem;
          color: #999999;
          margin: 0.5rem 0 0;
        }

        /* ================================================================ */
        /* Tier & Status Badges                                            */
        /* ================================================================ */
        .perfil-tier-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 0.875rem;
          background: rgba(var(--tier-color-rgb, 50, 224, 53), 0.12);
          border: 1px solid rgba(var(--tier-color-rgb, 50, 224, 53), 0.3);
          border-radius: 8px;
          color: var(--tier-color, #32e035);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          width: fit-content;
        }

        .perfil-subscription-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 0.875rem;
          background: rgba(var(--status-color-rgb, 50, 224, 53), 0.12);
          border: 1px solid rgba(var(--status-color-rgb, 50, 224, 53), 0.3);
          border-radius: 8px;
          color: var(--status-color, #32e035);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          width: fit-content;
        }

        /* ================================================================ */
        /* Action Buttons                                                   */
        /* ================================================================ */
        .perfil-action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          padding: 0.375rem 0.75rem;
          height: auto;
          color: #32e035;
          border: 1px solid rgba(50, 224, 53, 0.3);
          background: transparent;
          border-radius: 8px;
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }

        .perfil-action-btn:hover {
          background: rgba(50, 224, 53, 0.1);
          border-color: rgba(50, 224, 53, 0.5);
        }

        /* ================================================================ */
        /* Actions Section                                                  */
        /* ================================================================ */
        .perfil-actions {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }

        .perfil-btn-primary {
          width: 100%;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: #32e035;
          color: #070707;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }

        .perfil-btn-primary:hover {
          background: #2ac82b;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(50, 224, 53, 0.3);
        }

        .perfil-btn-secondary {
          width: 100%;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: transparent;
          color: #999999;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }

        .perfil-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        /* ================================================================ */
        /* Responsive                                                       */
        /* ================================================================ */
        @media (max-width: 640px) {
          .perfil-page {
            padding: 1.5rem 1rem 3rem;
          }

          .perfil-card {
            padding: 1.5rem 1rem;
          }

          .perfil-display-name {
            font-size: 1.25rem;
          }

          .perfil-stat-value {
            font-size: 1.5rem;
          }

          .perfil-header-content {
            gap: 1rem;
          }

          .perfil-avatar {
            width: 80px;
            height: 80px;
          }

          .perfil-avatar-placeholder {
            font-size: 2rem;
          }
        }
      `}</style>
    </main>
  );
}