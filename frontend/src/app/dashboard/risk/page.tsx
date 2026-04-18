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
import { Plus, Loader2, CheckCircle } from "lucide-react";
import { useRiskStore } from "@/stores/risk-store";
import type { CreateRiskAlertRequest } from "@/lib/types";

function levelVariant(level: string) {
  switch (level) {
    case "LOW":
      return "secondary" as const;
    case "MEDIUM":
      return "default" as const;
    case "HIGH":
    case "CRITICAL":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

export default function RiskAlertsPage() {
  const { alerts, loading, error, fetchAlerts, createAlert, resolveAlert } =
    useRiskStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateRiskAlertRequest>({
    criteriaNo: 1,
    level: "LOW",
    message: "",
    recommendation: "",
  });

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await createAlert(form);
    setOpen(false);
    setForm({ criteriaNo: 1, level: "LOW", message: "", recommendation: "" });
  }

  async function handleResolve(id: string) {
    await resolveAlert(id);
  }

  const activeAlerts = alerts.filter((a) => !a.isResolved);
  const resolvedAlerts = alerts.filter((a) => a.isResolved);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Risk Alerts</h2>
          <p className="text-muted-foreground">
            Monitor and manage accreditation risk alerts.
          </p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Alert
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create Risk Alert</SheetTitle>
              <SheetDescription>
                Flag a new risk for accreditation readiness.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Message</Label>
                <Input
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="e.g. Low research output for Criteria 6"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Recommendation (optional)</Label>
                <Input
                  value={form.recommendation ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, recommendation: e.target.value })
                  }
                  placeholder="Suggested action to mitigate this risk"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Level</Label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.level}
                    onChange={(e) =>
                      setForm({ ...form, level: e.target.value as CreateRiskAlertRequest["level"] })
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Criteria No</Label>
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
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Alert
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

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active Alerts</CardTitle>
          <CardDescription>
            {activeAlerts.length} unresolved risk{activeAlerts.length !== 1 && "s"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !alerts.length ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !activeAlerts.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No active risk alerts. Looking good!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Criteria</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Recommendation</TableHead>
                  <TableHead className="w-24">Level</TableHead>
                  <TableHead className="w-28">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell className="font-medium">
                      C{alert.criteriaNo}
                    </TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {alert.recommendation ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={levelVariant(alert.level)}>
                        {alert.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolve(alert.id)}
                        disabled={loading}
                      >
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resolved Alerts</CardTitle>
            <CardDescription>
              {resolvedAlerts.length} resolved
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Criteria</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Recommendation</TableHead>
                  <TableHead className="w-24">Level</TableHead>
                  <TableHead className="w-28">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolvedAlerts.map((alert) => (
                  <TableRow key={alert.id} className="opacity-60">
                    <TableCell className="font-medium">
                      C{alert.criteriaNo}
                    </TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {alert.recommendation ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{alert.level}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {dateFormatter.format(new Date(alert.updatedAt))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
