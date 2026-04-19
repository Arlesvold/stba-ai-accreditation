"use client"

import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, FileText, Sparkles } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  generateLedDraft,
  getLedDownloadUrl,
  getLedStatus,
  type GenerateLedPayload,
} from "@/lib/led-workspace-api"

type SourceContext = {
  totalDosenTetap: number
  kualifikasiS3: number
  rasioDosenMahasiswa: string
}

type Props = {
  sourceContext: SourceContext
}

const GENERATE_PAYLOAD: GenerateLedPayload = {
  criteria: [11],
  year: 2024,
  format: "docx",
}

const WORKFLOW_STEPS = ["Draft", "Processing AI", "Review", "Approved"]

type WorkspaceStage = "Draft" | "Processing AI" | "Review" | "Approved"

const EVIDENCE_ITEMS = [
  { name: "SK_Rektor_Kurikulum.pdf", status: "Linked" as const },
  { name: "MoU_British_Council_2021.pdf", status: "Missing Evidence" as const },
]

function statusStyle(status: "Linked" | "Missing Evidence") {
  if (status === "Linked") return "bg-emerald-100 text-emerald-800 border-emerald-200"
  return "bg-amber-100 text-amber-800 border-amber-200"
}

export default function LedWorkspaceClient({ sourceContext }: Props) {
  const [jobId, setJobId] = useState<string | null>(null)
  const [stage, setStage] = useState<WorkspaceStage>("Draft")
  const [progress, setProgress] = useState(8)
  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "failed">("idle")
  const [statusMessage, setStatusMessage] = useState("Belum ada proses generate.")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isConflict] = useState(false)
  const [draftText, setDraftText] = useState(
    "Sumber Daya Manusia STBA Pontianak terdiri dari 22 dosen tetap dengan rasio dosen terhadap mahasiswa sebesar 1:19,5 yang masih berada dalam batas ketentuan BAN-PT..."
  )

  const activeStep = useMemo(() => WORKFLOW_STEPS.findIndex((item) => item === stage), [stage])

  useEffect(() => {
    if (!jobId || status !== "processing") return

    const intervalId = setInterval(async () => {
      try {
        const polled = await getLedStatus(jobId)
        setProgress(polled.progress)
        setStatus(polled.status)
        setStatusMessage(polled.message)

        if (polled.status === "completed") {
          setStage("Review")
        }

        if (polled.status === "failed") {
          setIsGenerating(false)
        }
      } catch {
        setStatus("failed")
        setStatusMessage("Gagal polling status job LED.")
        setIsGenerating(false)
      }
    }, 1800)

    return () => clearInterval(intervalId)
  }, [jobId, status])

  async function handleGenerateDraft() {
    setIsGenerating(true)
    setStatus("processing")
    setStage("Processing AI")
    setProgress(28)
    setStatusMessage("Draft LED diproses AI...")

    try {
      const generated = await generateLedDraft(GENERATE_PAYLOAD)
      setJobId(generated.jobId)
      setProgress(generated.progress ?? 20)
      setStatus(generated.status)
      setStatusMessage(generated.message ?? "Draft sedang diproses...")

      if (generated.status === "completed") {
        setStage("Review")
        setIsGenerating(false)
      }
    } catch {
      setStatus("failed")
      setStatusMessage("Gagal generate draft. Cek koneksi backend LED service.")
      setIsGenerating(false)
    }
  }

  function handleApproveDraft() {
    setStage("Approved")
    setProgress(100)
    setStatusMessage("Dokumen telah disetujui reviewer.")
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-cyan-50 p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              LED Command Center - Institusi
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Document Command Center untuk proses drafting, validasi, dan finalisasi LED berbasis AI.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {status === "completed" && jobId ? (
              <Button asChild className="h-10 px-5">
                <a href={getLedDownloadUrl(jobId)} target="_blank" rel="noreferrer">
                  <FileText className="h-4 w-4" />
                  Export to DOCX
                </a>
              </Button>
            ) : null}
            {stage === "Review" ? (
              <Button variant="outline" className="h-10 px-5" onClick={handleApproveDraft}>
                Approve Draft
              </Button>
            ) : null}
            <Button onClick={handleGenerateDraft} disabled={isGenerating} className="h-10 px-5">
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate AI Draft"}
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <Progress value={progress} />
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            {WORKFLOW_STEPS.map((step, index) => (
              <div key={step} className="flex items-center gap-2 rounded-md border bg-white/80 px-2 py-1.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${index <= activeStep ? "bg-cyan-600" : "bg-slate-300"}`}
                />
                <span className={index <= activeStep ? "text-slate-900" : "text-slate-500"}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Source Data & Context Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[540px] pr-2">
              <div className="space-y-3">
                <Card className="border-slate-200 bg-slate-50/70">
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-500">Total Dosen Tetap</p>
                    <p className="text-xl font-semibold text-slate-900">{sourceContext.totalDosenTetap}</p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-slate-50/70">
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-500">Kualifikasi S3</p>
                    <p className="text-xl font-semibold text-slate-900">{sourceContext.kualifikasiS3} orang</p>
                  </CardContent>
                </Card>
                <Card className="border-slate-200 bg-slate-50/70">
                  <CardContent className="p-4">
                    <p className="text-xs text-slate-500">Rasio Dosen : Mahasiswa</p>
                    <p className="text-xl font-semibold text-slate-900">{sourceContext.rasioDosenMahasiswa}</p>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">AI Document Editor (Draft View)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant={isConflict ? "destructive" : "success"}>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Consistency Checker</AlertTitle>
              <AlertDescription>
                {isConflict
                  ? "Status: Konflik data dengan Tabel 3.a.1 LKPS (Flag Merah)"
                  : "Status: Sinkron dengan Tabel 3.a.1 LKPS (Total Dosen = 22) [Lolos]"}
              </AlertDescription>
            </Alert>

            <Tabs defaultValue="k4" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="k4">Kriteria 4: SDM</TabsTrigger>
                <TabsTrigger value="k11">Kriteria 11: Luaran</TabsTrigger>
              </TabsList>
              <TabsContent value="k4">
                <ScrollArea className="h-[430px] rounded-md border bg-white p-4">
                  <Textarea
                    value={draftText}
                    onChange={(event) => setDraftText(event.target.value)}
                    className="min-h-[390px] resize-none border-0 p-0 text-sm leading-7 shadow-none focus-visible:ring-0"
                  />
                </ScrollArea>
              </TabsContent>
              <TabsContent value="k11">
                <ScrollArea className="h-[430px] rounded-md border bg-white p-4">
                  <p className="text-sm leading-7 text-slate-700">
                    Draft kriteria 11 siap dihasilkan melalui AI generator. Klik Generate AI Draft untuk memulai.
                  </p>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <Alert>
              <FileText className="h-4 w-4" />
              <AlertTitle>Pipeline Status</AlertTitle>
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Evidence Binder & Validation</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[540px] pr-2">
              <div className="space-y-3">
                {EVIDENCE_ITEMS.map((item) => (
                  <div key={item.name} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-2">
                        <FileText className="mt-0.5 h-4 w-4 text-slate-500" />
                        <p className="truncate text-sm text-slate-800">{item.name}</p>
                      </div>
                      <Badge className={statusStyle(item.status)}>{item.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
