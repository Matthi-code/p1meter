import { NextRequest, NextResponse } from 'next/server'

type Location = {
  id: string
  lat: number
  lng: number
}

type DistanceMatrixResponse = {
  rows: {
    elements: {
      status: string
      duration: { value: number; text: string }
      distance: { value: number; text: string }
    }[]
  }[]
  status: string
}

type OptimizedRoute = {
  order: string[]
  totalDurationMinutes: number
  totalDistanceKm: number
  legs: {
    from: string
    to: string
    durationMinutes: number
    distanceKm: number
  }[]
}

export async function POST(request: NextRequest) {
  try {
    const { locations } = await request.json() as { locations: Location[] }

    if (!locations || locations.length < 2) {
      return NextResponse.json({
        order: locations?.map(l => l.id) || [],
        totalDurationMinutes: 0,
        totalDistanceKm: 0,
        legs: [],
      })
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 })
    }

    // Build origins and destinations strings
    const coords = locations.map(l => `${l.lat},${l.lng}`).join('|')

    // Call Google Distance Matrix API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${coords}&destinations=${coords}&key=${apiKey}&mode=driving`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch distance matrix')
    }

    const data: DistanceMatrixResponse = await response.json()

    if (data.status !== 'OK') {
      throw new Error(`Distance Matrix API error: ${data.status}`)
    }

    // Build duration matrix (in seconds)
    const n = locations.length
    const durationMatrix: number[][] = []
    const distanceMatrix: number[][] = []

    for (let i = 0; i < n; i++) {
      durationMatrix[i] = []
      distanceMatrix[i] = []
      for (let j = 0; j < n; j++) {
        const element = data.rows[i].elements[j]
        if (element.status === 'OK') {
          durationMatrix[i][j] = element.duration.value // seconds
          distanceMatrix[i][j] = element.distance.value // meters
        } else {
          // Use large value for unreachable destinations
          durationMatrix[i][j] = 999999
          distanceMatrix[i][j] = 999999
        }
      }
    }

    // Nearest Neighbor algorithm
    const optimizedOrder = nearestNeighbor(durationMatrix)

    // Calculate total duration and build legs
    let totalDuration = 0
    let totalDistance = 0
    const legs: OptimizedRoute['legs'] = []

    for (let i = 0; i < optimizedOrder.length - 1; i++) {
      const fromIdx = optimizedOrder[i]
      const toIdx = optimizedOrder[i + 1]
      const duration = durationMatrix[fromIdx][toIdx]
      const distance = distanceMatrix[fromIdx][toIdx]

      totalDuration += duration
      totalDistance += distance

      legs.push({
        from: locations[fromIdx].id,
        to: locations[toIdx].id,
        durationMinutes: Math.round(duration / 60),
        distanceKm: Math.round(distance / 100) / 10, // Round to 1 decimal
      })
    }

    const result: OptimizedRoute = {
      order: optimizedOrder.map(idx => locations[idx].id),
      totalDurationMinutes: Math.round(totalDuration / 60),
      totalDistanceKm: Math.round(totalDistance / 100) / 10,
      legs,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Route optimization error:', error)
    return NextResponse.json({ error: 'Failed to optimize route' }, { status: 500 })
  }
}

// Nearest Neighbor algorithm for TSP
function nearestNeighbor(matrix: number[][]): number[] {
  const n = matrix.length
  const visited = new Array(n).fill(false)
  const route: number[] = []

  // Start from first location
  let current = 0
  route.push(current)
  visited[current] = true

  for (let i = 1; i < n; i++) {
    let nearest = -1
    let minDist = Infinity

    // Find nearest unvisited location
    for (let j = 0; j < n; j++) {
      if (!visited[j] && matrix[current][j] < minDist) {
        minDist = matrix[current][j]
        nearest = j
      }
    }

    if (nearest !== -1) {
      route.push(nearest)
      visited[nearest] = true
      current = nearest
    }
  }

  return route
}
