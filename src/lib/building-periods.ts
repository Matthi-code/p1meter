/**
 * Building Period Characteristics
 *
 * Reference data for Dutch housing insulation based on construction year.
 * Used to estimate insulation status when customer doesn't know exact details.
 */

import type { WallType, GlassType, HeatingType, ImprovementPotential } from '@/types/supabase'

export type BuildingPeriod = {
  period: string
  yearFrom: number
  yearTo: number | null
  name: string
  characteristics: {
    wallType: WallType
    wallInsulation: boolean
    wallInsulationCm?: number
    roofInsulation: boolean
    roofInsulationCm?: number
    floorInsulation: boolean
    floorType: string
    glassType: GlassType
    rcWall?: number
    rcRoof?: number
    rcFloor?: number
    hasGasConnection?: boolean
    heatingType?: HeatingType
    hasSolarPanels?: boolean
    hasBattery?: boolean
  }
  description: string
  improvementPotential: ImprovementPotential
}

export const BUILDING_PERIODS: BuildingPeriod[] = [
  {
    period: 'tot_1925',
    yearFrom: 0,
    yearTo: 1924,
    name: 'Tot 1925 - Massieve muren',
    characteristics: {
      wallType: 'massief',
      wallInsulation: false,
      roofInsulation: false,
      floorInsulation: false,
      floorType: 'hout',
      glassType: 'enkel',
    },
    description: 'Massieve muren (steens/anderhalfsteens), vochtdoorslag, geen isolatie',
    improvementPotential: 'zeer_hoog',
  },
  {
    period: '1925_1945',
    yearFrom: 1925,
    yearTo: 1945,
    name: '1925-1945 - Begin spouwmuren',
    characteristics: {
      wallType: 'spouw_leeg',
      wallInsulation: false,
      roofInsulation: false,
      floorInsulation: false,
      floorType: 'hout',
      glassType: 'enkel',
    },
    description: 'Begin spouwmuren (jaren 30), nog geen isolatie',
    improvementPotential: 'zeer_hoog',
  },
  {
    period: '1945_1975',
    yearFrom: 1945,
    yearTo: 1975,
    name: '1945-1975 - Spouwmuren standaard',
    characteristics: {
      wallType: 'spouw_leeg',
      wallInsulation: false,
      roofInsulation: false,
      floorInsulation: false,
      floorType: 'beton',
      glassType: 'enkel',
    },
    description: 'Standaard spouwmuren, beton vloeren (60s), geen isolatie',
    improvementPotential: 'zeer_hoog',
  },
  {
    period: '1975_1987',
    yearFrom: 1975,
    yearTo: 1987,
    name: '1975-1987 - Eerste isolatie',
    characteristics: {
      wallType: 'spouw_gedeeltelijk',
      wallInsulation: true,
      wallInsulationCm: 2,
      roofInsulation: true,
      roofInsulationCm: 3,
      floorInsulation: false,
      floorType: 'beton',
      glassType: 'dubbel',
    },
    description: 'Eerste isolatiemaatregelen: ~2cm spouw, varierende dakisolatie, dubbel glas BG',
    improvementPotential: 'hoog',
  },
  {
    period: '1987_1992',
    yearFrom: 1987,
    yearTo: 1992,
    name: '1987-1992 - Redelijke isolatie',
    characteristics: {
      wallType: 'spouw_vol',
      wallInsulation: true,
      roofInsulation: true,
      floorInsulation: true,
      floorType: 'beton_geisoleerd',
      glassType: 'dubbel',
    },
    description: 'Volledig geïsoleerde spouw, redelijke dak/vloer isolatie',
    improvementPotential: 'gemiddeld',
  },
  {
    period: '1992_2014',
    yearFrom: 1992,
    yearTo: 2014,
    name: '1992-2014 - Bouwbesluit isolatie',
    characteristics: {
      wallType: 'spouw_vol',
      wallInsulation: true,
      roofInsulation: true,
      floorInsulation: true,
      floorType: 'beton_geisoleerd',
      glassType: 'hr_plus_plus',
    },
    description: 'Goede isolatie door Bouwbesluit 1992, HR++ glas standaard vanaf 2000',
    improvementPotential: 'laag',
  },
  {
    period: '2015_2018',
    yearFrom: 2015,
    yearTo: 2018,
    name: '2015-2018 - Hoge isolatie',
    characteristics: {
      wallType: 'spouw_vol',
      wallInsulation: true,
      rcWall: 4.5,
      roofInsulation: true,
      rcRoof: 6.0,
      floorInsulation: true,
      rcFloor: 3.5,
      floorType: 'beton_geisoleerd',
      glassType: 'hr_plus_plus',
    },
    description: 'Zeer hoge isolatiewaardes (Bouwbesluit 2012), triple glas introductie',
    improvementPotential: 'zeer_laag',
  },
  {
    period: '2019_2023',
    yearFrom: 2019,
    yearTo: 2023,
    name: '2019-2023 - BENG',
    characteristics: {
      wallType: 'spouw_vol',
      wallInsulation: true,
      rcWall: 4.7,
      roofInsulation: true,
      rcRoof: 6.3,
      floorInsulation: true,
      rcFloor: 3.7,
      floorType: 'beton_geisoleerd',
      glassType: 'triple',
      hasGasConnection: false,
      heatingType: 'warmtepomp',
      hasSolarPanels: true,
    },
    description: 'BENG-eisen, geen gas, warmtepomp standaard, triple glas',
    improvementPotential: 'minimaal',
  },
  {
    period: 'vanaf_2024',
    yearFrom: 2024,
    yearTo: null,
    name: 'Vanaf 2024 - Nul-op-de-Meter',
    characteristics: {
      wallType: 'spouw_vol',
      wallInsulation: true,
      rcWall: 5.0,
      roofInsulation: true,
      rcRoof: 7.0,
      floorInsulation: true,
      rcFloor: 4.0,
      floorType: 'beton_geisoleerd',
      glassType: 'triple',
      hasGasConnection: false,
      heatingType: 'warmtepomp',
      hasSolarPanels: true,
      hasBattery: true,
    },
    description: 'Energieneutraal (NOM), zeer luchtdicht, thuisbatterij',
    improvementPotential: 'geen',
  },
]

