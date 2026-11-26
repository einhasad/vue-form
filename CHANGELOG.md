# Changelog

## [Unreleased]

### Added

- `addFieldValidatorsByPattern(pattern, validators)` (on `FormContext` and the headless `Form`) returns a disposer `() => void` that removes the pattern and the validators it added to registered fields. Call it before re-applying a reloaded schema; calling `addFieldValidatorsByPattern` twice without disposing still duplicates the errors.
- `Field.removeValidator(validator)` and an optional `removeValidator?(validator)` member on `FieldHandle`. A custom `FieldHandle` without it keeps pattern validators after their disposer runs.
- `setFieldErrors(attribute, errors)` returns `true` when a field with that attribute is registered and `false` otherwise. Errors for unknown attributes are still dropped — send them to `setFormErrors` when it returns `false`.
- `FormField` (`./ant-design`) links its label to the control: it passes `html-for` to `<a-form-item>` and exposes a stable `field.id` in the slot. Bind `:id="field.id"` on your control to get a clickable, announced label.
- `FormField` slot `field.errorId`: the id of the rendered error message while the field is invalid, `undefined` otherwise. Bind `:aria-invalid="field.invalid" :aria-describedby="field.errorId"` on inputs and checkboxes so screen readers read the error.
- Types `FormFieldBinding` and `FormFieldSlotProps` (from `@einhasad-vue/vue-form/ant-design`); `FormField`'s default slot is now typed.
- `UseFieldReturn` type for the return value of `useField`.
- `SyncValidator` type — the return type of every built-in rule (exported from `@einhasad-vue/vue-form` and `/headless`).
- `@einhasad-vue/vue-form/package.json` is importable (listed in `exports`).
- `Strings.fieldFallback` (`"This field"`), used as `{attr}` when a rule gets no attribute name: `rules.required()('')` now says "This field cannot be blank" instead of " cannot be blank". Override it with `setStrings({ fieldFallback })`.

### Changed

