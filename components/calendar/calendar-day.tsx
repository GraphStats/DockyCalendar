"use client"

import { cn } from "@/lib/utils"
import type { CalendarEvent } from "./calendar-grid"

interface CalendarDayProps {
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
  onClick: () => void
}

export function CalendarDay({ day, isCurrentMonth, isToday, events, onClick }: CalendarDayProps) {
  return (
    <div
      className={cn(
        "min-h-[100px] border-r border-b p-2 cursor-pointer transition-colors hover:bg-muted/50",
        !isCurrentMonth && "bg-muted/20 text-muted-foreground",
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full",
          isToday && "bg-primary text-primary-foreground",
        )}
      >
        {day}
      </div>
      <div className="space-y-1">
        {events.slice(0, 3).map((event) => (
          <div
            key={event.id}
            className="text-xs p-1 rounded truncate"
            style={{
              backgroundColor: event.color || "oklch(var(--primary) / 0.2)",
              color: "oklch(var(--foreground))",
            }}
          >
            {event.title}
          </div>
        ))}
        {events.length > 3 && <div className="text-xs text-muted-foreground px-1">+{events.length - 3} autres</div>}
      </div>
    </div>
  )
}
