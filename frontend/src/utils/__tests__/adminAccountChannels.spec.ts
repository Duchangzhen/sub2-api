import { describe, expect, it } from 'vitest'

import type { Account, Group } from '@/types'
import {
  applyDefaultPricingToChannels,
  buildChannelsFromAdminAccounts,
} from '@/utils/adminAccountChannels'

function makeGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: 10,
    name: 'gpt-pro',
    description: null,
    platform: 'openai',
    rate_multiplier: 0.15,
    is_exclusive: false,
    status: 'active',
    subscription_type: 'standard',
    daily_limit_usd: null,
    weekly_limit_usd: null,
    monthly_limit_usd: null,
    allow_image_generation: false,
    allow_batch_image_generation: false,
    image_rate_independent: false,
    image_rate_multiplier: 1,
    batch_image_discount_multiplier: 1,
    batch_image_hold_multiplier: 1,
    image_price_1k: null,
    image_price_2k: null,
    image_price_4k: null,
    video_rate_independent: false,
    video_rate_multiplier: 1,
    video_price_480p: null,
    video_price_720p: null,
    video_price_1080p: null,
    web_search_price_per_call: null,
    peak_rate_enabled: false,
    peak_start: '',
    peak_end: '',
    peak_rate_multiplier: 1,
    claude_code_only: false,
    fallback_group_id: null,
    fallback_group_id_on_invalid_request: null,
    require_oauth_only: false,
    require_privacy_set: false,
    created_at: '',
    updated_at: '',
    ...overrides,
  }
}

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: 1,
    name: 'OpenAI upstream',
    platform: 'openai',
    type: 'apikey',
    credentials: {
      model_mapping: {
        'gpt-5.5': 'gpt-5.5',
        'gpt-5.6-sol': 'gpt-5.6-sol',
      },
    },
    proxy_id: null,
    concurrency: 10,
    priority: 0,
    status: 'active',
    error_message: null,
    last_used_at: null,
    expires_at: null,
    auto_pause_on_expired: false,
    created_at: '',
    updated_at: '',
    schedulable: true,
    rate_limited_at: null,
    rate_limit_reset_at: null,
    overload_until: null,
    temp_unschedulable_until: null,
    temp_unschedulable_reason: null,
    session_window_start: null,
    session_window_end: null,
    session_window_status: null,
    groups: [makeGroup()],
    ...overrides,
  }
}

describe('buildChannelsFromAdminAccounts', () => {
  it('turns account model mappings and groups into model marketplace rows', () => {
    const channels = buildChannelsFromAdminAccounts([makeAccount()])

    expect(channels).toHaveLength(1)
    expect(channels[0].name).toBe('OpenAI upstream')
    expect(channels[0].platforms[0].groups[0].name).toBe('gpt-pro')
    expect(channels[0].platforms[0].supported_models.map((model) => model.name)).toEqual([
      'gpt-5.5',
      'gpt-5.6-sol',
    ])
  })

  it('skips inactive accounts, wildcard-only mappings, and groups from other platforms', () => {
    const channels = buildChannelsFromAdminAccounts([
      makeAccount({ status: 'inactive' }),
      makeAccount({ id: 2, credentials: { model_mapping: { '*': '*' } } }),
      makeAccount({
        id: 3,
        groups: [makeGroup({ platform: 'anthropic' })],
      }),
    ])

    expect(channels).toHaveLength(1)
    expect(channels[0].platforms[0].groups).toEqual([])
  })

  it('fills missing account model prices from the native pricing catalog', () => {
    const channels = buildChannelsFromAdminAccounts([makeAccount()])
    const hydrated = applyDefaultPricingToChannels(channels, new Map([
      ['gpt-5.5', {
        found: true,
        input_price: 1.25e-6,
        output_price: 10e-6,
      }],
    ]))

    const models = hydrated[0].platforms[0].supported_models
    expect(models.find((model) => model.name === 'gpt-5.5')?.pricing).toMatchObject({
      billing_mode: 'token',
      input_price: 1.25e-6,
      output_price: 10e-6,
    })
    expect(models.find((model) => model.name === 'gpt-5.6-sol')?.pricing).toBeNull()
  })
})
