import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const testDir = dirname(fileURLToPath(import.meta.url))
const routerSource = readFileSync(resolve(testDir, '../index.ts'), 'utf8')
const sidebarSource = readFileSync(resolve(testDir, '../../components/layout/AppSidebar.vue'), 'utf8')

describe('available channels access', () => {
  it('requires an administrator at the route level', () => {
    const routeBlock = routerSource.match(
      /path: '\/available-channels'[\s\S]*?descriptionKey: 'availableChannels\.description'/
    )

    expect(routeBlock).not.toBeNull()
    expect(routeBlock?.[0]).toContain('requiresAdmin: true')
  })

  it('only adds the navigation item for administrators', () => {
    const adminNavigationBlock = sidebarSource.match(
      /if \(isAdmin\.value\) \{\s*items\.push\(\{ path: '\/available-channels'[\s\S]*?\}\)\s*\}/
    )

    expect(adminNavigationBlock).not.toBeNull()
    expect(adminNavigationBlock?.[0]).not.toContain('featureFlag')
    expect(adminNavigationBlock?.[0]).not.toContain('hideInSimpleMode')
  })
})
