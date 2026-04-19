import { create } from "zustand";
import api from "@/lib/api";
import type { RiskAlert, CreateRiskAlertRequest } from "@/lib/types";

type ValidationRow = {
  id: string;
  documentOutputId: string;
  validationType: string;
  severity: string;
  ruleCode?: string | null;
  message: string;
  createdAt: string;
};

type CreateValidationPayload = {
  documentOutputId: string;
  validationType: string;
  severity: string;
  ruleCode?: string;
  message: string;
};

const DEFAULT_DOCUMENT_OUTPUT_ID =
  process.env.NEXT_PUBLIC_RISK_DOCUMENT_OUTPUT_ID ??
  "39000000-0000-0000-0000-000000000001";

function toLevel(severity: string): RiskAlert["level"] {
  const s = severity.toUpperCase();
  if (s === "CRITICAL") return "CRITICAL";
  if (s === "ERROR") return "HIGH";
  if (s === "WARNING") return "MEDIUM";
  return "LOW";
}

function levelToSeverity(level: RiskAlert["level"]) {
  if (level === "CRITICAL") return "critical";
  if (level === "HIGH") return "error";
  if (level === "MEDIUM") return "warning";
  return "info";
}

function toCriteriaNo(ruleCode?: string | null) {
  if (!ruleCode) return 1;
  const match = ruleCode.match(/C(\d+)/i);
  if (!match) return 1;
  const parsed = Number(match[1]);
  return Number.isNaN(parsed) ? 1 : Math.max(1, Math.min(9, parsed));
}

function mapValidationToAlert(item: ValidationRow): RiskAlert {
  return {
    id: item.id,
    criteriaNo: toCriteriaNo(item.ruleCode),
    level: toLevel(item.severity),
    message: item.message,
    recommendation: item.ruleCode ? `Rule: ${item.ruleCode}` : undefined,
    isResolved: false,
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
  };
}

interface RiskState {
  alerts: RiskAlert[];
  loading: boolean;
  error: string | null;

  fetchAlerts: (params?: {
    level?: string;
    isResolved?: boolean;
    criteriaNo?: number;
  }) => Promise<void>;
  createAlert: (data: CreateRiskAlertRequest) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
}

export const useRiskStore = create<RiskState>((set) => ({
  alerts: [],
  loading: false,
  error: null,

  fetchAlerts: async (params) => {
    set({ loading: true, error: null });
    try {
      const normalizedParams = {
        ...(params?.level ? { severity: levelToSeverity(params.level as RiskAlert["level"]) } : {}),
      };
      const res = await api.get<{ data: ValidationRow[] }>("/risk/validations", {
        params: normalizedParams,
      });
      set({ alerts: (res.data.data ?? []).map(mapValidationToAlert), loading: false });
    } catch {
      set({ error: "Failed to fetch risk alerts", loading: false });
    }
  },

  createAlert: async (data) => {
    set({ loading: true, error: null });
    try {
      const payload: CreateValidationPayload = {
        documentOutputId: DEFAULT_DOCUMENT_OUTPUT_ID,
        validationType: "manual_alert",
        severity: levelToSeverity(data.level),
        ruleCode: `C${data.criteriaNo}-MANUAL`,
        message: data.message,
      };
      await api.post("/risk/validations", payload);
      const res = await api.get<{ data: ValidationRow[] }>("/risk/validations");
      set({ alerts: (res.data.data ?? []).map(mapValidationToAlert), loading: false });
    } catch {
      set({ error: "Failed to create alert", loading: false });
    }
  },

  resolveAlert: async (id) => {
    set({ loading: true, error: null });
    try {
      // Current backend has no resolve endpoint; keep resolve state on client side.
      set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === id ? { ...a, isResolved: true } : a
        ),
        loading: false,
      }));
    } catch {
      set({ error: "Failed to resolve alert", loading: false });
    }
  },
}));
