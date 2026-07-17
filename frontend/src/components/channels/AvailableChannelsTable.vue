<template>
  <div class="table-wrapper marketplace-scroll">
  <div v-if="loading" class="rounded-lg border border-gray-200 bg-white py-20 text-center dark:border-dark-700 dark:bg-dark-900">
    <Icon name="refresh" size="lg" class="inline-block animate-spin text-gray-400" />
  </div>

  <div v-else-if="catalog.length === 0" class="rounded-lg border border-gray-200 bg-white py-20 text-center dark:border-dark-700 dark:bg-dark-900">
    <Icon name="inbox" size="xl" class="mx-auto mb-3 h-12 w-12 text-gray-400" />
    <p class="text-sm text-gray-500 dark:text-gray-400">{{ emptyLabel }}</p>
  </div>

  <div v-else class="grid items-start gap-4 lg:grid-cols-[230px_minmax(0,1fr)]">
    <aside class="rounded-lg border border-gray-200 bg-white p-4 dark:border-dark-700 dark:bg-dark-900 lg:sticky lg:top-4">
      <div class="space-y-5">
        <section>
          <h2 class="mb-2 text-xs font-semibold text-gray-900 dark:text-white">
            {{ t('availableChannels.filters.providers') }}
          </h2>
          <div class="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              class="filter-button col-span-2"
              :class="selectedProvider === ALL_FILTER ? 'filter-button-active' : 'filter-button-idle'"
              @click="selectedProvider = ALL_FILTER"
            >
              {{ t('availableChannels.filters.allProviders') }}
            </button>
            <button
              v-for="platform in providerOptions"
              :key="platform"
              type="button"
              class="filter-button min-w-0"
              :class="selectedProvider === platform ? 'filter-button-active' : 'filter-button-idle'"
              :title="platformLabel(platform)"
              @click="selectedProvider = platform"
            >
              <PlatformIcon :platform="platform as GroupPlatform" size="xs" />
              <span class="truncate">{{ platformLabel(platform) }}</span>
            </button>
          </div>
        </section>

        <section class="border-t border-gray-100 pt-4 dark:border-dark-700">
          <h2 class="mb-2 text-xs font-semibold text-gray-900 dark:text-white">
            {{ t('availableChannels.filters.groups') }}
          </h2>
          <div class="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              class="filter-button col-span-2"
              :class="selectedGroup === ALL_FILTER ? 'filter-button-active' : 'filter-button-idle'"
              @click="selectedGroup = ALL_FILTER"
            >
              {{ t('availableChannels.filters.allGroups') }}
            </button>
            <button
              v-for="group in groupOptions"
              :key="group.id"
              type="button"
              class="filter-button min-w-0"
              :class="selectedGroup === String(group.id) ? 'filter-button-active' : 'filter-button-idle'"
              :title="group.name"
              @click="selectedGroup = String(group.id)"
            >
              <span class="truncate">{{ group.name }}</span>
            </button>
          </div>
        </section>

        <section class="border-t border-gray-100 pt-4 dark:border-dark-700">
          <h2 class="mb-2 text-xs font-semibold text-gray-900 dark:text-white">
            {{ t('availableChannels.filters.billingTypes') }}
          </h2>
          <div class="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              class="filter-button col-span-2"
              :class="selectedBilling === ALL_FILTER ? 'filter-button-active' : 'filter-button-idle'"
              @click="selectedBilling = ALL_FILTER"
            >
              {{ t('availableChannels.filters.allBillingTypes') }}
            </button>
            <button
              v-for="mode in billingOptions"
              :key="mode"
              type="button"
              class="filter-button"
              :class="selectedBilling === mode ? 'filter-button-active' : 'filter-button-idle'"
              @click="selectedBilling = mode"
            >
              {{ billingModeLabel(mode) }}
            </button>
          </div>
        </section>

        <button
          v-if="hasActiveFilters"
          type="button"
          class="btn btn-secondary w-full justify-center"
          @click="resetFilters"
        >
          <Icon name="refresh" size="sm" />
          {{ t('common.reset') }}
        </button>
      </div>
    </aside>

    <main class="min-w-0">
      <header class="mb-4 overflow-hidden rounded-lg bg-teal-700 px-5 py-5 text-white dark:bg-teal-800">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-lg font-semibold">{{ catalogTitle }}</h2>
              <span class="rounded-md bg-white/15 px-2 py-0.5 text-xs font-medium">
                {{ t('availableChannels.modelCount', { count: filteredModels.length }) }}
              </span>
            </div>
            <p class="mt-1 text-xs text-teal-50">
              {{ t('availableChannels.catalogDescription') }}
            </p>
          </div>
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <Icon name="grid" size="lg" />
          </div>
        </div>
      </header>

      <div v-if="filteredModels.length === 0" class="rounded-lg border border-gray-200 bg-white py-16 text-center dark:border-dark-700 dark:bg-dark-900">
        <Icon name="search" size="xl" class="mx-auto mb-3 h-10 w-10 text-gray-400" />
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ t('availableChannels.noMatchingModels') }}
        </p>
      </div>

      <div v-else class="grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
        <article
          v-for="model in filteredModels"
          :key="model.key"
          class="flex min-h-[190px] flex-col rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-teal-300 dark:border-dark-700 dark:bg-dark-900 dark:hover:border-teal-700"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex min-w-0 items-center gap-3">
              <span
                :class="[
                  'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border',
                  platformBadgeClass(model.platform),
                ]"
              >
                <PlatformIcon :platform="model.platform as GroupPlatform" size="sm" />
              </span>
              <div class="min-w-0">
                <h3 class="truncate text-sm font-semibold text-gray-900 dark:text-white" :title="model.name">
                  {{ model.name }}
                </h3>
                <p class="mt-0.5 text-[11px] uppercase text-gray-400">
                  {{ platformLabel(model.platform) }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700 dark:border-dark-600 dark:hover:bg-dark-800 dark:hover:text-gray-200"
              :title="t('common.copy')"
              @click="copyModelName(model.name)"
            >
              <Icon name="copy" size="sm" />
            </button>
          </div>

          <div v-if="priceRows(model).length > 0" class="mt-3 space-y-1.5">
            <div
              v-for="row in priceRows(model)"
              :key="row.label"
              class="flex items-baseline justify-between gap-3 text-xs"
            >
              <span class="text-gray-500 dark:text-gray-400">{{ row.label }}</span>
              <span class="text-right font-mono font-medium tabular-nums text-gray-800 dark:text-gray-200">
                {{ row.value }}
              </span>
            </div>
          </div>
          <p v-else class="mt-4 text-xs text-gray-400">{{ noPricingLabel }}</p>

          <div class="mt-auto flex flex-wrap items-center gap-1.5 pt-4">
            <span :class="billingBadgeClass(model.billingMode)" class="rounded-md px-2 py-0.5 text-[11px] font-medium">
              {{ billingModeLabel(model.billingMode) }}
            </span>
            <span
              v-if="model.intervalCount > 0"
              class="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
            >
              {{ t('availableChannels.tierCount', { count: model.intervalCount }) }}
            </span>
            <span
              v-for="group in visibleModelGroups(model.groups)"
              :key="group.id"
              class="max-w-full truncate rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600 dark:bg-dark-700 dark:text-gray-300"
              :title="group.name"
            >
              {{ group.name }} · {{ formatMultiplier(effectiveRate(group)) }}x
            </span>
          </div>
        </article>
      </div>
    </main>
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
  UserSupportedModel,
  UserSupportedModelPricing,
} from '@/api/channels'
import type { GroupPlatform } from '@/types'
import { platformBadgeClass } from '@/utils/platformColors'
import { formatScaledPriceForRates } from '@/utils/modelMarketplacePricing'
import { useAppStore } from '@/stores/app'
import {
  BILLING_MODE_IMAGE,
  BILLING_MODE_PER_REQUEST,
  BILLING_MODE_TOKEN,
  type BillingMode,
} from '@/constants/channel'

