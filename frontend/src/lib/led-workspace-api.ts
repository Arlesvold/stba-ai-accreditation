import axios from "axios"

import { mockGenerateLed, mockGetLedStatus } from "@/lib/mocks/led-workspace-mock"

export type GenerateLedPayload = {
  criteria: number[]
  year: number
  format: "docx" | "pdf"
}

export type LedJobStatusResponse = {
  jobId: string
  status: "processing" | "completed" | "failed"
  progress: number
  message: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"

const ledApi = axios.create({
  baseURL: `${API_BASE_URL}/v1/led`,
  headers: { "Content-Type": "application/json" },
})

// Toggle mock mode untuk Copilot/dev local saat endpoint backend belum siap.
const USE_LED_MOCK = true

export async function generateLedDraft(payload: GenerateLedPayload) {
  if (USE_LED_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return mockGenerateLed(payload)
  }

  const response = await ledApi.post("/generate", payload)
  return response.data.data as {
    jobId: string
    status: "processing" | "completed" | "failed"
    progress?: number
    message?: string
  }
}

export async function getLedStatus(jobId: string): Promise<LedJobStatusResponse> {
  if (USE_LED_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 700))
    return mockGetLedStatus(jobId)
  }

  const response = await ledApi.get(`/status/${jobId}`)
  const data = response.data.data
  return {
    jobId,
    status: data.status,
    progress: data.progress ?? 0,
    message: data.message ?? "Status diperbarui.",
  }
}

export function getLedDownloadUrl(jobId: string) {
  return `${API_BASE_URL}/v1/led/download/${jobId}`
}
