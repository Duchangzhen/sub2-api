import { describe, expect, it } from 'vitest'

import { formatScaledPriceForRates } from '@/utils/modelMarketplacePricing'

describe('formatScaledPriceForRates', () => {
  it('applies the selected group multiplier to the displayed model price', () => {
    expect(formatScaledPriceForRates(4.6875e-6, 1_000_000, [0.08])).toBe('$0.375')
  })

  it('shows a price range when the model belongs to groups with different rates', () => {
    expect(formatScaledPriceForRates(4.6875e-6, 1_000_000, [0.28, 0.08])).toBe(
      '$0.375 - $1.3125',
    )
  })

  it('keeps zero-rate groups free and handles missing prices', () => {
    expect(formatScaledPriceForRates(10e-6, 1_000_000, [0])).toBe('$0')
    expect(formatScaledPriceForRates(null, 1_000_000, [0.08])).toBe('-')
  })
})