interface MarketplaceModel {
  key: string
  name: string
  platform: string
  pricing: UserSupportedModelPricing | null
  billingMode: BillingMode | ''
  groups: UserAvailableGroup[]
  intervalCount: number
}

interface PriceRow {
  label: string
  value: string
}

const ALL_FILTER = 'all'

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
const appStore = useAppStore()
const selectedProvider = ref(ALL_FILTER)
const selectedGroup = ref(ALL_FILTER)
const selectedBilling = ref(ALL_FILTER)

const catalog = computed<MarketplaceModel[]>(() => {
  const models = new Map<string, {
    model: UserSupportedModel
    platform: string
    groups: Map<number, UserAvailableGroup>
  }>()

  for (const channel of props.rows) {
    for (const section of channel.platforms) {
      for (const model of section.supported_models) {
        const key = `${section.platform}:${model.name}`
        const entry = models.get(key) ?? {
          model,
          platform: section.platform,
          groups: new Map<number, UserAvailableGroup>(),
        }
        if (!entry.model.pricing && model.pricing) entry.model = model
        for (const group of section.groups) entry.groups.set(group.id, group)
        models.set(key, entry)
      }
    }
  }

  return [...models.entries()]
    .map(([key, entry]) => ({
      key,
      name: entry.model.name,
      platform: entry.platform,
      pricing: entry.model.pricing,
      billingMode: (entry.model.pricing?.billing_mode ?? '') as BillingMode | '',
      groups: [...entry.groups.values()].sort((a, b) => a.name.localeCompare(b.name)),
      intervalCount: entry.model.pricing?.intervals?.length ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))
})

const providerOptions = computed(() =>
  [...new Set(catalog.value.map((model) => model.platform))]
    .sort((a, b) => platformLabel(a).localeCompare(platformLabel(b))),
)

const groupOptions = computed(() => {
  const groups = new Map<number, UserAvailableGroup>()
  for (const model of catalog.value) {
    for (const group of model.groups) groups.set(group.id, group)
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name))
})

