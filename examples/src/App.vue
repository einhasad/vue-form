<template>
  <a-config-provider :theme="antdTheme">
  <header class="ds-header">
    <div class="ds-header__inner">
      <a
        href="/"
        class="ds-header__brand"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          aria-hidden="true"
        >
          <rect
            width="22"
            height="22"
            rx="5"
            fill="#FFC833"
          />
          <path
            d="M6 7h10M6 11h7M6 15h4"
            stroke="#1A1505"
            stroke-width="1.6"
            stroke-linecap="round"
          />
        </svg>
        <span class="ds-header__wordmark">
          <span class="ds-header__wordmark-scope">@einhasad/</span>vue-form
        </span>
        <span class="ds-header__version">v{{ version }}</span>
      </a>
      <nav class="ds-header__nav">
        <a
          href="/"
          class="is-active"
        >Docs</a>
        <a
          href="https://github.com/einhasad/vue-form"
          target="_blank"
          rel="noopener"
        >GitHub</a>
      </nav>
      <div class="ds-header__spacer" />
      <div class="ds-header__tools">
        <a
          class="ds-icon-btn"
          href="https://github.com/einhasad/vue-form"
          aria-label="GitHub"
          target="_blank"
          rel="noopener"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
          ><path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.1.63-1.35-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 015 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0012 2z" /></svg>
        </a>
      </div>
    </div>
  </header>

  <div class="ds-layout ds-layout--no-toc">
    <aside class="ds-sidebar">
      <div class="ds-sidebar__group">
        <span class="ds-caps ds-sidebar__label">Getting started</span>
        <ul>
          <li
            v-for="s in nav.gettingStarted"
            :key="s.id"
          >
            <a
              :href="`#${s.id}`"
              class="ds-sidebar__link"
              :class="{ 'is-active': activeSection === s.id }"
              @click.prevent="scrollTo(s.id)"
            >{{ s.label }}</a>
          </li>
        </ul>
      </div>
      <div class="ds-sidebar__group">
        <span class="ds-caps ds-sidebar__label">Validation</span>
        <ul>
          <li
            v-for="s in nav.validation"
            :key="s.id"
          >
            <a
              :href="`#${s.id}`"
              class="ds-sidebar__link"
              :class="{ 'is-active': activeSection === s.id }"
              @click.prevent="scrollTo(s.id)"
            >{{ s.label }}</a>
          </li>
        </ul>
      </div>
      <div class="ds-sidebar__group">
        <span class="ds-caps ds-sidebar__label">Form orchestration</span>
        <ul>
          <li
            v-for="s in nav.orchestration"
            :key="s.id"
          >
            <a
              :href="`#${s.id}`"
              class="ds-sidebar__link"
              :class="{ 'is-active': activeSection === s.id }"
              @click.prevent="scrollTo(s.id)"
            >{{ s.label }}</a>
          </li>
        </ul>
      </div>
      <div class="ds-sidebar__group">
        <span class="ds-caps ds-sidebar__label">Adapters &amp; patterns</span>
        <ul>
          <li
            v-for="s in nav.adapters"
            :key="s.id"
          >
            <a
              :href="`#${s.id}`"
              class="ds-sidebar__link"
              :class="{ 'is-active': activeSection === s.id }"
              @click.prevent="scrollTo(s.id)"
            >{{ s.label }}</a>
          </li>
        </ul>
      </div>
      <div class="ds-sidebar__group">
        <span class="ds-caps ds-sidebar__label">Real-world</span>
        <ul>
          <li
            v-for="s in nav.realworld"
            :key="s.id"
          >
            <a
              :href="`#${s.id}`"
              class="ds-sidebar__link"
              :class="{ 'is-active': activeSection === s.id }"
              @click.prevent="scrollTo(s.id)"
            >{{ s.label }}</a>
          </li>
        </ul>
      </div>
    </aside>

    <main class="ds-main ds-prose">
      <section class="ds-hero">
        <div class="ds-hero__grid-bg" />
        <div class="ds-hero__content">
          <div class="ds-hero__eyebrow">
            <span class="ds-hero__eyebrow-tag">v{{ version }}</span>
            <span>Headless · Vue 3.3+</span>
          </div>
          <h1 class="ds-hero__title">
            Forms that <em>get out of the way</em>,<br>not forms that fight you.
          </h1>
          <p class="ds-hero__lede">
            A fully headless Vue 3 form library: form state, field state, validation,
            and a wildcard-pattern API for array-field rules. Bring your own UI kit —
            or use the optional Ant Design adapter at
            <code>@einhasad/vue-form/ant-design</code>.
          </p>
          <div class="ds-hero__ctas">
            <div class="ds-install">
              <span class="ds-install__dollar">$</span>
              <span class="ds-install__cmd">{{ installCommand }}</span>
              <button
                class="ds-install__copy"
                :class="{ 'is-copied': installCopied }"
                :aria-label="installCopied ? 'Copied' : 'Copy install command'"
                type="button"
                @click="copyInstallCommand"
              >
                <template v-if="installCopied">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ><path d="M4 10l4 4 8-8" /></svg>
                  <span class="ds-install__copy-label">Copied!</span>
                </template>
                <svg
                  v-else
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ><rect
                  x="7"
                  y="7"
                  width="10"
                  height="10"
                  rx="1.5"
                /><path d="M13 7V4.5A1.5 1.5 0 0011.5 3h-7A1.5 1.5 0 003 4.5v7A1.5 1.5 0 004.5 13H7" /></svg>
              </button>
            </div>
            <a
              class="ds-btn ds-btn--primary"
              href="#basic"
            >Read the docs →</a>
            <a
              class="ds-btn ds-btn--ghost"
              href="https://github.com/einhasad/vue-form"
              target="_blank"
              rel="noopener"
            >GitHub ↗</a>
          </div>
        </div>
      </section>

      <h2
        id="introduction"
        class="demo-section"
      >
        Introduction
      </h2>
      <p class="ds-lede">
        <code>@einhasad/vue-form</code> ships <strong>no components</strong>, no widgets,
        no styling. The main entry is composables, headless classes, and validator factories —
        nothing else.
      </p>
      <p>
        Wrap your form in <code>useProvideForm()</code>, build any widget that calls
        <code>useField</code>, and you have a working form. Want Ant Design?
        Import widgets from <code>@einhasad/vue-form/ant-design</code> — same surface,
        zero antd code in the core bundle.
      </p>

      <div class="ds-concept-grid">
        <a
          href="#basic"
          class="ds-concept-card"
        >
          <span class="ds-concept-card__icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            ><path d="M3 5h14M3 10h14M3 15h8" /></svg>
          </span>
          <h3 class="ds-concept-card__title">Headless core</h3>
          <p class="ds-concept-card__desc">
            <code>Form</code> + <code>Field</code> are pure TypeScript classes.
            A thin Vue layer binds them to reactivity. No DOM, no styles.
          </p>
        </a>
        <a
          href="#server-errors"
          class="ds-concept-card"
        >
          <span class="ds-concept-card__icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            ><path d="M10 3v6M10 13v.01" /><circle
              cx="10"
              cy="10"
              r="7"
            /></svg>
          </span>
          <h3 class="ds-concept-card__title">Transport-agnostic</h3>
          <p class="ds-concept-card__desc">
            Throws what your API throws. The library never inspects rejection shapes —
            you decode 422 envelopes into <code>setFieldErrors</code>.
          </p>
        </a>
        <a
          href="#array-fields"
          class="ds-concept-card"
        >
          <span class="ds-concept-card__icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            ><rect
              x="3"
              y="4"
              width="14"
              height="3"
              rx="1"
            /><rect
              x="3"
              y="9"
              width="14"
              height="3"
              rx="1"
            /><rect
              x="3"
              y="14"
              width="14"
              height="3"
              rx="1"
            /></svg>
          </span>
          <h3 class="ds-concept-card__title">Wildcard validators</h3>
          <p class="ds-concept-card__desc">
            Layer rules onto every row matching a dotted pattern like
            <code>parts.*.sku</code>. New rows pick them up automatically.
          </p>
        </a>
      </div>

      <section
        id="api"
        class="demo-section"
      >
        <h2>API Reference</h2>
        <p>
          The full surface of <code>@einhasad/vue-form</code>: composables you import,
          methods on the <code>FormContext</code>, validator factories, and adapter
          subpaths.
        </p>

        <h3 class="ds-api-heading">
          Composables
        </h3>
        <div class="ds-api-table-wrap">
          <table class="ds-api-table">
            <thead>
              <tr>
                <th>Composable</th>
                <th>Returns</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>useProvideForm()</code></td>
                <td><code>FormContext</code></td>
                <td>Call once at the form root. Provides the context every <code>useField</code> in descendant components finds via <code>inject</code>.</td>
              </tr>
              <tr>
                <td><code>useForm()</code></td>
                <td><code>FormContext</code></td>
                <td>Returns the nearest provided form context. Throws if there isn't one.</td>
              </tr>
              <tr>
                <td><code>useField(opts)</code></td>
                <td><code>{ errors, isInvalid, firstError, validate, validateAsync, onBlur }</code></td>
                <td>Registers a field on mount, unregisters on unmount. <code>opts: { attribute, modelValue, validators? }</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="ds-api-heading">
          FormContext
        </h3>
        <div class="ds-api-table-wrap">
          <table class="ds-api-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>validateAll()</code></td>
                <td><code>() =&gt; boolean</code></td>
                <td>Sync pass across every registered field. Returns <code>true</code> when no errors.</td>
              </tr>
              <tr>
                <td><code>validateAllAsync()</code></td>
                <td><code>() =&gt; Promise&lt;boolean&gt;</code></td>
                <td>Awaits every async validator. Use on submit after <code>validateAll()</code>.</td>
              </tr>
              <tr>
                <td><code>clearErrors()</code></td>
                <td><code>() =&gt; void</code></td>
                <td>Clears every field's errors and the form-level errors list.</td>
              </tr>
              <tr>
                <td><code>setFieldErrors(attr, errors)</code></td>
                <td><code>(string, FieldError[])</code></td>
                <td>Attach error messages to a specific attribute (incl. dotted paths like <code>parts.0.sku</code>). Used to translate server 422 envelopes.</td>
              </tr>
              <tr>
                <td><code>setFormErrors(errors)</code></td>
                <td><code>(FieldError[])</code></td>
                <td>Top-level form errors. Render them however you want.</td>
              </tr>
              <tr>
                <td><code>setFieldValidators(attr, vs)</code></td>
                <td><code>(string, Validator[])</code></td>
                <td>Replace a registered field's validators.</td>
              </tr>
              <tr>
                <td><code>addFieldValidator(attr, v)</code></td>
                <td><code>(string, Validator)</code></td>
                <td>Append one validator to a specific field.</td>
              </tr>
              <tr>
                <td><code>addFieldValidatorsByPattern(p, vs)</code></td>
                <td><code>(string, Validator[])</code></td>
                <td>Layer validators onto every field whose attribute matches a dotted wildcard (<code>parts.*.sku</code>). Forward-applying — new rows pick them up on register.</td>
              </tr>
              <tr>
                <td><code>formErrors</code></td>
                <td><code>Ref&lt;FieldError[]&gt;</code></td>
                <td>Reactive form-level errors.</td>
              </tr>
              <tr>
                <td><code>loading</code></td>
                <td><code>Ref&lt;boolean&gt;</code></td>
                <td>Form-level loading flag. The library does not toggle this — your submit flow does.</td>
              </tr>
              <tr>
                <td><code>fields</code></td>
                <td><code>Ref&lt;FieldHandle[]&gt;</code></td>
                <td>Reactive list of registered fields.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="ds-api-heading">
          Validator factories (<code>rules</code>)
        </h3>
        <div class="ds-api-table-wrap">
          <table class="ds-api-table">
            <thead>
              <tr>
                <th>Factory</th>
                <th>Signature</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>required</code></td>
                <td><code>(attr?, override?)</code></td>
                <td>Fails on <code>null</code> / <code>undefined</code> / empty string.</td>
              </tr>
              <tr>
                <td><code>minLen</code> / <code>maxLen</code></td>
                <td><code>(n, attr?, override?)</code></td>
                <td>Length checks for strings.</td>
              </tr>
              <tr>
                <td><code>minNum</code> / <code>maxNum</code></td>
                <td><code>(n, attr?, override?)</code></td>
                <td>Numeric bounds.</td>
              </tr>
              <tr>
                <td><code>pattern</code></td>
                <td><code>(re, attr?, override?)</code></td>
                <td>RegExp test.</td>
              </tr>
              <tr>
                <td><code>email</code></td>
                <td><code>(attr?, override?)</code></td>
                <td>Loose RFC-style email check.</td>
              </tr>
              <tr>
                <td><code>uniqueIn</code></td>
                <td><code>(siblings, currentIndex, key, override?)</code></td>
                <td>Cross-row uniqueness check inside an array field.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="ds-api-heading">
          Subpaths
        </h3>
        <div class="ds-api-table-wrap">
          <table class="ds-api-table">
            <thead>
              <tr>
                <th>Import</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>@einhasad/vue-form</code></td>
                <td>Main barrel. Composables, classes, validator factories, types. <strong>Zero UI dependencies.</strong></td>
              </tr>
              <tr>
                <td><code>@einhasad/vue-form/headless</code></td>
                <td>Pure TypeScript: <code>Form</code> / <code>Field</code> classes, no Vue. For tests, server, non-Vue contexts.</td>
              </tr>
              <tr>
                <td><code>@einhasad/vue-form/ant-design</code></td>
                <td>Ant Design Vue widget pack. Optional peer-deps: <code>ant-design-vue</code>, <code>dayjs</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section
        id="basic"
        class="demo-section"
      >
        <h2>Basic Example</h2>
        <p>
          The minimal setup: <code>useProvideForm()</code> at the form root, your own
          widget that calls <code>useField</code> for each input, and validators from
          <code>rules.*</code>. No <code>&lt;Form&gt;</code> component — you own the
          submit flow.
        </p>
        <ExampleFrame
          file="BasicExample.vue"
          :source="basicSource"
        >
          <BasicExample />
        </ExampleFrame>
      </section>

      <section
        id="rules"
        class="demo-section"
      >
        <h2>Validation rules</h2>
        <p>
          Every built-in validator factory in one form. <code>rules.required</code>,
          <code>minLen</code>/<code>maxLen</code>, <code>minNum</code>/<code>maxNum</code>,
          <code>pattern</code>, <code>email</code>. All return a <code>FieldError | undefined</code>.
        </p>
        <ExampleFrame
          file="ValidationRulesExample.vue"
          :source="rulesSource"
        >
          <ValidationRulesExample />
        </ExampleFrame>
      </section>

      <section
        id="async"
        class="demo-section"
      >
        <h2>Async validators</h2>
        <p>
          Validators are plain functions — they can be async. Return
          <code>Promise&lt;FieldError | undefined&gt;</code>. Run them on submit
          via <code>validateAllAsync()</code> after sync rules pass.
        </p>
        <div class="ds-callout ds-callout--tip">
          <span class="ds-callout__icon">✓</span>
          <div class="ds-callout__body">
            <div class="ds-callout__title">
              Try it
            </div>
            <p style="margin:0">
              Type a VIN starting with <code>TAKEN</code> and submit. The form blocks
              with the async error, and the badge below shows the server check state.
            </p>
          </div>
        </div>
        <ExampleFrame
          file="AsyncValidatorExample.vue"
          :source="asyncSource"
        >
          <AsyncValidatorExample />
        </ExampleFrame>
      </section>

      <section
        id="i18n"
        class="demo-section"
      >
        <h2>i18n / overriding strings</h2>
        <p>
          One call to <code>setStrings(partial)</code> retargets every built-in error
          message. Type-checked against the canonical <code>Strings</code> shape, so
          you can't typo a key.
        </p>
        <ExampleFrame
          file="I18nExample.vue"
          :source="i18nSource"
        >
          <I18nExample />
        </ExampleFrame>
      </section>

      <section
        id="form-context"
        class="demo-section"
      >
        <h2>FormContext API</h2>
        <p>
          The form context is a plain object. You drive it manually:
          <code>validateAll()</code>, <code>clearErrors()</code>,
          <code>setFieldErrors</code>, <code>setFormErrors</code>. No magic submit
          flow — your code calls these in whatever order makes sense.
        </p>
        <ExampleFrame
          file="FormContextExample.vue"
          :source="formContextSource"
        >
          <FormContextExample />
        </ExampleFrame>
      </section>

      <section
        id="server-errors"
        class="demo-section"
      >
        <h2>Server-side errors (422)</h2>
        <p>
          The library never inspects rejection shapes. You catch the error your API
          throws, decode the field/message envelope, and call
          <code>setFieldErrors</code>. Anything that doesn't match goes to
          <code>setFormErrors</code>.
        </p>
        <div class="ds-callout ds-callout--note">
          <span class="ds-callout__icon">i</span>
          <div class="ds-callout__body">
            <div class="ds-callout__title">
              Try it
            </div>
            <p style="margin:0">
              Type <code>taken</code> as the username and submit. The mock backend
              returns a 422 envelope; the form maps each entry back to the field
              that produced it.
            </p>
          </div>
        </div>
        <ExampleFrame
          file="ServerErrorsExample.vue"
          :source="serverErrorsSource"
        >
          <ServerErrorsExample />
        </ExampleFrame>
      </section>

      <section
        id="array-fields"
        class="demo-section"
      >
        <h2>Array fields + wildcard validators</h2>
        <p>
          There is no <code>&lt;NestedForm&gt;</code>. Render <code>v-for</code>
          with a dotted attribute path (<code>parts.0.sku</code>, <code>parts.1.sku</code>, …)
          and you have an array field. Pair with
          <code>addFieldValidatorsByPattern("parts.*.sku", […])</code> and the rules
          apply to every row — including ones added later.
        </p>
        <ExampleFrame
          file="ArrayFieldsExample.vue"
          :source="arraySource"
        >
          <ArrayFieldsExample />
        </ExampleFrame>
      </section>

      <section
        id="server-schema"
        class="demo-section"
      >
        <h2>Server-driven schemas</h2>
        <p>
          A common pattern: the backend is the source of truth for validation rules.
          Fetch a schema on mount and install validators — including ones for array
          items that don't exist yet.
        </p>
        <ExampleFrame
          file="ServerSchemaExample.vue"
          :source="schemaSource"
        >
          <ServerSchemaExample />
        </ExampleFrame>
      </section>

      <section
        id="custom-widget"
        class="demo-section"
      >
        <h2>Custom widget</h2>
        <p>
          A widget is anything that calls <code>useField</code>. Pass
          <code>attribute</code> and a writable <code>modelValue</code> ref; the
          surrounding context discovers it on mount. Below: a slider widget with
          built-in label + error rendering.
        </p>
        <ExampleFrame
          file="CustomWidgetExample.vue"
          :source="customWidgetSource"
        >
          <CustomWidgetExample />
        </ExampleFrame>
      </section>

      <section
        id="headless"
        class="demo-section"
      >
        <h2>Headless subpath (no Vue)</h2>
        <p>
          Import from <code>@einhasad/vue-form/headless</code> for tests, server-side
          code, or any non-Vue context. Same <code>Form</code> / <code>Field</code>
          classes the Vue layer composes — without <code>vue</code> as a peer-dep.
        </p>
        <ExampleFrame
          file="HeadlessExample.vue"
          :source="headlessSource"
        >
          <HeadlessExample />
        </ExampleFrame>
      </section>

      <section
        id="antd-adapter"
        class="demo-section"
      >
        <h2>Ant Design Vue adapter</h2>
        <p>
          Opt-in widget pack that wraps <code>&lt;a-input&gt;</code>,
          <code>&lt;a-select&gt;</code>, <code>&lt;a-date-picker&gt;</code>, and friends.
          Each widget calls <code>useField</code> internally. <strong>Not
            included unless you import from <code>@einhasad/vue-form/ant-design</code></strong>,
          so the core lib stays free of antd code.
        </p>
        <ExampleFrame
          file="AntdAdapterExample.vue"
          :source="antdSource"
        >
          <AntdAdapterExample />
        </ExampleFrame>
      </section>

      <section
        id="vehicle-mock"
        class="demo-section"
      >
        <h2>Real-world: vehicle form (in-process mock)</h2>
        <p>
          End-to-end form using the antd adapter, with every widget type, an array
          field for parts, async VIN uniqueness, server-driven schema, and 422
          envelope decoding. Backend is a synchronous mock — no network calls.
        </p>
        <AddVehicleAntd />
      </section>

      <section
        id="vehicle-msw"
        class="demo-section"
      >
        <h2>Real-world: vehicle form (MSW server-driven)</h2>
        <p>
          Same shape, but with real <code>fetch()</code> calls intercepted by
          <a
            href="https://mswjs.io/"
            target="_blank"
            rel="noopener"
          >MSW v2</a>.
          The validation schema is fetched on mount; nested 422 errors
          (<code>parts.0.sku</code>) attach to the right row.
        </p>
        <AddVehicleMsw />
      </section>

      <div style="margin-top:56px;padding:20px 0;border-top:1px solid var(--line);display:flex;justify-content:space-between;font-size:13px;color:var(--ink-3);">
        <span>Last updated <time>April 28, 2026</time></span>
        <a
          href="https://github.com/einhasad/vue-form"
          style="color:var(--ink-3);"
          target="_blank"
          rel="noopener"
        >Edit on GitHub ↗</a>
      </div>
    </main>
  </div>

  <footer class="ds-footer">
    <div class="ds-footer__inner">
      <div class="ds-footer__brand">
        <span class="ds-header__brand">
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            aria-hidden="true"
          >
            <rect
              width="22"
              height="22"
              rx="5"
              fill="#FFC833"
            />
            <path
              d="M6 7h10M6 11h7M6 15h4"
              stroke="#1A1505"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
          <span class="ds-header__wordmark"><span class="ds-header__wordmark-scope">@einhasad/</span>vue-form</span>
        </span>
        <p>A headless Vue 3 form library that handles the boring parts. MIT licensed.</p>
      </div>
      <div class="ds-footer__col">
        <h4>Docs</h4>
        <ul>
          <li><a href="#basic">Basic</a></li>
          <li><a href="#rules">Validation rules</a></li>
          <li><a href="#array-fields">Array fields</a></li>
        </ul>
      </div>
      <div class="ds-footer__col">
        <h4>Patterns</h4>
        <ul>
          <li><a href="#server-errors">Server errors</a></li>
          <li><a href="#server-schema">Server schemas</a></li>
          <li><a href="#headless">Headless</a></li>
        </ul>
      </div>
      <div class="ds-footer__col">
        <h4>Community</h4>
        <ul>
          <li>
            <a
              href="https://github.com/einhasad/vue-form"
              target="_blank"
              rel="noopener"
            >GitHub</a>
          </li>
          <li>
            <a
              href="https://github.com/einhasad/vue-form/issues"
              target="_blank"
              rel="noopener"
            >Issues</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="ds-footer__legal">
      <span>© 2026 einhasad · MIT</span>
      <span>Built with vue-form itself.</span>
    </div>
  </footer>
  </a-config-provider>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import ExampleFrame from './components/ExampleFrame.vue'

