"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, LogIn } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await signIn("credentials", { email, password, redirect: false })
    if (res?.ok) {
      router.push("/")
      router.refresh()
    } else {
      setError("E-mail ou senha incorretos.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 shadow-lg mb-3">
            <span className="text-2xl font-black text-slate-900">L2</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">L2E Prime Solutions</h1>
          <p className="text-sm text-slate-500 mt-0.5">Sistema de Gestão</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Entrar</h2>
          <p className="text-sm text-slate-500 mb-6">Acesse com seu e-mail e senha</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 disabled:opacity-60 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="/esqueci-senha" className="text-sm text-slate-500 hover:text-amber-600 transition-colors">
              Esqueci minha senha
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          L2E Prime Solutions · Sistema interno
        </p>
      </div>
    </div>
  )
}
