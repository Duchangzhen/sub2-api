import type { Account, Group } from '@/types'
import type {
  UserAvailableChannel,
  UserAvailableGroup,
  UserSupportedModel,
} from '@/api/channels'

function modelNamesFromAccount(account: Account): string[] {
  const mapping = account.credentials?.model_mapping
  const whitelist = account.credentials?.model_whitelist
  const names: string[] = []

  if (mapping && typeof mapping === 'object' && !Array.isArray(mapping)) {
    names.push(...Object.keys(mapping))
  }
  if (Array.isArray(whitelist)) {
    names.push(...whitelist.filter((name): name is string => typeof name === 'string'))
  }

  return [...new Set(names.map((name) => name.trim()).filter((name) => name && !name.includes('*')))]
    .sort((a, b) => a.localeCompare(b))
}

function toAvailableGroup(group: Group): UserAvailableGroup {
  return {
    id: group.id,
    name: group.name,
    platform: group.platform,
    subscription_type: group.subscription_type,
    rate_multiplier: group.rate_multiplier,
    peak_rate_enabled: group.peak_rate_enabled,
    peak_start: group.peak_start,
    peak_end: group.peak_end,
    peak_rate_multiplier: group.peak_rate_multiplier,
    is_exclusive: group.is_exclusive,
  }
}

export function buildChannelsFromAdminAccounts(accounts: Account[]): UserAvailableChannel[] {
  return accounts
    .filter((account) => account.status === 'active')
    .map((account): UserAvailableChannel | null => {
      const modelNames = modelNamesFromAccount(account)
      if (modelNames.length === 0) return null

      const groups = (account.groups ?? [])
        .filter((group) => group.status === 'active' && group.platform === account.platform)
        .map(toAvailableGroup)
      const supportedModels: UserSupportedModel[] = modelNames.map((name) => ({
        name,
        platform: account.platform,
        pricing: null,
      }))

      return {
        name: account.name,
        description: account.notes ?? '',
        platforms: [{
          platform: account.platform,
          groups,
          supported_models: supportedModels,
        }],
      }
    })
    .filter((channel): channel is UserAvailableChannel => channel !== null)
}