import BasicExample from './examples/BasicExample.vue'
import ValidationRulesExample from './examples/ValidationRulesExample.vue'
import AsyncValidatorExample from './examples/AsyncValidatorExample.vue'
import I18nExample from './examples/I18nExample.vue'
import FormContextExample from './examples/FormContextExample.vue'
import ServerErrorsExample from './examples/ServerErrorsExample.vue'
import ArrayFieldsExample from './examples/ArrayFieldsExample.vue'
import ServerSchemaExample from './examples/ServerSchemaExample.vue'
import CustomWidgetExample from './examples/CustomWidgetExample.vue'
import HeadlessExample from './examples/HeadlessExample.vue'
import AntdAdapterExample from './examples/AntdAdapterExample.vue'

import AddVehicleAntd from './views/AddVehicleAntd.vue'
import AddVehicleMsw from './views/AddVehicleMsw.vue'

import basicSource from './examples/BasicExample.vue?raw'
import rulesSource from './examples/ValidationRulesExample.vue?raw'
import asyncSource from './examples/AsyncValidatorExample.vue?raw'
import i18nSource from './examples/I18nExample.vue?raw'
import formContextSource from './examples/FormContextExample.vue?raw'
import serverErrorsSource from './examples/ServerErrorsExample.vue?raw'
import arraySource from './examples/ArrayFieldsExample.vue?raw'
import schemaSource from './examples/ServerSchemaExample.vue?raw'
import customWidgetSource from './examples/CustomWidgetExample.vue?raw'
import headlessSource from './examples/HeadlessExample.vue?raw'
import antdSource from './examples/AntdAdapterExample.vue?raw'

