import { subMinutes, subHours, subDays } from 'date-fns'
import type {
  StoreEvent,
  EventSeverity,
  EventType,
  Store,
  SKU,
  FlaggedIncident,
  PaymentTransaction,
  WhatsAppConversation,
  CheckoutSession,
} from './types'

// --- helpers ---

let _id = 1000
export function nextId(): string {
  return `evt-${(++_id).toString().padStart(6, '0')}`
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max))
}

// --- stores ---

export const STORE_IDS = [
  'LIMA-03',
  'MEX-CDMX-12',
  'BOG-NORTE-04',
  'SCL-PROV-07',
  'GDL-CENTRO-02',
  'LIM-MIRAFLORES-01',
]

const CAMERA_IDS = Array.from({ length: 30 }, (_, i) => `CAM-${String(i + 1).padStart(2, '0')}`)
const SHELF_IDS = ['SHELF-A1', 'SHELF-A2', 'SHELF-B1', 'SHELF-B2', 'SHELF-B3', 'SHELF-C1', 'SHELF-C2', 'SHELF-D1']
const SKU_IDS = Array.from({ length: 60 }, (_, i) => `SKU ${String(i + 400).padStart(4, '0')}`)
const CART_IDS = Array.from({ length: 20 }, (_, i) => `CART-${['3F', '2A', '1B', '4C', '2D'][i % 5]}${i}`)

const EVENT_TYPES: EventType[] = [
  'pick-detected',
  'tailgating',
  'pick-without-pay',
  'low-stock',
  'oos',
  'misplacement',
  'checkout-init',
  'walk-out',
  'payment-success',
  'payment-failover',
  'cart-tampering',
  'camera-offline',
  'camera-degraded',
]

const SEVERITY_WEIGHTS: { severity: EventSeverity; weight: number }[] = [
  { severity: 'info', weight: 60 },
  { severity: 'warning', weight: 25 },
  { severity: 'flagged', weight: 12 },
  { severity: 'resolved', weight: 3 },
]

function randomSeverity(): EventSeverity {
  const total = SEVERITY_WEIGHTS.reduce((s, w) => s + w.weight, 0)
  let r = Math.random() * total
  for (const { severity, weight } of SEVERITY_WEIGHTS) {
    r -= weight
    if (r <= 0) return severity
  }
  return 'info'
}

function sourceForType(type: EventType): string {
  switch (type) {
    case 'pick-detected':
    case 'tailgating':
    case 'pick-without-pay':
    case 'cart-tampering':
      return pick(CAMERA_IDS)
    case 'low-stock':
    case 'oos':
    case 'misplacement':
      return pick(SHELF_IDS)
    case 'checkout-init':
    case 'walk-out':
      return pick(CART_IDS)
    case 'payment-success':
    case 'payment-failover':
      return `POS-${randInt(1, 12).toString().padStart(2, '0')}`
    case 'camera-offline':
    case 'camera-degraded':
      return pick(CAMERA_IDS)
    default:
      return pick(CAMERA_IDS)
  }
}

function metadataForType(type: EventType): Record<string, string> {
  switch (type) {
    case 'pick-detected':
      return { sku: pick(SKU_IDS), conf: rand(0.7, 0.99).toFixed(2) }
    case 'tailgating':
      return { conf: rand(0.7, 0.99).toFixed(2), persons: String(randInt(2, 4)) }
    case 'pick-without-pay':
      return { sku: pick(SKU_IDS), value: `$${rand(5, 120).toFixed(2)}`, conf: rand(0.8, 0.99).toFixed(2) }
    case 'low-stock':
      return { current: String(randInt(1, 4)), max: '10', eta: `${randInt(20, 90)}s` }
    case 'oos':
      return { sku: pick(SKU_IDS), since: `${randInt(5, 120)}m ago` }
    case 'misplacement':
      return { sku: pick(SKU_IDS), expected: pick(SHELF_IDS) }
    case 'checkout-init':
      return { items: String(randInt(1, 12)), est: `$${rand(10, 200).toFixed(2)}` }
    case 'walk-out':
      return { conf: rand(0.8, 0.99).toFixed(2), items: String(randInt(1, 8)) }
    case 'payment-success':
      return { amount: `$${rand(10, 300).toFixed(2)}`, processor: pick(['Stripe', 'MP', 'Niubiz']) }
    case 'payment-failover':
      return { from: pick(['Stripe', 'MP']), to: pick(['Prisma', 'EBANX']), amount: `$${rand(10, 300).toFixed(2)}` }
    case 'cart-tampering':
      return { conf: rand(0.6, 0.95).toFixed(2), items_removed: String(randInt(1, 5)) }
    case 'camera-offline':
      return {
        duration: `${randInt(1, 45)}m`,
        last_seen: `${randInt(1, 60)}m ago`,
        issue: pick(['Connection lost', 'Power failure', 'Network timeout', 'Hardware fault']),
      }
    case 'camera-degraded':
      return {
        signal: String(randInt(15, 55)),
        duration: `${randInt(1, 30)}m`,
        issue: pick(['Low bandwidth', 'Packet loss', 'High latency', 'Interference detected']),
      }
    default:
      return {}
  }
}

