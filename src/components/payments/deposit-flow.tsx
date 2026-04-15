"use client";

import { useCallback, useEffect, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { toast } from "sonner";
import { Wallet, ChevronRight, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

import type { IPaymentFormData } from "@mercadopago/sdk-react/esm/bricks/payment/type.d";

import { createPaymentIntentAction } from "@/app/depositar/actions";

// ---------------------------------------------------------------------------
// Inicializa o SDK do MP uma única vez no módulo
// ---------------------------------------------------------------------------
const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? "";

initMercadoPago(MP_PUBLIC_KEY, { locale: "pt-BR" });

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const PRESET_AMOUNTS = [50, 100, 200, 500];

type FlowStatus = "amount" | "brick" | "success" | "failure" | "pending";

interface DepositFlowProps {
  /** Status vindo da query string após redirect do MP */
  initialStatus?: "success" | "failure" | "pending";
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export function DepositFlow({ initialStatus }: DepositFlowProps) {
  const [status, setStatus] = useState<FlowStatus>(initialStatus ?? "amount");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Se o usuário voltou de um redirect do MP, mostra a tela correta
  useEffect(() => {
    if (initialStatus) setStatus(initialStatus);
  }, [initialStatus]);

  // Valor efetivamente selecionado (preset ou custom)
  const effectiveAmount =
    selectedAmount !== null
      ? selectedAmount
      : customAmount !== ""
        ? parseFloat(customAmount.replace(",", "."))
        : null;

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handlePreset = (value: number) => {
    setSelectedAmount(value);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAmount(null);
    const raw = e.target.value.replace(/[^\d,\.]/g, "");
    setCustomAmount(raw);
  };

  const handleSubmitAmount = async () => {
    const amount = effectiveAmount;
    if (!amount || isNaN(amount) || amount < 10) {
      toast.error("Informe um valor mínimo de R$ 10,00.");
      return;
    }
    if (amount > 5000) {
      toast.error("O valor máximo de depósito é R$ 5.000,00.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createPaymentIntentAction(amount);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setPreferenceId(result.preferenceId);
      setStatus("brick");
    } catch {
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrickSubmit = useCallback(
    async (_formData: IPaymentFormData) => {
      // O Brick do MP cuida do submit para a API do MP internamente.
      // A confirmação real chega via webhook — aqui apenas aguardamos o redirect.
    },
    []
  );

  const handleBrickError = useCallback((error: unknown) => {
    console.error("[DepositFlow] Brick error:", error);
    toast.error("Erro ao processar o pagamento. Tente novamente.");
  }, []);

  const handleRetry = () => {
    setStatus("amount");
    setPreferenceId(null);
    setSelectedAmount(null);
    setCustomAmount("");
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="deposit-flow">
      {status === "amount" && (
        <AmountStep
          presets={PRESET_AMOUNTS}
          selected={selectedAmount}
          custom={customAmount}
          effective={effectiveAmount}
          isLoading={isLoading}
          onPreset={handlePreset}
          onCustomChange={handleCustomChange}
          onSubmit={handleSubmitAmount}
        />
      )}

      {status === "brick" && preferenceId && (
        <BrickStep
          preferenceId={preferenceId}
          amount={effectiveAmount ?? 0}
          onSubmit={handleBrickSubmit}
          onError={handleBrickError}
          onBack={() => setStatus("amount")}
        />
      )}

      {status === "success" && <StatusScreen type="success" onRetry={handleRetry} />}
      {status === "failure" && <StatusScreen type="failure" onRetry={handleRetry} />}
      {status === "pending" && <StatusScreen type="pending" onRetry={handleRetry} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-componentes
// ---------------------------------------------------------------------------

function AmountStep({
  presets,
  selected,
  custom,
  effective,
  isLoading,
  onPreset,
  onCustomChange,
  onSubmit,
}: {
  presets: number[];
  selected: number | null;
  custom: string;
  effective: number | null;
  isLoading: boolean;
  onPreset: (v: number) => void;
  onCustomChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="deposit-amount-step">
      <div className="deposit-header">
        <div className="deposit-icon-wrap">
          <Wallet size={22} className="deposit-icon" />
        </div>
        <div>
          <h2 className="deposit-title">Adicionar Fichas</h2>
          <p className="deposit-subtitle">Escolha o valor e pague com Pix, cartão ou boleto</p>
        </div>
      </div>

      <div className="deposit-presets">
        {presets.map((v) => (
          <button
            key={v}
            type="button"
            className={`deposit-preset-btn${selected === v ? " active" : ""}`}
            onClick={() => onPreset(v)}
          >
            <span className="preset-label">R$</span>
            <span className="preset-value">{v}</span>
          </button>
        ))}
      </div>

      <div className="deposit-custom-wrap">
        <span className="deposit-custom-prefix">R$</span>
        <input
          id="deposit-custom-amount"
          type="text"
          inputMode="decimal"
          placeholder="Outro valor"
          value={custom}
          onChange={onCustomChange}
          className="deposit-custom-input"
          aria-label="Valor personalizado de depósito"
        />
      </div>

      {effective !== null && !isNaN(effective) && effective > 0 && (
        <p className="deposit-summary">
          Você está depositando{" "}
          <strong>
            {effective.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </strong>
        </p>
      )}

      <button
        id="deposit-submit-btn"
        type="button"
        className="deposit-submit-btn"
        onClick={onSubmit}
        disabled={isLoading || !effective || isNaN(effective ?? NaN) || (effective ?? 0) < 10}
      >
        {isLoading ? (
          <Loader2 size={18} className="spin" />
        ) : (
          <>
            Continuar para pagamento
            <ChevronRight size={18} />
          </>
        )}
      </button>
    </div>
  );
}

function BrickStep({
  preferenceId,
  amount,
  onSubmit,
  onError,
  onBack,
}: {
  preferenceId: string;
  amount: number;
  onSubmit: (data: IPaymentFormData) => Promise<void>;
  onError: (err: unknown) => void;
  onBack: () => void;
}) {
  return (
    <div className="deposit-brick-step">
      <div className="deposit-brick-header">
        <button
          type="button"
          className="deposit-back-btn"
          onClick={onBack}
          aria-label="Voltar para seleção de valor"
        >
          ← Voltar
        </button>
        <p className="deposit-brick-amount">
          Depósito de{" "}
          <strong>
            {amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </strong>
        </p>
      </div>

      <Payment
        initialization={{ amount, preferenceId }}
        customization={{
          visual: {
            style: {
              theme: "dark",
              customVariables: {
                baseColor: "#32e035",
                baseColorFirstVariant: "#28c02c",
                baseColorSecondVariant: "#1fa023",
                borderRadiusSmall: "8px",
                borderRadiusMedium: "12px",
                borderRadiusLarge: "16px",
              },
            },
          },
          paymentMethods: {
            creditCard: "all",
            debitCard: "all",
            ticket: "all",
            bankTransfer: "all",
            mercadoPago: "all",
          },
        onSubmit={onSubmit}
        onError={onError}
        onReady={() => {/* Brick pronto */}}
      />
    </div>
  );
}

function StatusScreen({
  type,
  onRetry,
}: {
  type: "success" | "failure" | "pending";
  onRetry: () => void;
}) {
  const config = {
    success: {
      icon: <CheckCircle2 size={52} className="status-icon success" />,
      title: "Depósito confirmado!",
      message: "Seu saldo será atualizado em instantes.",
      btnLabel: "Fazer outro depósito",
    },
    failure: {
      icon: <XCircle size={52} className="status-icon failure" />,
      title: "Pagamento não aprovado",
      message: "Verifique os dados e tente novamente.",
      btnLabel: "Tentar novamente",
    },
    pending: {
      icon: <Clock size={52} className="status-icon pending" />,
      title: "Pagamento em análise",
      message: "Assim que aprovado, seu saldo será atualizado automaticamente.",
      btnLabel: "Fazer outro depósito",
    },
  }[type];

  return (
    <div className="deposit-status-screen">
      {config.icon}
      <h2 className="status-title">{config.title}</h2>
      <p className="status-message">{config.message}</p>
      <button
        id="deposit-status-retry-btn"
        type="button"
        className="deposit-submit-btn"
        onClick={onRetry}
      >
        {config.btnLabel}
      </button>
    </div>
  );
}
