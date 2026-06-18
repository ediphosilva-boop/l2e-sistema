"use client"
import { useState } from "react"
import { ArrowLeft, KeyRound, Mail } from "lucide-react"
import Image from "next/image"

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Image src="/logo-l2e.png" alt="L2E Prime Solutions" width={140} height={90} className="object-contain mb-3" priority />
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 mb-2">
            <KeyRound className="h-5 w-5 text-amber-600" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Recuperar Acesso</h1>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border border-amber-200 mx-auto">
                <Mail className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900 mb-2">Solicitação enviada</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Entre em contato com o administrador do sistema informando seu e-mail:
                </p>
                <p className="text-sm font-semibold text-amber-600 mt-2">{email}</p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-left">
                <p className="text-xs text-slate-500 font-medium mb-1">Contato do administrador:</p>
                <p className="text-xs text-slate-700">Lucas Souza — lucas@l2eprime.com.br</p>
              </div>
              <p className="text-xs text-slate-400">
                O administrador irá redefinir sua senha pela tela de Perfis de Acesso.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-1">Esqueci minha senha</h2>
              <p className="text-sm text-slate-500 mb-6">
                Informe seu e-mail e o administrador irá redefinir seu acesso.
              </p>
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
                <button
                  type="submit"
                  className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors"
                >
                  Solicitar redefinição
                </button>
              </form>
            </>
          )}
        </div>

        <a href="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Voltar para o login
        </a>
      </div>
    </div>
  )
}
