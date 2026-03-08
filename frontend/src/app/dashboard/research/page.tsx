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
import { Plus, Loader2 } from "lucide-react";
import { useResearchStore } from "@/stores/research-store";
import type {
  Publication,
  CreatePublicationRequest,
  ResearchGrant,
  CreateGrantRequest,
  Hki,
  CreateHkiRequest,
  PublicationType,
} from "@/lib/types";

export default function ResearchPage() {
  const {
    publications,
    grants,
    hkiList,
    loading,
    error,
    fetchPublications,
    createPublication,
    fetchGrants,
    createGrant,
    fetchHki,
    createHki,
  } = useResearchStore();

  useEffect(() => {
    fetchPublications();
    fetchGrants();
    fetchHki();
  }, [fetchPublications, fetchGrants, fetchHki]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Research</h2>
        <p className="text-muted-foreground">
          Manage publications, research grants, and intellectual property.
        </p>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="publications">
        <TabsList>
          <TabsTrigger value="publications">
            Publications ({publications.length})
          </TabsTrigger>
          <TabsTrigger value="grants">Grants ({grants.length})</TabsTrigger>
          <TabsTrigger value="hki">HKI ({hkiList.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="publications" className="mt-4">
          <PublicationsTab
            items={publications}
            loading={loading}
            onCreate={createPublication}
          />
        </TabsContent>
        <TabsContent value="grants" className="mt-4">
          <GrantsTab
            items={grants}
            loading={loading}
            onCreate={createGrant}
          />
        </TabsContent>
        <TabsContent value="hki" className="mt-4">
          <HkiTab items={hkiList} loading={loading} onCreate={createHki} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== Publications Tab =====
function PublicationsTab({
  items,
  loading,
  onCreate,
}: {
  items: Publication[];
  loading: boolean;
  onCreate: (data: CreatePublicationRequest) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreatePublicationRequest>({
    title: "",
    journal: "",
    year: new Date().getFullYear(),
    type: "JOURNAL",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onCreate(form);
    setOpen(false);
    setForm({ title: "", journal: "", year: new Date().getFullYear(), type: "JOURNAL" });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Publications</CardTitle>
          <CardDescription>{items.length} publications total</CardDescription>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add Publication</SheetTitle>
              <SheetDescription>
                Add a new research publication.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Journal / Venue</Label>
                <Input
                  value={form.journal}
                  onChange={(e) => setForm({ ...form, journal: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value as PublicationType,
                      })
                    }
                  >
                    <option value="JOURNAL">Journal</option>
                    <option value="CONFERENCE">Conference</option>
                    <option value="BOOK">Book</option>
                    <option value="CHAPTER">Chapter</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SINTA Level</Label>
                  <Input
                    type="number"
                    min={1}
                    max={6}
                    value={form.sintaLevel ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        sintaLevel: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>DOI</Label>
                  <Input
                    value={form.doi ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, doi: e.target.value || undefined })
                    }
                    placeholder="10.xxxx/xxxxx"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No publications yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Journal</TableHead>
                <TableHead className="w-24">Type</TableHead>
                <TableHead className="w-20">SINTA</TableHead>
                <TableHead className="w-16">Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((pub) => (
                <TableRow key={pub.id}>
                  <TableCell className="font-medium">{pub.title}</TableCell>
                  <TableCell>{pub.journal}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{pub.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {pub.sintaLevel ? `S${pub.sintaLevel}` : "—"}
                  </TableCell>
                  <TableCell>{pub.year}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ===== Grants Tab =====
function GrantsTab({
  items,
  loading,
  onCreate,
}: {
  items: ResearchGrant[];
  loading: boolean;
  onCreate: (data: CreateGrantRequest) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateGrantRequest>({
    title: "",
    source: "",
    amount: 0,
    year: new Date().getFullYear(),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onCreate(form);
    setOpen(false);
    setForm({ title: "", source: "", amount: 0, year: new Date().getFullYear() });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Research Grants</CardTitle>
          <CardDescription>{items.length} grants total</CardDescription>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add Grant</SheetTitle>
              <SheetDescription>Add a new research grant.</SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Funding Source</Label>
                <Input
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  placeholder="e.g. Kemendikbud, LPDP"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (Rp)</Label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: Number(e.target.value) })
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No grants yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-16">Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((grant) => (
                <TableRow key={grant.id}>
                  <TableCell className="font-medium">{grant.title}</TableCell>
                  <TableCell>{grant.source}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(grant.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        grant.status === "COMPLETED"
                          ? "default"
                          : grant.status === "REJECTED"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {grant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{grant.year}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

// ===== HKI Tab =====
function HkiTab({
  items,
  loading,
  onCreate,
}: {
  items: Hki[];
  loading: boolean;
  onCreate: (data: CreateHkiRequest) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateHkiRequest>({
    title: "",
    type: "",
    year: new Date().getFullYear(),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onCreate(form);
    setOpen(false);
    setForm({ title: "", type: "", year: new Date().getFullYear() });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">
            Intellectual Property (HKI)
          </CardTitle>
          <CardDescription>{items.length} HKI total</CardDescription>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Add HKI</SheetTitle>
              <SheetDescription>
                Add a new intellectual property record.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    placeholder="e.g. Patent, Copyright"
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
                <Label>Registration Number</Label>
                <Input
                  value={form.regNumber ?? ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      regNumber: e.target.value || undefined,
                    })
                  }
                  placeholder="Optional"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No HKI records yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reg. Number</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-16">Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((hki) => (
                <TableRow key={hki.id}>
                  <TableCell className="font-medium">{hki.title}</TableCell>
                  <TableCell>{hki.type}</TableCell>
                  <TableCell>{hki.regNumber ?? "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        hki.status === "GRANTED" ? "default" : "secondary"
                      }
                    >
                      {hki.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{hki.year}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
