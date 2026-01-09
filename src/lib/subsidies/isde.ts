/**
 * ISDE Subsidie - Investeringssubsidie Duurzame Energie
 *
 * Subsidie voor warmtepompen, zonneboilers, en isolatie
 * Via RVO.nl
 */

import type { HouseProfile, PropertyType } from '@/types/supabase'

/**
 * ISDE subsidy amounts for heat pumps (2024/2025)
 */
export const ISDE_WARMTEPOMP = {
  // Lucht-water warmtepomp
  luchtWater: {
    min: 2100,
    max: 3700,
    average: 2900,
    description: 'Lucht-water warmtepomp',
  },
  // Hybride warmtepomp
  hybride: {
    min: 1900,
    max: 2800,
    average: 2350,
    description: 'Hybride warmtepomp',
  },
  // Grond-water warmtepomp
  grondWater: {
    min: 3400,
    max: 5600,
    average: 4500,
    description: 'Grond-water warmtepomp (bodem)',
  },
  // Water-water warmtepomp
  waterWater: {
    min: 3400,
    max: 5600,
    average: 4500,
    description: 'Water-water warmtepomp',
  },
}

/**
 * ISDE subsidy amounts for insulation (2024/2025)
 * Based on m² with min/max per measure
 */
export const ISDE_ISOLATIE = {
  glas: {
    perM2: 75, // EUR per m² HR++ glas
    minAmount: 200,
    maxAmount: 3000,
    description: 'HR++ of triple glas',
  },
  spouwmuur: {
    perM2: 6, // EUR per m² (beperkt subsidiabel via ISDE, vaak NIP)
    minAmount: 0,
    maxAmount: 500,
    description: 'Spouwmuurisolatie (beperkt)',
    note: 'Spouwmuur meestal via NIP subsidie',
  },
  dak: {
    perM2: 20,
    minAmount: 200,
    maxAmount: 2000,
    description: 'Dakisolatie',
  },
  vloer: {
    perM2: 12,
    minAmount: 150,
    maxAmount: 1500,
    description: 'Vloerisolatie',
  },
}

/**
 * ISDE for solar water heater
 */
export const ISDE_ZONNEBOILER = {
  min: 500,
  max: 1500,
  average: 1000,
  description: 'Zonneboiler',
}

/**
 * General ISDE configuration
 */
export const ISDE_CONFIG = {
  infoUrl: 'https://www.rvo.nl/subsidies-financiering/isde',
  applicationUrl: 'https://mijn.rvo.nl/isde',

  // Combined with NIP for extra benefit
  combinableWithNIP: true,

  // Valid for existing homes
  eligiblePropertyTypes: [
    'rijtjeswoning',
    'hoekwoning',
    'twee_onder_een_kap',
    'vrijstaand',
    'appartement',
    'maisonnette',
  ] as PropertyType[],
}

export type ISDECalculation = {
  measure: string
  description: string
  estimatedAmount: number
  range: { min: number; max: number }
  notes?: string
}

/**
 * Calculate ISDE subsidy for heat pump
 */
export function calculateISDEWarmtepomp(
  heatPumpType: 'luchtWater' | 'hybride' | 'grondWater' | 'waterWater'
): ISDECalculation {
  const data = ISDE_WARMTEPOMP[heatPumpType]

  return {
    measure: 'warmtepomp',
    description: data.description,
    estimatedAmount: data.average,
    range: { min: data.min, max: data.max },
  }
}

/**
 * Calculate ISDE subsidy for glass replacement
 */
export function calculateISDEGlas(m2: number): ISDECalculation {
  const data = ISDE_ISOLATIE.glas
  const calculated = m2 * data.perM2
  const amount = Math.min(Math.max(calculated, data.minAmount), data.maxAmount)

  return {
    measure: 'glas',
    description: data.description,
    estimatedAmount: Math.round(amount),
    range: { min: data.minAmount, max: data.maxAmount },
  }
}

