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
import { useIkuStore } from "@/stores/iku-store";
import type { CreateIkuRequest } from "@/lib/types";

const emptyForm: CreateIkuRequest = {
  criteriaNo: 1,
  indicator: "",
  target: 0,
  current: 0,
  year: new Date().getFullYear(),
  semester: "",
  notes: "",
};

export default function IkuPage() {
  const { items, loading, error, fetchAll, create, update, remove } =
    useIkuStore();
  const [form, setForm] = useState<CreateIkuRequest>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  function handleOpen(item?: (typeof items)[0]) {
    if (item) {
      setEditId(item.id);
      setForm({
        criteriaNo: item.criteriaNo,
        indicator: item.indicator,
        target: item.target,
        current: item.current,
        year: item.year,
        semester: item.semester ?? "",
        notes: item.notes ?? "",
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
    if (confirm("Are you sure you want to delete this IKU?")) {
      await remove(id);
    }
  }

  function statusColor(status: string) {
    switch (status) {
      case "EXCELLENT":
        return "default";
      case "GOOD":
        return "secondary";
      case "NEEDS_IMPROVEMENT":
        return "destructive";
      default:
        return "outline" as const;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">IKU Management</h2>
          <p className="text-muted-foreground">
            Manage key performance indicators for accreditation criteria.
          </p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button onClick={() => handleOpen()}>
              <Plus className="mr-2 h-4 w-4" /> Add IKU
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{editId ? "Edit IKU" : "Add New IKU"}</SheetTitle>
              <SheetDescription>
                {editId
                  ? "Update the indicator details."
                  : "Fill in the details for a new performance indicator."}
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Criteria No (1-9)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={9}
                    value={form.criteriaNo}
                    onChange={(e) =>
                      setForm({ ...form, criteriaNo: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
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
                <Label>Indicator</Label>
                <Input
                  value={form.indicator}
                  onChange={(e) =>
                    setForm({ ...form, indicator: e.target.value })
                  }
                  placeholder="e.g. Percentage of lecturers with doctoral degree"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.target}
                    onChange={(e) =>
                      setForm({ ...form, target: Number(e.target.value) })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.current}
                    onChange={(e) =>
                      setForm({ ...form, current: Number(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Semester (optional)</Label>
                <Input
                  value={form.semester}
                  onChange={(e) =>
                    setForm({ ...form, semester: e.target.value })
                  }
                  placeholder="e.g. Ganjil 2025/2026"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editId ? "Update" : "Create"}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Indicators</CardTitle>
          <CardDescription>{items.length} indicators total</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && items.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No IKU data yet. Click &quot;Add IKU&quot; to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead>Indicator</TableHead>
                  <TableHead className="w-20 text-right">Target</TableHead>
                  <TableHead className="w-20 text-right">Current</TableHead>
                  <TableHead className="w-24 text-right">Progress</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead className="w-16">Year</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      C{item.criteriaNo}
                    </TableCell>
                    <TableCell>{item.indicator}</TableCell>
                    <TableCell className="text-right">{item.target}</TableCell>
                    <TableCell className="text-right">{item.current}</TableCell>
                    <TableCell className="text-right">
                      {item.percentage}%
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColor(item.status)}>
                        {item.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.year}</TableCell>
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
