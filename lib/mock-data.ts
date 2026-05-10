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
    manager: pick(['Elena M.', 'Carlos R.', 'Sofia T.', 'Diego P.', 'Ana L.', 'Javier S.']),
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

export function generatePaymentTransactions(): PaymentTransaction[] {
  const processors: PaymentTransaction['processor'][] = ['Stripe', 'MP', 'Prisma', 'Niubiz', 'EBANX']
  return Array.from({ length: 40 }, (_, i) => {
    const status = Math.random() < 0.04 ? 'failed' : Math.random() < 0.02 ? 'failover' : 'success'
    return {
      id: `pay-${String(i + 1).padStart(6, '0')}`,
      timestamp: subMinutes(new Date(), i * 3),
      amount: parseFloat(rand(5, 350).toFixed(2)),
      currency: pick(['PEN', 'MXN', 'COP', 'CLP', 'USD']),
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

export function generatePaymentTimeSeries(): { time: string; rate: number }[] {
  return Array.from({ length: 60 }, (_, i) => ({
    time: `${String(Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`,
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