/**
 * Get building period based on construction year
 */
export function getBuildingPeriod(yearBuilt: number): BuildingPeriod | undefined {
  return BUILDING_PERIODS.find(
    (p) => yearBuilt >= p.yearFrom && (!p.yearTo || yearBuilt <= p.yearTo)
  )
}

/**
 * Estimate insulation status based on construction year
 */
export function estimateInsulationStatus(yearBuilt: number) {
  const period = getBuildingPeriod(yearBuilt)
  if (!period) return null

  return {
    period: period.name,
    periodCode: period.period,
    characteristics: period.characteristics,
    improvementPotential: period.improvementPotential,
    description: period.description,
  }
}

/**
 * Get human-readable description for wall type
 */
export function getWallTypeLabel(wallType: WallType): string {
  const labels: Record<WallType, string> = {
    massief: 'Massieve muur (geen spouw)',
    spouw_leeg: 'Spouwmuur - niet geïsoleerd',
    spouw_gedeeltelijk: 'Spouwmuur - gedeeltelijk geïsoleerd',
    spouw_vol: 'Spouwmuur - volledig geïsoleerd',
  }
  return labels[wallType]
}

/**
 * Get human-readable description for glass type
 */
export function getGlassTypeLabel(glassType: GlassType): string {
  const labels: Record<GlassType, string> = {
    enkel: 'Enkel glas',
    dubbel: 'Dubbel glas',
    hr: 'HR glas',
    hr_plus: 'HR+ glas',
    hr_plus_plus: 'HR++ glas',
    triple: 'Triple glas',
  }
  return labels[glassType]
}

/**
 * Get improvement potential color class for UI
 */
export function getImprovementPotentialColor(potential: ImprovementPotential): string {
  const colors: Record<ImprovementPotential, string> = {
    geen: 'text-green-600 bg-green-100',
    minimaal: 'text-green-600 bg-green-100',
    zeer_laag: 'text-green-500 bg-green-50',
    laag: 'text-yellow-600 bg-yellow-100',
    gemiddeld: 'text-orange-600 bg-orange-100',
    hoog: 'text-red-500 bg-red-100',
    zeer_hoog: 'text-red-600 bg-red-200',
  }
  return colors[potential]
}

/**
 * Get improvement potential label for UI
 */
export function getImprovementPotentialLabel(potential: ImprovementPotential): string {
  const labels: Record<ImprovementPotential, string> = {
    geen: 'Geen verbeterpotentieel',
    minimaal: 'Minimaal verbeterpotentieel',
    zeer_laag: 'Zeer laag verbeterpotentieel',
    laag: 'Laag verbeterpotentieel',
    gemiddeld: 'Gemiddeld verbeterpotentieel',
    hoog: 'Hoog verbeterpotentieel',
    zeer_hoog: 'Zeer hoog verbeterpotentieel',
  }
  return labels[potential]
}

/**
 * Count poorly insulated building parts
 */
export function countPoorlyInsulatedParts(profile: {
  wall_insulation?: boolean | null
  floor_insulation?: boolean | null
  roof_insulation?: boolean | null
  glass_type?: GlassType | null
}): number {
  let count = 0
  if (profile.wall_insulation === false) count++
  if (profile.floor_insulation === false) count++
  if (profile.roof_insulation === false) count++
  if (profile.glass_type === 'enkel' || profile.glass_type === 'dubbel') count++
  return count
}
