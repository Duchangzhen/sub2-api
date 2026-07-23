<template>
  <div class="min-h-screen bg-white text-gray-900 dark:bg-dark-950 dark:text-white">
    <header class="sticky top-0 z-30 border-b border-gray-200 bg-white/95 dark:border-dark-800 dark:bg-dark-950/95">
      <nav class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <router-link to="/home" class="flex min-w-0 items-center gap-3">
          <img :src="siteLogo || '/logo.png'" alt="" class="h-9 w-9 rounded-lg object-contain" />
          <span class="truncate text-base font-bold">{{ siteName }}</span>
        </router-link>
        <div class="flex items-center gap-1 sm:gap-2">
          <router-link to="/home" class="docs-nav-link"><Icon name="home" size="sm" /><span class="hidden sm:inline">首页</span></router-link>
          <router-link to="/docs" class="docs-nav-link"><Icon name="book" size="sm" /><span class="hidden sm:inline">文档</span></router-link>
          <LocaleSwitcher />
          <router-link :to="accountPath" class="ml-1 inline-flex h-9 items-center rounded-lg bg-gray-900 px-3 text-sm font-semibold text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
            {{ isAuthenticated ? '控制台' : '登录' }}
          </router-link>
        </div>
      </nav>
    </header>

    <main v-if="!activeDoc" class="mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-6 sm:pt-20">
      <header class="mx-auto max-w-3xl text-center">
        <h1 class="text-3xl font-bold leading-tight sm:text-4xl">集成文档 - {{ siteName }}</h1>
        <p class="mx-auto mt-5 text-base leading-8 text-gray-600 dark:text-dark-300 sm:text-lg">
          主流 AI 编程工具的安装与使用教程，支持 Windows、macOS 和 Linux。从注册账号、生成 Key，到接入常用客户端，一步一步写清楚。
        </p>
      </header>
      <section class="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <router-link v-for="doc in docs" :key="doc.slug" :to="`/docs/${doc.slug}`" class="doc-card group">
          <div class="flex items-start justify-between gap-4">
            <span :class="['doc-mark', doc.markClass]">
              <PlatformIcon v-if="doc.logoPlatform" :platform="doc.logoPlatform" size="lg" />
              <span v-else>{{ doc.mark }}</span>
            </span>
            <Icon name="arrowRight" size="md" class="text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-gray-900 dark:group-hover:text-white" />
          </div>
          <div class="mt-6 min-w-0">
            <h2 class="break-words text-xl font-bold">{{ doc.title }}</h2>
            <p class="mt-2 text-sm font-semibold text-gray-500 dark:text-dark-400">{{ doc.vendor }}</p>
            <p class="mt-5 text-sm leading-7 text-gray-600 dark:text-dark-300">{{ doc.description }}</p>
          </div>
          <div class="mt-auto flex flex-wrap gap-2 pt-5">
            <span v-for="tag in doc.tags" :key="tag" class="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-dark-800 dark:text-dark-300">{{ tag }}</span>
          </div>
        </router-link>
      </section>
    </main>

    <main v-else class="mx-auto grid max-w-6xl gap-8 px-5 pb-20 pt-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <article class="min-w-0">
        <router-link to="/docs" class="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-dark-400 dark:hover:text-white">
          <Icon name="arrowLeft" size="sm" />返回文档
        </router-link>
        <header class="border-b border-gray-200 pb-8 dark:border-dark-800">
          <div class="flex items-start gap-5">
            <span :class="['doc-mark', activeDoc.markClass]">
              <PlatformIcon v-if="activeDoc.logoPlatform" :platform="activeDoc.logoPlatform" size="lg" />
              <span v-else>{{ activeDoc.mark }}</span>
            </span>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-gray-500 dark:text-dark-400">{{ activeDoc.vendor }}</p>
              <h1 class="mt-2 break-words text-3xl font-bold sm:text-4xl">{{ activeDoc.title }}</h1>
              <p class="mt-4 text-base leading-8 text-gray-600 dark:text-dark-300">{{ activeDoc.summary }}</p>
            </div>
          </div>
        </header>

        <section class="mt-7 grid gap-3 md:grid-cols-3">
          <div v-for="item in detailFacts" :key="item.label" class="endpoint-card">
            <div class="mb-3 flex items-center gap-2 text-sm font-semibold"><Icon :name="item.icon" size="sm" />{{ item.label }}</div>
            <div class="flex items-start gap-2"><code class="min-w-0 flex-1 break-all rounded bg-gray-50 px-2 py-1.5 text-xs text-gray-700 dark:bg-dark-900 dark:text-dark-200">{{ item.value }}</code><button class="copy-button" title="复制" @click="copy(item.value)"><Icon name="copy" size="sm" /></button></div>
          </div>
        </section>

        <section class="doc-section mt-8">
          <div class="mb-6 flex items-center gap-2"><Icon name="clipboard" size="md" /><h2 class="text-xl font-bold">从注册到生成 Key</h2></div>
          <div class="grid gap-4">
            <div v-for="(step, index) in commonFlow" :key="step.title" class="grid gap-3 border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-dark-800 sm:grid-cols-[32px_minmax(0,1fr)_auto]">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white dark:bg-white dark:text-gray-900">{{ index + 1 }}</span>
              <div><h3 class="font-bold">{{ step.title }}</h3><p class="mt-2 text-sm leading-7 text-gray-600 dark:text-dark-300">{{ step.body }}</p></div>
              <router-link v-if="step.link" :to="step.link" class="inline-flex h-9 items-center gap-1 self-start rounded-lg border border-gray-200 px-3 text-sm font-semibold hover:bg-gray-50 dark:border-dark-700 dark:hover:bg-dark-800">{{ step.linkText }}<Icon name="externalLink" size="xs" /></router-link>
            </div>
          </div>
        </section>

        <section class="mt-5 grid gap-5">
          <div v-for="section in activeDoc.sections" :key="section.title" class="doc-section">
            <h2 class="text-xl font-bold">{{ section.title }}</h2>
            <p class="mt-3 text-sm leading-8 text-gray-600 dark:text-dark-300">{{ section.body }}</p>
            <div v-if="section.commands" class="mt-5 grid gap-4">
              <div v-for="command in section.commands" :key="command.label" class="overflow-hidden rounded-lg bg-gray-950">
                <div class="flex items-center justify-between border-b border-white/10 px-4 py-2.5"><span class="text-xs font-semibold text-gray-300">{{ command.label }}</span><button class="inline-flex h-7 items-center gap-1 rounded bg-gray-800 px-2 text-xs text-gray-200 hover:bg-gray-700" @click="copy(command.code)"><Icon name="copy" size="xs" />复制</button></div>
                <pre class="max-w-full overflow-x-auto px-4 py-4 text-xs leading-6 text-gray-200"><code>{{ command.code }}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </article>

      <aside class="min-w-0">
        <div class="sticky top-24 grid gap-5">
          <section class="doc-section">
            <div class="mb-4 flex items-center gap-2 font-bold"><Icon name="checkCircle" size="md" />接入清单</div>
            <ul class="grid gap-3 text-sm leading-6 text-gray-600 dark:text-dark-300"><li v-for="item in checklist" :key="item" class="flex gap-2"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-900 dark:bg-white"></span>{{ item }}</li></ul>
          </section>
          <section class="doc-section">
            <div class="mb-3 flex items-center gap-2 font-bold"><Icon name="terminal" size="md" />其他教程</div>
            <router-link v-for="doc in otherDocs" :key="doc.slug" :to="`/docs/${doc.slug}`" class="flex items-center justify-between gap-3 border-b border-gray-100 py-2.5 text-sm font-semibold text-gray-600 last:border-0 hover:text-gray-900 dark:border-dark-800 dark:text-dark-300 dark:hover:text-white"><span class="truncate">{{ doc.title }}</span><Icon name="arrowRight" size="xs" /></router-link>
          </section>
          <router-link to="/keys" class="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700"><Icon name="key" size="sm" />去生成 API Key</router-link>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore, useAuthStore } from '@/stores'
