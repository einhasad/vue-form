import en from './en.json'

export type Strings = typeof en

let current: Strings = { ...en }

export function setStrings(partial: Partial<Strings>): void {
  current = { ...current, ...partial }
}

export function getStrings(): Readonly<Strings> {
  return current
}

export function resetStrings(): void {
  current = { ...en }
}

export function interpolate(
  template: string,
  params: Record<string, unknown> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => (params[k] == null ? '' : String(params[k])))
}
