"use client"
import { useEffect, useRef } from "react"
import { signOut } from "next-auth/react"

const IDLE_TIMEOUT = 30 * 60 * 1000 // 30 minutes

export function IdleLogout() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const reset = () => {
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => {
        signOut({ callbackUrl: "/login" })
      }, IDLE_TIMEOUT)
    }

    const events = ["mousedown", "keydown", "scroll", "touchstart"]
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      if (timer.current) clearTimeout(timer.current)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [])

  return null
}
