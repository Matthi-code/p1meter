/**
 * Waarde Check Bon - €2000 tegoed Windmolens A16
 *
 * Huiseigenaren in de regio krijgen €2000 tegoed
 * Te besteden aan energiebesparende maatregelen.
 */

import type { Customer, HouseProfile } from '@/types/supabase'

/**
 * Eligible postcodes for Waarde Check Bon
 */
export const WAARDE_CHECK_POSTCODES = [
  '4765', // Zevenbergschen Hoek (primair focus)
  '4781', // Moerdijk
  '4782', // Moerdijk
  '4767', // Langeweg
]

/**
 * Waarde Check Bon configuration
 */
export const WAARDE_CHECK_CONFIG = {
  amount: 2000, // EUR
  validUntil: '2026-12-31',
  sponsor: 'Windmolens A16',

  // What can it be spent on
  eligibleMeasures: [
    'spouwmuurisolatie',
    'vloerisolatie',
    'dakisolatie',
    'hr_plus_plus_glas',
    'zonnepanelen',
    'warmtepomp',
    'hybride_warmtepomp',
    'energiecoach_advies',
  ],
}

/**
 * Check if customer is eligible for Waarde Check Bon
 */
export function isEligibleForWaardeCheck(
  customer: Pick<Customer, 'postal_code' | 'city'>,
  _profile?: HouseProfile | null
): boolean {
  if (!customer.postal_code) return false

  const postcode4 = customer.postal_code.substring(0, 4)
  return WAARDE_CHECK_POSTCODES.includes(postcode4)
}

/**
 * Get Waarde Check status for a customer
 */
export function getWaardeCheckStatus(
  customer: Pick<Customer, 'postal_code' | 'city'>,
  amountUsed: number = 0
): {
  eligible: boolean
  totalAmount: number
  amountUsed: number
  amountRemaining: number
  validUntil: string
  message: string
} {
  const eligible = isEligibleForWaardeCheck(customer)
  const totalAmount = eligible ? WAARDE_CHECK_CONFIG.amount : 0
  const amountRemaining = Math.max(0, totalAmount - amountUsed)

  let message = ''
  if (!eligible) {
    message = 'Uw postcode komt niet in aanmerking voor de Waarde Check Bon.'
  } else if (amountRemaining === 0) {
    message = 'U heeft uw volledige Waarde Check Bon benut!'
  } else if (amountUsed > 0) {
    message = `U heeft nog €${amountRemaining} tegoed van uw Waarde Check Bon.`
  } else {
    message = `U heeft €${totalAmount} tegoed van de Waarde Check Bon!`
  }

  return {
    eligible,
    totalAmount,
    amountUsed,
    amountRemaining,
    validUntil: WAARDE_CHECK_CONFIG.validUntil,
    message,
  }
}

/**
 * Calculate how much of a measure can be paid with Waarde Check
 */
export function calculateWaardeCheckContribution(
  measureSlug: string,
  measureCost: number,
  remainingBudget: number
): {
  applicable: boolean
  contribution: number
  reason: string
} {
  // Check if measure is eligible
  if (!WAARDE_CHECK_CONFIG.eligibleMeasures.includes(measureSlug)) {
    return {
      applicable: false,
      contribution: 0,
      reason: 'Deze maatregel komt niet in aanmerking voor de Waarde Check Bon.',
    }
  }

  if (remainingBudget <= 0) {
    return {
      applicable: false,
      contribution: 0,
      reason: 'Uw Waarde Check Bon is volledig benut.',
    }
  }

  const contribution = Math.min(measureCost, remainingBudget)

  return {
    applicable: true,
    contribution,
    reason: contribution === measureCost
      ? 'Volledig te betalen met Waarde Check Bon!'
      : `€${contribution} te betalen met Waarde Check Bon.`,
  }
}

/**
 * Get postcode area name
 */
export function getPostcodeAreaName(postalCode: string): string {
  const postcode4 = postalCode.substring(0, 4)

  const areas: Record<string, string> = {
    '4765': 'Zevenbergschen Hoek',
    '4781': 'Moerdijk',
    '4782': 'Moerdijk',
    '4767': 'Langeweg',
  }

  return areas[postcode4] || 'Onbekend'
}
