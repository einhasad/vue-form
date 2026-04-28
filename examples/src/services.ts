// Fake services for the demo. The library doesn't see this code.

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const vehicleApi = {
  async create(payload: Record<string, unknown>) {
    await sleep(400)
    if ((payload as { name?: string }).name === 'reject') {
      // Simulate an axios-style 422 envelope so the demo's @fail handler
      // can show the per-field error path.
      throw {
        response: {
          status: 422,
          data: {
            result: [{ field: 'name', message: 'Server says name is taken.' }],
          },
        },
      }
    }
    if ((payload as { name?: string }).name === 'crash') {
      throw new Error('Network unreachable')
    }
    return { id: Math.floor(Math.random() * 9999) + 1, ...payload }
  },
}

export const validationApi = {
  async isVinTaken(vin: string): Promise<boolean> {
    await sleep(300)
    return vin.toUpperCase().startsWith('TAKEN')
  },
  async isSkuTaken(sku: string): Promise<boolean> {
    await sleep(200)
    return sku.toUpperCase() === 'BUSY'
  },
  async getSchema(_kind: string): Promise<Record<string, ServerRule[]>> {
    await sleep(100)
    return {
      name: [
        { kind: 'required' },
        { kind: 'minLen', n: 3 },
        { kind: 'maxLen', n: 80 },
      ],
      description: [{ kind: 'maxLen', n: 2000 }],
      'parts.*.sku': [
        { kind: 'required' },
        { kind: 'minLen', n: 1 },
        { kind: 'maxLen', n: 40 },
      ],
      'parts.*.qty': [
        { kind: 'required' },
        { kind: 'minNum', n: 1 },
        { kind: 'maxNum', n: 99 },
      ],
    }
  },
}

export const partLookupApi = {
  async search(q: string): Promise<{ id: number; name: string }[]> {
    await sleep(200)
    if (!q) return []
    const seed = ['Wheel', 'Engine', 'Door', 'Seat', 'Mirror', 'Battery']
    return seed
      .filter((n) => n.toLowerCase().includes(q.toLowerCase()))
      .map((name, i) => ({ id: i + 1, name: `${name} (${q})` }))
  },
}

export type ServerRule =
  | { kind: 'required' }
  | { kind: 'minLen'; n: number }
  | { kind: 'maxLen'; n: number }
  | { kind: 'minNum'; n: number }
  | { kind: 'maxNum'; n: number }
  | { kind: 'pattern'; re: string }
