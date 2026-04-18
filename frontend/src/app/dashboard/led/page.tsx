"use client";

import { useState } from "react";
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
import { Loader2, Download, FileText, RefreshCw } from "lucide-react";
import { useLedStore } from "@/stores/led-store";

const CRITERIA_OPTIONS = [
  { no: 1, label: "C1 – Visi, Misi, Tujuan dan Strategi" },
  { no: 2, label: "C2 – Tata Pamong, Tata Kelola dan Kerjasama" },
  { no: 3, label: "C3 – Mahasiswa" },
  { no: 4, label: "C4 – Sumber Daya Manusia" },
  { no: 5, label: "C5 – Keuangan, Sarana dan Prasarana" },
  { no: 6, label: "C6 – Pendidikan" },
  { no: 7, label: "C7 – Penelitian" },
  { no: 8, label: "C8 – Pengabdian kepada Masyarakat" },
  { no: 9, label: "C9 – Luaran dan Capaian Tridharma" },
];

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function statusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return <Badge variant="default">Completed</Badge>;
    case "PROCESSING":
      return <Badge variant="secondary">Processing</Badge>;
    case "PENDING":
      return <Badge variant="secondary">Pending</Badge>;
    case "FAILED":
      return <Badge variant="destructive">Failed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function LedPage() {
  const { currentJob, loading, error, generate, checkStatus, download } =
    useLedStore();
  const [selectedCriteria, setSelectedCriteria] = useState<number[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [format, setFormat] = useState("docx");

  function toggleCriteria(no: number) {
    setSelectedCriteria((prev) =>
      prev.includes(no) ? prev.filter((c) => c !== no) : [...prev, no]
    );
  }

  function selectAll() {
    if (selectedCriteria.length === 9) {
      setSelectedCriteria([]);
    } else {
      setSelectedCriteria(CRITERIA_OPTIONS.map((c) => c.no));
    }
  }

  async function handleGenerate() {
    if (selectedCriteria.length === 0) return;
    await generate({
      criteria: selectedCriteria.sort((a, b) => a - b),
      year,
      format,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">LED Generator</h2>
        <p className="text-muted-foreground">
          Generate Laporan Evaluasi Diri documents for accreditation.
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Generate Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generate LED</CardTitle>
            <CardDescription>
              Select criteria, year, and format to generate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Criteria</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                >
                  {selectedCriteria.length === 9 ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {CRITERIA_OPTIONS.map((c) => (
                  <label
                    key={c.no}
                    className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCriteria.includes(c.no)}
                      onChange={() => toggleCriteria(c.no)}
                      className="h-4 w-4 rounded border-input"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Format</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="docx">DOCX</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              className="w-full"
              disabled={loading || selectedCriteria.length === 0}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <FileText className="mr-2 h-4 w-4" />
              Generate LED
            </Button>
          </CardContent>
        </Card>

        {/* Job Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generation Status</CardTitle>
            <CardDescription>
              {currentJob
                ? `Job ${currentJob.jobId.slice(0, 8)}...`
                : "No active job"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!currentJob ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Generate a LED to see the status here.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  {statusBadge(currentJob.status)}
                </div>

                {currentJob.progress !== undefined && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{currentJob.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${currentJob.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  Created:{" "}
                  {dateTimeFormatter.format(new Date(currentJob.createdAt))}
                </div>

                <div className="flex gap-2">
                  {(currentJob.status === "PENDING" ||
                    currentJob.status === "PROCESSING") && (
                    <Button
                      variant="outline"
                      onClick={() => checkStatus(currentJob.jobId)}
                      disabled={loading}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  )}
                  {currentJob.status === "COMPLETED" && (
                    <Button
                      onClick={() => download(currentJob.jobId)}
                      disabled={loading}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
