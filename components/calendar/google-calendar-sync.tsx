"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Download, Upload, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useGoogleCalendar } from "@/hooks/use-google-calendar"
import type { CalendarEvent } from "./calendar-grid"

interface GoogleCalendarSyncProps {
  onClose: () => void
  events: CalendarEvent[]
  onEventsImported: (events: CalendarEvent[]) => void
}

export function GoogleCalendarSync({ onClose, events, onEventsImported }: GoogleCalendarSyncProps) {
  const { isGoogleConnected, syncing, error, importEvents, exportEvents } = useGoogleCalendar()
  const [syncStatus, setSyncStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleImport = async () => {
    setSyncStatus("idle")
    setMessage("")

    try {
      const importedEvents = await importEvents()
      onEventsImported(importedEvents)

      setSyncStatus("success")
      setMessage(`${importedEvents.length} événement(s) importé(s) avec succès depuis Google Calendar`)
    } catch (err) {
      setSyncStatus("error")
      setMessage(err instanceof Error ? err.message : "Erreur lors de l'importation des événements")
    }
  }

  const handleExport = async () => {
    setSyncStatus("idle")
    setMessage("")

    try {
      // Only export events that are not already from Google Calendar
      const localEvents = events.filter((e) => !e.googleEventId)

      if (localEvents.length === 0) {
        setMessage("Aucun événement local à exporter")
        return
      }

      await exportEvents(localEvents)

      setSyncStatus("success")
      setMessage(`${localEvents.length} événement(s) exporté(s) avec succès vers Google Calendar`)
    } catch (err) {
      setSyncStatus("error")
      setMessage(err instanceof Error ? err.message : "Erreur lors de l'exportation des événements")
    }
  }

  if (!isGoogleConnected) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Synchronisation Google Calendar</CardTitle>
              <CardDescription>Connectez-vous avec Google pour synchroniser vos événements</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Veuillez vous connecter avec Google pour accéder à la synchronisation Google Calendar. Déconnectez-vous et
              reconnectez-vous en utilisant le bouton &quot;Google Calendar&quot;.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Synchronisation Google Calendar</CardTitle>
            <CardDescription>Importez ou exportez vos événements avec Google Calendar</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {syncStatus === "success" && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{message}</AlertDescription>
          </Alert>
        )}

        {(syncStatus === "error" || error) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{message || error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Importer depuis Google</h3>
            <p className="text-sm text-muted-foreground">
              Récupérez tous vos événements Google Calendar dans DockyCalendar
            </p>
            <Button onClick={handleImport} disabled={syncing} className="w-full bg-transparent" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {syncing ? "Importation..." : "Importer"}
            </Button>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Exporter vers Google</h3>
            <p className="text-sm text-muted-foreground">Envoyez vos événements DockyCalendar vers Google Calendar</p>
            <Button
              onClick={handleExport}
              disabled={syncing || events.length === 0}
              className="w-full bg-transparent"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              {syncing ? "Exportation..." : "Exporter"}
            </Button>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">À propos de la synchronisation</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>L&apos;importation récupère vos événements des 30 derniers jours</li>
            <li>L&apos;exportation envoie uniquement vos événements locaux</li>
            <li>Les événements synchronisés sont marqués avec un badge vert</li>
            <li>Vous avez {events.filter((e) => !e.googleEventId).length} événement(s) local(aux) à exporter</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
