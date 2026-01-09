'use client'

import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { InstallationWithRelations } from '@/types/supabase'
import { getStatusLabel, getStatusColor, formatDateTime } from '@/lib/utils'
import { geocodeAddress, extractHouseNumber } from '@/lib/geocoding'
import { MapPin, User, Calendar, Clock, Loader2 } from 'lucide-react'

// Fix for default marker icons in Leaflet with webpack/Next.js
const createCustomIcon = (status: string) => {
  const colors: Record<string, string> = {
    scheduled: '#3b82f6', // blue
    confirmed: '#22c55e', // green
    traveling: '#f59e0b', // amber
    in_progress: '#f59e0b', // amber
    completed: '#6b7280', // gray
    cancelled: '#ef4444', // red
  }

  const color = colors[status] || '#3b82f6'

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg
          style="transform: rotate(45deg); width: 16px; height: 16px; color: white;"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

// Component to fit bounds to markers
function FitBounds({
  installations,
  getCoords
}: {
  installations: GeocodedInstallation[]
  getCoords: (i: GeocodedInstallation) => [number, number]
}) {
  const map = useMap()

  useEffect(() => {
    if (installations.length > 0) {
      const validInstallations = installations.filter(
        (i) => (i.customer?.latitude && i.customer?.longitude) || (i.geocodedLat && i.geocodedLng)
      )
      if (validInstallations.length > 0) {
        const bounds = L.latLngBounds(validInstallations.map(getCoords))
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] })
        }
      }
    }
  }, [installations, map, getCoords])

  return null
}

export type InstallationsMapProps = {
  installations: InstallationWithRelations[]
  onSelectInstallation?: (installation: InstallationWithRelations) => void
}

// Type for installation with geocoded coordinates
type GeocodedInstallation = InstallationWithRelations & {
  geocodedLat?: number
  geocodedLng?: number
}

export default function InstallationsMap({
  installations,
  onSelectInstallation,
}: InstallationsMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [geocodedInstallations, setGeocodedInstallations] = useState<GeocodedInstallation[]>([])
  const [isGeocoding, setIsGeocoding] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Create a hash of installations to detect changes
  const installationsHash = installations.map(i =>
    `${i.id}-${i.customer?.postal_code}-${i.customer?.address}`
  ).join('|')

  // Geocode installations that don't have coordinates
  useEffect(() => {
    if (!installations.length) return

    const geocodeAll = async () => {
      setIsGeocoding(true)

      const results: GeocodedInstallation[] = []

      for (const installation of installations) {
        // Skip if already has coordinates in DB
        if (installation.customer?.latitude && installation.customer?.longitude) {
          results.push(installation)
          continue
        }

        // Try to geocode using postal_code and address (extract house number)
        if (installation.customer?.postal_code && installation.customer?.address) {
          // Extract house number from address (e.g., "Hoofdstraat 123" -> "123")
          const houseNumberMatch = installation.customer.address.match(/\d+/)
          const houseNumber = houseNumberMatch ? houseNumberMatch[0] : ''

          if (houseNumber) {
            const coords = await geocodeAddress(installation.customer.postal_code, houseNumber)
            if (coords) {
              results.push({
                ...installation,
                geocodedLat: coords.lat,
                geocodedLng: coords.lng,
              })
              continue
            }
          }
        }

        // Add without coordinates
        results.push(installation)
      }

      setGeocodedInstallations(results)
      setIsGeocoding(false)
    }

    geocodeAll()
  }, [installationsHash, installations])

  // Helper to get coordinates
  const getCoords = useCallback((i: GeocodedInstallation): [number, number] => {
    if (i.customer?.latitude && i.customer?.longitude) {
      return [i.customer.latitude, i.customer.longitude]
    }
    return [i.geocodedLat!, i.geocodedLng!]
  }, [])

  // Filter installations with valid coordinates (either from DB or geocoded)
  const mappableInstallations = geocodedInstallations.filter(
    (i) =>
      (i.customer?.latitude && i.customer?.longitude) ||
      (i.geocodedLat && i.geocodedLng)
  )

  // Calculate center (Netherlands center as default)
  const defaultCenter: [number, number] = [52.1326, 5.2913]
  const center: [number, number] =
    mappableInstallations.length > 0
      ? [
          mappableInstallations.reduce((sum, i) => sum + getCoords(i)[0], 0) /
            mappableInstallations.length,
          mappableInstallations.reduce((sum, i) => sum + getCoords(i)[1], 0) /
            mappableInstallations.length,
        ]
      : defaultCenter

  if (!isMounted) {
    return (
      <div className="h-[400px] bg-[var(--gray-100)] rounded-2xl flex items-center justify-center">
        <div className="text-[var(--gray-500)]">Kaart laden...</div>
      </div>
    )
  }

  return (
    <div className="relative h-[400px] rounded-2xl overflow-hidden border border-[var(--gray-200)]">
      <MapContainer
        center={center}
        zoom={8}
        scrollWheelZoom={true}
        className="h-full w-full"
        style={{ background: '#f1f5f9' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds installations={mappableInstallations} getCoords={getCoords} />

        {mappableInstallations.map((installation) => (
          <Marker
            key={installation.id}
            position={getCoords(installation)}
            icon={createCustomIcon(installation.status)}
            eventHandlers={{
              click: () => onSelectInstallation?.(installation),
            }}
          >
            <Popup className="installation-popup">
              <div className="min-w-[250px] p-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-[var(--gray-900)] text-base">
                    {installation.customer?.name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(
                      installation.status
                    )}`}
                  >
                    {getStatusLabel(installation.status)}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-[var(--gray-600)]">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {installation.customer?.address}, {installation.customer?.city}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[var(--gray-600)]">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>{formatDateTime(installation.scheduled_at)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[var(--gray-600)]">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span>{installation.duration_minutes} minuten</span>
                  </div>

                  <div className="flex items-center gap-2 text-[var(--gray-600)]">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span>{installation.assignee?.name || 'Niet toegewezen'}</span>
                  </div>
                </div>

                {installation.notes && (
                  <div className="mt-3 pt-3 border-t border-[var(--gray-100)]">
                    <p className="text-sm text-[var(--gray-500)] italic">{installation.notes}</p>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 z-[1000]">
        <p className="text-xs font-semibold text-[var(--gray-700)] mb-2">Legenda</p>
        <div className="space-y-1.5">
          <LegendItem color="#3b82f6" label="Gepland" />
          <LegendItem color="#22c55e" label="Bevestigd" />
          <LegendItem color="#f59e0b" label="Onderweg / Bezig" />
          <LegendItem color="#6b7280" label="Voltooid" />
          <LegendItem color="#ef4444" label="Geannuleerd" />
        </div>
      </div>

      {/* Counter */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2 z-[1000]">
        {isGeocoding ? (
          <div className="flex items-center gap-2 text-sm text-[var(--gray-600)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Adressen laden...
          </div>
        ) : (
          <p className="text-sm font-medium text-[var(--gray-900)]">
            {mappableInstallations.length} van {installations.length} locaties
          </p>
        )}
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs text-[var(--gray-600)]">{label}</span>
    </div>
  )
}
