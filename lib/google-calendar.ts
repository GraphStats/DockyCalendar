import type { User } from "firebase/auth"

export interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  status?: string
  htmlLink?: string
}

const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3"

export class GoogleCalendarService {
  private accessToken: string | null = null

  constructor(user: User | null) {
    if (user) {
      this.initializeAccessToken(user)
    }
  }

  private async initializeAccessToken(user: User) {
    try {
      // Get the Firebase ID token which can be used to get Google access token
      const idToken = await user.getIdToken()
      this.accessToken = idToken
    } catch (error) {
      console.error("Error getting access token:", error)
    }
  }

  async fetchEvents(timeMin?: Date, timeMax?: Date): Promise<GoogleCalendarEvent[]> {
    if (!this.accessToken) {
      throw new Error("Not authenticated with Google")
    }

    try {
      const params = new URLSearchParams({
        maxResults: "100",
        orderBy: "startTime",
        singleEvents: "true",
        ...(timeMin && { timeMin: timeMin.toISOString() }),
        ...(timeMax && { timeMax: timeMax.toISOString() }),
      })

      const response = await fetch(`${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events?${params}`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`)
      }

      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error("Error fetching Google Calendar events:", error)
      throw error
    }
  }

  async createEvent(event: {
    summary: string
    description?: string
    start: Date
    end: Date
    timeZone?: string
  }): Promise<GoogleCalendarEvent> {
    if (!this.accessToken) {
      throw new Error("Not authenticated with Google")
    }

    try {
      const eventData = {
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: event.timeZone || "Europe/Paris",
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: event.timeZone || "Europe/Paris",
        },
      }

      const response = await fetch(`${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create event: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating Google Calendar event:", error)
      throw error
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error("Not authenticated with Google")
    }

    try {
      const response = await fetch(`${GOOGLE_CALENDAR_API_BASE}/calendars/primary/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete event: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error deleting Google Calendar event:", error)
      throw error
    }
  }
}

// Helper function to convert Google Calendar event to our CalendarEvent format
export function convertGoogleEventToCalendarEvent(googleEvent: GoogleCalendarEvent) {
  const startDateTime = googleEvent.start.dateTime || googleEvent.start.date
  const endDateTime = googleEvent.end.dateTime || googleEvent.end.date

  if (!startDateTime || !endDateTime) {
    return null
  }

  return {
    id: `google-${googleEvent.id}`,
    googleEventId: googleEvent.id,
    title: googleEvent.summary || "Sans titre",
    description: googleEvent.description,
    start: new Date(startDateTime),
    end: new Date(endDateTime),
    color: "oklch(0.60 0.20 140)", // Green color for Google Calendar events
  }
}
