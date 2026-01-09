/**
 * NIP Subsidie - Nationaal Isolatieprogramma 2025
 *
 * Subsidie voor huiseigenaren met oudere woningen
 * Bedrag afhankelijk van WOZ-waarde.
 */

import type { HouseProfile, PropertyType } from '@/types/supabase'
import { countPoorlyInsulatedParts } from '../building-periods'

/**
 * NIP Subsidie configuration
 */
export const NIP_CONFIG = {
  // WOZ thresholds
  wozThresholdHigh: 477000, // Max WOZ waarde
  wozThresholdLow: 400000, // Grens voor €2000 vs €1000

  // Amounts
  amountHighWoz: 1000, // WOZ €400k-€477k
  amountLowWoz: 2000, // WOZ ≤ €400k

  // Eligibility requirements
  maxBuildYear: 1992, // Gebouwd vóór 1993

  // Eligible energy labels (OR at least 2 poorly insulated parts)
  eligibleLabels: ['D', 'E', 'F', 'G'],

  // Reference date for WOZ
  wozReferenceDate: '2024-01-01',

  // What can it be spent on
  eligibleMeasures: [
    'spouwmuurisolatie',
    'vloerisolatie',
    'dakisolatie',
    'bodemisolatie',
  ],

  // Excluded property types
  excludedPropertyTypes: ['appartement', 'maisonnette'] as PropertyType[], // VvE apartments not eligible

  // Info links
  infoUrl: 'https://www.rvo.nl/subsidies-financiering/nip',
  applicationUrl: 'https://mijn.rvo.nl/',
}

export type NIPEligibilityResult = {
  eligible: boolean
  amount: number
  reason: string
  details: {
    yearBuiltOk: boolean
    wozOk: boolean
    labelOrInsulationOk: boolean
    propertyTypeOk: boolean
    wozValue?: number
    yearBuilt?: number
    energyLabel?: string
    poorlyInsulatedParts?: number
  }
}

/**
 * Calculate NIP subsidy eligibility and amount
 */
export function calculateNIPSubsidy(
  profile: Partial<HouseProfile>
): NIPEligibilityResult {
  const details = {
    yearBuiltOk: false,
    wozOk: false,
    labelOrInsulationOk: false,
    propertyTypeOk: false,
    wozValue: profile.woz_value ?? undefined,
    yearBuilt: profile.year_built ?? undefined,
    energyLabel: profile.energy_label ?? undefined,
    poorlyInsulatedParts: undefined as number | undefined,
  }

  // Check property type (no VvE/apartments)
  if (profile.property_type) {
    details.propertyTypeOk = !NIP_CONFIG.excludedPropertyTypes.includes(profile.property_type)
  } else {
    details.propertyTypeOk = true // Unknown = assume OK
  }

  if (!details.propertyTypeOk) {
    return {
      eligible: false,
      amount: 0,
      reason: 'VvE/appartement komt niet in aanmerking voor NIP subsidie.',
      details,
    }
  }

  // Check build year (vóór 1993)
  if (profile.year_built) {
    details.yearBuiltOk = profile.year_built < 1993
  }

  if (!details.yearBuiltOk) {
    return {
      eligible: false,
      amount: 0,
      reason: `Woning is gebouwd in ${profile.year_built || 'onbekend jaar'}. NIP subsidie geldt alleen voor woningen vóór 1993.`,
      details,
    }
  }

  // Check WOZ value
  if (profile.woz_value) {
    details.wozOk = profile.woz_value < NIP_CONFIG.wozThresholdHigh
  }

  if (!details.wozOk) {
    return {
      eligible: false,
      amount: 0,
      reason: `WOZ-waarde €${profile.woz_value?.toLocaleString('nl-NL') || 'onbekend'} is hoger dan €${NIP_CONFIG.wozThresholdHigh.toLocaleString('nl-NL')}.`,
      details,
    }
  }

  // Check energy label OR poorly insulated parts
  const hasEligibleLabel =
    profile.energy_label && NIP_CONFIG.eligibleLabels.includes(profile.energy_label)

  const poorlyInsulatedCount = countPoorlyInsulatedParts({
    wall_insulation: profile.wall_insulation,
    floor_insulation: profile.floor_insulation,
    roof_insulation: profile.roof_insulation,
    glass_type: profile.glass_type,
  })

  details.poorlyInsulatedParts = poorlyInsulatedCount
  details.labelOrInsulationOk = hasEligibleLabel || poorlyInsulatedCount >= 2

  if (!details.labelOrInsulationOk) {
    return {
      eligible: false,
      amount: 0,
      reason: `Woning heeft energielabel ${profile.energy_label || 'onbekend'} (D/E/F/G nodig) of minimaal 2 slecht geïsoleerde onderdelen (nu: ${poorlyInsulatedCount}).`,
      details,
    }
  }

  // Determine amount based on WOZ
  const amount = profile.woz_value && profile.woz_value <= NIP_CONFIG.wozThresholdLow
    ? NIP_CONFIG.amountLowWoz
    : NIP_CONFIG.amountHighWoz

  return {
    eligible: true,
    amount,
    reason: `Uw woning komt in aanmerking voor €${amount} NIP subsidie!`,
    details,
  }
}

/**
 * Get NIP subsidy explanation text
 */
export function getNIPExplanation(result: NIPEligibilityResult): string[] {
  const lines: string[] = []

  if (result.details.yearBuilt) {
    const check = result.details.yearBuiltOk ? '✓' : '✗'
    lines.push(`${check} Bouwjaar: ${result.details.yearBuilt} ${result.details.yearBuiltOk ? '(vóór 1993)' : '(moet vóór 1993)'}`)
  }

  if (result.details.wozValue) {
    const check = result.details.wozOk ? '✓' : '✗'
    const threshold = result.details.wozValue <= NIP_CONFIG.wozThresholdLow
      ? `≤ €${NIP_CONFIG.wozThresholdLow.toLocaleString('nl-NL')}`
      : `< €${NIP_CONFIG.wozThresholdHigh.toLocaleString('nl-NL')}`
    lines.push(`${check} WOZ-waarde: €${result.details.wozValue.toLocaleString('nl-NL')} ${result.details.wozOk ? `(${threshold})` : ''}`)
  }

  if (result.details.energyLabel) {
    const labelOk = NIP_CONFIG.eligibleLabels.includes(result.details.energyLabel)
    const check = labelOk ? '✓' : '○'
    lines.push(`${check} Energielabel: ${result.details.energyLabel} ${labelOk ? '' : '(D/E/F/G geeft direct recht)'}`)
  }

  if (result.details.poorlyInsulatedParts !== undefined) {
    const insulationOk = result.details.poorlyInsulatedParts >= 2
    const check = insulationOk ? '✓' : '○'
    lines.push(`${check} Slecht geïsoleerde onderdelen: ${result.details.poorlyInsulatedParts} ${insulationOk ? '(minimaal 2)' : '(minimaal 2 nodig)'}`)
  }

  if (!result.details.propertyTypeOk) {
    lines.push('✗ Geen VvE/appartement')
  }

  return lines
}

/**
 * Check if a measure is eligible for NIP subsidy
 */
export function isMeasureNIPEligible(measureSlug: string): boolean {
  return NIP_CONFIG.eligibleMeasures.includes(measureSlug)
}
