<template>
  <div class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-dark-700 dark:bg-dark-900">
    <div v-if="loading" class="py-16 text-center">
      <Icon name="refresh" size="lg" class="inline-block animate-spin text-gray-400" />
    </div>

    <div v-else-if="marketplaceGroups.length === 0" class="py-16 text-center">
      <Icon name="inbox" size="xl" class="mx-auto mb-3 h-12 w-12 text-gray-400" />
      <p class="text-sm text-gray-500 dark:text-gray-400">{{ emptyLabel }}</p>
    </div>

    <div v-else>
      <section
        v-for="group in marketplaceGroups"
        :key="group.key"
        class="border-b border-gray-200 last:border-b-0 dark:border-dark-700"
      >
        <header
          class="flex flex-col gap-3 bg-gray-50/80 px-4 py-4 dark:bg-dark-800/60 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <div class="flex min-w-0 items-center gap-3">
            <span
              :class="[
                'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border',
                platformBadgeClass(group.platform),
              ]"
            >
              <PlatformIcon :platform="group.platform as GroupPlatform" size="sm" />
            </span>
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="truncate text-sm font-semibold text-gray-900 dark:text-white">
                  {{ group.name }}
                </h2>
                <span
                  v-if="group.group"
                  class="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                >
                  {{ formatMultiplier(effectiveRate(group.group)) }}x
                </span>
              </div>
              <div class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                <span class="uppercase">{{ group.platform }}</span>
                <span aria-hidden="true">·</span>
                <span>{{ group.sources.join(' / ') }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 pl-12 sm:pl-0">
            <span
              v-if="group.group"
              class="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400"
            >
              <Icon :name="group.group.is_exclusive ? 'shield' : 'globe'" size="xs" />
              {{ group.group.is_exclusive ? t('availableChannels.exclusive') : t('availableChannels.public') }}
            </span>
            <span
              class="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 dark:border-dark-600 dark:bg-dark-800 dark:text-gray-300"
            >
              {{ t('availableChannels.modelCount', { count: group.models.length }) }}
            </span>
          </div>
        </header>

        <div class="overflow-x-auto">
          <table class="w-full min-w-[860px] table-fixed border-collapse text-sm">
            <thead>
              <tr class="border-y border-gray-100 bg-white text-xs text-gray-500 dark:border-dark-700 dark:bg-dark-900 dark:text-gray-400">
                <th class="w-[31%] px-5 py-2.5 text-left font-medium">
                  {{ columns.supportedModels }}
                </th>
                <th class="w-[13%] px-3 py-2.5 text-left font-medium">
                  {{ t(`${pricingKeyPrefix}.billingMode`) }}
                </th>
                <th class="w-[14%] px-3 py-2.5 text-right font-medium">
                  <span class="block">{{ t(`${pricingKeyPrefix}.inputPrice`) }}</span>
                  <span class="mt-0.5 block text-[10px] font-normal text-gray-400">
                    {{ t('availableChannels.priceUnit') }}
                  </span>
                </th>
                <th class="w-[14%] px-3 py-2.5 text-right font-medium">
                  <span class="block">{{ t(`${pricingKeyPrefix}.outputPrice`) }}</span>
                  <span class="mt-0.5 block text-[10px] font-normal text-gray-400">
                    {{ t('availableChannels.priceUnit') }}
                  </span>
                </th>
                <th class="w-[13%] px-3 py-2.5 text-right font-medium">
                  <span class="block">{{ t(`${pricingKeyPrefix}.cacheWritePrice`) }}</span>
                  <span class="mt-0.5 block text-[10px] font-normal text-gray-400">
                    {{ t('availableChannels.priceUnit') }}
                  </span>
                </th>
                <th class="w-[13%] px-3 py-2.5 text-right font-medium">
                  <span class="block">{{ t(`${pricingKeyPrefix}.cacheReadPrice`) }}</span>
                  <span class="mt-0.5 block text-[10px] font-normal text-gray-400">
                    {{ t('availableChannels.priceUnit') }}
                  </span>
                </th>
                <th class="w-10 px-2 py-2.5">
                  <span class="sr-only">{{ t(`${pricingKeyPrefix}.intervals`) }}</span>
                </th>
              </tr>
            </thead>

            <tbody>
              <template v-for="model in group.models" :key="`${group.key}-${model.name}`">
                <tr class="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70 dark:border-dark-700/70 dark:hover:bg-dark-800/50">
                  <td class="px-5 py-3">
                    <div class="flex min-w-0 items-center gap-2">
                      <PlatformIcon
                        :platform="group.platform as GroupPlatform"
                        size="xs"
                        class="flex-shrink-0"
                      />
                      <span class="truncate font-medium text-gray-900 dark:text-gray-100">
                        {{ model.name }}
                      </span>
                      <span
                        v-if="!model.pricing"
                        class="flex-shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-dark-700 dark:text-gray-400"
                      >
                        {{ noPricingLabel }}
                      </span>
                    </div>
                  </td>
                  <td class="px-3 py-3">
                    <span
                      class="inline-flex rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-dark-700 dark:text-gray-300"
                    >
                      {{ billingModeLabel(model) }}
                    </span>
                  </td>
                  <td class="px-3 py-3 text-right font-mono text-xs tabular-nums text-blue-700 dark:text-blue-300">
                    {{ inputPrice(model) }}
                  </td>
                  <td class="px-3 py-3 text-right font-mono text-xs tabular-nums text-emerald-700 dark:text-emerald-300">
                    {{ outputPrice(model) }}
                  </td>
                  <td class="px-3 py-3 text-right font-mono text-xs tabular-nums text-amber-700 dark:text-amber-300">
                    {{ cacheWritePrice(model) }}
                  </td>
                  <td class="px-3 py-3 text-right font-mono text-xs tabular-nums text-gray-700 dark:text-gray-300">
                    {{ cacheReadPrice(model) }}
                  </td>
                  <td class="px-2 py-3 text-center">
                    <button
                      v-if="model.pricing?.intervals?.length"
                      type="button"
                      class="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-dark-700 dark:hover:text-gray-200"
                      :title="t(`${pricingKeyPrefix}.intervals`)"
                      @click="toggleIntervals(group.key, model.name)"
                    >
                      <Icon
                        :name="isExpanded(group.key, model.name) ? 'chevronDown' : 'chevronRight'"
                        size="sm"
                      />
                    </button>
                  </td>
                </tr>

                <tr
                  v-if="model.pricing?.intervals?.length && isExpanded(group.key, model.name)"
                  class="border-b border-gray-100 bg-gray-50/80 dark:border-dark-700 dark:bg-dark-800/40"
                >
                  <td colspan="7" class="px-5 py-3">
                    <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      <div
                        v-for="(interval, index) in model.pricing.intervals"
                        :key="`${group.key}-${model.name}-tier-${index}`"
                        class="rounded-md border border-gray-200 bg-white px-3 py-2 dark:border-dark-600 dark:bg-dark-800"
                      >
                        <div class="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">
                          {{ intervalLabel(interval) }}
                        </div>
                        <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                          <span>{{ t(`${pricingKeyPrefix}.inputPrice`) }}</span>
                          <span class="text-right font-mono text-blue-700 dark:text-blue-300">
                            {{ intervalPrice(interval.input_price) }}
                          </span>
                          <span>{{ t(`${pricingKeyPrefix}.outputPrice`) }}</span>
                          <span class="text-right font-mono text-emerald-700 dark:text-emerald-300">
                            {{ intervalPrice(interval.output_price) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '@/components/icons/Icon.vue'
import PlatformIcon from '@/components/common/PlatformIcon.vue'
import type {
  UserAvailableChannel,
  UserAvailableGroup,
  UserPricingInterval,
  UserSupportedModel,
} from '@/api/channels'
import type { GroupPlatform } from '@/types'
import { platformBadgeClass } from '@/utils/platformColors'
import { formatScaled } from '@/utils/pricing'
import {
  BILLING_MODE_IMAGE,
  BILLING_MODE_PER_REQUEST,
  BILLING_MODE_TOKEN,
} from '@/constants/channel'

interface MarketplaceGroup {
  key: string
  name: string
  platform: string
  group: UserAvailableGroup | null
  sources: string[]
  models: UserSupportedModel[]
}

const props = defineProps<{
  columns: {
    name: string
    description: string
    platform: string
    groups: string
    supportedModels: string
  }
  rows: UserAvailableChannel[]
  loading: boolean
  pricingKeyPrefix: string
  noPricingLabel: string
  noModelsLabel: string
  emptyLabel: string
  userGroupRates: Record<number, number>
}>()

const { t } = useI18n()
const expandedRows = ref(new Set<string>())

const marketplaceGroups = computed<MarketplaceGroup[]>(() => {
  const grouped = new Map<string, {
    group: UserAvailableGroup | null
    name: string
    platform: string
    sources: Set<string>
    models: Map<string, UserSupportedModel>
  }>()

  for (const channel of props.rows) {
    for (const section of channel.platforms) {
      const sectionGroups = section.groups.length > 0 ? section.groups : [null]
      for (const group of sectionGroups) {
        const key = group
          ? `group-${group.id}`
          : `ungrouped-${section.platform}-${channel.name}`
        const entry = grouped.get(key) ?? {
          group,
          name: group?.name ?? t('availableChannels.ungrouped'),
          platform: group?.platform || section.platform,
          sources: new Set<string>(),
          models: new Map<string, UserSupportedModel>(),
        }
        entry.sources.add(channel.name)
        for (const model of section.supported_models) {
          const existing = entry.models.get(model.name)
          if (!existing || (!existing.pricing && model.pricing)) {
            entry.models.set(model.name, model)
          }
        }
        grouped.set(key, entry)
      }
    }
  }

  return [...grouped.entries()]
    .map(([key, entry]) => ({
      key,
      name: entry.name,
      platform: entry.platform,
      group: entry.group,
      sources: [...entry.sources].sort((a, b) => a.localeCompare(b)),
      models: [...entry.models.values()].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((group) => group.models.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
})

function billingModeLabel(model: UserSupportedModel): string {
  switch (model.pricing?.billing_mode) {
    case BILLING_MODE_TOKEN:
      return t(`${props.pricingKeyPrefix}.billingModeToken`)
    case BILLING_MODE_PER_REQUEST:
      return t(`${props.pricingKeyPrefix}.billingModePerRequest`)
    case BILLING_MODE_IMAGE:
      return t(`${props.pricingKeyPrefix}.billingModeImage`)
    default:
      return '-'
  }
}

function inputPrice(model: UserSupportedModel): string {
  if (model.pricing?.billing_mode !== BILLING_MODE_TOKEN) return '-'
  return formatScaled(model.pricing.input_price, 1_000_000)
}

function outputPrice(model: UserSupportedModel): string {
  const pricing = model.pricing
  if (!pricing) return '-'
  if (pricing.billing_mode === BILLING_MODE_TOKEN) {
    return formatScaled(pricing.output_price, 1_000_000)
  }
  if (pricing.billing_mode === BILLING_MODE_IMAGE) {
    return formatScaled(pricing.per_request_price ?? pricing.image_output_price, 1)
  }
  return formatScaled(pricing.per_request_price, 1)
}

function cacheWritePrice(model: UserSupportedModel): string {
  if (model.pricing?.billing_mode !== BILLING_MODE_TOKEN) return '-'
  return formatScaled(model.pricing.cache_write_price, 1_000_000)
}

function cacheReadPrice(model: UserSupportedModel): string {
  if (model.pricing?.billing_mode !== BILLING_MODE_TOKEN) return '-'
  return formatScaled(model.pricing.cache_read_price, 1_000_000)
}

function rowKey(groupKey: string, modelName: string): string {
  return `${groupKey}:${modelName}`
}

function isExpanded(groupKey: string, modelName: string): boolean {
  return expandedRows.value.has(rowKey(groupKey, modelName))
}

function toggleIntervals(groupKey: string, modelName: string): void {
  const key = rowKey(groupKey, modelName)
  const next = new Set(expandedRows.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedRows.value = next
}

function intervalLabel(interval: UserPricingInterval): string {
  if (interval.tier_label) return interval.tier_label
  const max = interval.max_tokens == null ? '∞' : interval.max_tokens.toLocaleString()
  return `${interval.min_tokens.toLocaleString()} - ${max}`
}

function intervalPrice(value: number | null): string {
  return formatScaled(value, 1_000_000)
}

function effectiveRate(group: UserAvailableGroup): number {
  return props.userGroupRates[group.id] ?? group.rate_multiplier
}

function formatMultiplier(value: number): string {
  return value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
}
</script>
