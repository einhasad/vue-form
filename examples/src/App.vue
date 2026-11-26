<template>
  <a-config-provider :theme="antdTheme">
  <a
    class="ds-skip-link"
    href="#main"
  >Skip to content</a>
  <header class="ds-header">
    <div class="ds-header__inner">
      <a
        :href="baseUrl"
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
          <span class="ds-header__wordmark-scope">{{ libScope }}</span>{{ libShortName }}
        </span>
        <span class="ds-header__version">v{{ version }}</span>
      </a>
      <nav class="ds-header__nav">
        <a
          href="#introduction"
          class="is-active"
          @click.prevent="scrollTo('introduction')"
        >Docs</a>
        <a
          href="https://github.com/einhasad/vue-form"
          class="ds-header__gh-text"
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
      <nav aria-label="Sections">
        <div
          v-for="group in navGroups"
          :key="group.label"
          class="ds-sidebar__group"
        >
          <span class="ds-caps ds-sidebar__label">{{ group.label }}</span>
          <ul>
            <li
              v-for="s in group.items"
              :key="s.id"
            >
              <a
                :href="`#${s.id}`"
                class="ds-sidebar__link"
                :class="{ 'is-active': activeSection === s.id }"
                :aria-current="activeSection === s.id ? 'location' : undefined"
                @click.prevent="scrollTo(s.id)"
              >{{ s.label }}</a>
            </li>
          </ul>
        </div>
      </nav>
    </aside>

    <main
      id="main"
      class="ds-main ds-prose"
    >
      <details
        ref="mobileNav"
        class="ds-mobile-nav"
      >
        <summary class="ds-mobile-nav__summary">
          Sections
        </summary>
        <nav aria-label="Sections">
          <div
            v-for="group in navGroups"
            :key="group.label"
            class="ds-mobile-nav__group"
          >
            <span class="ds-caps ds-sidebar__label">{{ group.label }}</span>
            <ul>
              <li
                v-for="s in group.items"
                :key="s.id"
              >
                <a
                  :href="`#${s.id}`"
                  class="ds-sidebar__link"
                  :class="{ 'is-active': activeSection === s.id }"
                  :aria-current="activeSection === s.id ? 'location' : undefined"
                  @click.prevent="scrollFromMobileNav(s.id)"
                >{{ s.label }}</a>
              </li>
            </ul>
          </div>
        </nav>
      </details>

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
            <code>{{ libName }}/ant-design</code>.
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
        The main entry of <code>{{ libName }}</code> ships <strong>no components</strong>,
        no widgets, no styling: composables, validator factories, strings and types. The
        <code>Form</code> / <code>Field</code> classes live in <code>{{ libName }}/headless</code>.
      </p>
      <p>
        Wrap your form in <code>useProvideForm()</code>, build any widget that calls
        <code>useField</code>, and you have a working form. Want Ant Design?
        <code>{{ libName }}/ant-design</code> exports one component, <code>FormField</code>:
        a scoped-slot wrapper around <code>&lt;a-form-item&gt;</code> that calls
        <code>useField</code> and hands your antd control <code>{ field }</code>
        (<code>value</code>, <code>status</code>, <code>onBlur</code>, errors). Zero antd code in the main entry.
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
          The full surface of <code>{{ libName }}</code>: composables you import,
          methods on the <code>FormContext</code>, validator factories, strings, and
          subpaths.
        </p>

        <h3 class="ds-api-heading">
          Composables
        </h3>
        <div
          class="ds-api-table-wrap"
          role="region"
          aria-label="Composables table"
          tabindex="0"
        >
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
                <td><code>useFormOptional()</code></td>
                <td><code>FormContext | undefined</code></td>
                <td>Same lookup as <code>useForm()</code>, but returns <code>undefined</code> without a provider. Never throws, no injection warning. For widgets that also work standalone.</td>
              </tr>
              <tr>
                <td><code>useField(opts)</code></td>
                <td><code>{ errors, isInvalid, firstError, validate, validateAsync, onBlur }</code></td>
                <td>Inside a form: registers on mount, unregisters on unmount. Without a form: skips registration and validates locally with the same return shape. <code>opts: { attribute, modelValue, validators? }</code>; <code>attribute</code> and <code>validators</code> are read once at setup.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="ds-api-heading">
          FormContext
        </h3>
        <div
          class="ds-api-table-wrap"
          role="region"
          aria-label="FormContext members table"
          tabindex="0"
        >
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
                <td><code>hasErrors()</code></td>
                <td><code>() =&gt; boolean</code></td>
                <td><code>true</code> when any registered field currently has errors. Does not run validators.</td>
              </tr>
              <tr>
                <td><code>clearErrors()</code></td>
                <td><code>() =&gt; void</code></td>
                <td>Clears every field's errors and the form-level errors list.</td>
              </tr>
              <tr>
                <td><code>getField(attr)</code></td>
                <td><code>(string) =&gt; FieldHandle | undefined</code></td>
                <td>The registered field with that exact attribute, if any.</td>
              </tr>
              <tr>
                <td><code>setFieldErrors(attr, errors)</code></td>
                <td><code>(string, FieldError[]) =&gt; boolean</code></td>
                <td>Attach error messages to a registered attribute (incl. dotted paths like <code>parts.0.sku</code>). Used to translate server 422 envelopes. Returns <code>false</code> when no field has that attribute; send those to <code>setFormErrors</code>.</td>
              </tr>
              <tr>
                <td><code>setFormErrors(errors)</code></td>
                <td><code>(FieldError[]) =&gt; void</code></td>
                <td>Top-level form errors. Render them however you want.</td>
              </tr>
              <tr>
                <td><code>setFieldValidators(attr, vs)</code></td>
                <td><code>(string, Validator[]) =&gt; void</code></td>
                <td>Replace a registered field's validators.</td>
              </tr>
              <tr>
                <td><code>addFieldValidator(attr, v)</code></td>
                <td><code>(string, Validator) =&gt; void</code></td>
                <td>Append one validator to a specific field.</td>
              </tr>
              <tr>
                <td><code>addFieldValidatorsByPattern(p, vs)</code></td>
                <td><code>(string, Validator[]) =&gt; () =&gt; void</code></td>
                <td>Layer validators onto every field whose attribute matches a dotted wildcard (<code>parts.*.sku</code>). Forward-applying — new rows pick them up on register. Returns a disposer that removes the pattern and its validators; call it before installing a new schema.</td>
              </tr>
              <tr>
                <td><code>register(h)</code> / <code>unregister(h)</code></td>
                <td><code>(FieldHandle) =&gt; void</code></td>
                <td><code>useField</code> calls these for you. Call them yourself only for a hand-written <code>FieldHandle</code>.</td>
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
        <div
          class="ds-api-table-wrap"
          role="region"
          aria-label="Validator factories table"
          tabindex="0"
        >
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
                <td>Fails on <code>null</code>, <code>undefined</code>, <code>''</code>, whitespace-only strings and <code>[]</code>. <code>0</code> and <code>false</code> pass, so a must-tick checkbox needs a custom validator.</td>
              </tr>
              <tr>
                <td><code>requiredIf</code></td>
                <td><code>(predicate, attr?, override?)</code></td>
                <td>Same blank check as <code>required</code>, only while <code>predicate()</code> is truthy (called on every validation). Key <code>requiredIf</code>, message from the <code>required</code> string.</td>
              </tr>
              <tr>
                <td><code>minLen</code> / <code>maxLen</code></td>
                <td><code>(n, attr?, override?)</code></td>
                <td>String length at least / at most <code>n</code>. Non-string values pass.</td>
              </tr>
              <tr>
                <td><code>lengthBetween</code></td>
                <td><code>(min, max, attr?, override?)</code></td>
                <td>String length within <code>min</code>..<code>max</code>, inclusive. Non-string values pass.</td>
              </tr>
              <tr>
                <td><code>minNum</code> / <code>maxNum</code></td>
                <td><code>(n, attr?, override?)</code></td>
                <td>Number or numeric string at least / at most <code>n</code>. Non-numeric values pass; pair with <code>numeric</code>.</td>
              </tr>
              <tr>
                <td><code>between</code></td>
                <td><code>(min, max, attr?, override?)</code></td>
                <td>Number or numeric string within <code>min</code>..<code>max</code>, inclusive. Non-numeric values pass.</td>
              </tr>
              <tr>
                <td><code>integer</code></td>
                <td><code>(attr?, override?)</code></td>
                <td>Number or numeric string must be a whole number. Non-numeric values pass.</td>
              </tr>
              <tr>
                <td><code>numeric</code></td>
                <td><code>(attr?, override?)</code></td>
                <td>Finite number or decimal number string. Hex/binary/octal literals (<code>0x1F</code>), whitespace-only strings and other types fail.</td>
              </tr>
              <tr>
                <td><code>pattern</code></td>
                <td><code>(re, attr?, override?)</code></td>
                <td>String must match <code>re</code>; <code>/g</code> and <code>/y</code> flags are safe. Non-string values pass.</td>
              </tr>
              <tr>
                <td><code>email</code></td>
                <td><code>(attr?, override?)</code></td>
                <td>Loose <code>local@domain.tld</code> check, no whitespace. Non-string values pass.</td>
              </tr>
              <tr>
                <td><code>url</code></td>
                <td><code>(attr?, override?)</code></td>
                <td>Absolute <code>http:</code> / <code>https:</code> URL. Other schemes fail. Non-string values pass.</td>
              </tr>
              <tr>
                <td><code>uuid</code></td>
                <td><code>(attr?, override?)</code></td>
                <td>Canonical 8-4-4-4-12 hex UUID, versions 1–8 plus the nil and max UUIDs, any case. Non-string values pass.</td>
              </tr>
              <tr>
                <td><code>oneOf</code></td>
                <td><code>(allowed, attr?, override?)</code></td>
                <td>Value must be strictly equal (<code>includes</code>) to one of <code>allowed</code>.</td>
              </tr>
              <tr>
                <td><code>sameAs</code></td>
                <td><code>(other, attr?, override?)</code></td>
                <td>Strictly equal to <code>other</code>: a plain value or a ref-like <code>{ value }</code> read on every validation.</td>
              </tr>
              <tr>
                <td><code>uniqueIn</code></td>
                <td><code>(siblings, currentIndex, key, override?)</code></td>
                <td>No other row in <code>siblings</code> (array or ref-like <code>{ value }</code>, read on every validation) has the same <code>[key]</code>. Message uses <code>{value}</code>, key <code>unique</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          All {{ ruleCount }} factories return <code>FieldError | undefined</code> with <code>key</code>
          set to the rule name. Every rule except <code>required</code> and <code>requiredIf</code>
          skips empty values (<code>null</code>, <code>undefined</code>, <code>''</code>, <code>[]</code>),
          so pair them with <code>required</code>. Without an <code>attr</code>, messages use the
          <code>fieldFallback</code> string ("This field").
        </p>

        <h3 class="ds-api-heading">
          Strings
        </h3>
        <div
          class="ds-api-table-wrap"
          role="region"
          aria-label="Strings functions table"
          tabindex="0"
        >
          <table class="ds-api-table">
            <thead>
              <tr>
                <th>Function</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>setStrings(partial)</code></td>
                <td><code>(Partial&lt;Strings&gt;) =&gt; void</code></td>
                <td>Overrides message templates. Keys are type-checked against <code>Strings</code>.</td>
              </tr>
              <tr>
                <td><code>getStrings()</code></td>
                <td><code>() =&gt; Readonly&lt;Strings&gt;</code></td>
                <td>The current templates.</td>
              </tr>
              <tr>
                <td><code>resetStrings()</code></td>
                <td><code>() =&gt; void</code></td>
                <td>Back to the English defaults.</td>
              </tr>
              <tr>
                <td><code>interpolate(template, params)</code></td>
                <td><code>(string, Record&lt;string, unknown&gt;?) =&gt; string</code></td>
                <td>Replaces <code>{name}</code> placeholders; missing params become empty. Useful in custom validators.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="ds-callout ds-callout--note">
          <span class="ds-callout__icon">i</span>
          <div class="ds-callout__body">
            <div class="ds-callout__title">
              Strings are global
            </div>
            <p style="margin:0">
              <code>setStrings</code> changes one module-level table shared by every app instance
              and every SSR request in the process. Call it once at boot.
              <code>fieldFallback</code> ("This field") replaces <code>{attr}</code> when a rule has no label.
              Deprecated, unused by the library and removed in 1.0: <code>selectPlaceholder</code>,
              <code>searchPlaceholder</code>, <code>currencySymbol</code>, <code>nestedAddButton</code>,
              <code>nestedDeleteButton</code>, <code>nestedCloneButton</code>, <code>uniqueServer</code>.
            </p>
          </div>
        </div>

        <h3 class="ds-api-heading">
          Types
        </h3>
        <div
          class="ds-api-table-wrap"
          role="region"
          aria-label="Types table"
          tabindex="0"
        >
          <table class="ds-api-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Entry</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>FormContext</code></td>
                <td>main</td>
                <td>Return type of <code>useProvideForm</code> / <code>useForm</code> (members above).</td>
              </tr>
              <tr>
                <td><code>UseFieldOptions</code></td>
                <td>main</td>
                <td><code>{ attribute, modelValue, validators? }</code> passed to <code>useField</code>.</td>
              </tr>
              <tr>
                <td><code>UseFieldReturn</code></td>
                <td>main</td>
                <td><code>{ errors, isInvalid, firstError, validate, validateAsync, onBlur }</code> returned by <code>useField</code>.</td>
              </tr>
              <tr>
                <td><code>Validator</code></td>
                <td>main, /headless</td>
                <td><code>(value) =&gt; FieldError | undefined | Promise&lt;…&gt;</code>. Any sync or async validator.</td>
              </tr>
              <tr>
                <td><code>SyncValidator</code></td>
                <td>main, /headless</td>
                <td><code>(value) =&gt; FieldError | undefined</code>. What every <code>rules.*</code> factory returns.</td>
              </tr>
              <tr>
                <td><code>FieldError</code></td>
                <td>main, /headless</td>
                <td><code>{ message, key?, … }</code>. Open shape; extend via interface merging.</td>
              </tr>
              <tr>
                <td><code>FieldHandle</code></td>
                <td>main, /headless</td>
                <td>What a form registers: <code>attribute</code>, <code>errors</code>, validate and error-setting methods.</td>
              </tr>
              <tr>
                <td><code>Strings</code></td>
                <td>main, /headless</td>
                <td>Every message template key accepted by <code>setStrings</code>.</td>
              </tr>
              <tr>
                <td><code>FormFieldBinding</code></td>
                <td>/ant-design</td>
                <td>The slot <code>field</code>: <code>value</code>, <code>onBlur</code>, <code>invalid</code>, <code>status</code>, <code>firstError</code>, <code>errors</code>, <code>id</code>, <code>errorId</code>.</td>
              </tr>
              <tr>
                <td><code>FormFieldSlotProps</code></td>
                <td>/ant-design</td>
                <td><code>{ field: FormFieldBinding }</code>, the default slot props of <code>FormField</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="ds-api-heading">
          Subpaths
        </h3>
        <div
          class="ds-api-table-wrap"
          role="region"
          aria-label="Subpaths table"
          tabindex="0"
        >
          <table class="ds-api-table">
            <thead>
              <tr>
                <th>Import</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>{{ libName }}</code></td>
                <td>Main entry: composables, validator factories (<code>rules</code>), strings, types. <strong>Zero UI dependencies.</strong> <code>vue</code> is a peer dependency.</td>
              </tr>
              <tr>
                <td><code>{{ libName }}/headless</code></td>
                <td>Pure TypeScript: the <code>Form</code> / <code>Field</code> classes (only exported here), <code>rules</code>, strings. No Vue import at runtime. For tests, server, non-Vue contexts.</td>
              </tr>
              <tr>
                <td><code>{{ libName }}/ant-design</code></td>
                <td>One component, <code>FormField</code>: an <code>&lt;a-form-item&gt;</code> wrapper whose default slot receives <code>{ field }</code> for any antd control. Optional peer dependencies: <code>ant-design-vue</code>, <code>dayjs</code>.</td>
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
          The everyday factories in one form: <code>rules.required</code>,
          <code>minLen</code>/<code>maxLen</code>, <code>minNum</code>/<code>maxNum</code>,
          <code>pattern</code>, <code>email</code>. All return a <code>FieldError | undefined</code>.
          The <a href="#api">API reference</a> lists all {{ ruleCount }} factories.
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
          you can't typo a key. <code>setStrings</code> and <code>resetStrings</code> change
          messages globally: the table is module-level, shared by every app instance and
          every SSR request in the process.
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
        id="standalone-field"
        class="demo-section"
      >
        <h2>Field without a form</h2>
        <p>
          <code>useField</code> works without <code>useProvideForm()</code>: it skips
          registration and validates locally with the same return shape. A widget that
          should behave either way asks <code>useFormOptional()</code>, which returns
          <code>undefined</code> instead of throwing.
        </p>
        <ExampleFrame
          file="StandaloneFieldExample.vue"
          :source="standaloneSource"
        >
          <StandaloneFieldExample />
        </ExampleFrame>
      </section>

      <section
        id="headless"
        class="demo-section"
      >
        <h2>Headless subpath (no Vue)</h2>
        <p>
          Import from <code>{{ libName }}/headless</code> for tests, server-side
          code, or any non-Vue context. Same <code>Form</code> / <code>Field</code>
          classes the Vue layer composes, with no Vue import at runtime
          (<code>vue</code> stays a peer dependency of the package).
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
          One opt-in component, <code>FormField</code>, wraps <code>&lt;a-form-item&gt;</code>
          and calls <code>useField</code> for you. Put any antd control in its default slot
          and bind the slot's <code>{ field }</code>: <code>v-model:value="field.value"</code>,
          <code>:status="field.status"</code>, <code>@blur="field.onBlur"</code>, plus
          <code>:id="field.id"</code> so the label points at the control. For text inputs also bind
          <code>:aria-invalid="field.invalid"</code> and <code>:aria-describedby="field.errorId"</code>
          (the id of the rendered error, <code>undefined</code> while valid). <code>&lt;a-select&gt;</code>
          and the date/time pickers accept only <code>:id</code>: ant-design-vue drops <code>aria-*</code>
          attributes on them. <strong>Not
            included unless you import from <code>{{ libName }}/ant-design</code></strong>,
          so the main entry stays free of antd code.
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
        <span>v{{ version }} released <time :datetime="releaseDate">{{ releaseDateLabel }}</time></span>
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
          <span class="ds-header__wordmark"><span class="ds-header__wordmark-scope">{{ libScope }}</span>{{ libShortName }}</span>
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
      <span>© {{ releaseYear }} einhasad · MIT</span>
      <span>Built with vue-form itself.</span>
    </div>
  </footer>
  </a-config-provider>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { rules } from '@einhasad-vue/vue-form'
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
import StandaloneFieldExample from './examples/StandaloneFieldExample.vue'

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
import standaloneSource from './examples/StandaloneFieldExample.vue?raw'

