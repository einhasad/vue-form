// Public main barrel — fully headless.
// No Vue components ship in this package; consumers wire their own UI layer
// (Ant Design, Naive, PrimeVue, native HTML, …) on top of the composables
// and headless classes below.

// Composables
export { useForm, useProvideForm } from './vue/useForm'
export type { FormContext } from './vue/useForm'
export { useField } from './vue/useField'
export type { UseFieldOptions } from './vue/useField'

// Strings
export {
  setStrings,
  getStrings,
  resetStrings,
  interpolate,
} from './headless/strings'
export type { Strings } from './headless/strings'

// Types
export type { Validator, FieldHandle, FieldError } from './headless/types'

// Validator factories
import * as rules from './headless/rules'
export { rules }