export function generateEvent(timestamp?: Date): StoreEvent {
  const type = pick(EVENT_TYPES)
  const severity = randomSeverity()
  return {
    id: nextId(),
    timestamp: timestamp ?? new Date(),
    source: sourceForType(type),
    type,
    severity,
    confidence: parseFloat(rand(0.65, 0.99).toFixed(2)),
    store: pick(STORE_IDS),
    metadata: metadataForType(type),
  }
}

export function seedEvents(count = 50): StoreEvent[] {
  return Array.from({ length: count }, (_, i) =>
    generateEvent(subMinutes(new Date(), count - i))
  ).reverse()
}

// --- stores data ---

export function generateStores(): Store[] {
  return STORE_IDS.map((id) => ({
    id,
    name: id,
    location: id.split('-')[0],
    status: pick(['online', 'online', 'online', 'degraded', 'online', 'online']) as Store['status'],
    eventsPerHour: randInt(80, 450),
    shrinkRate: parseFloat(rand(0.5, 3.2).toFixed(2)),
    shrinkDelta: parseFloat(rand(-1.5, 1.5).toFixed(2)),
    revenue: randInt(4000, 28000),
    cameraCount: randInt(12, 32),
    camerasOnline: 0,
    manager: pick(['Santiago G.', 'Carlos R.', 'Sofia T.', 'Diego P.', 'Ana L.', 'Javier S.']),
    lastSync: subMinutes(new Date(), randInt(0, 5)),
    sparkline: Array.from({ length: 12 }, () => randInt(50, 400)),
  })).map((s) => ({
    ...s,
    camerasOnline: s.cameraCount - (s.status === 'degraded' ? randInt(1, 3) : 0),
  }))
}

// --- SKUs ---

const SKU_NAMES = [
  'Whole Milk 1L', 'Greek Yogurt 500g', 'Sourdough Bread', 'Cheddar Cheese 200g',
  'Orange Juice 1L', 'Sparkling Water 6pk', 'Pasta 500g', 'Tomato Sauce 400g',
  'Olive Oil 500ml', 'Instant Coffee 200g', 'Chocolate Bar 100g', 'Chips 150g',
  'Energy Drink 250ml', 'Protein Bar', 'Granola 400g', 'Almond Milk 1L',
  'Frozen Pizza', 'Ice Cream 500ml', 'Butter 250g', 'Cream Cheese 150g',
]

export function generateSKUs(): SKU[] {
  return SKU_IDS.slice(0, 40).map((id, i) => {
    const max = randInt(8, 30)
    const current = randInt(0, max)
    const pct = current / max
    return {
      id,
      name: SKU_NAMES[i % SKU_NAMES.length],
      shelf: pick(SHELF_IDS),
      currentStock: current,
      maxStock: max,
      lastRestock: subHours(new Date(), randInt(1, 48)),
      velocity: parseFloat(rand(0.1, 4.5).toFixed(1)),
      oosRisk: pct < 0.1 ? 'critical' : pct < 0.2 ? 'high' : pct < 0.4 ? 'medium' : 'low',
      category: pick(['Dairy', 'Bakery', 'Beverages', 'Snacks', 'Frozen', 'Condiments']),
      price: parseFloat(rand(0.99, 24.99).toFixed(2)),
    }
  })
}

// --- flagged incidents ---

