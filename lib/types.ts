export type EventSeverity = 'info' | 'warning' | 'flagged' | 'resolved'

export type EventType =
  | 'pick-detected'
  | 'tailgating'
  | 'pick-without-pay'
  | 'low-stock'
  | 'oos'
  | 'misplacement'
  | 'checkout-init'
  | 'walk-out'
  | 'payment-success'
  | 'payment-failover'
  | 'cart-tampering'
  | 'camera-offline'
  | 'camera-degraded'

export interface StoreEvent {
  id: string
  timestamp: Date
  source: string
  type: EventType
  severity: EventSeverity
  confidence?: number
  store: string
  metadata?: Record<string, string>
}

export interface Store {
  id: string
  name: string
  location: string
  status: 'online' | 'degraded' | 'offline'
  eventsPerHour: number
  shrinkRate: number
  shrinkDelta: number
  revenue: number
  cameraCount: number
  camerasOnline: number
  manager: string
  lastSync: Date
  sparkline: number[]
}

export interface SKU {
  id: string
  name: string
  shelf: string
  currentStock: number
  maxStock: number
  lastRestock: Date
  velocity: number
  oosRisk: 'low' | 'medium' | 'high' | 'critical'
  category: string
  price: number
}

export interface FlaggedIncident {
  id: string
  eventId: string
  type: EventType
  confidence: number
  store: string
  camera: string
  timestamp: Date
  severity: EventSeverity
  status: 'open' | 'confirmed' | 'false-positive' | 'needs-context'
  description: string
  estimatedValue?: number
}

export interface PaymentLineItem {
  name: string
  sku: string
  lineTotal: number
}

export interface PaymentTransaction {
  id: string
  timestamp: Date
  amount: number
  currency: string
  /** Basket lines; totals align with `amount` */
  lineItems: PaymentLineItem[]
  processor: 'Stripe' | 'MP' | 'Prisma' | 'Niubiz' | 'EBANX'
  status: 'success' | 'failed' | 'failover' | 'pending'
  store: string
  retryCount: number
}

export interface WhatsAppConversation {
  id: string
  customerId: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  status: 'open' | 'resolved' | 'pending'
  messages: WhatsAppMessage[]
}

export interface WhatsAppMessage {
  id: string
  content: string
  timestamp: Date
  direction: 'inbound' | 'outbound'
  type: 'text' | 'image' | 'order'
}

export interface CheckoutSession {
  id: string
  entryTime: Date
  route: 'walk-out' | 'kiosk' | 'assisted'
  confidence: number
  status: 'in-progress' | 'completed' | 'abandoned'
  store: string
  itemCount: number
  estimatedValue: number
}
