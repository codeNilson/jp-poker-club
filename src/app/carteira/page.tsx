import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  GiftIcon,
  ZapIcon,
  UndoIcon,
  SettingsIcon,
} from "lucide-react";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Carteira | JP Poker Club",
  description: "Visualize seu saldo e histórico de transações no JP Poker Club.",
};

type WalletTransaction = {
  id: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  type: "deposit" | "bonus" | "debit" | "refund" | "adjustment";
  description: string | null;
  created_at: string;
  reference_type: string | null;
  reference_id: string | null;
};

const TRANSACTION_LABELS: Record<string, string> = {
  deposit: "Depósito",
  bonus: "Bônus",
  debit: "Débito",
  refund: "Reembolso",
  adjustment: "Ajuste",
};

const TRANSACTION_ICONS: Record<string, React.ReactNode> = {
  deposit: <ArrowUpRightIcon size={18} />,
  bonus: <GiftIcon size={18} />,
  debit: <ArrowDownLeftIcon size={18} />,
  refund: <UndoIcon size={18} />,
  adjustment: <ZapIcon size={18} />,
};

const TRANSACTION_COLORS: Record<string, string> = {
  deposit: "#32e035",
  bonus: "#ffd700",
  debit: "#ff6b6b",
  refund: "#00d9ff",
  adjustment: "#9d4edd",
};

