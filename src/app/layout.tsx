import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "L2E Prime Solutions — Sistema de Gestão",
  description: "Sistema de gestão para acabamento de apartamentos",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${inter.className} h-full bg-slate-100 text-slate-900 antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
