"use client"
import { useEffect, useState } from "react"
import { Plus, Shield, ShieldCheck, Eye, Pencil as PencilIcon, Trash2, UserCheck, UserX } from "lucide-react"
import { Topbar } from "@/components/layout/topbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const ROLES: Record<string, { label: string; color: string; description: string; icon: React.ElementType }> = {
  admin:        { label: "Admin",        color: "bg-red-100 text-red-700",    description: "Acesso total — todos os módulos, usuários e configurações", icon: ShieldCheck },
  gestor:       { label: "Gestor",       color: "bg-amber-100 text-amber-700", description: "Todos os módulos exceto gerenciar usuários", icon: Shield },
  vendedor:     { label: "Vendedor",     color: "bg-blue-100 text-blue-700",  description: "Clientes, Projetos e Contratos (criar propostas)", icon: PencilIcon },
  visualizador: { label: "Visualizador", color: "bg-slate-100 text-slate-600",  description: "Dashboard e Projetos — somente leitura", icon: Eye },
}

const PERMISSIONS: Record<string, string[]> = {
  admin:        ["Dashboard", "Projetos", "Produtos/Serviços", "Clientes", "Fornecedores", "Gestão de Caixa", "Contratos", "Perfis de Acesso"],
  gestor:       ["Dashboard", "Projetos", "Produtos/Serviços", "Clientes", "Fornecedores", "Gestão de Caixa", "Contratos"],
  vendedor:     ["Dashboard (leitura)", "Projetos (criar/editar)", "Clientes (criar/editar)", "Contratos (propostas)"],
  visualizador: ["Dashboard (leitura)", "Projetos (leitura)"],
}

interface User { id: string; email: string; name: string; role: string; active: boolean; createdAt: string }

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([])
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", email: "", role: "visualizador", active: true, password: "" })
  const [loading, setLoading] = useState(false)

  const load = () => fetch("/api/users").then(r => r.json()).then(setUsers)
  useEffect(() => { load() }, [])

  const openNew = () => { setForm({ name: "", email: "", role: "visualizador", active: true, password: "" }); setEditId(null); setOpen(true) }
  const openEdit = (u: User) => { setForm({ name: u.name, email: u.email, role: u.role, active: u.active, password: "" }); setEditId(u.id); setOpen(true) }

  const save = async () => {
    setLoading(true)
    if (editId) await fetch(`/api/users/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    else await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    await load(); setOpen(false); setLoading(false)
  }

  const toggleActive = async (u: User) => {
    await fetch(`/api/users/${u.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !u.active }) })
    await load()
  }

  const del = async (id: string) => { if (!confirm("Excluir usuário?")) return; await fetch(`/api/users/${id}`, { method: "DELETE" }); await load() }

  return (
    <>
      <Topbar
        title="Perfis de Acesso"
        description="Gerencie usuários e permissões do sistema"
        action={<Button onClick={openNew}><Plus className="h-4 w-4" />Novo Usuário</Button>}
      />
      <div className="p-6 space-y-6">
        {/* Tabela de roles */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(ROLES).map(([key, role]) => {
            const Icon = role.icon
            const count = users.filter(u => u.role === key && u.active).length
            return (
              <Card key={key} className="hover:border-amber-200 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Icon className={`h-4 w-4 ${role.color.split(" ")[1]}`} />
                    <Badge className={`${role.color} text-xs`}>{role.label}</Badge>
                    <span className="ml-auto text-xs text-slate-400">{count} usuário{count !== 1 ? "s" : ""}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{role.description}</p>
                  <div className="space-y-1">
                    {PERMISSIONS[key].map(p => (
                      <p key={p} className="text-xs text-slate-500 flex items-center gap-1">
                        <span className="text-green-500">✓</span>{p}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Lista de usuários */}
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">E-mail</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Perfil</th>
                <th className="text-left px-4 py-3 text-slate-600 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => {
                const role = ROLES[u.role]
                return (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{u.name}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge className={`${role?.color ?? "bg-slate-100 text-slate-600"} text-xs`}>{role?.label ?? u.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs font-medium ${u.active ? "text-green-600" : "text-slate-400"}`}>
                        {u.active ? <><UserCheck className="h-3.5 w-3.5" />Ativo</> : <><UserX className="h-3.5 w-3.5" />Inativo</>}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" title={u.active ? "Desativar" : "Ativar"} onClick={() => toggleActive(u)}>
                          {u.active ? <UserX className="h-3.5 w-3.5 text-yellow-600" /> : <UserCheck className="h-3.5 w-3.5 text-green-600" />}
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(u)}><PencilIcon className="h-3.5 w-3.5 text-slate-400" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => del(u.id)}><Trash2 className="h-3.5 w-3.5 text-red-400" /></Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {users.length === 0 && (
                <tr><td colSpan={5} className="text-center text-slate-400 py-8">Nenhum usuário cadastrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v && !loading) setOpen(false) }}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="max-w-sm">
          <DialogHeader><DialogTitle>{editId ? "Editar Usuário" : "Novo Usuário"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Nome *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1" /></div>
            <div><Label>E-mail *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1" /></div>
            <div>
              <Label>{editId ? "Nova Senha (deixe em branco para não alterar)" : "Senha *"}</Label>
              <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="mt-1" placeholder={editId ? "••••••••" : "Mínimo 6 caracteres"} />
              {!editId && <p className="text-xs text-slate-400 mt-1">Se não informar, a senha padrão será <code>l2e@2026</code></p>}
            </div>
            <div>
              <Label>Perfil de Acesso</Label>
              <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      <span className="flex flex-col"><span>{v.label}</span><span className="text-xs text-zinc-500">{v.description}</span></span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.role && (
                <div className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-500">
                  <p className="font-semibold text-slate-700 mb-1">Permissões:</p>
                  {PERMISSIONS[form.role]?.map(p => <p key={p} className="flex items-center gap-1 text-slate-600"><span className="text-green-500">✓</span>{p}</p>)}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.name || !form.email || loading}>{loading ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
