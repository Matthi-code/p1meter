/**
 * Reference Energy Consumption Data
 *
 * Based on CBS/Milieu Centraal data for Dutch households.
 * Used to compare customer consumption with similar households.
 */

import type { PropertyType } from '@/types/supabase'

export type ReferenceConsumption = {
  propertyType: PropertyType | 'alle'
  buildPeriod: string
  gasMin: number
  gasMax: number
  gasAvg: number
  elecMin: number
  elecMax: number
  elecAvg: number
  notes: string
}

export type DetailedReference = {
  category: string
  types?: PropertyType[]
  sizeRange: string
  buildPeriod: string
  gas: number
  elecWithoutSolar: number
  elecWithSolar: number
  solarReturn: number
}

/**
 * Reference consumption by property type and build period
 */
export const REFERENCE_CONSUMPTION: ReferenceConsumption[] = [
  // Vrijstaande woningen
  {
    propertyType: 'vrijstaand',
    buildPeriod: 'voor_1975',
    gasMin: 2800,
    gasMax: 3500,
    gasAvg: 3150,
    elecMin: 4000,
    elecMax: 5000,
    elecAvg: 4500,
    notes: 'Slechte isolatie, groot woonoppervlak',
  },
  {
    propertyType: 'vrijstaand',
    buildPeriod: '1975_1995',
    gasMin: 2000,
    gasMax: 2600,
    gasAvg: 2300,
    elecMin: 3500,
    elecMax: 4500,
    elecAvg: 4000,
    notes: 'Enige isolatie aanwezig',
  },
  {
    propertyType: 'vrijstaand',
    buildPeriod: '1995_2015',
    gasMin: 1400,
    gasMax: 1800,
    gasAvg: 1600,
    elecMin: 3200,
    elecMax: 4000,
    elecAvg: 3600,
    notes: 'Goede isolatie',
  },

  // Twee-onder-een-kap
  {
    propertyType: 'twee_onder_een_kap',
    buildPeriod: 'voor_1975',
    gasMin: 2200,
    gasMax: 2800,
    gasAvg: 2500,
    elecMin: 3500,
    elecMax: 4500,
    elecAvg: 4000,
    notes: 'Beperkte isolatie',
  },
  {
    propertyType: 'twee_onder_een_kap',
    buildPeriod: '1975_1995',
    gasMin: 1600,
    gasMax: 2100,
    gasAvg: 1850,
    elecMin: 3000,
    elecMax: 4000,
    elecAvg: 3500,
    notes: 'Matige isolatie',
  },
  {
    propertyType: 'twee_onder_een_kap',
    buildPeriod: '1995_2015',
    gasMin: 1100,
    gasMax: 1500,
    gasAvg: 1300,
    elecMin: 2800,
    elecMax: 3600,
    elecAvg: 3200,
    notes: 'Goede isolatie',
  },

  // Rijtjeswoningen / Tussenwoningen
  {
    propertyType: 'tussenwoning',
    buildPeriod: 'voor_1975',
    gasMin: 1600,
    gasMax: 2000,
    gasAvg: 1800,
    elecMin: 3000,
    elecMax: 4000,
    elecAvg: 3500,
    notes: 'Voordeel van aangrenzende woningen',
  },
  {
    propertyType: 'tussenwoning',
    buildPeriod: '1975_1995',
    gasMin: 1200,
    gasMax: 1600,
    gasAvg: 1400,
    elecMin: 2800,
    elecMax: 3600,
    elecAvg: 3200,
    notes: 'Gemiddeld verbruik',
  },
  {
    propertyType: 'tussenwoning',
    buildPeriod: '1995_2015',
    gasMin: 900,
    gasMax: 1200,
    gasAvg: 1050,
    elecMin: 2600,
    elecMax: 3400,
    elecAvg: 3000,
    notes: 'Goede isolatie',
  },

  // Hoekwoningen
  {
    propertyType: 'hoekwoning',
    buildPeriod: 'voor_1975',
    gasMin: 1800,
    gasMax: 2200,
    gasAvg: 2000,
    elecMin: 3200,
    elecMax: 4200,
    elecAvg: 3700,
    notes: 'Extra buitenmuur, beperkte isolatie',
  },
  {
    propertyType: 'hoekwoning',
    buildPeriod: '1975_1995',
    gasMin: 1400,
    gasMax: 1800,
    gasAvg: 1600,
    elecMin: 2900,
    elecMax: 3700,
    elecAvg: 3300,
    notes: 'Extra buitenmuur, matige isolatie',
  },
  {
    propertyType: 'hoekwoning',
    buildPeriod: '1995_2015',
    gasMin: 1000,
    gasMax: 1300,
    gasAvg: 1150,
    elecMin: 2700,
    elecMax: 3500,
    elecAvg: 3100,
    notes: 'Goede isolatie',
  },

  // Appartementen
  {
    propertyType: 'appartement',
    buildPeriod: 'voor_1975',
    gasMin: 1000,
    gasMax: 1400,
    gasAvg: 1200,
    elecMin: 2500,
    elecMax: 3500,
    elecAvg: 3000,
    notes: 'Kleinere warmtevraag',
  },
  {
    propertyType: 'appartement',
    buildPeriod: '1975_1995',
    gasMin: 800,
    gasMax: 1100,
    gasAvg: 950,
    elecMin: 2300,
    elecMax: 3200,
    elecAvg: 2750,
    notes: 'Relatief zuinig',
  },
  {
    propertyType: 'appartement',
    buildPeriod: '1995_2015',
    gasMin: 600,
    gasMax: 900,
    gasAvg: 750,
    elecMin: 2100,
    elecMax: 2900,
    elecAvg: 2500,
    notes: 'Goede isolatie, compact',
  },

  // Algemeen - goed geïsoleerd
  {
    propertyType: 'alle',
    buildPeriod: '1995_2015',
    gasMin: 800,
    gasMax: 1200,
    gasAvg: 1000,
    elecMin: 2800,
    elecMax: 3500,
    elecAvg: 3150,
    notes: 'HR-glas en goede schil',
  },

  // Nieuwbouw BENG
  {
    propertyType: 'alle',
    buildPeriod: '2019_heden',
    gasMin: 0,
    gasMax: 300,
    gasAvg: 150,
    elecMin: 2500,
    elecMax: 3500,
    elecAvg: 3000,
    notes: 'Vaak (hybride) warmtepomp',
  },

  // NOM woningen
  {
    propertyType: 'alle',
    buildPeriod: '2024_heden',
    gasMin: 0,
    gasMax: 0,
    gasAvg: 0,
    elecMin: 0,
    elecMax: 500,
    elecAvg: 250,
    notes: 'Netto verbruik door zonnepanelen',
  },
]

