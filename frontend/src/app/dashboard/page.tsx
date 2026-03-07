import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, BookOpen, Award, AlertTriangle } from "lucide-react";

const stats = [
  {
    title: "IKU Achievement",
    value: "—",
    description: "Not yet calculated",
    icon: Target,
    color: "text-blue-600",
  },
  {
    title: "Total Research",
    value: "—",
    description: "Publications & Grants",
    icon: BookOpen,
    color: "text-green-600",
  },
  {
    title: "Accreditation Score",
    value: "—",
    description: "Readiness score",
    icon: Award,
    color: "text-amber-600",
  },
  {
    title: "Risk Alerts",
    value: "—",
    description: "Active alerts",
    icon: AlertTriangle,
    color: "text-red-600",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
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
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No activity yet. Data will appear once connected to the API.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="secondary">IKU: Pending</Badge>
            <Badge variant="secondary">Research: Pending</Badge>
            <Badge variant="secondary">LED: Pending</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
