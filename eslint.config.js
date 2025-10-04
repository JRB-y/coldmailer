import prettier from 'eslint-config-prettier'
import vue from 'eslint-plugin-vue'
import prettierPlugin from 'eslint-plugin-prettier'

export default [
  {
    ignores: ['node_modules', 'dist', 'frontend/.nuxt', 'frontend/.output'],
  },
  // JS/TS shared rules
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },
  // Vue-specific rules (frontend only)
  {
    files: ['frontend/**/*.{vue,js,ts}'],
    plugins: { vue },
    rules: {
      ...(vue.configs['vue3-recommended']?.rules ?? {}),
    },
  },
  prettier,
]