/**
 * Calculate ISDE subsidy for insulation measure
 */
export function calculateISDEInsulatie(
  type: 'dak' | 'vloer' | 'spouwmuur',
  m2: number
): ISDECalculation {
  const data = ISDE_ISOLATIE[type]
  const calculated = m2 * data.perM2
  const amount = Math.min(Math.max(calculated, data.minAmount), data.maxAmount)

  return {
    measure: type,
    description: data.description,
    estimatedAmount: Math.round(amount),
    range: { min: data.minAmount, max: data.maxAmount },
    notes: 'note' in data ? (data as typeof ISDE_ISOLATIE.spouwmuur).note : undefined,
  }
}

/**
 * Estimate total ISDE subsidy for a house
 */
export function estimateTotalISDESubsidy(
  profile: Partial<HouseProfile>,
  plannedMeasures: {
    heatPumpType?: 'luchtWater' | 'hybride' | 'grondWater' | 'waterWater'
    glassM2?: number
    roofM2?: number
    floorM2?: number
    solarBoiler?: boolean
  }
): {
  measures: ISDECalculation[]
  totalMin: number
  totalMax: number
  totalEstimated: number
} {
  const measures: ISDECalculation[] = []

  // Heat pump
  if (plannedMeasures.heatPumpType) {
    measures.push(calculateISDEWarmtepomp(plannedMeasures.heatPumpType))
  }

  // Glass
  if (plannedMeasures.glassM2) {
    measures.push(calculateISDEGlas(plannedMeasures.glassM2))
  }

  // Roof insulation
  if (plannedMeasures.roofM2) {
    measures.push(calculateISDEInsulatie('dak', plannedMeasures.roofM2))
  }

  // Floor insulation
  if (plannedMeasures.floorM2) {
    measures.push(calculateISDEInsulatie('vloer', plannedMeasures.floorM2))
  }

  // Solar boiler
  if (plannedMeasures.solarBoiler) {
    measures.push({
      measure: 'zonneboiler',
      description: ISDE_ZONNEBOILER.description,
      estimatedAmount: ISDE_ZONNEBOILER.average,
      range: { min: ISDE_ZONNEBOILER.min, max: ISDE_ZONNEBOILER.max },
    })
  }

  const totalMin = measures.reduce((sum, m) => sum + m.range.min, 0)
  const totalMax = measures.reduce((sum, m) => sum + m.range.max, 0)
  const totalEstimated = measures.reduce((sum, m) => sum + m.estimatedAmount, 0)

  return {
    measures,
    totalMin,
    totalMax,
    totalEstimated,
  }
}

/**
 * Check if property type is eligible for ISDE
 */
export function isPropertyTypeEligible(propertyType: PropertyType): boolean {
  return ISDE_CONFIG.eligiblePropertyTypes.includes(propertyType)
}

/**
 * Get recommended heat pump type based on property
 */
export function getRecommendedHeatPump(
  profile: Partial<HouseProfile>
): {
  type: 'luchtWater' | 'hybride' | 'grondWater'
  reason: string
} {
  // For older homes with poor insulation, recommend hybrid
  if (profile.year_built && profile.year_built < 1975) {
    if (!profile.wall_insulation || !profile.roof_insulation) {
      return {
        type: 'hybride',
        reason: 'Hybride warmtepomp aanbevolen bij beperkte isolatie',
      }
    }
  }

  // For homes with good insulation and space, recommend ground source
  if (
    profile.plot_size_m2 &&
    profile.plot_size_m2 > 300 &&
    profile.property_type === 'vrijstaand'
  ) {
    return {
      type: 'grondWater',
      reason: 'Voldoende ruimte voor bodemwarmtepomp',
    }
  }

  // Default: air-water heat pump
  return {
    type: 'luchtWater',
    reason: 'Meest gangbare oplossing voor bestaande woningen',
  }
}
