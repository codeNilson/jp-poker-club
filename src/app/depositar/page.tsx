import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DepositFlow } from "@/components/payments/deposit-flow";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Depositar Fichas | JP Poker Club",
  description: "Adicione fichas à sua carteira para participar de torneios e cash games.",
};

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function DepositarPage({ searchParams }: Props) {
  // Redireciona se não autenticado
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const rawStatus = params.status;
  const initialStatus =
    rawStatus === "success" || rawStatus === "failure" || rawStatus === "pending"
      ? rawStatus
      : undefined;

  return (
    <main className="depositar-page">
      {/* Background decorativo */}
      <div className="depositar-bg" aria-hidden="true">
        <div className="depositar-bg-glow" />
      </div>

      <section className="depositar-container">
        <DepositFlow initialStatus={initialStatus} />
      </section>

      <style>{`
        /* ------------------------------------------------------------------ */
        /* Layout                                                              */
        /* ------------------------------------------------------------------ */
        .depositar-page {
          min-height: 100dvh;
          background: var(--background, #070707);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem 1rem 4rem;
          position: relative;
          overflow: hidden;
        }

        .depositar-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .depositar-bg-glow {
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 640px;
          height: 640px;
          background: radial-gradient(ellipse at center, rgba(50,224,53,0.08) 0%, transparent 70%);
          border-radius: 50%;
        }

        .depositar-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 480px;
        }

        /* ------------------------------------------------------------------ */
        /* Deposit flow wrapper                                                */
        /* ------------------------------------------------------------------ */
        .deposit-flow {
          background: var(--card, #121217);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 2rem 1.75rem;
          box-shadow: 0 0 0 1px rgba(50,224,53,0.05), 0 24px 64px rgba(0,0,0,0.6);
        }

        /* ------------------------------------------------------------------ */
        /* Header                                                              */
        /* ------------------------------------------------------------------ */
        .deposit-header {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          margin-bottom: 1.75rem;
        }

        .deposit-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(50,224,53,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .deposit-icon {
          color: #32e035;
        }

        .deposit-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.125rem;
          line-height: 1.3;
        }

        .deposit-subtitle {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.45);
          margin: 0;
          line-height: 1.4;
        }

        /* ------------------------------------------------------------------ */
        /* Presets                                                             */
        /* ------------------------------------------------------------------ */
        .deposit-presets {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.625rem;
          margin-bottom: 1rem;
        }

        .deposit-preset-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.1rem;
          padding: 0.875rem 0.5rem;
          border-radius: 12px;
          border: 1.5px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: border-color 0.18s, background 0.18s, color 0.18s, transform 0.12s;
        }

        .deposit-preset-btn:hover {
          border-color: rgba(50,224,53,0.4);
          background: rgba(50,224,53,0.06);
          color: #fff;
          transform: translateY(-1px);
        }

        .deposit-preset-btn.active {
          border-color: #32e035;
          background: rgba(50,224,53,0.12);
          color: #32e035;
        }

        .preset-label {
          font-size: 0.7rem;
          font-weight: 500;
          opacity: 0.7;
          line-height: 1;
        }

        .preset-value {
          font-size: 1.35rem;
          font-weight: 800;
          line-height: 1;
        }

        /* ------------------------------------------------------------------ */
        /* Custom amount                                                       */
        /* ------------------------------------------------------------------ */
        .deposit-custom-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 0 1rem;
          margin-bottom: 1.25rem;
          transition: border-color 0.18s;
        }

        .deposit-custom-wrap:focus-within {
          border-color: rgba(50,224,53,0.5);
        }

        .deposit-custom-prefix {
          font-size: 0.9rem;
          font-weight: 600;
          color: rgba(255,255,255,0.4);
          flex-shrink: 0;
        }

        .deposit-custom-input {
          background: transparent;
          border: none;
          outline: none;
          color: #fff;
          font-size: 1rem;
          font-weight: 600;
          width: 100%;
          padding: 0.875rem 0;
        }

        .deposit-custom-input::placeholder {
          color: rgba(255,255,255,0.25);
          font-weight: 400;
        }

        /* ------------------------------------------------------------------ */
        /* Summary                                                             */
        /* ------------------------------------------------------------------ */
        .deposit-summary {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.5);
          margin: 0 0 1.25rem;
          text-align: center;
        }

        .deposit-summary strong {
          color: #32e035;
        }

        /* ------------------------------------------------------------------ */
        /* Submit button                                                       */
        /* ------------------------------------------------------------------ */
        .deposit-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.875rem 1.5rem;
          border-radius: 12px;
          border: none;
          background: #32e035;
          color: #070707;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.18s, opacity 0.18s, transform 0.12s;
          letter-spacing: 0.01em;
        }

        .deposit-submit-btn:hover:not(:disabled) {
          background: #28c02c;
          transform: translateY(-1px);
        }

        .deposit-submit-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .spin {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ------------------------------------------------------------------ */
        /* Brick step                                                          */
        /* ------------------------------------------------------------------ */
        .deposit-brick-step {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .deposit-brick-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .deposit-back-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.5);
          font-size: 0.85rem;
          cursor: pointer;
          padding: 0;
          transition: color 0.15s;
        }

        .deposit-back-btn:hover {
          color: #fff;
        }

        .deposit-brick-amount {
          font-size: 0.9rem;
          color: rgba(255,255,255,0.6);
          margin: 0;
        }

        .deposit-brick-amount strong {
          color: #32e035;
        }

        /* ------------------------------------------------------------------ */
        /* Status screen                                                       */
        /* ------------------------------------------------------------------ */
        .deposit-status-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 0 0.5rem;
          text-align: center;
        }

        .status-icon {
          margin-bottom: 0.25rem;
        }

        .status-icon.success { color: #32e035; }
        .status-icon.failure { color: #ef4444; }
        .status-icon.pending { color: #f59e0b; }

        .status-title {
          font-size: 1.2rem;
          font-weight: 700;
          color: #fff;
          margin: 0;
        }

        .status-message {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.5);
          margin: 0 0 0.75rem;
        }
      `}</style>
    </main>
  );
}
