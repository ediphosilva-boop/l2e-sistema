"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import {
  LayoutDashboard, Building2, Package, Users, Truck,
  Wallet, FileText, Settings, LogOut, Calendar, BarChart3, Receipt, X, DollarSign, Database,
} from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/",               label: "Dashboard",        icon: LayoutDashboard },
  { href: "/projetos",       label: "Projetos",         icon: Building2 },
  { href: "/planejamento",   label: "Cronograma",       icon: Calendar },
  { href: "/produtos",       label: "Produtos/Serviços", icon: Package },
  { href: "/clientes",       label: "Clientes",         icon: Users },
  { href: "/fornecedores",   label: "Fornecedores",     icon: Truck },
  { href: "/caixa",          label: "Gestão de Caixa",  icon: Wallet },
  { href: "/dre",            label: "DRE",              icon: BarChart3 },
  { href: "/contratos",      label: "Propostas",        icon: FileText },
  { href: "/extrato",        label: "Extrato Cliente",  icon: Receipt },
  { href: "/configuracoes/precos",   label: "Preços de Pacotes", icon: DollarSign },
  { href: "/configuracoes/usuarios", label: "Perfis de Acesso", icon: Settings },
  { href: "/configuracoes/backup",   label: "Backup",            icon: Database },
]

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrador",
  gestor: "Gestor",
  vendedor: "Vendedor",
  visualizador: "Visualizador",
}

export function Sidebar({ mobileOpen, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user as { name?: string; email?: string; role?: string } | undefined

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "flex h-full w-60 flex-col bg-slate-900 shadow-xl shrink-0",
        "fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out",
        "md:relative md:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-slate-700/50 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm overflow-hidden shrink-0">
              <Image
                src="/logo-l2e.png"
                alt="L2E"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight tracking-wide">L2E Prime</p>
              <p className="text-[10px] text-slate-400 leading-tight tracking-wider uppercase">Solutions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                  active
                    ? "bg-amber-500 text-slate-900 font-semibold shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-slate-700/50 px-3 py-3 space-y-2">
          {user && (
            <div className="px-2 py-1.5">
              <p className="text-xs font-semibold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{ROLE_LABEL[user.role ?? ""] ?? user.role}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sair
          </button>
        </div>
      </aside>
    </>
  )
}
