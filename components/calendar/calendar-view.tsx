"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, LogOut, Plus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { CalendarGrid } from "./calendar-grid"
import { CalendarStats } from "./calendar-stats"
import { GoogleCalendarSync } from "./google-calendar-sync"
import type { CalendarEvent } from "./calendar-grid"

export function CalendarView() {
  const { user, logout } = useAuth()
  const [showSync, setShowSync] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const handleEventsImported = (importedEvents: CalendarEvent[]) => {
    setEvents((prevEvents) => {
      const newEvents = [...prevEvents]
      importedEvents.forEach((importedEvent) => {
        const exists = newEvents.some((e) => e.googleEventId === importedEvent.googleEventId)
        if (!exists) {
          newEvents.push(importedEvent)
        }
      })
      return newEvents
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-bold">DockyCalendar</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
              <Button variant="outline" size="sm" onClick={() => setShowSync(!showSync)}>
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Sync </span>Google
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {showSync && (
        <div className="border-b bg-muted/50">
          <div className="container mx-auto px-4 py-4">
            <GoogleCalendarSync
              onClose={() => setShowSync(false)}
              events={events}
              onEventsImported={handleEventsImported}
            />
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">
        <CalendarStats events={events} />
        <CalendarGrid events={events} onEventsChange={setEvents} />
      </main>
    </div>
  )
}
