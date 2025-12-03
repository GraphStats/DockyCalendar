"use client"

import { useAuth } from "@/lib/auth-context"
import { AuthForm } from "@/components/auth/auth-form"
import { CalendarView } from "@/components/calendar/calendar-view"

export default function Home() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return <CalendarView />
}
