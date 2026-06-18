interface TopbarProps {
  title: string
  description?: string
  subtitle?: string
  action?: React.ReactNode
}

export function Topbar({ title, description, subtitle, action }: TopbarProps) {
  const sub = description ?? subtitle
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        {sub && <p className="text-sm text-slate-500">{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
