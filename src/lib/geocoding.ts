// Geocoding utilities using PDOK Locatieserver API (Dutch addresses)

// Geocoding cache to avoid repeated API calls
const geocodeCache = new Map<string, { lat: number; lng: number } | null>()

/**
 * Geocode a Dutch address using PDOK Locatieserver API
 * @param postalCode - Dutch postal code (e.g., "1234 AB")
 * @param houseNumber - House number (e.g., "123")
 * @returns Coordinates or null if not found
 */
export async function geocodeAddress(
  postalCode: string,
  houseNumber: string
): Promise<{ lat: number; lng: number } | null> {
  // Clean up postal code (remove spaces)
  const cleanPostal = postalCode.replace(/\s/g, '').toUpperCase()
  const cacheKey = `${cleanPostal}-${houseNumber}`

  // Check cache first
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) || null
  }

  try {
    // PDOK Locatieserver API - free Dutch geocoding
    const query = `${cleanPostal} ${houseNumber}`
    const response = await fetch(
      `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(query)}&rows=1`
    )

    if (!response.ok) {
      geocodeCache.set(cacheKey, null)
      return null
    }

    const data = await response.json()

    if (data.response?.docs?.[0]?.centroide_ll) {
      // Parse "POINT(lng lat)" format
      const match = data.response.docs[0].centroide_ll.match(/POINT\(([^ ]+) ([^)]+)\)/)
      if (match) {
        const result = { lat: parseFloat(match[2]), lng: parseFloat(match[1]) }
        geocodeCache.set(cacheKey, result)
        return result
      }
    }

    geocodeCache.set(cacheKey, null)
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    geocodeCache.set(cacheKey, null)
    return null
  }
}

/**
 * Extract house number from a Dutch address string
 * @param address - Address like "Hoofdstraat 123" or "Kerkweg 45a"
 * @returns House number or null
 */
export function extractHouseNumber(address: string): string | null {
  const match = address.match(/\d+[a-zA-Z]?/)
  return match ? match[0] : null
}

/**
 * Geocode a customer address and return coordinates
 * @param postalCode - Postal code
 * @param address - Full address string
 * @returns Coordinates or null
 */
export async function geocodeCustomerAddress(
  postalCode: string,
  address: string
): Promise<{ latitude: number; longitude: number } | null> {
  const houseNumber = extractHouseNumber(address)
  if (!houseNumber) return null

  const result = await geocodeAddress(postalCode, houseNumber)
  if (!result) return null

  return {
    latitude: result.lat,
    longitude: result.lng,
  }
}
