/**
 * Stimuleringslening Gemeente Moerdijk
 *
 * Lening (geen subsidie) voor energiebesparende maatregelen
 * Zeer lage rente: 1,7% vast
 */

import type { Customer, HouseProfile } from '@/types/supabase'

/**
 * Stimuleringslening configuration
 */
export const STIMULERINGSLENING_CONFIG = {
  // Interest rate
  interestRate: 0.017, // 1.7%

  // Loan amounts
  minAmount: 2500, // EUR
  maxAmount: 35000, // EUR

  // Terms
  shortTermLimit: 12500, // Under this: 10 years
  shortTermYears: 10,
  longTermYears: 15,

  // Eligibility
  minBuildingAge: 10, // Building must be older than 10 years
  maxApplicantAge: 76, // Applicant must be younger than 76

  // Eligible municipalities
  eligibleMunicipalities: [
    'moerdijk',
    'zevenbergschen hoek',
    'zevenbergen',
    'klundert',
    'fijnaart',
    'willemstad',
    'standdaarbuiten',
    'langeweg',
  ],

  // Eligible postcodes
  eligiblePostcodes: ['4765', '4781', '4782', '4767', '4761', '4791', '4793', '4794', '4795', '4797'],

  // What can it be spent on
  eligibleCategories: {
    duurzaamheid: [
      'Zonnepanelen',
      'Spouwmuurisolatie',
      'Dakisolatie',
      'Vloerisolatie',
      'HR++ glas',
      'Warmtepomp',
      'Hybride warmtepomp',
      'Zonneboiler',
    ],
    levensloopbestendig: [
      'Slaapkamer/badkamer begane grond',
      'Inductiekookplaat',
      'Bredere deuren',
      'Drempels verwijderen',
      'Domotica',
      'Traplift',
    ],
    veiligheid: [
      'Hang- en sluitwerk',
      'Buitenverlichting met sensor',
      'Rookmelders',
      'CO-melders',
      'Alarmsysteem',
    ],
  },

  // Info link
  infoUrl: 'https://www.moerdijk.nl/stimuleringslening',
}

export type LoanCalculation = {
  amount: number
  years: number
  interestRate: number
  monthlyPayment: number
  totalInterest: number
  totalPayment: number
}

/**
 * Calculate monthly payment for annuity loan
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 12
  const months = years * 12

  if (monthlyRate === 0) {
    return principal / months
  }

  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
}

/**
 * Calculate full loan details
 */
export function calculateLoan(amount: number): LoanCalculation {
  // Clamp amount to valid range
  const validAmount = Math.min(
    Math.max(amount, STIMULERINGSLENING_CONFIG.minAmount),
    STIMULERINGSLENING_CONFIG.maxAmount
  )

  // Determine term based on amount
  const years = validAmount <= STIMULERINGSLENING_CONFIG.shortTermLimit
    ? STIMULERINGSLENING_CONFIG.shortTermYears
    : STIMULERINGSLENING_CONFIG.longTermYears

  const monthlyPayment = calculateMonthlyPayment(
    validAmount,
    STIMULERINGSLENING_CONFIG.interestRate,
    years
  )

  const totalPayment = monthlyPayment * years * 12
  const totalInterest = totalPayment - validAmount

  return {
    amount: validAmount,
    years,
    interestRate: STIMULERINGSLENING_CONFIG.interestRate,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
  }
}

/**
 * Check if customer is eligible for Stimuleringslening
 */
export function isEligibleForStimuleringslening(
  customer: Pick<Customer, 'postal_code' | 'city'>,
  profile: Partial<HouseProfile> | null,
  applicantAge?: number
): {
  eligible: boolean
  reasons: string[]
} {
  const reasons: string[] = []
  let eligible = true

  // Check postcode
  if (customer.postal_code) {
    const postcode4 = customer.postal_code.substring(0, 4)
    if (!STIMULERINGSLENING_CONFIG.eligiblePostcodes.includes(postcode4)) {
      eligible = false
      reasons.push('Postcode ligt niet in gemeente Moerdijk')
    }
  }

  // Check building age
  if (profile?.year_built) {
    const currentYear = new Date().getFullYear()
    const buildingAge = currentYear - profile.year_built

    if (buildingAge < STIMULERINGSLENING_CONFIG.minBuildingAge) {
      eligible = false
      reasons.push(`Woning is ${buildingAge} jaar oud (minimaal ${STIMULERINGSLENING_CONFIG.minBuildingAge} jaar vereist)`)
    }
  }

  // Check applicant age
  if (applicantAge && applicantAge >= STIMULERINGSLENING_CONFIG.maxApplicantAge) {
    eligible = false
    reasons.push(`Aanvrager moet jonger zijn dan ${STIMULERINGSLENING_CONFIG.maxApplicantAge} jaar`)
  }

  if (eligible) {
    reasons.push('Uw woning komt in aanmerking voor de Stimuleringslening')
  }

  return { eligible, reasons }
}

/**
 * Get example calculation for display
 */
export function getExampleCalculations(): {
  label: string
  amount: number
  calculation: LoanCalculation
}[] {
  return [
    {
      label: 'Spouwmuurisolatie',
      amount: 3000,
      calculation: calculateLoan(3000),
    },
    {
      label: 'HR++ glas',
      amount: 8000,
      calculation: calculateLoan(8000),
    },
    {
      label: 'Volledige isolatie',
      amount: 15000,
      calculation: calculateLoan(15000),
    },
    {
      label: 'Warmtepomp + isolatie',
      amount: 25000,
      calculation: calculateLoan(25000),
    },
  ]
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format percentage
 */
export function formatPercentage(rate: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rate)
}
