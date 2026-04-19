import type { GenerateLedPayload, LedJobStatusResponse } from "@/lib/led-workspace-api"

const STATUS_SEQUENCE: Array<LedJobStatusResponse["status"]> = [
  "processing",
  "processing",
  "completed",
]

const mockJobState = new Map<string, { pollCount: number; payload: GenerateLedPayload }>()

function makeMockJobId() {
  const seed = Date.now().toString(36)
  return `led-mock-${seed}`
}

export function mockGenerateLed(payload: GenerateLedPayload) {
  const jobId = makeMockJobId()
  mockJobState.set(jobId, { pollCount: 0, payload })

  return {
    jobId,
    status: "processing" as const,
    progress: 20,
    message: "Job diterima. AI sedang memproses dokumen.",
  }
}

export function mockGetLedStatus(jobId: string): LedJobStatusResponse {
  const job = mockJobState.get(jobId)
  if (!job) {
    return {
      jobId,
      status: "processing",
      progress: 10,
      message: "Job belum ditemukan, mencoba sinkronisasi...",
    }
  }

  const index = Math.min(job.pollCount, STATUS_SEQUENCE.length - 1)
  const status = STATUS_SEQUENCE[index]
  const progress = status === "completed" ? 100 : 45 + index * 20
  const message =
    status === "completed"
      ? `Draft LED selesai untuk tahun ${job.payload.year}.`
      : "Draft sedang diproses oleh pipeline RAG + LLM."

  mockJobState.set(jobId, { ...job, pollCount: job.pollCount + 1 })

  return {
    jobId,
    status,
    progress,
    message,
  }
}
