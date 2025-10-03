import { defineI18nConfig } from '#i18n'

export default defineI18nConfig(() => ({
  fallbackLocale: 'en',
  availableLocales: ['en', 'fr'],
}))
