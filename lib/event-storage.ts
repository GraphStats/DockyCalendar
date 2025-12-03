import type { CalendarEvent } from "@/components/calendar/calendar-grid"

const STORAGE_KEY = "dockycalendar_events"

export class EventStorage {
  static saveEvents(events: CalendarEvent[]): void {
    try {
      const serializedEvents = events.map((event) => ({
        ...event,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
      }))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedEvents))
    } catch (error) {
      console.error("Error saving events to localStorage:", error)
    }
  }

  static loadEvents(): CalendarEvent[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []

      const parsed = JSON.parse(stored)
      return parsed.map((event: CalendarEvent & { start: string; end: string }) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }))
    } catch (error) {
      console.error("Error loading events from localStorage:", error)
      return []
    }
  }

  static clearEvents(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error("Error clearing events from localStorage:", error)
    }
  }
}