export function generateFlaggedIncidents(): FlaggedIncident[] {
  const types: EventType[] = ['pick-without-pay', 'tailgating', 'cart-tampering', 'walk-out']
  return Array.from({ length: 18 }, (_, i) => {
    const type = pick(types)
    const statuses: FlaggedIncident['status'][] = ['open', 'open', 'open', 'confirmed', 'false-positive', 'needs-context']
    return {
      id: `inc-${String(i + 1).padStart(4, '0')}`,
      eventId: `evt-${String(i + 900).padStart(6, '0')}`,
      type,
      confidence: parseFloat(rand(0.72, 0.98).toFixed(2)),
      store: pick(STORE_IDS),
      camera: pick(CAMERA_IDS),
      timestamp: subMinutes(new Date(), randInt(5, 480)),
      severity: pick(['flagged', 'flagged', 'warning']) as EventSeverity,
      status: pick(statuses),
      description: ({
        'pick-without-pay': `Item removed from shelf, no scan detected at exit`,
        'tailgating': `Multiple persons entered through access point`,
        'cart-tampering': `Cart contents modified without scan`,
        'walk-out': `Customer exited without completing payment`,
      } as Record<string, string>)[type] ?? 'Anomalous behavior detected',
      estimatedValue: parseFloat(rand(8, 180).toFixed(2)),
    }
  })
}

// --- payments ---

const PAYMENT_PRODUCT_NAMES = [
  'Whole milk 1L',
  'Wheat bread loaf',
  'Eggs 12-pack',
  'Bananas · weighed',
  'Ground beef 500g',
  'Laundry detergent',
  'Paper towels 6-roll',
  'Sparkling water 6pk',
  'Shampoo 400ml',
  'AA batteries 8pk',
  'Frozen pizza',
  'Orange juice 2L',
  'Diapers size 4',
  'Cooking oil 1L',
  'Yogurt multipack',
  'Potato chips family',
  'Hand soap refill',
  'Rice 1kg',
  'Coffee beans 250g',
  'Salad kit',
  'Prepared sandwich',
  'Chocolate bar',
  'Trash bags',
  'Bleach 2L',
  'Gift card reload',
]

/** Builds 2–7 basket lines whose `lineTotal` sums to `total` (within rounding). */
function generatePaymentLineItems(total: number): PaymentTransaction['lineItems'] {
  const n = randInt(2, 7)
  const items: PaymentTransaction['lineItems'] = []
  let remaining = total

  for (let i = 0; i < n - 1; i++) {
    const slicesLeft = n - i
    const maxShare = remaining - (slicesLeft - 1) * 0.01
    const portion = rand(0.18, 0.62)
    let lineTotal = parseFloat((maxShare * portion).toFixed(2))
    lineTotal = Math.min(lineTotal, Math.max(0.01, remaining - 0.01 * (slicesLeft - 1)))
    items.push({
      name: pick(PAYMENT_PRODUCT_NAMES),
      sku: `${pick(['GRO', 'RTL', 'FMB', 'HPC'])}-${String(randInt(100000, 999999))}`,
      lineTotal,
    })
    remaining -= lineTotal
  }

  items.push({
    name: pick(PAYMENT_PRODUCT_NAMES),
    sku: `${pick(['GRO', 'RTL', 'FMB', 'HPC'])}-${String(randInt(100000, 999999))}`,
    lineTotal: parseFloat(Math.max(0.01, remaining).toFixed(2)),
  })

  const drift = total - items.reduce((s, x) => s + x.lineTotal, 0)
  if (Math.abs(drift) >= 0.01 && items.length > 0) {
    items[items.length - 1].lineTotal = parseFloat((items[items.length - 1].lineTotal + drift).toFixed(2))
  }

  return items
}

export function generatePaymentTransactions(): PaymentTransaction[] {
  const processors: PaymentTransaction['processor'][] = ['Stripe', 'MP', 'Prisma', 'Niubiz', 'EBANX']
  return Array.from({ length: 40 }, (_, i) => {
    const status = Math.random() < 0.04 ? 'failed' : Math.random() < 0.02 ? 'failover' : 'success'
    const amount = parseFloat(rand(5, 350).toFixed(2))
    return {
      id: `pay-${String(i + 1).padStart(6, '0')}`,
      timestamp: subMinutes(new Date(), i * 3),
      amount,
      currency: pick(['PEN', 'MXN', 'COP', 'CLP', 'USD']),
      lineItems: generatePaymentLineItems(amount),
      processor: pick(processors),
      status: status as PaymentTransaction['status'],
      store: pick(STORE_IDS),
      retryCount: status === 'failed' ? randInt(0, 3) : 0,
    }
  })
}

// --- WhatsApp ---

const WA_CUSTOMER_IDS = Array.from({ length: 12 }, (_, i) => `CX-${String(i + 4001).padStart(6, '0')}`)

