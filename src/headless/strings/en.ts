export interface Strings {
  required: string
  minLen: string
  maxLen: string
  minNum: string
  maxNum: string
  pattern: string
  email: string
  url: string
  integer: string
  numeric: string
  between: string
  lengthBetween: string
  oneOf: string
  sameAs: string
  uuid: string
  unique: string
  fieldFallback: string
  /** @deprecated Not used by the library; will be removed in 1.0. */
  uniqueServer: string
  /** @deprecated Not used by the library; will be removed in 1.0. */
  selectPlaceholder: string
  /** @deprecated Not used by the library; will be removed in 1.0. */
  searchPlaceholder: string
  /** @deprecated Not used by the library; will be removed in 1.0. */
  currencySymbol: string
  /** @deprecated Not used by the library; will be removed in 1.0. */
  nestedAddButton: string
  /** @deprecated Not used by the library; will be removed in 1.0. */
  nestedDeleteButton: string
  /** @deprecated Not used by the library; will be removed in 1.0. */
  nestedCloneButton: string
  errFormMissing: string
}

export const en: Readonly<Strings> = {
  required: '{attr} cannot be blank',
  minLen: '{attr} should contain at least {min} characters',
  maxLen: '{attr} should contain at most {max} characters',
  minNum: '{attr} must be no less than {min}',
  maxNum: '{attr} must be no greater than {max}',
  pattern: '{attr} format is invalid',
  email: '{attr} must be a valid email',
  url: '{attr} must be a valid URL',
  integer: '{attr} must be an integer',
  numeric: '{attr} must be a number',
  between: '{attr} must be between {min} and {max}',
  lengthBetween: '{attr} should contain between {min} and {max} characters',
  oneOf: '{attr} must be one of: {values}',
  sameAs: '{attr} does not match',
  uuid: '{attr} must be a valid UUID',
  unique: '{value} is already used',
  fieldFallback: 'This field',
  uniqueServer: '{value} is not available',
  selectPlaceholder: 'Select {label}',
  searchPlaceholder: 'Search…',
  currencySymbol: '$',
  nestedAddButton: 'Add item',
  nestedDeleteButton: 'Delete',
  nestedCloneButton: 'Clone',
  errFormMissing:
    '[vue-form] useForm() must be called in a component below useProvideForm() (use useFormOptional() for standalone widgets)',
}