- Errors set with `setFieldErrors` / `setErrors` / `addError` now survive validation (blur, `validateAll`, `validateAllAsync`) while the field value is unchanged; they are listed before validator errors. Editing the value, `clearErrors()` or setting new errors removes them. Previously the next validation (e.g. blur) wiped them. **What to do:** call `formCtx.clearErrors()` at the start of your submit handler (otherwise last submit's server errors on unchanged fields make `validateAll()` return `false`), and call `clearErrors()` yourself wherever you relied on blur to remove server errors.
- `validateAsync()` / `validateAllAsync()` resolve with the errors for the field's current value: when the value changes while async validators run, the stale result is discarded and validation runs again; overlapping calls resolve with the latest run's result. No action needed.
- `rules.required` and `rules.requiredIf` treat whitespace-only strings as blank. If `'   '` must be accepted, use a custom validator.
- `rules.uniqueIn` skips empty values (`''`, `null`, `undefined`, `[]`) as 0.2.0 promised for every rule; two blank rows no longer collide. Add `rules.required` if blanks must be rejected.
- `rules.numeric` rejects whitespace-only strings and hex / binary / octal literals (`'0x1f'`, `'0b1'`, `'0o7'`). `minNum`, `maxNum`, `between` and `integer` treat them as non-numeric and skip them instead of reading `' '` as `0` or `'0x10'` as `16`. Add `rules.numeric()` to reject them.
- `rules.uuid` accepts the nil (`00000000-0000-0000-0000-000000000000`) and max (`ffffffff-ffff-ffff-ffff-ffffffffffff`) UUIDs (RFC 9562).
- `Strings` is a standalone exported interface (was `typeof` the bundled `en.json`) and gained the required key `fieldFallback`. Code that builds a complete `Strings` object (not `Partial<Strings>`) must add `fieldFallback`; `setStrings(partial)` callers need no change.
- `FormField` renders the error through `<a-form-item>`'s `help` slot as `<span id="…-error">` instead of the `help` prop string. Visible text and antd's `role="alert"` container are unchanged; only CSS or tests that match the exact markup inside `.ant-form-item-explain` see the extra `<span>`.
- Type declarations are now one self-contained file per entry (`dist/index.d.ts`, `dist/headless.d.ts`, `dist/ant-design.d.ts`) plus `.d.cts` twins for `require`, and no declaration maps are shipped. **What to do:** import types only from the package entry points; deep imports of `@einhasad-vue/vue-form/dist/...` declaration paths (never part of `exports`) no longer resolve.
- The `/ant-design` type declarations now resolve (in 0.3.0 they pointed at an unshipped `./FormField.vue` and did not resolve at all), but they require Vue 3.5+: on Vue 3.3 / 3.4 they fail with TS2707 / TS2694. Runtime still supports Vue 3.3+ and the main / `/headless` types work on 3.3+. **What to do:** on Vue 3.3 / 3.4 with the adapter, enable `skipLibCheck` or upgrade to Vue 3.5. `FormField`'s declared emit handlers now return `any` instead of `void` (build moved to `vite-plugin-dts` 4); no source change needed.
- `engines.node` is now `>=20` (Node 18 is end-of-life); CI tests Node 20 and 22. The library code uses no Node API; this only affects installs with `engine-strict`.
- `FormContext.setFieldErrors` now returns `boolean` (was `void`) and `addFieldValidatorsByPattern` on `FormContext` and `Form` returns `() => void` (was `void`). Calling code needs no change. **What to do:** hand-written `FormContext` objects (test doubles, mocks) must return a boolean from `setFieldErrors` and a disposer from `addFieldValidatorsByPattern`; subclasses of `Form` that override `addFieldValidatorsByPattern` must return a disposer.
- Rules called without an attribute name now say "This field cannot be blank" (from `Strings.fieldFallback`) instead of " cannot be blank". **What to do:** update tests or snapshots that match the old text, or pass an `attr` to the rule.
- The `errFormMissing` message now reads "[vue-form] useForm() must be called in a component below useProvideForm() (use useFormOptional() for standalone widgets)" (it named a `<Form>` component that does not exist). Update code or tests that match the old text.

### Fixed

- A rejecting async validator no longer causes an unhandled promise rejection during the sync pass (blur, `validate()`, `validateAll()`).
- `validate()`, `validateAll()` and `validateAllAsync()` called in the same tick as a model change validated the old value; they now read the current model value.
- `useFormOptional()` called outside `setup()` returned `undefined` only after a Vue "inject() can only be used inside setup()" warning; it now returns `undefined` silently, and `useForm()` there throws its own error without the Vue warning.
- `rules.pattern` with a `/g` or `/y` regex no longer alternates between pass and fail; the regex you pass is no longer mutated.
- The `Strings` type is self-contained in the published `.d.ts` (it referenced `en.json`, which is not shipped).
- TypeScript errors when consuming the package with `moduleResolution: node16` / `nodenext` (TS1479, TS2834, missing `./FormField.vue`) or `bundler` (missing `./en.json`); `exports` now lists `types` first with separate declarations for `import` and `require`.

### Deprecated

- `Strings` keys `uniqueServer`, `selectPlaceholder`, `searchPlaceholder`, `currencySymbol`, `nestedAddButton`, `nestedDeleteButton`, `nestedCloneButton`: the library never uses them. They will be removed in 1.0; stop overriding them.

### Docs

- README: the Ant Design section now documents the real single `FormField` wrapper (the 14 widget components and the `disabled` prop it described never existed); every validator factory is listed with its exact semantics; documented that `attribute` / `validators` are read once at mount, that strings are global module state, how long server errors live, and that async validators run but are ignored in the sync pass.
- Development: ESLint (`npm run lint`), demo typecheck (`npm run typecheck:examples`) and `npm run test:coverage` with 100% thresholds; CI runs every gate on Node 20 and 22; a `publish.yml` workflow publishes with npm Trusted Publishing and provenance. The package `homepage` is now the live demo.
- Demo site: shows the real version and release date, works under the `/vue-form/` base, has a "Sections" menu on narrow screens, a skip link and reduced-motion scrolling; example widgets have linked labels and announced errors; the i18n example no longer overwrites the app's strings; the API reference lists every export and every rule; new "Field without a form" example.

## [0.3.0] - 2026-10-22

### Added

- `useFormOptional()` — returns the nearest `FormContext` or `undefined`; never throws and never emits a Vue injection warning. `useForm()` keeps throwing when no form is provided.

### Changed

- `useField` no longer requires a form. Without a `useProvideForm` ancestor it skips registration; `validate`, `validateAsync`, `onBlur`, `errors`, `isInvalid` and `firstError` work locally with the same return shape. Previously it threw `errFormMissing`.
- `ant-design-vue` optional peer range widened to `^3.2.0 || ^4.0.0`.

## [0.2.0] - 2026-04-28

### Added

- Nine new validator factories: `url`, `integer`, `numeric`, `between`, `lengthBetween`, `oneOf`, `sameAs`, `requiredIf`, `uuid`. Same `(args, attr, override)` signature, same skip-on-empty convention, same `key` field on the returned `FieldError`.
- New error strings (`url`, `integer`, `numeric`, `between`, `lengthBetween`, `oneOf`, `sameAs`, `uuid`) — overridable via `setStrings(partial)`. `requiredIf` reuses the existing `required` string.
- `@faker-js/faker`-driven fuzz test suite (`tests/headless/rules.fuzz.test.ts`) — generates 50+ valid/invalid samples per rule using a fixed seed (`0xc0ffee`) for reproducibility.

### Notes

- `sameAs` accepts a plain value or a Vue-ref-like `{ value: unknown }` (same duck-typed pattern as `uniqueIn`) — no Vue import required.
- `requiredIf` takes a getter `() => unknown` so callers can read other fields without coupling the rule to Vue.
- `url` accepts only `http:` and `https:` schemes — `ftp:`, `mailto:`, `javascript:` etc. are rejected.

## [0.1.0] - 2026-04-28

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
