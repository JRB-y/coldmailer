<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ChevronDown, UserRound, Mail, Coins, Languages } from 'lucide-vue-next'

const { user, isAuthenticated, logout } = useAuth()
const router = useRouter()
const { t, locale, locales } = useI18n()
const localePath = useLocalePath()

const isMenuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const isLangMenuOpen = ref(false)
const langMenuRef = ref<HTMLElement | null>(null)

function toggleMenu() {
  const nextState = !isMenuOpen.value
  isMenuOpen.value = nextState
  if (nextState) {
    closeLangMenu()
  }
}

function closeMenu() {
  isMenuOpen.value = false
}

function closeLangMenu() {
  isLangMenuOpen.value = false
}

async function handleLogout() {
  closeMenu()
  closeLangMenu()
  await logout()
  const target = localePath('/')
  router.push(target)
}

function handleDocumentClick(event: MouseEvent) {
  const target = event.target as Node | null
  if (isMenuOpen.value && menuRef.value && target && !menuRef.value.contains(target)) {
    closeMenu()
  }
  if (isLangMenuOpen.value && langMenuRef.value && target && !langMenuRef.value.contains(target)) {
    closeLangMenu()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeMenu()
    closeLangMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
})
</script>
<template>
  <header class="py-6 px-4 sm:px-6 border-b border-gray-800">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
      <NuxtLink class="text-2xl font-bold text-white flex items-center gap-2" :to="localePath('/')">
        <img src="/logo-mobile.png" alt="Valix Logo" class="h-9 w-auto inline-block" />
        <div
          class="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-3xl"
        >
          Valix
        </div>
        <!-- <img src="/logo.png" alt="Valix Logo" class="hidden h-9 w-auto sm:inline-block" /> -->
      </NuxtLink>
      <!-- Navigation -->
      <ClientOnly>
        <template #fallback>
          <div class="h-10 w-[140px]"></div>
        </template>
        <div class="flex items-center gap-4 sm:gap-6">
          <template v-if="isAuthenticated && user">
            <div ref="menuRef" class="relative">
              <button
                type="button"
                @click="toggleMenu"
                :aria-expanded="isMenuOpen"
                aria-haspopup="true"
                class="group flex items-center gap-2 rounded-full border border-gray-800/80 bg-zinc-900/70 px-2 py-2 text-left shadow-lg shadow-blue-500/5 transition-colors hover:border-blue-500/60 hover:bg-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 relative"
              >
                <span
                  class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 transition-colors group-hover:bg-blue-500/20 group-hover:text-blue-300"
                >
                  <UserRound class="h-4 w-4" />
                </span>
                <ChevronDown
                  :class="[
                    'h-4 w-4 text-gray-400 transition-transform duration-200',
                    isMenuOpen ? 'rotate-180 text-white' : '',
                  ]"
                />
              </button>

              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-1"
              >
                <div
                  v-if="isMenuOpen"
                  class="absolute right-0 top-full z-50 mt-3 w-52 rounded-xl border border-gray-800/80 bg-zinc-950/95 p-2 shadow-xl shadow-blue-500/10 backdrop-blur"
                  role="menu"
                >
                  <div
                    class="rounded-lg border border-gray-800/60 bg-zinc-900/80 px-3 py-3 text-sm text-gray-300"
                  >
                    <div class="flex items-center gap-2">
                      <Mail class="h-4 w-4 text-blue-400" />
                      <span class="truncate">{{ user.email }}</span>
                    </div>
                    <div class="mt-2 flex items-center gap-2 text-blue-300">
                      <Coins class="h-4 w-4" />
                      <span class="font-semibold">
                        {{
                          t('header.menu.credits', {
                            credits: Intl.NumberFormat(locale).format(user.credits || 0),
                          })
                        }}
                      </span>
                    </div>
                  </div>
                  <div class="mt-2 space-y-1">
                    <NuxtLink
                      :to="localePath('/dashboard')"
                      class="block rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-zinc-800 hover:text-white"
                      role="menuitem"
                      @click="closeMenu"
                    >
                      {{ t('header.menu.dashboard') }}
                    </NuxtLink>
                    <NuxtLink
                      :to="localePath('/history')"
                      class="block rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-zinc-800 hover:text-white"
                      role="menuitem"
                      @click="closeMenu"
                    >
                      {{ t('header.menu.history') }}
                    </NuxtLink>
                    <NuxtLink
                      :to="localePath('/bulk')"
                      class="block rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-zinc-800 hover:text-white"
                      role="menuitem"
                      @click="closeMenu"
                    >
                      {{ t('header.menu.bulk') }}
                    </NuxtLink>
                    <div class="my-2 h-px bg-gray-800"></div>
                    <NuxtLink
                      :to="localePath('/pricing')"
                      class="block rounded-lg px-3 py-2 text-sm bg-blue-600/10 text-blue-400 transition-colors hover:bg-blue-600/20 hover:text-blue-300"
                      role="menuitem"
                      @click="closeMenu"
                    >
                      {{ t('header.menu.buyCredits') }}
                    </NuxtLink>
                    <button
                      type="button"
                      class="block w-full rounded-lg text-red-600 px-3 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-zinc-800"
                      role="menuitem"
                      @click="handleLogout"
                    >
                      {{ t('header.menu.logout') }}
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </template>
          <template v-else>
            <div class="flex items-center gap-3 relative">
              <NuxtLink
                :to="localePath('/blog')"
                class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Blog
              </NuxtLink>
              <NuxtLink
                :to="localePath('/pricing')"
                class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </NuxtLink>
              <NuxtLink
                :to="localePath('/auth/login')"
                class="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                {{ t('header.auth.login') }}
              </NuxtLink>
              <NuxtLink
                :to="localePath('/auth/signup')"
                class="px-6 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {{ t('header.auth.signup') }}
              </NuxtLink>
            </div>
          </template>
        </div>
      </ClientOnly>
    </div>
  </header>
</template>
