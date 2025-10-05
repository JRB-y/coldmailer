<script setup lang="ts">
import { ref, computed } from 'vue'
import { Loader2, Mail, Phone, MessageSquare } from 'lucide-vue-next'

definePageMeta({
  ssr: false,
})

const { t } = useI18n()
const config = useRuntimeConfig()
const apiUrl = config.public.apiUrl
const { user, token, isAuthenticated } = useAuth()

const name = ref('')
const email = ref('')
const subject = ref('')
const message = ref('')
const submitting = ref(false)
const success = ref('')
const error = ref('')

const isFormValid = computed(() => {
  return name.value.trim() && email.value.trim() && message.value.trim()
})

if (isAuthenticated.value && user.value) {
  name.value = user.value.email
  email.value = user.value.email
}

async function submitContact() {
  if (!isFormValid.value || submitting.value) {
    return
  }

  submitting.value = true
  success.value = ''
  error.value = ''

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }

    const response = await fetch(`${apiUrl}/api/contact`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: name.value.trim(),
        email: email.value.trim(),
        subject: subject.value.trim(),
        message: message.value.trim(),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || t('contact.messages.error'))
    }

    success.value = t('contact.messages.success')
    message.value = ''
    if (!isAuthenticated.value) {
      name.value = ''
      email.value = ''
    }
    subject.value = ''
  } catch (err: any) {
    error.value = err.message || t('contact.messages.error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto">
    <div class="mb-8">
      <UiBackButton />
    </div>

    <div class="grid gap-8 md:grid-cols-[2fr,1fr]">
      <div class="bg-zinc-900 border border-gray-800 rounded-2xl p-6 md:p-8">
        <h1 class="text-3xl font-bold text-white mb-3">{{ t('contact.hero.title') }}</h1>
        <p class="text-gray-400 mb-6">{{ t('contact.hero.subtitle') }}</p>

        <form class="space-y-5" @submit.prevent="submitContact">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-zinc-300" for="contact-name">
                {{ t('contact.form.nameLabel') }}
              </label>
              <input
                id="contact-name"
                v-model="name"
                type="text"
                :placeholder="t('contact.form.namePlaceholder')"
                class="w-full rounded-lg border border-gray-800 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                required
              />
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-zinc-300" for="contact-email">
                {{ t('contact.form.emailLabel') }}
              </label>
              <input
                id="contact-email"
                v-model="email"
                type="email"
                :placeholder="t('contact.form.emailPlaceholder')"
                class="w-full rounded-lg border border-gray-800 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                required
              />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-zinc-300" for="contact-subject">
              {{ t('contact.form.subjectLabel') }}
            </label>
            <input
              id="contact-subject"
              v-model="subject"
              type="text"
              :placeholder="t('contact.form.subjectPlaceholder')"
              class="w-full rounded-lg border border-gray-800 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-zinc-300" for="contact-message">
              {{ t('contact.form.messageLabel') }}
            </label>
            <textarea
              id="contact-message"
              v-model="message"
              rows="6"
              :placeholder="t('contact.form.messagePlaceholder')"
              class="w-full rounded-lg border border-gray-800 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              required
            ></textarea>
          </div>

          <UiButton
            type="submit"
            size="lg"
            class="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
            :disabled="!isFormValid || submitting"
          >
            <Loader2 v-if="submitting" class="w-4 h-4 mr-2 animate-spin" />
            {{ submitting ? t('contact.form.submitting') : t('contact.form.submit') }}
          </UiButton>

          <div v-if="success" class="rounded-lg border border-green-700/50 bg-green-900/20 px-4 py-3 text-sm text-green-300">
            {{ success }}
          </div>
          <div v-if="error" class="rounded-lg border border-red-700/50 bg-red-900/20 px-4 py-3 text-sm text-red-300">
            {{ error }}
          </div>
        </form>
      </div>

      <aside class="space-y-6">
        <div class="bg-zinc-900 border border-gray-800 rounded-2xl p-6">
          <h2 class="text-lg font-semibold text-white mb-4">{{ t('contact.sidebar.title') }}</h2>
          <p class="text-sm text-gray-400 mb-4">{{ t('contact.sidebar.description') }}</p>

          <div class="space-y-4 text-sm text-gray-300">
            <div class="flex items-start gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                <Mail class="w-4 h-4" />
              </span>
              <div>
                <p class="font-semibold text-white">{{ t('contact.sidebar.emailTitle') }}</p>
                <a href="mailto:contact@valixmail.com" class="hover:text-blue-300 transition-colors">
                  contact@valixmail.com
                </a>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                <Phone class="w-4 h-4" />
              </span>
              <div>
                <p class="font-semibold text-white">{{ t('contact.sidebar.responseTitle') }}</p>
                <p class="text-gray-400">{{ t('contact.sidebar.responseDescription') }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3">
              <span class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-400">
                <MessageSquare class="w-4 h-4" />
              </span>
              <div>
                <p class="font-semibold text-white">{{ t('contact.sidebar.feedbackTitle') }}</p>
                <p class="text-gray-400">{{ t('contact.sidebar.feedbackDescription') }}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