const libName = __LIB_NAME__
const version = __LIB_VERSION__
const releaseDate = __LIB_RELEASE_DATE__
const releaseYear = releaseDate.slice(0, 4)
const releaseDateLabel = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
}).format(new Date(`${releaseDate}T00:00:00Z`))
const libScope = libName.includes('/') ? libName.slice(0, libName.indexOf('/') + 1) : ''
const libShortName = libName.slice(libScope.length)
const baseUrl = import.meta.env.BASE_URL
const installCommand = `npm install ${libName}`
const ruleCount = Object.keys(rules).length

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
    colorBorder: '#8C877C',
    colorBorderSecondary: '#D3CEC1',
    colorBgContainer: '#FBFAF7',
    colorBgElevated: '#FFFFFF',
    colorBgLayout: '#FBFAF7',
    colorText: '#111111',
    colorTextSecondary: '#3A3A3A',
    colorTextTertiary: '#6E6A63',
    colorTextQuaternary: '#A09A8E',
    colorError: '#C03535',
    colorErrorBg: '#FCEAEA',
    colorErrorBorder: '#C03535',
    colorWarning: '#7A5500',
    colorSuccess: '#2F7A4B',
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
      hoverBorderColor: '#6E6A63',
      activeShadow: '0 0 0 3px rgba(255, 200, 51, 0.35)',
    },
    InputNumber: {
      activeBorderColor: '#111111',
      hoverBorderColor: '#6E6A63',
      activeShadow: '0 0 0 3px rgba(255, 200, 51, 0.35)',
    },
    Select: {
      optionSelectedBg: '#F3F0E8',
      optionSelectedColor: '#111111',
      optionActiveBg: '#FBFAF7',
      activeBorderColor: '#111111',
      hoverBorderColor: '#6E6A63',
    },
    DatePicker: {
      activeBorderColor: '#111111',
      hoverBorderColor: '#6E6A63',
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

const navGroups = [
  {
    label: 'Getting started',
    items: [
      { id: 'introduction', label: 'Introduction' },
      { id: 'api', label: 'API Reference' },
      { id: 'basic', label: 'Basic Example' },
    ],
  },
  {
    label: 'Validation',
    items: [
      { id: 'rules', label: 'Validation rules' },
      { id: 'async', label: 'Async validators' },
      { id: 'i18n', label: 'i18n / strings' },
    ],
  },
  {
    label: 'Form orchestration',
    items: [
      { id: 'form-context', label: 'FormContext API' },
      { id: 'server-errors', label: 'Server errors (422)' },
      { id: 'array-fields', label: 'Array fields' },
      { id: 'server-schema', label: 'Server schemas' },
    ],
  },
  {
    label: 'Adapters & patterns',
    items: [
      { id: 'custom-widget', label: 'Custom widget' },
      { id: 'standalone-field', label: 'Field without a form' },
      { id: 'headless', label: 'Headless subpath' },
      { id: 'antd-adapter', label: 'Ant Design adapter' },
    ],
  },
  {
    label: 'Real-world',
    items: [
      { id: 'vehicle-mock', label: 'Vehicle (mock)' },
      { id: 'vehicle-msw', label: 'Vehicle (MSW)' },
    ],
  },
]

const allSections = navGroups.flatMap((g) => g.items.map((s) => s.id))

const activeSection = ref(allSections[0] ?? 'introduction')

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
  history.replaceState(null, '', `#${id}`)
  activeSection.value = id
}