import { useClipboard } from '@/composables/useClipboard'
import { commonFlow, createIntegrationDocs } from '@/data/integrationDocs'
import Icon from '@/components/icons/Icon.vue'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import PlatformIcon from '@/components/common/PlatformIcon.vue'

const route = useRoute()
const appStore = useAppStore()
const authStore = useAuthStore()
const { copyToClipboard } = useClipboard()
const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'ACAIM API')
const siteLogo = computed(() => appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '')
const origin = window.location.origin.replace(/\/+$/, '')
const docs = createIntegrationDocs({ claude: origin, openai: `${origin}/v1`, gemini: `${origin}/v1beta` })
const activeDoc = computed(() => docs.find(doc => doc.slug === route.params.slug))
const isAuthenticated = computed(() => authStore.isAuthenticated)
const accountPath = computed(() => isAuthenticated.value ? (authStore.isAdmin ? '/admin/dashboard' : '/dashboard') : '/login')
const otherDocs = computed(() => docs.filter(doc => doc.slug !== activeDoc.value?.slug))
const detailFacts = computed(() => activeDoc.value ? [
  { icon: 'globe' as const, label: activeDoc.value.endpointLabel, value: activeDoc.value.endpoint },
  { icon: 'key' as const, label: 'API Key', value: 'sk-你的本站Key' },
  { icon: 'sparkles' as const, label: '推荐模型', value: activeDoc.value.model }
] : [])
const checklist = ['账号已注册并能进入控制台', 'API Key 管理里已创建 Key', 'Base URL 按工具类型填写正确', '已用简单问题验证调用成功']

function copy(value: string) { copyToClipboard(value, '已复制到剪贴板') }

watch(() => route.params.slug, () => window.scrollTo({ top: 0, behavior: 'smooth' }))
onMounted(() => {
  authStore.checkAuth()
  if (!appStore.publicSettingsLoaded) appStore.fetchPublicSettings()
})
</script>

<style scoped>
.docs-nav-link { @apply inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-dark-300 dark:hover:bg-dark-800 dark:hover:text-white; }
.doc-card { @apply flex min-h-[280px] flex-col rounded-lg border border-gray-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-lg dark:border-dark-800 dark:bg-dark-900 dark:hover:border-dark-700; }
.doc-mark { @apply flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-bold; }
.endpoint-card { @apply rounded-lg border border-gray-200 bg-white p-4 dark:border-dark-800 dark:bg-dark-900; }
.copy-button { @apply flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:border-dark-700 dark:text-dark-300 dark:hover:bg-dark-800 dark:hover:text-white; }
.doc-section { @apply rounded-lg border border-gray-200 bg-white p-5 dark:border-dark-800 dark:bg-dark-900 sm:p-6; }
</style>
