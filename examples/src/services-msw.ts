// Fetch-based services. Backed by MSW handlers in dev (see src/mocks/handlers.ts);
// in production these would hit a real backend at the same URLs.

export type ServerRule =
  | { kind: 'required' }
  | { kind: 'minLen'; n: number }
  | { kind: 'maxLen'; n: number }
  | { kind: 'minNum'; n: number }
  | { kind: 'maxNum'; n: number }
  | { kind: 'pattern'; re: string }

interface AxiosLikeError {
  response: {
    status: number
    data: unknown
  }
}

async function asAxiosLikeError(res: Response): Promise<never> {
  let data: unknown
  try {
    data = await res.json()
  } catch {
    data = await res.text().catch(() => '')
  }
  const err: AxiosLikeError = { response: { status: res.status, data } }
  throw err
}

export const vehicleApi = {
  async create(payload: Record<string, unknown>) {
    const res = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) await asAxiosLikeError(res)
    return res.json()
  },
}

export const validationApi = {
  async getSchema(kind: string): Promise<Record<string, ServerRule[]>> {
    const res = await fetch(`/api/validation/schema/${encodeURIComponent(kind)}`)
    if (!res.ok) await asAxiosLikeError(res)
    return res.json()
  },
  async isVinTaken(vin: string): Promise<boolean> {
    const res = await fetch(`/api/validation/vin-taken/${encodeURIComponent(vin)}`)
    if (!res.ok) await asAxiosLikeError(res)
    const data = (await res.json()) as { taken: boolean }
    return data.taken
  },
  async isSkuTaken(sku: string): Promise<boolean> {
    const res = await fetch(`/api/validation/sku-taken/${encodeURIComponent(sku)}`)
    if (!res.ok) await asAxiosLikeError(res)
    const data = (await res.json()) as { taken: boolean }
    return data.taken
  },
}

export const partLookupApi = {
  async search(q: string): Promise<{ id: number; name: string }[]> {
    const res = await fetch(`/api/parts/search?q=${encodeURIComponent(q)}`)
    if (!res.ok) await asAxiosLikeError(res)
    return res.json()
  },
}
