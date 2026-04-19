import LedWorkspaceClient from "./workspace-client"

export const dynamic = "force-static"

export default async function LedWorkspacePage() {
  // RSC: summary context disiapkan di server dan diumpankan ke komponen client.
  const sourceContext = {
    totalDosenTetap: 22,
    kualifikasiS3: 1,
    rasioDosenMahasiswa: "1:19.5",
  }

  return <LedWorkspaceClient sourceContext={sourceContext} />
}
