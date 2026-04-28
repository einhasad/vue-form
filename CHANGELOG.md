# Changelog

## 0.2.0 — 2026-04-28

### Added

- Nine new validator factories: `url`, `integer`, `numeric`, `between`, `lengthBetween`, `oneOf`, `sameAs`, `requiredIf`, `uuid`. Same `(args, attr, override)` signature, same skip-on-empty convention, same `key` field on the returned `FieldError`.
- New error strings (`url`, `integer`, `numeric`, `between`, `lengthBetween`, `oneOf`, `sameAs`, `uuid`) — overridable via `setStrings(partial)`. `requiredIf` reuses the existing `required` string.
- `@faker-js/faker`-driven fuzz test suite (`tests/headless/rules.fuzz.test.ts`) — generates 50+ valid/invalid samples per rule using a fixed seed (`0xc0ffee`) for reproducibility.

### Notes

- `sameAs` accepts a plain value or a Vue-ref-like `{ value: unknown }` (same duck-typed pattern as `uniqueIn`) — no Vue import required.
- `requiredIf` takes a getter `() => unknown` so callers can read other fields without coupling the rule to Vue.
- `url` accepts only `http:` and `https:` schemes — `ftp:`, `mailto:`, `javascript:` etc. are rejected.

## 0.1.0 — 2026-04-28

Initial release.

### Architecture

- Headless `Form` and `Field` classes (pure TypeScript, no Vue/DOM/transport coupling).
- Vue layer: `useProvideForm`, `useForm`, `useField`. Module-private injection key — outside callers cannot bypass these helpers.
- Validator factory pack: `required`, `minLen`, `maxLen`, `minNum`, `maxNum`, `pattern`, `email`, `uniqueIn`.
- All user-facing strings live in `headless/strings/en.json` and are overridable via `setStrings(partial)`.
- Optional Ant Design Vue adapter at the `./ant-design` subpath — a single `FormField` scoped-slot wrapper around `<a-form-item>` + `useField`. The main entry stays headless; the adapter is only pulled in if you import from `@einhasad-vue/vue-form/ant-design`.

### Contract

- Validators are plain functions returning `FieldError | undefined | Promise<FieldError | undefined>`. No `ValidateRule` object, no `code` numbers.
- A field exposes `errors: FieldError[]`. Validation collects every failing rule, not stop-at-first.
- The library does not interpret submit-rejection shapes. Consumers translate failures via `formCtx.setFieldErrors` and/or `formCtx.setFormErrors`.
- External / runtime validator injection: `formCtx.setFieldValidators` and `formCtx.addFieldValidator`. Promise-returning validators are awaited on submit.

### Build

- Vite library mode, three entries: main (`@einhasad-vue/vue-form`), headless (`@einhasad-vue/vue-form/headless`), Ant Design adapter (`@einhasad-vue/vue-form/ant-design`).
- ESM + CJS bundles; per-source-file `.d.ts` emitted via `vite-plugin-dts`.
- `vue` is externalized everywhere; `ant-design-vue` and `dayjs` are externalized and listed as optional peer-deps (only required by the `./ant-design` subpath).