const billingOptions = computed(() =>
  [...new Set(catalog.value.map((model) => model.billingMode).filter(Boolean))]
    .sort((a, b) => billingModeLabel(a).localeCompare(billingModeLabel(b))),
)

const filteredModels = computed(() => catalog.value.filter((model) => {
  if (selectedProvider.value !== ALL_FILTER && model.platform !== selectedProvider.value) return false
  if (selectedGroup.value !== ALL_FILTER && !model.groups.some((group) => String(group.id) === selectedGroup.value)) return false
  if (selectedBilling.value !== ALL_FILTER && model.billingMode !== selectedBilling.value) return false
  return true
}))

const hasActiveFilters = computed(() =>
  selectedProvider.value !== ALL_FILTER ||
  selectedGroup.value !== ALL_FILTER ||
  selectedBilling.value !== ALL_FILTER,
)

const catalogTitle = computed(() => {
  if (selectedGroup.value !== ALL_FILTER) {
    return groupOptions.value.find((group) => String(group.id) === selectedGroup.value)?.name ??
      t('availableChannels.allModels')
  }
  if (selectedProvider.value !== ALL_FILTER) return platformLabel(selectedProvider.value)
  return t('availableChannels.allModels')
})

function platformLabel(platform: string): string {
  return t(`admin.groups.platforms.${platform}`, platform)
}

function billingModeLabel(mode: BillingMode | ''): string {
  switch (mode) {
    case BILLING_MODE_TOKEN:
      return t(`${props.pricingKeyPrefix}.billingModeToken`)
    case BILLING_MODE_PER_REQUEST:
      return t(`${props.pricingKeyPrefix}.billingModePerRequest`)
    case BILLING_MODE_IMAGE:
      return t(`${props.pricingKeyPrefix}.billingModeImage`)
    default:
      return t('availableChannels.filters.unknownBilling')
  }
}

function billingBadgeClass(mode: BillingMode | ''): string {
  switch (mode) {
    case BILLING_MODE_PER_REQUEST:
      return 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
    case BILLING_MODE_IMAGE:
      return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
    default:
      return 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300'
  }
}

