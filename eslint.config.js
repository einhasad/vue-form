import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default defineConfig(
  { ignores: ['dist/**', 'coverage/**', 'examples/dist/**', 'examples/public/**'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    files: ['**/*.{ts,vue}'],
    rules: {
      // vue-tsc already reports undefined names (typescript-eslint guidance).
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Template formatting only; no formatter policy in this repo.
      'vue/html-indent': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/attributes-order': 'off',
    },
  },
  {
    // Tests mount small inline harness components next to each other.
    files: ['tests/**/*.ts'],
    rules: { 'vue/one-component-per-file': 'off' },
  },
)
