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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Loader2, Users, Briefcase, Clock, Trophy } from "lucide-react";
import { useStudentStore } from "@/stores/student-store";
import type {
  CreateAlumniRequest,
  CreateAchievementRequest,
  AchievementLevel,
} from "@/lib/types";

export default function StudentPage() {
  const {
    alumni,
    achievements,
    tracerSummary,
    loading,
    error,
    fetchAlumni,
    createAlumni,
    removeAlumni,
    fetchTracerSummary,
    fetchAchievements,
    createAchievement,
    removeAchievement,
  } = useStudentStore();

  useEffect(() => {
    fetchAlumni();
    fetchAchievements();
    fetchTracerSummary();
  }, [fetchAlumni, fetchAchievements, fetchTracerSummary]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Analitik Mahasiswa
        </h2>
        <p className="text-muted-foreground">
          Data alumni, tracer study, dan prestasi mahasiswa.
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Tracer Study Summary Cards */}
      {tracerSummary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Total Alumni</CardDescription>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tracerSummary.totalAlumni}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Bekerja</CardDescription>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tracerSummary.employed}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Tingkat Kerja</CardDescription>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tracerSummary.employmentRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Rata-rata Tunggu</CardDescription>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tracerSummary.avgWaitingMonths.toFixed(1)}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  bulan
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="alumni">
        <TabsList>
          <TabsTrigger value="alumni">
            Alumni ({alumni.length})
          </TabsTrigger>
          <TabsTrigger value="achievements">
            Prestasi ({achievements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alumni" className="mt-4">
          <AlumniTab
            items={alumni}
            loading={loading}
            onCreate={createAlumni}
            onDelete={removeAlumni}
          />
        </TabsContent>
        <TabsContent value="achievements" className="mt-4">
          <AchievementsTab
            items={achievements}
            loading={loading}
            onCreate={createAchievement}
            onDelete={removeAchievement}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== Alumni Tab =====
function AlumniTab({
  items,
  loading,
  onCreate,
  onDelete,
}: {
  items: ReturnType<typeof useStudentStore.getState>["alumni"];
  loading: boolean;
  onCreate: (data: CreateAlumniRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateAlumniRequest>({
    nim: "",
    name: "",
    graduationYear: new Date().getFullYear(),
    programStudy: "",
    employmentStatus: "",
    company: "",
    position: "",
    waitingMonths: 0,
    surveyYear: new Date().getFullYear(),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onCreate(form);
    setOpen(false);
    setForm({
      nim: "",
      name: "",
      graduationYear: new Date().getFullYear(),
      programStudy: "",
    });
  }

  async function handleDelete(id: string) {
    if (confirm("Yakin ingin menghapus data alumni ini?")) {
      await onDelete(id);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Data Alumni</CardTitle>
          <CardDescription>{items.length} alumni terdaftar</CardDescription>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Tambah
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Tambah Alumni</SheetTitle>
              <SheetDescription>
                Tambah data alumni baru untuk tracer study.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>NIM</Label>
                  <Input
                    value={form.nim}
                    onChange={(e) =>
                      setForm({ ...form, nim: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nama</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tahun Lulus</Label>
                  <Input
                    type="number"
                    value={form.graduationYear}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        graduationYear: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Program Studi</Label>
                  <Input
                    value={form.programStudy}
                    onChange={(e) =>
                      setForm({ ...form, programStudy: e.target.value })
                    }
                    placeholder="Sastra Inggris"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status Pekerjaan</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={form.employmentStatus ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, employmentStatus: e.target.value })
                    }
                  >
                    <option value="">Pilih...</option>
                    <option value="EMPLOYED">Bekerja</option>
                    <option value="SELF_EMPLOYED">Wiraswasta</option>
                    <option value="UNEMPLOYED">Belum Bekerja</option>
                    <option value="CONTINUING_STUDY">Melanjutkan Studi</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Masa Tunggu (bulan)</Label>
                  <Input
                    type="number"
                    value={form.waitingMonths ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        waitingMonths: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Perusahaan</Label>
                  <Input
                    value={form.company ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, company: e.target.value || undefined })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jabatan</Label>
                  <Input
                    value={form.position ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        position: e.target.value || undefined,
                      })
                    }
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada data alumni.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIM</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Prodi</TableHead>
                <TableHead className="w-16">Lulus</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Perusahaan</TableHead>
                <TableHead className="w-20 text-right">Tunggu</TableHead>
                <TableHead className="w-16 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.nim}</TableCell>
                  <TableCell>{a.name}</TableCell>
                  <TableCell>{a.programStudy}</TableCell>
                  <TableCell>{a.graduationYear}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        a.employmentStatus === "EMPLOYED" ||
                        a.employmentStatus === "SELF_EMPLOYED"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {a.employmentStatus ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>{a.company ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    {a.waitingMonths != null ? `${a.waitingMonths} bln` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(a.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ===== Achievements Tab =====
function AchievementsTab({
  items,
  loading,
  onCreate,
  onDelete,
}: {
  items: ReturnType<typeof useStudentStore.getState>["achievements"];
  loading: boolean;
  onCreate: (data: CreateAchievementRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateAchievementRequest>({
    studentName: "",
    title: "",
    category: "NATIONAL",
    type: "",
    year: new Date().getFullYear(),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onCreate(form);
    setOpen(false);
    setForm({
      studentName: "",
      title: "",
      category: "NATIONAL",
      type: "",
      year: new Date().getFullYear(),
    });
  }

  async function handleDelete(id: string) {
    if (confirm("Yakin ingin menghapus data prestasi ini?")) {
      await onDelete(id);
    }
  }

  function categoryColor(cat: AchievementLevel) {
    switch (cat) {
      case "INTERNATIONAL":
        return "default";
      case "NATIONAL":
        return "secondary";
      case "REGIONAL":
        return "outline" as const;
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Prestasi Mahasiswa</CardTitle>
          <CardDescription>{items.length} prestasi tercatat</CardDescription>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Tambah
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Tambah Prestasi</SheetTitle>
              <SheetDescription>
                Catat prestasi mahasiswa dalam kompetisi.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Mahasiswa</Label>
                  <Input
                    value={form.studentName}
                    onChange={(e) =>
                      setForm({ ...form, studentName: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>NIM</Label>
                  <Input
                    value={form.nim ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, nim: e.target.value || undefined })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Judul / Nama Kompetisi</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tingkat</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category: e.target.value as AchievementLevel,
                      })
                    }
                  >
                    <option value="REGIONAL">Regional</option>
                    <option value="NATIONAL">Nasional</option>
                    <option value="INTERNATIONAL">Internasional</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Jenis</Label>
                  <Input
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value })
                    }
                    placeholder="Debat, Essay, dll"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Penyelenggara</Label>
                  <Input
                    value={form.organizer ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        organizer: e.target.value || undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tahun</Label>
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
                <Label>Peringkat / Hasil</Label>
                <Input
                  value={form.rank ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, rank: e.target.value || undefined })
                  }
                  placeholder="Juara 1, Finalis, dll"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Belum ada data prestasi.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mahasiswa</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead className="w-28">Tingkat</TableHead>
                <TableHead>Peringkat</TableHead>
                <TableHead className="w-16">Tahun</TableHead>
                <TableHead className="w-16 text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((ach) => (
                <TableRow key={ach.id}>
                  <TableCell className="font-medium">
                    {ach.studentName}
                  </TableCell>
                  <TableCell>{ach.title}</TableCell>
                  <TableCell>{ach.type}</TableCell>
                  <TableCell>
                    <Badge variant={categoryColor(ach.category)}>
                      {ach.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{ach.rank ?? "—"}</TableCell>
                  <TableCell>{ach.year}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(ach.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
