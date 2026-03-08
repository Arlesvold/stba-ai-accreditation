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
import { useBkdStore } from "@/stores/bkd-store";
import type { CreateBkdRequest } from "@/lib/types";

const emptyForm: CreateBkdRequest = {
  semester: "",
  year: new Date().getFullYear(),
  teachingHours: 0,
  researchHours: 0,
  serviceHours: 0,
  totalCredits: 0,
  status: "DRAFT",
};

export default function BkdPage() {
  const { reports, loading, error, fetchAll, create, update, remove } =
    useBkdStore();
  const [form, setForm] = useState<CreateBkdRequest>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function handleOpen(item?: (typeof reports)[0]) {
    if (item) {
      setEditId(item.id);
      setForm({
        semester: item.semester,
        year: item.year,
        teachingHours: item.teachingHours,
        researchHours: item.researchHours,
        serviceHours: item.serviceHours,
        totalCredits: item.totalCredits,
        status: item.status,
      });
    } else {
      setEditId(null);
      setForm(emptyForm);
    }
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editId) {
      await update(editId, form);
    } else {
      await create(form);
    }
    setOpen(false);
    setForm(emptyForm);
    setEditId(null);
  }

  async function handleDelete(id: string) {
    if (confirm("Yakin ingin menghapus laporan BKD ini?")) {
      await remove(id);
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case "VERIFIED":
        return "default";
      case "SUBMITTED":
        return "secondary";
      case "DRAFT":
        return "outline" as const;
      case "REJECTED":
        return "destructive";
      default:
        return "outline" as const;
    }
  }

  const totalTeaching = reports.reduce((s, r) => s + r.teachingHours, 0);
  const totalResearch = reports.reduce((s, r) => s + r.researchHours, 0);
  const totalService = reports.reduce((s, r) => s + r.serviceHours, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            BKD - Beban Kerja Dosen
          </h2>
          <p className="text-muted-foreground">
            Kelola laporan beban kerja dosen per semester.
          </p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => handleOpen()}>
              <Plus className="mr-2 h-4 w-4" /> Tambah BKD
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {editId ? "Edit Laporan BKD" : "Tambah Laporan BKD"}
              </SheetTitle>
              <SheetDescription>
                {editId
                  ? "Perbarui data beban kerja dosen."
                  : "Isi data beban kerja dosen untuk semester ini."}
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Input
                    value={form.semester}
                    onChange={(e) =>
                      setForm({ ...form, semester: e.target.value })
                    }
                    placeholder="Ganjil / Genap"
                    required
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jam Pengajaran</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={form.teachingHours ?? 0}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        teachingHours: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jam Penelitian</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={form.researchHours ?? 0}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        researchHours: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jam Pengabdian</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={form.serviceHours ?? 0}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        serviceHours: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total SKS</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={form.totalCredits ?? 0}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        totalCredits: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={form.status ?? "DRAFT"}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                </select>
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Laporan</CardDescription>
            <CardTitle className="text-2xl">{reports.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Jam Pengajaran</CardDescription>
            <CardTitle className="text-2xl">{totalTeaching}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Jam Penelitian</CardDescription>
            <CardTitle className="text-2xl">{totalResearch}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Jam Pengabdian</CardDescription>
            <CardTitle className="text-2xl">{totalService}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Laporan BKD</CardTitle>
          <CardDescription>{reports.length} laporan total</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && reports.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada data BKD. Klik &quot;Tambah BKD&quot; untuk memulai.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dosen</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead className="w-16">Tahun</TableHead>
                  <TableHead className="w-24 text-right">Pengajaran</TableHead>
                  <TableHead className="w-24 text-right">Penelitian</TableHead>
                  <TableHead className="w-24 text-right">Pengabdian</TableHead>
                  <TableHead className="w-20 text-right">SKS</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-24 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.user?.name ?? "—"}
                    </TableCell>
                    <TableCell>{item.semester}</TableCell>
                    <TableCell>{item.year}</TableCell>
                    <TableCell className="text-right">
                      {item.teachingHours}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.researchHours}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.serviceHours}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.totalCredits}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColor(item.status)}>
                        {item.status}
                      </Badge>
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