export default async function CarteiraPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch wallet and transaction data
  const [walletResult, transactionsResult] = await Promise.all([
    supabase
      .from("wallets")
      .select("balance, updated_at")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("wallet_transactions")
      .select("id, amount, balance_before, balance_after, type, description, created_at, reference_type, reference_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const wallet = walletResult.data;
  const transactions = (transactionsResult.data || []) as WalletTransaction[];
  const balance = wallet?.balance || 0;

  return (
    <main className="carteira-page">
      {/* Background decorativo */}
      <div className="carteira-bg" aria-hidden="true">
        <div className="carteira-bg-glow" />
      </div>

      <section className="carteira-container">
        {/* Balance Card */}
        <div className="carteira-card carteira-balance-card">
          <div className="carteira-balance-header">
            <h1 className="carteira-balance-label">Saldo Disponível</h1>
            <p className="carteira-balance-value">
              R$ {balance.toFixed(2).replace(".", ",")}
            </p>
            {wallet?.updated_at && (
              <p className="carteira-balance-updated">
                Atualizado em{" "}
                {new Date(wallet.updated_at).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>

          <Link href="/depositar" className="carteira-deposit-btn-link">
            <Button className="carteira-deposit-btn">
              <ArrowUpRightIcon size={20} />
              Depositar Fichas
            </Button>
          </Link>
        </div>

        {/* Transactions Section */}
        <div className="carteira-transactions-section">
          <h2 className="carteira-transactions-title">Histórico de Movimentações</h2>

          {transactions.length > 0 ? (
            <div className="carteira-transactions-list">
              {transactions.map((transaction) => {
                const transactionDate = new Date(transaction.created_at);
                const label = TRANSACTION_LABELS[transaction.type] || transaction.type;
                const icon = TRANSACTION_ICONS[transaction.type];
                const color = TRANSACTION_COLORS[transaction.type];
                const isIncome = ["deposit", "bonus", "refund"].includes(transaction.type);
                const displayAmount = isIncome ? transaction.amount : -transaction.amount;
                const amountColor = isIncome ? "#32e035" : "#ff6b6b";

                return (
                  <div key={transaction.id} className="carteira-transaction-item">
                    <div className="carteira-transaction-icon" style={{ color }}>
                      {icon}
                    </div>

                    <div className="carteira-transaction-details">
                      <p className="carteira-transaction-type">{label}</p>
                      {transaction.description && (
                        <p className="carteira-transaction-description">
                          {transaction.description}
                        </p>
                      )}
                      <p className="carteira-transaction-date">
                        {transactionDate.toLocaleDateString("pt-BR")} às{" "}
                        {transactionDate.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="carteira-transaction-amounts">
                      <p
                        className="carteira-transaction-amount"
                        style={{ color: amountColor }}
                      >
                        {isIncome ? "+" : ""}
                        R$ {Math.abs(displayAmount).toFixed(2).replace(".", ",")}
                      </p>
                      <p className="carteira-transaction-balance">
                        Saldo: R${" "}
                        {transaction.balance_after.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="carteira-empty-state">
              <SettingsIcon size={48} />
              <p className="carteira-empty-text">
                Nenhuma movimentação registrada
              </p>
              <p className="carteira-empty-subtext">
                Comece depositando fichas para participar dos eventos
              </p>
              <Link href="/depositar">
                <Button className="carteira-empty-btn">
                  <ArrowUpRightIcon size={20} />
                  Fazer Meu Primeiro Depósito
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <style>{`
        /* ================================================================ */
        /* Layout                                                           */
        /* ================================================================ */
        .carteira-page {
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

        .carteira-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .carteira-bg-glow {
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

        .carteira-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 640px;
        }

        /* ================================================================ */
        /* Balance Card                                                     */
        /* ================================================================ */
        .carteira-card {
          background: var(--card, #121217);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 2rem 1.75rem;
          box-shadow: 0 0 0 1px rgba(50, 224, 53, 0.05),
            0 24px 64px rgba(0, 0, 0, 0.6);
        }

        .carteira-balance-card {
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .carteira-balance-header {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .carteira-balance-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #999999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .carteira-balance-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #32e035;
          margin: 0;
          line-height: 1.2;
        }

        .carteira-balance-updated {
          font-size: 0.75rem;
          color: #666666;
          margin: 0;
        }

        .carteira-deposit-btn-link {
          text-decoration: none;
        }

        .carteira-deposit-btn {
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

        .carteira-deposit-btn:hover {
          background: #2ac82b;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(50, 224, 53, 0.3);
        }

        /* ================================================================ */
        /* Transactions Section                                             */
        /* ================================================================ */
        .carteira-transactions-section {
          margin-top: 2rem;
        }

        .carteira-transactions-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 1.5rem 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .carteira-transactions-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .carteira-transaction-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          transition: all 0.2s ease-in-out;
        }

        .carteira-transaction-item:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .carteira-transaction-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          flex-shrink: 0;
        }

        .carteira-transaction-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .carteira-transaction-type {
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }

        .carteira-transaction-description {
          font-size: 0.8rem;
          color: #999999;
          margin: 0;
        }

        .carteira-transaction-date {
          font-size: 0.75rem;
          color: #666666;
          margin: 0;
        }

        .carteira-transaction-amounts {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
          white-space: nowrap;
        }

        .carteira-transaction-amount {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0;
        }

        .carteira-transaction-balance {
          font-size: 0.75rem;
          color: #999999;
          margin: 0;
        }

        /* ================================================================ */
        /* Empty State                                                      */
        /* ================================================================ */
        .carteira-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 3rem 1.75rem;
          text-align: center;
          color: #999999;
        }

        .carteira-empty-state svg {
          color: #666666;
          margin-bottom: 0.5rem;
        }

        .carteira-empty-text {
          font-size: 1.125rem;
          font-weight: 600;
          color: #ffffff;
          margin: 0;
        }

        .carteira-empty-subtext {
          font-size: 0.875rem;
          color: #999999;
          margin: 0;
        }

        .carteira-empty-btn {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          background: #32e035;
          color: #070707;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
        }

        .carteira-empty-btn:hover {
          background: #2ac82b;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(50, 224, 53, 0.3);
        }

        /* ================================================================ */
        /* Responsive                                                       */
        /* ================================================================ */
        @media (max-width: 640px) {
          .carteira-page {
            padding: 1.5rem 1rem 3rem;
          }

          .carteira-card {
            padding: 1.5rem 1rem;
          }

          .carteira-balance-value {
            font-size: 2rem;
          }

          .carteira-transaction-item {
            gap: 0.75rem;
          }

          .carteira-transaction-icon {
            width: 36px;
            height: 36px;
          }

          .carteira-transaction-amounts {
            flex-direction: row;
            gap: 1rem;
            justify-content: space-between;
          }

          .carteira-empty-state {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </main>
  );
}