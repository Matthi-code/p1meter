'use client'

import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Customer } from '@/types/supabase'
import { MapPin, Mail, Phone, Loader2 } from 'lucide-react'
import { geocodeAddress } from '@/lib/geocoding'

// Customer marker icon
const createCustomerIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: #3b82f6;
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
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
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
  customers,
  getCoords,
}: {
  customers: GeocodedCustomer[]
  getCoords: (c: GeocodedCustomer) => [number, number]
}) {
  const map = useMap()

  useEffect(() => {
    if (customers.length > 0) {
      const validCustomers = customers.filter(
        (c) => (c.latitude && c.longitude) || (c.geocodedLat && c.geocodedLng)
      )
      if (validCustomers.length > 0) {
        const bounds = L.latLngBounds(validCustomers.map(getCoords))
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] })
        }
      }
    }
  }, [customers, map, getCoords])

  return null
}

export type CustomersMapProps = {
  customers: Customer[]
  onSelectCustomer?: (customer: Customer) => void
}

// Type for customer with geocoded coordinates
type GeocodedCustomer = Customer & {
  geocodedLat?: number
  geocodedLng?: number
}

export default function CustomersMap({
  customers,
  onSelectCustomer,
}: CustomersMapProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [geocodedCustomers, setGeocodedCustomers] = useState<GeocodedCustomer[]>([])
  const [isGeocoding, setIsGeocoding] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Create a hash of customers to detect changes
  const customersHash = customers
    .map((c) => `${c.id}-${c.postal_code}-${c.address}`)
    .join('|')

  // Geocode customers that don't have coordinates
  useEffect(() => {
    if (!customers.length) return

    const geocodeAll = async () => {
      setIsGeocoding(true)

      const results: GeocodedCustomer[] = []

      for (const customer of customers) {
        // Skip if already has coordinates in DB
        if (customer.latitude && customer.longitude) {
          results.push(customer)
          continue
        }

        // Try to geocode using postal_code and address
        if (customer.postal_code && customer.address) {
          const houseNumberMatch = customer.address.match(/\d+/)
          const houseNumber = houseNumberMatch ? houseNumberMatch[0] : ''

          if (houseNumber) {
            const coords = await geocodeAddress(customer.postal_code, houseNumber)
            if (coords) {
              results.push({
                ...customer,
                geocodedLat: coords.lat,
                geocodedLng: coords.lng,
              })
              continue
            }
          }
        }

        // Add without coordinates
        results.push(customer)
      }

      setGeocodedCustomers(results)
      setIsGeocoding(false)
    }

    geocodeAll()
  }, [customersHash, customers])

  // Helper to get coordinates
  const getCoords = useCallback((c: GeocodedCustomer): [number, number] => {
    if (c.latitude && c.longitude) {
      return [c.latitude, c.longitude]
    }
    return [c.geocodedLat!, c.geocodedLng!]
  }, [])

  // Filter customers with valid coordinates
  const mappableCustomers = geocodedCustomers.filter(
    (c) => (c.latitude && c.longitude) || (c.geocodedLat && c.geocodedLng)
  )

  // Calculate center (Netherlands center as default)
  const defaultCenter: [number, number] = [52.1326, 5.2913]
  const center: [number, number] =
    mappableCustomers.length > 0
      ? [
          mappableCustomers.reduce((sum, c) => sum + getCoords(c)[0], 0) /
            mappableCustomers.length,
          mappableCustomers.reduce((sum, c) => sum + getCoords(c)[1], 0) /
            mappableCustomers.length,
        ]
      : defaultCenter

  const markerIcon = createCustomerIcon()

  if (!isMounted) {
    return (
      <div className="h-[400px] bg-slate-100 rounded-2xl flex items-center justify-center">
        <div className="text-slate-500">Kaart laden...</div>
      </div>
    )
  }

  return (
    <div className="relative h-[400px] rounded-2xl overflow-hidden border border-slate-200">
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
        <FitBounds customers={mappableCustomers} getCoords={getCoords} />

        {mappableCustomers.map((customer) => (
          <Marker
            key={customer.id}
            position={getCoords(customer)}
            icon={markerIcon}
            eventHandlers={{
              click: () => onSelectCustomer?.(customer),
            }}
          >
            <Popup className="customer-popup">
              <div className="min-w-[220px] p-1">
                <h3 className="font-semibold text-slate-900 text-base mb-3">
                  {customer.name}
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>
                      {customer.address}, {customer.city}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <a href={`tel:${customer.phone}`} className="hover:text-blue-600">
                      {customer.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <a href={`mailto:${customer.email}`} className="hover:text-blue-600 truncate">
                      {customer.email}
                    </a>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Counter */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2 z-[1000]">
        {isGeocoding ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Adressen laden...
          </div>
        ) : (
          <p className="text-sm font-medium text-slate-900">
            {mappableCustomers.length} van {customers.length} locaties
          </p>
        )}
      </div>
    </div>
  )
}
