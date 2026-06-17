interface TopbarProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function Topbar({ title, description, action }: TopbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
