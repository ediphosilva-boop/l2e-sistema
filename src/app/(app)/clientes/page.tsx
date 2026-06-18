"use client"
import { useEffect, useState } from "react"
import { Plus, Search, User, Phone, Mail, Pencil, Trash2, FolderOpen, Upload, Download } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface Client {
  id: string; name: string; cpfCnpj?: string; email?: string
  phone?: string; address?: string; notes?: string
  _count?: { projects: number }
}

const empty = (): Omit<Client, "id" | "_count"> => ({
  name: "", cpfCnpj: "", email: "", phone: "", address: "", notes: "",
})

const CSV_TEMPLATE = `Nome,CPF/CNPJ,E-mail,Telefone,Endereço,Observações
João Silva,123.456.789-00,joao@email.com,(11) 99999-0001,Rua A 100 SP,Cliente indicado
Maria Souza,,maria@email.com,(11) 99999-0002,Rua B 200 SP,`

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [openBulk, setOpenBulk] = useState(false)
  const [form, setForm] = useState(empty())
  const [editId, setEditId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [csvText, setCsvText] = useState("")
  const [csvPreview, setCsvPreview] = useState<Omit<Client, "id" | "_count">[]>([])
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkResult, setBulkResult] = useState<string | null>(null)

  const load = () => fetch("/api/clients").then(r => r.json()).then(setClients)
  useEffect(() => { load() }, [])

  const filtered = clients.filter(c =>
    [c.name, c.cpfCnpj, c.email, c.phone].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  const openNew = () => { setForm(empty()); setEditId(null); setOpen(true) }
  const openEdit = (c: Client) => {
    setForm({ name: c.name, cpfCnpj: c.cpfCnpj ?? "", email: c.email ?? "", phone: c.phone ?? "", address: c.address ?? "", notes: c.notes ?? "" })
    setEditId(c.id); setOpen(true)
  }

  const save = async () => {
    setLoading(true)
    if (editId) await fetch(`/api/clients/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    else await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    await load(); setOpen(false); setLoading(false)
  }

  const del = async (id: string) => {
    if (!confirm("Excluir cliente?")) return
    await fetch(`/api/clients/${id}`, { method: "DELETE" }); await load()
  }

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n").filter(l => l.trim())
    const dataLines = lines[0]?.toLowerCase().startsWith("nome") ? lines.slice(1) : lines
    const parsed = dataLines.map(line => {
      const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""))
      return { name: cols[0] ?? "", cpfCnpj: cols[1] ?? "", email: cols[2] ?? "", phone: cols[3] ?? "", address: cols[4] ?? "", notes: cols[5] ?? "" }
    }).filter(r => r.name)
    setCsvPreview(parsed)
  }

  const importBulk = async () => {
    if (!csvPreview.length) return
    setBulkLoading(true)
    let ok = 0, err = 0
    for (const row of csvPreview) {
      try {
        await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(row) })
        ok++
      } catch { err++ }
    }
    await load()
    setBulkResult(`✅ ${ok} importados${err > 0 ? `, ❌ ${err} com erro` : ""}`)
    setBulkLoading(false)
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" })
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob)
    a.download = "modelo_clientes.csv"; a.click()
  }

  return (
    <>
      <Topbar
        title="Clientes"
        description={`${clients.length} clientes cadastrados`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setOpenBulk(true); setCsvText(""); setCsvPreview([]); setBulkResult(null) }}>
              <Upload className="h-4 w-4" />Importar em Massa
            </Button>
            <Button onClick={openNew}><Plus className="h-4 w-4" />Novo Cliente</Button>
          </div>
        }
      />
      <div className="p-6 space-y-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="Buscar por nome, CPF/CNPJ..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => (
            <Card key={c.id} className="hover:border-amber-300 hover:shadow-md transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{c.name}</p>
                      {c.cpfCnpj && <p className="text-xs text-slate-500">{c.cpfCnpj}</p>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5 text-slate-500" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => del(c.id)}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {c.phone && <p className="flex items-center gap-2 text-xs text-slate-600"><Phone className="h-3 w-3 text-slate-400" />{c.phone}</p>}
                  {c.email && <p className="flex items-center gap-2 text-xs text-slate-600"><Mail className="h-3 w-3 text-slate-400" />{c.email}</p>}
                  {c.address && <p className="text-xs text-slate-500 mt-1">{c.address}</p>}
                </div>
                {(c._count?.projects ?? 0) > 0 && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                    <FolderOpen className="h-3 w-3" />
                    {c._count?.projects} projeto{(c._count?.projects ?? 0) > 1 ? "s" : ""}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-slate-400 py-12">Nenhum cliente encontrado</p>
          )}
        </div>
      </div>

      {/* Modal individual */}
      <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) setOpen(false) }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? "Editar Cliente" : "Novo Cliente"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>CPF / CNPJ</Label><Input value={form.cpfCnpj} onChange={e => setForm({ ...form, cpfCnpj: e.target.value })} className="mt-1" /></div>
              <div><Label>Telefone</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1" /></div>
            </div>
            <div><Label>E-mail</Label><Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1" /></div>
            <div><Label>Endereço</Label><Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="mt-1" /></div>
            <div><Label>Observações</Label><Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="mt-1" rows={3} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.name || loading}>{loading ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal importação em massa */}
      <Dialog open={openBulk} onOpenChange={setOpenBulk}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-amber-500" />Importar Clientes em Massa</DialogTitle>
            <DialogDescription>Cole os dados em formato CSV ou preencha o texto abaixo. Uma linha por cliente.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="colar">
            <TabsList className="mb-3">
              <TabsTrigger value="colar">Colar / Digitar</TabsTrigger>
              <TabsTrigger value="instrucoes">Instruções</TabsTrigger>
            </TabsList>

            <TabsContent value="colar" className="space-y-3">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="h-3.5 w-3.5" />Baixar Modelo CSV
                </Button>
              </div>
              <Textarea
                placeholder={`Nome,CPF/CNPJ,E-mail,Telefone,Endereço,Observações\nJoão Silva,,,,(11) 99999-0001,Rua A 100`}
                value={csvText}
                onChange={e => { setCsvText(e.target.value); parseCSV(e.target.value); setBulkResult(null) }}
                rows={6}
                className="font-mono text-xs"
              />
              {csvPreview.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-700 mb-2">Preview — {csvPreview.length} registros detectados:</p>
                  <div className="rounded-lg border border-slate-200 overflow-auto max-h-48">
                    <table className="w-full text-xs">
                      <thead><tr className="bg-slate-50 border-b border-slate-200">{["Nome","CPF/CNPJ","E-mail","Telefone","Endereço"].map(h => <th key={h} className="text-left px-3 py-2 text-slate-600 font-medium">{h}</th>)}</tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {csvPreview.map((r, i) => (
                          <tr key={i} className={r.name ? "" : "bg-red-50"}>
                            <td className="px-3 py-1.5 font-medium text-slate-800">{r.name || <span className="text-red-500">⚠ vazio</span>}</td>
                            <td className="px-3 py-1.5 text-slate-600">{r.cpfCnpj || "—"}</td>
                            <td className="px-3 py-1.5 text-slate-600">{r.email || "—"}</td>
                            <td className="px-3 py-1.5 text-slate-600">{r.phone || "—"}</td>
                            <td className="px-3 py-1.5 text-slate-600 truncate max-w-[120px]">{r.address || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {bulkResult && <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{bulkResult}</div>}
            </TabsContent>

            <TabsContent value="instrucoes">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 space-y-2">
                <p className="font-semibold">Formato aceito: CSV (valores separados por vírgula)</p>
                <p>Colunas na ordem: <code className="bg-white px-1 rounded text-xs">Nome, CPF/CNPJ, E-mail, Telefone, Endereço, Observações</code></p>
                <p className="text-slate-500">• A primeira linha pode ser o cabeçalho (será ignorada automaticamente)</p>
                <p className="text-slate-500">• Apenas o campo <strong>Nome</strong> é obrigatório</p>
                <p className="text-slate-500">• Campos vazios podem ser deixados em branco (coloque a vírgula mesmo assim)</p>
                <div className="mt-3 rounded bg-white border border-slate-200 p-3 font-mono text-xs text-slate-600">
                  <p className="text-slate-400">// Exemplo:</p>
                  <p>Nome,CPF/CNPJ,E-mail,Telefone,Endereço,Observações</p>
                  <p>João Silva,123.456.789-00,joao@email.com,(11)99999-0001,SP,VIP</p>
                  <p>Maria Souza,,,,(11)99999-0002,</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenBulk(false)}>Fechar</Button>
            <Button onClick={importBulk} disabled={!csvPreview.length || bulkLoading}>
              <Upload className="h-4 w-4" />
              {bulkLoading ? `Importando ${csvPreview.length}...` : `Importar ${csvPreview.length} cliente${csvPreview.length !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