const SAMPLE_MESSAGES = [
  'Where is my order?',
  'I want to return a product',
  'The store is out of stock on item 0482',
  'Can you confirm my pickup time?',
  'I was charged twice',
  'The self-checkout wasn\'t working',
  'Thank you for the help!',
  'My receipt is wrong',
]

export function generateWhatsAppConversations(): WhatsAppConversation[] {
  return WA_CUSTOMER_IDS.map((id, i) => {
    const msgCount = randInt(2, 8)
    const messages = Array.from({ length: msgCount }, (_, j) => ({
      id: `msg-${i}-${j}`,
      content: pick(SAMPLE_MESSAGES),
      timestamp: subMinutes(new Date(), (msgCount - j) * randInt(2, 15)),
      direction: (j % 2 === 0 ? 'inbound' : 'outbound') as 'inbound' | 'outbound',
      type: 'text' as const,
    }))
    return {
      id: `wa-${id}`,
      customerId: id,
      lastMessage: messages[messages.length - 1].content,
      lastMessageTime: messages[messages.length - 1].timestamp,
      unreadCount: Math.random() < 0.4 ? randInt(1, 5) : 0,
      status: pick(['open', 'open', 'resolved', 'pending']) as WhatsAppConversation['status'],
      messages,
    }
  })
}

// --- checkout sessions ---

export function generateCheckoutSessions(): CheckoutSession[] {
  return Array.from({ length: 24 }, (_, i) => ({
    id: `sess-${String(i + 1).padStart(4, '0')}`,
    entryTime: subMinutes(new Date(), randInt(1, 60)),
    route: pick(['walk-out', 'kiosk', 'assisted', 'walk-out', 'kiosk']) as CheckoutSession['route'],
    confidence: parseFloat(rand(0.78, 0.99).toFixed(2)),
    status: pick(['in-progress', 'completed', 'completed', 'completed', 'abandoned']) as CheckoutSession['status'],
    store: pick(STORE_IDS),
    itemCount: randInt(1, 15),
    estimatedValue: parseFloat(rand(8, 220).toFixed(2)),
  }))
}

// --- dashboard metrics ---

export function getDashboardMetrics() {
  return {
    eventsProcessed: 12847,
    eventsProcessedDelta: 8.2,
    shrinkPrevented: 2340,
    shrinkSparkline: [820, 1100, 890, 1340, 1120, 1800, 2100, 1950, 2340].map(v => v + randInt(-50, 50)),
    stockoutsResolved: 47,
    avgResolutionTime: '4m 12s',
    walkouts: 312,
    walkoutPct: 4.8,
    paymentSuccessRate: 99.4,
    paymentFailovers: 8,
    activeCameras: 28,
    totalCameras: 30,
  }
}

// Deterministic pseudo-random seeded from a date (so same date → same numbers).
function seededRand(seed: number, min: number, max: number): number {
  const x = Math.sin(seed + 1) * 10000
  const r = x - Math.floor(x)
  return min + r * (max - min)
}

export function getDashboardMetricsForDate(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const isToday = d.getTime() === today.getTime()

  if (isToday) return getDashboardMetrics()

  // Seed based on days since epoch for determinism
  const seed = Math.floor(d.getTime() / 86_400_000)

  const eventsProcessed = Math.round(seededRand(seed * 3, 8000, 16000))
  const prevDay = Math.round(seededRand((seed - 1) * 3, 8000, 16000))
  const eventsProcessedDelta = parseFloat(((eventsProcessed - prevDay) / prevDay * 100).toFixed(1))
  const shrinkPrevented = Math.round(seededRand(seed * 7, 1200, 3800))
  const walkouts = Math.round(seededRand(seed * 11, 180, 480))
  const totalCheckouts = Math.round(seededRand(seed * 13, 5000, 9000))
  const walkoutPct = parseFloat((walkouts / totalCheckouts * 100).toFixed(1))
  const paymentSuccessRate = parseFloat((seededRand(seed * 17, 98.2, 99.9)).toFixed(1))
  const paymentFailovers = Math.round(seededRand(seed * 19, 2, 18))
  const activeCameras = 30 - Math.round(seededRand(seed * 23, 0, 4))

  return {
    eventsProcessed,
    eventsProcessedDelta,
    shrinkPrevented,
    shrinkSparkline: Array.from({ length: 9 }, (_, i) =>
      Math.round(seededRand(seed * 29 + i, shrinkPrevented * 0.3, shrinkPrevented * 0.9))
    ),
    stockoutsResolved: Math.round(seededRand(seed * 31, 20, 80)),
    avgResolutionTime: `${Math.round(seededRand(seed * 37, 2, 8))}m ${Math.round(seededRand(seed * 41, 5, 59))}s`,
    walkouts,
    walkoutPct,
    paymentSuccessRate,
    paymentFailovers,
    activeCameras,
    totalCameras: 30,
  }
}