function priceRows(model: MarketplaceModel): PriceRow[] {
  const pricing = model.pricing
  if (!pricing) return []
  if (pricing.billing_mode === BILLING_MODE_PER_REQUEST) {
    return compactPriceRows([
      [t(`${props.pricingKeyPrefix}.perRequestPrice`), modelPrice(model, pricing.per_request_price, 1), t(`${props.pricingKeyPrefix}.unitPerRequest`)],
    ])
  }
  if (pricing.billing_mode === BILLING_MODE_IMAGE) {
    return compactPriceRows([
      [t(`${props.pricingKeyPrefix}.imageOutputPrice`), modelPrice(model, pricing.per_request_price ?? pricing.image_output_price, 1), t(`${props.pricingKeyPrefix}.unitPerRequest`)],
    ])
  }
  return compactPriceRows([
    [t(`${props.pricingKeyPrefix}.inputPrice`), modelPrice(model, pricing.input_price, 1_000_000), t(`${props.pricingKeyPrefix}.unitPerMillion`)],
    [t(`${props.pricingKeyPrefix}.outputPrice`), modelPrice(model, pricing.output_price, 1_000_000), t(`${props.pricingKeyPrefix}.unitPerMillion`)],
    [t(`${props.pricingKeyPrefix}.cacheReadPrice`), modelPrice(model, pricing.cache_read_price, 1_000_000), t(`${props.pricingKeyPrefix}.unitPerMillion`)],
    [t(`${props.pricingKeyPrefix}.cacheWritePrice`), modelPrice(model, pricing.cache_write_price, 1_000_000), t(`${props.pricingKeyPrefix}.unitPerMillion`)],
    [t(`${props.pricingKeyPrefix}.imageOutputPrice`), modelPrice(model, pricing.image_output_price, 1_000_000), t(`${props.pricingKeyPrefix}.unitPerMillion`)],
  ])
}

function modelPrice(model: MarketplaceModel, value: number | null, scale: number): string {
  return formatScaledPriceForRates(value, scale, applicableRates(model))
}

function applicableRates(model: MarketplaceModel): number[] {
  if (selectedGroup.value !== ALL_FILTER) {
    const group = model.groups.find((item) => String(item.id) === selectedGroup.value)
    return group ? [effectiveRate(group)] : [1]
  }
  const rates = model.groups.map(effectiveRate)
  return rates.length > 0 ? rates : [1]
}

function compactPriceRows(rows: Array<[string, string, string]>): PriceRow[] {
  return rows
    .filter(([, value]) => value !== '-')
    .map(([label, value, unit]) => ({ label, value: `${value} ${unit}` }))
}

function resetFilters(): void {
  selectedProvider.value = ALL_FILTER
  selectedGroup.value = ALL_FILTER
  selectedBilling.value = ALL_FILTER
}

function effectiveRate(group: UserAvailableGroup): number {
  return props.userGroupRates[group.id] ?? group.rate_multiplier
}

function formatMultiplier(value: number): string {
  return value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
}

function visibleModelGroups(groups: UserAvailableGroup[]): UserAvailableGroup[] {
  if (selectedGroup.value === ALL_FILTER) return groups.slice(0, 3)
  return groups.filter((group) => String(group.id) === selectedGroup.value)
}

async function copyModelName(name: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(name)
    appStore.showSuccess(t('common.copied'))
  } catch {
    appStore.showError(t('common.copyFailed'))
  }
}
</script>

<style scoped>
.marketplace-scroll {
  min-height: 0;
  overflow-y: auto;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: rgb(156 163 175) transparent;
}

.marketplace-scroll::-webkit-scrollbar {
  width: 10px;
}

.marketplace-scroll::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 6px;
  background-clip: padding-box;
  background-color: rgb(156 163 175);
}

.marketplace-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.filter-button {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border-radius: 6px;
  border-width: 1px;
  padding: 0.375rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  transition: border-color 150ms, background-color 150ms, color 150ms;
}

.filter-button-idle {
  border-color: rgb(229 231 235);
  background: white;
  color: rgb(75 85 99);
}

.filter-button-idle:hover {
  border-color: rgb(153 246 228);
  background: rgb(240 253 250);
  color: rgb(15 118 110);
}

.filter-button-active {
  border-color: rgb(94 234 212);
  background: rgb(204 251 241);
  color: rgb(15 118 110);
}

:global(.dark) .filter-button-idle {
  border-color: rgb(75 85 99);
  background: rgb(31 41 55);
  color: rgb(209 213 219);
}

:global(.dark) .filter-button-idle:hover,
:global(.dark) .filter-button-active {
  border-color: rgb(13 148 136);
  background: rgb(19 78 74 / 0.45);
  color: rgb(153 246 228);
}
</style>
