"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  Truck,
  Wallet,
  FileText,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/",               label: "Dashboard",        icon: LayoutDashboard },
  { href: "/projetos",       label: "Projetos",         icon: Building2 },
  { href: "/produtos",       label: "Produtos/Serviços", icon: Package },
  { href: "/clientes",       label: "Clientes",         icon: Users },
  { href: "/fornecedores",   label: "Fornecedores",     icon: Truck },
  { href: "/caixa",          label: "Gestão de Caixa",  icon: Wallet },
  { href: "/contratos",      label: "Contratos",        icon: FileText },
  { href: "/configuracoes/usuarios", label: "Perfis de Acesso", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-60 flex-col bg-slate-900 shadow-xl">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-700/50 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 font-bold text-slate-900 text-sm shadow-sm">
          L2
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight tracking-wide">L2E Prime</p>
          <p className="text-[10px] text-slate-400 leading-tight tracking-wider uppercase">Solutions</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
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

      {/* Footer */}
      <div className="border-t border-slate-700/50 px-4 py-3">
        <p className="text-[10px] text-slate-500">© 2026 L2E Prime Solutions</p>
      </div>
    </aside>
  )
}