// --- heatmap ---

export function generateHeatmapData(): number[][] {
  const stores = STORE_IDS
  const hours = Array.from({ length: 24 }, (_, h) => h)
  return stores.map(() =>
    hours.map((h) => {
      const base = h >= 9 && h <= 21 ? rand(40, 200) : rand(0, 30)
      return Math.round(base)
    })
  )
}

export function generateHeatmapDataForDate(date: Date): number[][] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  if (d.getTime() === today.getTime()) return generateHeatmapData()

  const seed = Math.floor(d.getTime() / 86_400_000)
  const hours = Array.from({ length: 24 }, (_, h) => h)
  return STORE_IDS.map((_, si) =>
    hours.map((h) => {
      const base = h >= 9 && h <= 21
        ? seededRand(seed * 43 + si * 100 + h, 30, 190)
        : seededRand(seed * 43 + si * 100 + h, 0, 25)
      return Math.round(base)
    })
  )
}

// Returns per-hour unique visitor counts (deterministic per date).
export function generateVisitorDataForDate(date: Date): number[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)

  const isToday = d.getTime() === today.getTime()
  const seed = isToday ? Math.floor(today.getTime() / 86_400_000) : Math.floor(d.getTime() / 86_400_000)

  return Array.from({ length: 24 }, (_, h) => {
    const isOpen = h >= 8 && h <= 22
    const base = isOpen
      ? seededRand(seed * 59 + h * 13, 18, 160)
      : seededRand(seed * 59 + h * 13, 0, 12)
    return Math.round(base)
  })
}

/** One point per hour, 00:00–23:00 — full calendar day for payment success rate chart */
export function generatePaymentTimeSeries(): { time: string; rate: number }[] {
  return Array.from({ length: 24 }, (_, h) => ({
    time: `${String(h).padStart(2, '0')}:00`,
    rate: parseFloat((99 + rand(-1.5, 0.8)).toFixed(2)),
  }))
}

export function getProcessorVolumes(): { name: string; volume: number; failover: number }[] {
  return [
    { name: 'Stripe', volume: 4820, failover: 3 },
    { name: 'MP', volume: 3210, failover: 5 },
    { name: 'Prisma', volume: 1840, failover: 0 },
    { name: 'Niubiz', volume: 2100, failover: 1 },
    { name: 'EBANX', volume: 930, failover: 0 },
  ]
}

// --- detection rules ---

export const DETECTION_RULES = [
  { id: 'rule-001', name: 'Pick-without-pay > $20', category: 'Loss Prevention', enabled: true, triggerCount: 847 },
  { id: 'rule-002', name: 'Tailgating after closing hours', category: 'Loss Prevention', enabled: true, triggerCount: 234 },
  { id: 'rule-003', name: 'Cart tampering > 2 items', category: 'Loss Prevention', enabled: true, triggerCount: 112 },
  { id: 'rule-004', name: 'OOS alert — velocity threshold', category: 'Inventory', enabled: true, triggerCount: 1203 },
  { id: 'rule-005', name: 'Low stock < 20% capacity', category: 'Inventory', enabled: true, triggerCount: 3401 },
  { id: 'rule-006', name: 'Payment failover cascade', category: 'Payments', enabled: false, triggerCount: 8 },
  { id: 'rule-007', name: 'Walk-out confidence > 0.85', category: 'Checkout', enabled: true, triggerCount: 312 },
  { id: 'rule-008', name: 'Misplacement > 3 items/hour', category: 'Inventory', enabled: false, triggerCount: 94 },
]

// --- anomalies ---

export const ANOMALY_DESCRIPTIONS = [
  { title: 'Pick-without-pay spike at CAM-07', detail: '14:00–14:30 · 4× baseline · 12 events', severity: 'flagged' as EventSeverity },
  { title: 'Unusual velocity drop — SKU 0482', detail: 'Last 2h · 60% below 7-day avg · SHELF-B3', severity: 'warning' as EventSeverity },
  { title: 'Payment failover cluster — Stripe', detail: '09:15–09:22 · 5 consecutive failures · Rerouted to Prisma', severity: 'warning' as EventSeverity },
]
