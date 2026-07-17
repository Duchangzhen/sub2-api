import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const componentPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../AvailableChannelsTable.vue',
)
const componentSource = readFileSync(componentPath, 'utf8')

describe('AvailableChannelsTable marketplace behavior', () => {
  it('provides the scroll container expected by TablePageLayout', () => {
    expect(componentSource).toContain('class="table-wrapper marketplace-scroll"')
    expect(componentSource).toContain('overflow-y: auto;')
    expect(componentSource).toContain('scrollbar-gutter: stable;')
  })

  it('formats displayed prices with the applicable group rates', () => {
    expect(componentSource).toContain("import { formatScaledPriceForRates }")
    expect(componentSource).toContain('applicableRates(model)')
  })
})
