"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { GoogleCalendarService, convertGoogleEventToCalendarEvent } from "@/lib/google-calendar"
import type { CalendarEvent } from "@/components/calendar/calendar-grid"

export function useGoogleCalendar() {
  const { user } = useAuth()
  const [isGoogleConnected, setIsGoogleConnected] = useState(false)
  const [googleService, setGoogleService] = useState<GoogleCalendarService | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const service = new GoogleCalendarService(user)
      setGoogleService(service)

      // Check if user signed in with Google by checking provider data
      const isGoogle = user.providerData.some((provider) => provider.providerId === "google.com")
      setIsGoogleConnected(isGoogle)
    } else {
      setGoogleService(null)
      setIsGoogleConnected(false)
    }
  }, [user])

  const importEvents = useCallback(async (): Promise<CalendarEvent[]> => {
    if (!googleService || !isGoogleConnected) {
      throw new Error("Google Calendar is not connected")
    }

    setSyncing(true)
    setError(null)

    try {
      // Fetch events from the last 30 days
      const timeMin = new Date()
      timeMin.setDate(timeMin.getDate() - 30)

      const googleEvents = await googleService.fetchEvents(timeMin)

      const calendarEvents = googleEvents
        .map(convertGoogleEventToCalendarEvent)
        .filter((event): event is CalendarEvent => event !== null)

      return calendarEvents
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error importing events"
      setError(message)
      throw new Error(message)
    } finally {
      setSyncing(false)
    }
  }, [googleService, isGoogleConnected])

  const exportEvent = useCallback(
    async (event: CalendarEvent): Promise<void> => {
      if (!googleService || !isGoogleConnected) {
        throw new Error("Google Calendar is not connected")
      }

      setSyncing(true)
      setError(null)

      try {
        await googleService.createEvent({
          summary: event.title,
          description: event.description,
          start: event.start,
          end: event.end,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error exporting event"
        setError(message)
        throw new Error(message)
      } finally {
        setSyncing(false)
      }
    },
    [googleService, isGoogleConnected],
  )

  const exportEvents = useCallback(
    async (events: CalendarEvent[]): Promise<void> => {
      if (!googleService || !isGoogleConnected) {
        throw new Error("Google Calendar is not connected")
      }

      setSyncing(true)
      setError(null)

      try {
        // Export events one by one (in production, consider batching)
        for (const event of events) {
          // Skip events that are already from Google Calendar
          if (!event.googleEventId) {
            await googleService.createEvent({
              summary: event.title,
              description: event.description,
              start: event.start,
              end: event.end,
            })
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error exporting events"
        setError(message)
        throw new Error(message)
      } finally {
        setSyncing(false)
      }
    },
    [googleService, isGoogleConnected],
  )

  const deleteGoogleEvent = useCallback(
    async (googleEventId: string): Promise<void> => {
      if (!googleService || !isGoogleConnected) {
        throw new Error("Google Calendar is not connected")
      }

      try {
        await googleService.deleteEvent(googleEventId)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error deleting event"
        setError(message)
        throw new Error(message)
      }
    },
    [googleService, isGoogleConnected],
  )

  return {
    isGoogleConnected,
    syncing,
    error,
    importEvents,
    exportEvent,
    exportEvents,
    deleteGoogleEvent,
  }
}