/**
 * Detailed reference data by size (2+ bewoners)
 */
export const REFERENCE_BY_SIZE: DetailedReference[] = [
  {
    category: 'klein_appartement_oud',
    sizeRange: 'tot 100 m²',
    buildPeriod: 'voor_1992',
    gas: 840,
    elecWithoutSolar: 2080,
    elecWithSolar: 2050,
    solarReturn: 40,
  },
  {
    category: 'kleine_woning_oud',
    types: ['hoekwoning', 'tussenwoning'],
    sizeRange: 'tot 100 m²',
    buildPeriod: 'voor_1992',
    gas: 970,
    elecWithoutSolar: 2430,
    elecWithSolar: 2020,
    solarReturn: 470,
  },
  {
    category: 'middelgrote_woning_oud',
    types: ['hoekwoning', 'tussenwoning'],
    sizeRange: '100-150 m²',
    buildPeriod: 'voor_1992',
    gas: 1080,
    elecWithoutSolar: 2770,
    elecWithSolar: 2070,
    solarReturn: 810,
  },
  {
    category: 'middelgrote_woning_nieuw',
    types: ['hoekwoning', 'tussenwoning'],
    sizeRange: '100-150 m²',
    buildPeriod: 'vanaf_1992',
    gas: 870,
    elecWithoutSolar: 2800,
    elecWithSolar: 1970,
    solarReturn: 960,
  },
  {
    category: 'grote_woning_oud',
    types: ['hoekwoning', 'tussenwoning'],
    sizeRange: 'vanaf 150 m²',
    buildPeriod: 'voor_1992',
    gas: 1500,
    elecWithoutSolar: 3460,
    elecWithSolar: 2390,
    solarReturn: 1230,
  },
  {
    category: 'grote_vrijstaand_oud',
    types: ['vrijstaand'],
    sizeRange: 'vanaf 150 m²',
    buildPeriod: 'voor_1992',
    gas: 1820,
    elecWithoutSolar: 4140,
    elecWithSolar: 2700,
    solarReturn: 1770,
  },
  {
    category: 'grote_vrijstaand_nieuw',
    types: ['vrijstaand'],
    sizeRange: 'vanaf 150 m²',
    buildPeriod: 'vanaf_1992',
    gas: 1350,
    elecWithoutSolar: 3800,
    elecWithSolar: 2400,
    solarReturn: 1600,
  },
]

/**
 * Determine build period code from year
 */