const version = '0.1.0'
const installCommand = 'npm install @einhasad/vue-form'

// Match docs design system. Tokens map to vars in design-system.css.
const antdTheme = {
  token: {
    colorPrimary: '#111111',
    colorPrimaryHover: '#000000',
    colorPrimaryActive: '#000000',
    colorPrimaryBg: '#F3F0E8',
    colorPrimaryBgHover: '#E8E4DB',
    colorPrimaryBorder: '#111111',
    colorPrimaryBorderHover: '#000000',
    colorPrimaryText: '#111111',
    colorPrimaryTextHover: '#000000',
    colorPrimaryTextActive: '#000000',
    colorLink: '#111111',
    colorLinkHover: '#3A3A3A',
    colorBorder: '#E8E4DB',
    colorBorderSecondary: '#D3CEC1',
    colorBgContainer: '#FBFAF7',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#FBFAF7',
    colorText: '#111111',
    colorTextSecondary: '#3A3A3A',
    colorTextTertiary: '#6E6A63',
    colorTextQuaternary: '#A09A8E',
    colorError: '#D64545',
    colorErrorBg: '#FCEAEA',
    colorErrorBorder: '#D64545',
    colorWarning: '#7A5500',
    colorSuccess: '#3E8A5B',
    colorInfo: '#2E6BBF',
    borderRadius: 4,
    borderRadiusLG: 6,
    borderRadiusSM: 3,
    borderRadiusXS: 2,
    controlHeight: 34,
    fontFamily:
      "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: 13,
    fontSizeLG: 15,
    fontSizeSM: 12,
    wireframe: false,
    motionDurationMid: '120ms',
  },
  components: {
    Button: {
      controlHeight: 32,
      paddingInline: 14,
      fontWeight: 500,
      defaultBg: '#FFFFFF',
      defaultColor: '#3A3A3A',
      defaultBorderColor: '#E8E4DB',
      defaultHoverBg: '#F3F0E8',
      defaultHoverBorderColor: '#111111',
      defaultHoverColor: '#111111',
      primaryShadow: 'none',
      dangerShadow: 'none',
    },
    Input: {
      paddingBlock: 6,
      paddingInline: 10,
      activeBorderColor: '#111111',
      hoverBorderColor: '#D3CEC1',
      activeShadow: '0 0 0 3px rgba(255, 200, 51, 0.35)',
    },
    InputNumber: {
      activeBorderColor: '#111111',
      hoverBorderColor: '#D3CEC1',
      activeShadow: '0 0 0 3px rgba(255, 200, 51, 0.35)',
    },
    Select: {
      optionSelectedBg: '#F3F0E8',
      optionSelectedColor: '#111111',
      optionActiveBg: '#FBFAF7',
      activeBorderColor: '#111111',
      hoverBorderColor: '#D3CEC1',
    },
    DatePicker: {
      activeBorderColor: '#111111',
      hoverBorderColor: '#D3CEC1',
    },
    Checkbox: {
      colorPrimary: '#111111',
      colorPrimaryHover: '#000000',
    },
    Radio: {
      colorPrimary: '#111111',
      colorPrimaryHover: '#000000',
    },
    Switch: {
      colorPrimary: '#111111',
      colorPrimaryHover: '#000000',
    },
    Form: {
      labelColor: '#3A3A3A',
      labelFontSize: 13,
      itemMarginBottom: 16,
    },
    Alert: {
      defaultPadding: '8px 12px',
    },
    Table: {
      headerBg: '#F3F0E8',
      headerColor: '#3A3A3A',
      borderColor: '#E8E4DB',
    },
  },
}