const mobileNav = ref<HTMLDetailsElement | null>(null)

function scrollFromMobileNav(id: string) {
  if (mobileNav.value) mobileNav.value.open = false
  scrollTo(id)
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

<style scoped>
.ds-app .ds-skip-link {
  position: absolute;
  top: var(--space-2);
  left: var(--space-2);
  z-index: 100;
  padding: var(--space-2) var(--space-4);
  background: var(--ink);
  color: var(--paper);
  text-decoration: none;
  font-weight: 500;
  border-radius: var(--radius-xs);
  transform: translateY(-200%);
}
.ds-app .ds-skip-link:focus {
  transform: none;
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

#main,
.demo-section {
  scroll-margin-top: calc(var(--header-h) + var(--space-4));
}

.ds-mobile-nav {
  display: none;
  margin: 0 0 var(--space-6);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-xs);
  background: var(--surface);
}
.ds-mobile-nav__summary {
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 0 var(--space-4);
  font-weight: 500;
  color: var(--ink);
  list-style: none;
  cursor: pointer;
}
.ds-mobile-nav__summary::-webkit-details-marker {
  display: none;
}
.ds-mobile-nav__summary::after {
  content: '▾';
  content: '▾' / '';
  margin-left: auto;
  color: var(--ink-3);
}
.ds-mobile-nav[open] .ds-mobile-nav__summary::after {
  content: '▴';
  content: '▴' / '';
}
.ds-mobile-nav nav {
  padding: 0 var(--space-3) var(--space-3);
  border-top: 1px solid var(--line);
}
.ds-mobile-nav__group {
  margin-top: var(--space-3);
}
.ds-mobile-nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.ds-mobile-nav .ds-sidebar__link {
  min-height: 32px;
  display: flex;
  align-items: center;
}

@media (max-width: 960px) {
  .ds-mobile-nav {
    display: block;
  }
}
</style>
