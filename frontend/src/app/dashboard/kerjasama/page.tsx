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
import { useCooperationStore } from "@/stores/cooperation-store";
import type { CreateCooperationRequest, CooperationScope } from "@/lib/types";

const emptyForm: CreateCooperationRequest = {
  partnerName: "",
  partnerType: "",
  scope: "NATIONAL",
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "ACTIVE",
  documentUrl: "",
  contactPerson: "",
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeZone: "Asia/Jakarta",
});

export default function KerjasamaPage() {
  const { cooperations, loading, error, fetchAll, create, update, remove } =
    useCooperationStore();
  const [form, setForm] = useState<CreateCooperationRequest>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function handleOpen(item?: (typeof cooperations)[0]) {
    if (item) {
      setEditId(item.id);
      setForm({
        partnerName: item.partnerName,
        partnerType: item.partnerType,
        scope: item.scope,
        title: item.title,
        description: item.description ?? "",
        startDate: item.startDate?.slice(0, 10) ?? "",
        endDate: item.endDate?.slice(0, 10) ?? "",
        status: item.status,
        documentUrl: item.documentUrl ?? "",
        contactPerson: item.contactPerson ?? "",
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
      description: form.description || undefined,
      endDate: form.endDate || undefined,
      documentUrl: form.documentUrl || undefined,
      contactPerson: form.contactPerson || undefined,
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
    if (confirm("Yakin ingin menghapus kerjasama ini?")) {
      await remove(id);
    }
  }

  function scopeColor(scope: CooperationScope) {
    return scope === "INTERNATIONAL" ? "default" : "secondary";
  }

  function statusColor(status: string) {
    switch (status) {
      case "ACTIVE":
        return "default";
      case "EXPIRED":
        return "destructive";
      case "DRAFT":
        return "outline" as const;
      default:
        return "secondary";
    }
  }

  const nationalCount = cooperations.filter(
    (c) => c.scope === "NATIONAL"
  ).length;
  const internationalCount = cooperations.filter(
    (c) => c.scope === "INTERNATIONAL"
  ).length;
  const activeCount = cooperations.filter((c) => c.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Kerjasama & MoU
          </h2>
          <p className="text-muted-foreground">
            Kelola data kerjasama nasional dan internasional.
          </p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => handleOpen()}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Kerjasama
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {editId ? "Edit Kerjasama" : "Tambah Kerjasama"}
              </SheetTitle>
              <SheetDescription>
                {editId
                  ? "Perbarui data kerjasama."
                  : "Tambah data kerjasama atau MoU baru."}
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Nama Mitra</Label>
                <Input
                  value={form.partnerName}
                  onChange={(e) =>
                    setForm({ ...form, partnerName: e.target.value })
                  }
                  placeholder="Universitas ABC"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Jenis Mitra</Label>
                  <Input
                    value={form.partnerType}
                    onChange={(e) =>
                      setForm({ ...form, partnerType: e.target.value })
                    }
                    placeholder="Perguruan Tinggi, Industri"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lingkup</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={form.scope}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        scope: e.target.value as CooperationScope,
                      })
                    }
                  >
                    <option value="NATIONAL">Nasional</option>
                    <option value="INTERNATIONAL">Internasional</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Judul MoU / Kerjasama</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  required
                />
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
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal Berakhir</Label>
                  <Input
                    type="date"
                    value={form.endDate ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={form.status ?? "ACTIVE"}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Kontak Person</Label>
                  <Input
                    value={form.contactPerson ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, contactPerson: e.target.value })
                    }
                  />
                </div>
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
            <CardDescription>Total Kerjasama</CardDescription>
            <CardTitle className="text-2xl">{cooperations.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Nasional</CardDescription>
            <CardTitle className="text-2xl">{nationalCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Internasional</CardDescription>
            <CardTitle className="text-2xl">{internationalCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aktif</CardDescription>
            <CardTitle className="text-2xl">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Kerjasama</CardTitle>
          <CardDescription>
            {cooperations.length} kerjasama total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && cooperations.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : cooperations.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Belum ada data kerjasama. Klik &quot;Tambah Kerjasama&quot; untuk
              memulai.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mitra</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead className="w-24">Jenis</TableHead>
                  <TableHead className="w-28">Lingkup</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-24">Mulai</TableHead>
                  <TableHead className="w-24">Berakhir</TableHead>
                  <TableHead className="w-24 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cooperations.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.partnerName}
                    </TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.partnerType}</TableCell>
                    <TableCell>
                      <Badge variant={scopeColor(item.scope)}>
                        {item.scope === "NATIONAL"
                          ? "Nasional"
                          : "Internasional"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColor(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {dateFormatter.format(new Date(item.startDate))}
                    </TableCell>
                    <TableCell>
                      {item.endDate
                        ? dateFormatter.format(new Date(item.endDate))
                        : "—"}
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
