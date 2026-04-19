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
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useSpmiStore } from "@/stores/spmi-store";
import type { CreateSpmiRequest, SPMIPhase } from "@/lib/types";

const phases: { value: SPMIPhase; label: string }[] = [
  { value: "PENETAPAN", label: "Penetapan" },
  { value: "PELAKSANAAN", label: "Pelaksanaan" },
  { value: "EVALUASI", label: "Evaluasi" },
  { value: "PENGENDALIAN", label: "Pengendalian" },
  { value: "PENINGKATAN", label: "Peningkatan" },
];

const emptyForm: CreateSpmiRequest = {
  name: "",
  year: new Date().getFullYear(),
  phase: "PENETAPAN",
  description: "",
  status: "PLANNED",
  startDate: "",
  endDate: "",
  findings: "",
  followUp: "",
};

export default function SpmiPage() {
  const { cycles, loading, error, fetchAll, create, update, remove } =
    useSpmiStore();
  const [form, setForm] = useState<CreateSpmiRequest>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function handleOpen(item?: (typeof cycles)[0]) {
    if (item) {
      setEditId(item.id);
      setForm({
        name: item.name,
        year: item.year,
        phase: item.phase,
        description: item.description ?? "",
        status: item.status ?? "PLANNED",
        startDate: item.startDate?.slice(0, 10) ?? "",
        endDate: item.endDate?.slice(0, 10) ?? "",
        findings: item.findings ?? "",
        followUp: item.followUp ?? "",
      });
    } else {
      setEditId(null);
      setForm(emptyForm);
    }
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      status: form.status ?? "PLANNED",
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      description: form.description || undefined,
      findings: form.findings || undefined,
      followUp: form.followUp || undefined,
    };
    if (editId) {
      await update(editId, payload);
    } else {
      await create(payload);
    }
    setOpen(false);
    setForm(emptyForm);
    setEditId(null);
  }

  async function handleDelete(id: string) {
    if (confirm("Yakin ingin menghapus siklus SPMI ini?")) {
      await remove(id);
    }
  }

  function phaseColor(phase: SPMIPhase) {
    switch (phase) {
      case "PENETAPAN":
        return "default";
      case "PELAKSANAAN":
        return "secondary";
      case "EVALUASI":
        return "outline" as const;
      case "PENGENDALIAN":
        return "destructive";
      case "PENINGKATAN":
        return "default";
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case "COMPLETED":
        return "default";
      case "IN_PROGRESS":
        return "secondary";
      case "PLANNED":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  }

  // Count phases
  const phaseCounts = phases.map((p) => ({
    ...p,
    count: cycles.filter((c) => c.phase === p.value).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            SPMI - Monitoring Mutu
          </h2>
          <p className="text-muted-foreground">
            Siklus PPEPP (Penetapan, Pelaksanaan, Evaluasi, Pengendalian,
            Peningkatan).
          </p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => handleOpen()}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Siklus
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {editId ? "Edit Siklus SPMI" : "Tambah Siklus SPMI"}
              </SheetTitle>
              <SheetDescription>
                {editId
                  ? "Perbarui data siklus mutu."
                  : "Tambah siklus mutu baru dalam PPEPP."}
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Nama Siklus</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Audit Mutu Internal 2025"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label>Fase PPEPP</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={form.phase}
                    onChange={(e) =>
                      setForm({ ...form, phase: e.target.value as SPMIPhase })
                    }
                  >
                    {phases.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Input
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal Mulai</Label>
                  <Input
                    type="date"
                    value={form.startDate ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Selesai</Label>
                  <Input
                    type="date"
                    value={form.endDate ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={form.status ?? "PLANNED"}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                >
                  <option value="PLANNED">Planned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Temuan</Label>
                <Input
                  value={form.findings ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, findings: e.target.value })
                  }
                  placeholder="Hasil temuan audit..."
                />
              </div>
              <div className="space-y-2">
                <Label>Tindak Lanjut</Label>
                <Input
                  value={form.followUp ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, followUp: e.target.value })
                  }
                  placeholder="Rencana tindak lanjut..."
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editId ? "Perbarui" : "Simpan"}
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

      {/* Phase Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {phaseCounts.map((p) => (
          <Card key={p.value}>
            <CardHeader className="pb-2">
              <CardDescription>{p.label}</CardDescription>
              <CardTitle className="text-2xl">{p.count}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Siklus SPMI</CardTitle>
          <CardDescription>{cycles.length} siklus total</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && cycles.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : cycles.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada data SPMI. Klik &quot;Tambah Siklus&quot; untuk memulai.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="w-28">Fase</TableHead>
                  <TableHead className="w-16">Tahun</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead>Temuan</TableHead>
                  <TableHead>Tindak Lanjut</TableHead>
                  <TableHead className="w-24 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cycles.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant={phaseColor(item.phase)}>
                        {item.phase}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.year}</TableCell>
                    <TableCell>
                      <Badge variant={statusColor(item.status ?? "PLANNED")}>
                        {(item.status ?? "PLANNED").replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {item.findings ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {item.followUp ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpen(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
