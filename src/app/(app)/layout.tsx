import { Sidebar } from "@/components/layout/sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
