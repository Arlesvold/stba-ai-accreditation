"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { AccreditationCriterion, UpdateScoreRequest } from "@/lib/types";

type DraftMap = Record<
  string,
  {
    score: string;
    maxScore: string;
    notes: string;
  }
>;

interface AccreditationScoreProps {
  criteria: AccreditationCriterion[];
  loading: boolean;
  onUpdate: (id: string, payload: UpdateScoreRequest) => Promise<void>;
}

function buildDrafts(criteria: AccreditationCriterion[]): DraftMap {
  return criteria.reduce<DraftMap>((acc, item) => {
    acc[item.id] = {
      score: String(item.score),
      maxScore: String(item.maxScore),
      notes: item.notes ?? "",
    };
    return acc;
  }, {});
}

function statusPalette(item: AccreditationCriterion) {
  if (item.status === "good") {
    return {
      text: "text-emerald-700",
      border: "border-l-emerald-500",
      bar: "[&>div]:bg-emerald-500",
      label: "good",
      Icon: CheckCircle2,
    };
  }

  const ratio = item.maxScore > 0 ? item.gap / item.maxScore : 1;
  const isCritical = ratio >= 0.35;

  return {
    text: isCritical ? "text-rose-700" : "text-amber-700",
    border: isCritical ? "border-l-rose-500" : "border-l-amber-500",
    bar: isCritical ? "[&>div]:bg-rose-500" : "[&>div]:bg-amber-500",
    label: "at_risk",
    Icon: AlertTriangle,
  };
}

export function AccreditationScore({
  criteria,
  loading,
  onUpdate,
}: AccreditationScoreProps) {
  const [drafts, setDrafts] = useState<DraftMap>(() => buildDrafts(criteria));
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(buildDrafts(criteria));
  }, [criteria]);

  async function handleSave(id: string) {
    const draft = drafts[id];
    if (!draft) {
      return;
    }

    const score = Number(draft.score);
    const maxScore = Number(draft.maxScore);
    if (Number.isNaN(score) || Number.isNaN(maxScore) || score < 0 || maxScore <= 0) {
      return;
    }

    setSavingId(id);
    try {
      await onUpdate(id, {
        score,
        maxScore,
        notes: draft.notes.trim() || undefined,
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {criteria.map((item) => {
        const pct =
          item.maxScore > 0
            ? Math.max(0, Math.min(100, Math.round((item.score / item.maxScore) * 100)))
            : 0;
        const palette = statusPalette(item);
        const isSaving = savingId === item.id;

        return (
          <Card key={item.id} className={cn("border-l-4", palette.border)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Kriteria {item.number}
                  </p>
                  <CardTitle className="text-base leading-snug">{item.name}</CardTitle>
                </div>
                <Badge variant="outline" className={cn("capitalize", palette.text)}>
                  <palette.Icon className="mr-1 h-3.5 w-3.5" />
                  {palette.label}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Skor Saat Ini</span>
                  <span className="font-semibold text-foreground">
                    {item.score} / {item.maxScore}
                  </span>
                </div>
                <Progress className={palette.bar} value={pct} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Gap: {item.gap}</span>
                  <span>{pct}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor={`score-${item.id}`}>Update Skor</Label>
                  <Input
                    id={`score-${item.id}`}
                    type="number"
                    min={0}
                    step="0.01"
                    value={drafts[item.id]?.score ?? ""}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...prev[item.id],
                          score: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`max-${item.id}`}>Max Score</Label>
                  <Input
                    id={`max-${item.id}`}
                    type="number"
                    min={1}
                    step="0.01"
                    value={drafts[item.id]?.maxScore ?? ""}
                    onChange={(e) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...prev[item.id],
                          maxScore: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor={`notes-${item.id}`}>Catatan Internal</Label>
                <Input
                  id={`notes-${item.id}`}
                  value={drafts[item.id]?.notes ?? ""}
                  onChange={(e) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [item.id]: {
                        ...prev[item.id],
                        notes: e.target.value,
                      },
                    }))
                  }
                  placeholder="Opsional"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={loading || isSaving}
                onClick={() => void handleSave(item.id)}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Simpan Pembaruan
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
