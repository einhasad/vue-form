import { http, HttpResponse, delay } from 'msw'

// Wire-format used by the production ActiveForm:
//   422 → { result: Array<{ field: string; message: string }> }
// Field paths are dotted (e.g. "parts.0.sku") to match how
// @einhasad/vue-form addresses nested fields.

type ServerRule =
  | { kind: 'required' }
  | { kind: 'minLen'; n: number }
  | { kind: 'maxLen'; n: number }
  | { kind: 'minNum'; n: number }
  | { kind: 'maxNum'; n: number }
  | { kind: 'pattern'; re: string }

// Schema keys are dotted attributes. A `*` segment is a wildcard matching one
// dotted segment, so "parts.*.sku" applies to every row's SKU field.
const schemas: Record<string, Record<string, ServerRule[]>> = {
  vehicle: {
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
  },
}

const TAKEN_VIN_PREFIX = 'TAKEN'
const TAKEN_SKU = 'BUSY'

interface VehiclePayload {
  name?: string
  vin?: string
  parts?: Array<{ sku?: string; qty?: number }>
}

export const handlers = [
  // --- Server-driven configuration --------------------------------------
  http.get('/api/validation/schema/:kind', async ({ params }) => {
    await delay(150)
    const kind = String(params.kind)
    return HttpResponse.json(schemas[kind] ?? {})
  }),

  // --- Async per-field uniqueness checks -------------------------------
  http.get('/api/validation/vin-taken/:vin', async ({ params }) => {
    await delay(250)
    const vin = String(params.vin).toUpperCase()
    return HttpResponse.json({ taken: vin.startsWith(TAKEN_VIN_PREFIX) })
  }),

  http.get('/api/validation/sku-taken/:sku', async ({ params }) => {
    await delay(180)
    const sku = String(params.sku).toUpperCase()
    return HttpResponse.json({ taken: sku === TAKEN_SKU })
  }),

  // --- Remote search for SearchSelect ----------------------------------
  http.get('/api/parts/search', async ({ request }) => {
    await delay(180)
    const url = new URL(request.url)
    const q = url.searchParams.get('q') ?? ''
    const seed = ['Wheel', 'Engine', 'Door', 'Seat', 'Mirror', 'Battery']
    if (!q) {
      // No query → return a default list (e.g., "popular parts") so the
      // dropdown is populated as soon as it opens.
      return HttpResponse.json(seed.map((name, i) => ({ id: i + 1, name })))
    }
    return HttpResponse.json(
      seed
        .filter((n) => n.toLowerCase().includes(q.toLowerCase()))
        .map((name, i) => ({ id: i + 1, name: `${name} (${q})` })),
    )
  }),

  // --- Create vehicle (with realistic 422 envelope) --------------------
  http.post('/api/vehicles', async ({ request }) => {
    await delay(400)
    const body = (await request.json()) as VehiclePayload

    if (body.name === 'crash') {
      return new HttpResponse('Internal server error', { status: 500 })
    }

    const errors: Array<{ field: string; message: string }> = []

    // Top-level field errors.
    if (body.name === 'reject') {
      errors.push({ field: 'name', message: 'Server says this name is taken.' })
    }
    if (body.vin && String(body.vin).toUpperCase().startsWith(TAKEN_VIN_PREFIX)) {
      errors.push({ field: 'vin', message: 'VIN is already registered.' })
    }

    // Nested field errors — uses dotted paths matching the lib's attribute scheme.
    if (Array.isArray(body.parts)) {
      body.parts.forEach((p, i) => {
        if (!p.sku) {
          errors.push({ field: `parts.${i}.sku`, message: 'SKU is required.' })
        } else if (String(p.sku).toUpperCase() === TAKEN_SKU) {
          errors.push({ field: `parts.${i}.sku`, message: `SKU "${p.sku}" is reserved by another order.` })
        }
        if (p.qty !== undefined && p.qty <= 0) {
          errors.push({ field: `parts.${i}.qty`, message: 'Quantity must be positive.' })
        }
      })
    }

    if (errors.length > 0) {
      return HttpResponse.json({ result: errors }, { status: 422 })
    }

    return HttpResponse.json({ id: Math.floor(Math.random() * 9999) + 1, ...body }, { status: 201 })
  }),
]