export function getBuildPeriodCode(yearBuilt: number): string {
  if (yearBuilt < 1975) return 'voor_1975'
  if (yearBuilt < 1995) return '1975_1995'
  if (yearBuilt < 2015) return '1995_2015'
  if (yearBuilt < 2019) return '2015_2019'
  if (yearBuilt < 2024) return '2019_heden'
  return '2024_heden'
}

/**
 * Get reference consumption for a property
 */
export function getReferenceConsumption(
  propertyType: PropertyType,
  yearBuilt: number
): ReferenceConsumption | undefined {
  const buildPeriod = getBuildPeriodCode(yearBuilt)

  // Find specific match
  let match = REFERENCE_CONSUMPTION.find(
    (r) => r.propertyType === propertyType && r.buildPeriod === buildPeriod
  )

  // Fallback to general
  if (!match) {
    match = REFERENCE_CONSUMPTION.find(
      (r) => r.propertyType === 'alle' && r.buildPeriod === buildPeriod
    )
  }

  return match
}

/**
 * Compare actual consumption with reference
 */
export function compareWithReference(
  actualGas: number,
  actualElec: number,
  reference: ReferenceConsumption
): {
  gasComparison: 'onder' | 'gemiddeld' | 'boven'
  gasPercentage: number
  elecComparison: 'onder' | 'gemiddeld' | 'boven'
  elecPercentage: number
} {
  const gasPercentage = Math.round((actualGas / reference.gasAvg) * 100)
  const elecPercentage = Math.round((actualElec / reference.elecAvg) * 100)

  const getComparison = (actual: number, min: number, max: number): 'onder' | 'gemiddeld' | 'boven' => {
    if (actual < min) return 'onder'
    if (actual > max) return 'boven'
    return 'gemiddeld'
  }

  return {
    gasComparison: getComparison(actualGas, reference.gasMin, reference.gasMax),
    gasPercentage,
    elecComparison: getComparison(actualElec, reference.elecMin, reference.elecMax),
    elecPercentage,
  }
}

/**
 * Estimate annual energy costs
 */
export function estimateEnergyCosts(
  gasM3: number,
  electricityKwh: number,
  returnKwh: number = 0
): {
  gasCost: number
  electricityCost: number
  returnValue: number
  totalCost: number
} {
  // Current (2024/2025) average prices in NL
  const GAS_PRICE_PER_M3 = 1.45 // EUR per m³
  const ELECTRICITY_PRICE_PER_KWH = 0.40 // EUR per kWh
  const RETURN_PRICE_PER_KWH = 0.12 // EUR per kWh (terugleververgoeding)

  const gasCost = Math.round(gasM3 * GAS_PRICE_PER_M3)
  const electricityCost = Math.round(electricityKwh * ELECTRICITY_PRICE_PER_KWH)
  const returnValue = Math.round(returnKwh * RETURN_PRICE_PER_KWH)

  return {
    gasCost,
    electricityCost,
    returnValue,
    totalCost: gasCost + electricityCost - returnValue,
  }
}

/**
 * Calculate potential savings with insulation
 */
export function calculateInsulationSavings(
  currentGasM3: number,
  hasWallInsulation: boolean,
  hasFloorInsulation: boolean,
  hasRoofInsulation: boolean,
  glassType: string
): {
  measure: string
  savingM3: number
  savingEuro: number
}[] {
  const GAS_PRICE = 1.45
  const savings: { measure: string; savingM3: number; savingEuro: number }[] = []

  // Typical savings percentages
  if (!hasWallInsulation) {
    const savingM3 = Math.round(currentGasM3 * 0.20) // 20% besparing
    savings.push({
      measure: 'Spouwmuurisolatie',
      savingM3,
      savingEuro: Math.round(savingM3 * GAS_PRICE),
    })
  }

  if (!hasRoofInsulation) {
    const savingM3 = Math.round(currentGasM3 * 0.15) // 15% besparing
    savings.push({
      measure: 'Dakisolatie',
      savingM3,
      savingEuro: Math.round(savingM3 * GAS_PRICE),
    })
  }

  if (!hasFloorInsulation) {
    const savingM3 = Math.round(currentGasM3 * 0.08) // 8% besparing
    savings.push({
      measure: 'Vloerisolatie',
      savingM3,
      savingEuro: Math.round(savingM3 * GAS_PRICE),
    })
  }

  if (glassType === 'enkel' || glassType === 'dubbel') {
    const savingM3 = Math.round(currentGasM3 * 0.10) // 10% besparing
    savings.push({
      measure: 'HR++ glas',
      savingM3,
      savingEuro: Math.round(savingM3 * GAS_PRICE),
    })
  }

  return savings
}
