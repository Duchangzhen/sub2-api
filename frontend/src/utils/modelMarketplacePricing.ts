import { formatScaled } from '@/utils/pricing'

export function formatScaledPriceForRates(
  value: number | null,
  scale: number,
  rates: number[],
): string {
  if (value == null) return '-'
  const normalizedRates = [...new Set(rates.filter((rate) => Number.isFinite(rate) && rate >= 0))]
    .sort((a, b) => a - b)
  if (normalizedRates.length === 0) normalizedRates.push(1)

  const lowest = formatScaled(value * normalizedRates[0], scale)
  const highest = formatScaled(value * normalizedRates[normalizedRates.length - 1], scale)
  return lowest === highest ? lowest : `${lowest} - ${highest}`
}
