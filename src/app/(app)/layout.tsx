"use client"
import { useState } from "react"
import Image from "next/image"
import { Menu } from "lucide-react"
import { Sidebar } from "@/components/layout/sidebar"
import { IdleLogout } from "@/components/idle-logout"
import { AlertBanner } from "@/components/alert-banner"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="flex flex-1 flex-col overflow-y-auto min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 sticky top-0 z-30 shadow-md">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-slate-300 hover:text-white p-1 rounded"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-white overflow-hidden shrink-0 flex items-center justify-center">
              <Image src="/logo-l2e.png" alt="L2E" width={24} height={24} className="object-contain" />
            </div>
            <span className="text-sm font-bold text-white tracking-wide">L2E Prime Solutions</span>
          </div>
        </div>
        <AlertBanner />
        {children}
      </main>
      <IdleLogout />
    </div>
  )
}
