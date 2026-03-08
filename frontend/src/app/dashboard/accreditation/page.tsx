"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Plus, Loader2, Award } from "lucide-react";
import { useAccreditationStore } from "@/stores/accreditation-store";
import type { CreateScoreRequest } from "@/lib/types";

function gradeColor(grade: string) {
  switch (grade) {
    case "A":
      return "text-green-600";
    case "B":
      return "text-blue-600";
    case "C":
      return "text-amber-600";
    default:
      return "text-red-600";
  }
}

export default function AccreditationPage() {
  const { readiness, loading, error, fetchReadiness, createScore } =
    useAccreditationStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateScoreRequest>({
    criteriaNo: 1,
    criteriaName: "",
    score: 0,
    maxScore: 4,
    year: new Date().getFullYear(),
    notes: "",
  });

  useEffect(() => {
    fetchReadiness();
  }, [fetchReadiness]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createScore(form);
    setOpen(false);
    setForm({
      criteriaNo: 1,
      criteriaName: "",
      score: 0,
      maxScore: 4,
      year: new Date().getFullYear(),
      notes: "",
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Accreditation</h2>
          <p className="text-muted-foreground">
            Monitor accreditation readiness and criteria scores.
          </p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Score
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add Criteria Score</SheetTitle>
              <SheetDescription>
                Add a score for an accreditation criterion.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Criteria No (1-9)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={9}
                    value={form.criteriaNo}
                    onChange={(e) =>
                      setForm({ ...form, criteriaNo: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={form.year}
                    onChange={(e) =>
                      setForm({ ...form, year: Number(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Criteria Name</Label>
                <Input
                  value={form.criteriaName}
                  onChange={(e) =>
                    setForm({ ...form, criteriaName: e.target.value })
                  }
                  placeholder="e.g. Visi, Misi, Tujuan dan Strategi"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Score</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.score}
                    onChange={(e) =>
                      setForm({ ...form, score: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Score</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.maxScore ?? 4}
                    onChange={(e) =>
                      setForm({ ...form, maxScore: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  value={form.notes ?? ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Readiness Overview */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {readiness ? `${readiness.totalScore}/${readiness.maxScore}` : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Percentage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {readiness ? `${readiness.percentage}%` : "—"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Predicted Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award
                className={`h-8 w-8 ${readiness ? gradeColor(readiness.grade) : "text-muted-foreground"}`}
              />
              <span className="text-3xl font-bold">
                {readiness?.grade ?? "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scores Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Criteria Scores</CardTitle>
          <CardDescription>
            {readiness?.scores.length ?? 0} criteria assessed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !readiness ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !readiness?.scores.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No scores yet. Click &quot;Add Score&quot; to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead>Criteria</TableHead>
                  <TableHead className="w-20 text-right">Score</TableHead>
                  <TableHead className="w-20 text-right">Max</TableHead>
                  <TableHead className="w-24 text-right">Percentage</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {readiness.scores.map((score) => {
                  const pct =
                    score.maxScore > 0
                      ? Math.round((score.score / score.maxScore) * 100)
                      : 0;
                  return (
                    <TableRow key={score.id}>
                      <TableCell className="font-medium">
                        C{score.criteriaNo}
                      </TableCell>
                      <TableCell>{score.criteriaName}</TableCell>
                      <TableCell className="text-right">
                        {score.score}
                      </TableCell>
                      <TableCell className="text-right">
                        {score.maxScore}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={pct >= 80 ? "default" : pct >= 60 ? "secondary" : "destructive"}
                        >
                          {pct}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {score.notes ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
