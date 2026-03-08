"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, BookOpen, Award, AlertTriangle } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useIkuStore } from "@/stores/iku-store";
import { useResearchStore } from "@/stores/research-store";
import { useAccreditationStore } from "@/stores/accreditation-store";
import { useRiskStore } from "@/stores/risk-store";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { items: ikuItems, fetchAll: fetchIku } = useIkuStore();
  const { publications, grants, fetchPublications, fetchGrants } = useResearchStore();
  const { readiness, fetchReadiness } = useAccreditationStore();
  const { alerts, fetchAlerts } = useRiskStore();

  useEffect(() => {
    fetchIku();
    fetchPublications();
    fetchGrants();
    fetchReadiness();
    fetchAlerts();
  }, [fetchIku, fetchPublications, fetchGrants, fetchReadiness, fetchAlerts]);

  const avgIku =
    ikuItems.length > 0
      ? Math.round(
          ikuItems.reduce((sum, i) => sum + i.percentage, 0) / ikuItems.length
        )
      : 0;

  const totalResearch = publications.length + grants.length;
  const activeAlerts = alerts.filter((a) => !a.isResolved).length;

  const stats = [
    {
      title: "IKU Achievement",
      value: ikuItems.length > 0 ? `${avgIku}%` : "—",
      description: `${ikuItems.length} indicators tracked`,
      icon: Target,
      color: "text-blue-600",
    },
    {
      title: "Total Research",
      value: totalResearch > 0 ? String(totalResearch) : "—",
      description: `${publications.length} publications, ${grants.length} grants`,
      icon: BookOpen,
      color: "text-green-600",
    },
    {
      title: "Accreditation Score",
      value: readiness ? `${readiness.percentage}%` : "—",
      description: readiness ? `Grade: ${readiness.grade}` : "Not assessed",
      icon: Award,
      color: "text-amber-600",
    },
    {
      title: "Risk Alerts",
      value: activeAlerts > 0 ? String(activeAlerts) : "0",
      description: `${alerts.length} total, ${activeAlerts} active`,
      icon: AlertTriangle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back{user?.name ? `, ${user.name}` : ""}
        </h2>
        <p className="text-muted-foreground">
          Overview of your accreditation performance indicators.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">IKU Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {ikuItems.length > 0 ? (
              <div className="space-y-2">
                {ikuItems.slice(0, 5).map((iku) => (
                  <div
                    key={iku.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate mr-2">{iku.indicator}</span>
                    <Badge
                      variant={iku.percentage >= 80 ? "default" : "secondary"}
                    >
                      {iku.percentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No IKU data yet.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Risk Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {activeAlerts > 0 ? (
              <div className="space-y-2">
                {alerts
                  .filter((a) => !a.isResolved)
                  .slice(0, 5)
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate mr-2">{alert.message}</span>
                      <Badge
                        variant={
                          alert.level === "CRITICAL" || alert.level === "HIGH"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {alert.level}
                      </Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No active alerts. All clear!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
