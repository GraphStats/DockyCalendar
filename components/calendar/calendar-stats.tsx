"use client"

import type { CalendarEvent } from "./calendar-grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ExternalLink, Clock } from "lucide-react"

interface CalendarStatsProps {
  events: CalendarEvent[]
}

export function CalendarStats({ events }: CalendarStatsProps) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekFromNow = new Date(today)
  weekFromNow.setDate(weekFromNow.getDate() + 7)

  const todayEvents = events.filter((event) => {
    const eventDate = new Date(event.start)
    return eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
  })

  const upcomingEvents = events.filter((event) => {
    const eventDate = new Date(event.start)
    return eventDate >= today && eventDate < weekFromNow
  })

  const googleSyncedEvents = events.filter((event) => event.googleEventId)

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aujourd&apos;hui</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayEvents.length}</div>
          <CardDescription className="text-xs text-muted-foreground">
            {todayEvents.length === 0 ? "Aucun événement" : todayEvents.length === 1 ? "événement" : "événements"}
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cette semaine</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{upcomingEvents.length}</div>
          <CardDescription className="text-xs text-muted-foreground">événements à venir</CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Synchronisés</CardTitle>
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{googleSyncedEvents.length}</div>
          <CardDescription className="text-xs text-muted-foreground">avec Google Calendar</CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