const nav = {
  gettingStarted: [
    { id: 'introduction', label: 'Introduction' },
    { id: 'api', label: 'API Reference' },
    { id: 'basic', label: 'Basic Example' },
  ],
  validation: [
    { id: 'rules', label: 'Validation rules' },
    { id: 'async', label: 'Async validators' },
    { id: 'i18n', label: 'i18n / strings' },
  ],
  orchestration: [
    { id: 'form-context', label: 'FormContext API' },
    { id: 'server-errors', label: 'Server errors (422)' },
    { id: 'array-fields', label: 'Array fields' },
    { id: 'server-schema', label: 'Server schemas' },
  ],
  adapters: [
    { id: 'custom-widget', label: 'Custom widget' },
    { id: 'headless', label: 'Headless subpath' },
    { id: 'antd-adapter', label: 'Ant Design adapter' },
  ],
  realworld: [
    { id: 'vehicle-mock', label: 'Vehicle (mock)' },
    { id: 'vehicle-msw', label: 'Vehicle (MSW)' },
  ],
}

const allSections = [
  ...nav.gettingStarted,
  ...nav.validation,
  ...nav.orchestration,
  ...nav.adapters,
  ...nav.realworld,
].map((s) => s.id)

const activeSection = ref(allSections[0] ?? 'introduction')

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeSection.value = id
  }
}

function updateActiveSection() {
  const y = window.scrollY + 150
  for (let i = allSections.length - 1; i >= 0; i--) {
    const el = document.getElementById(allSections[i])
    if (el && el.offsetTop <= y) {
      activeSection.value = allSections[i]
      break
    }
  }
}

const installCopied = ref(false)
let installCopiedTimer: ReturnType<typeof setTimeout> | null = null

async function copyInstallCommand() {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(installCommand)
    } else {
      const ta = document.createElement('textarea')
      ta.value = installCommand
      ta.setAttribute('readonly', '')
      ta.style.position = 'absolute'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    installCopied.value = true
    if (installCopiedTimer) clearTimeout(installCopiedTimer)
    installCopiedTimer = setTimeout(() => {
      installCopied.value = false
    }, 1500)
  } catch {
    installCopied.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveSection)
  updateActiveSection()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveSection)
})
</script>
