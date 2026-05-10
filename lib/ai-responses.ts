import {
  generateStores,
  generateSKUs,
  generateFlaggedIncidents,
  getDashboardMetrics,
  STORE_IDS,
} from './mock-data'

const stores = generateStores()
const skus = generateSKUs()
const incidents = generateFlaggedIncidents()
const metrics = getDashboardMetrics()

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Contextual AI response engine
export function generateAIResponse(userMessage: string): string {
  const q = userMessage.toLowerCase()

  // Shrink / loss prevention
  if (q.includes('shrink') || q.includes('loss') || q.includes('theft') || q.includes('steal')) {
    const worst = [...stores].sort((a, b) => b.shrinkRate - a.shrinkRate)[0]
    const open = incidents.filter((i) => i.status === 'open').length
    return `Current shrink across the network averages **${(stores.reduce((s, st) => s + st.shrinkRate, 0) / stores.length).toFixed(2)}%**.\n\nHighest shrink store right now is **${worst.id}** at ${worst.shrinkRate}% — that's ${worst.shrinkDelta > 0 ? '+' : ''}${worst.shrinkDelta}% vs last week.\n\nThere are **${open} open LP incidents** in the queue. The most common event type is pick-without-pay, concentrated between 13:00–15:00. I'd recommend reviewing CAM-07 footage for that window.`
  }

  // Inventory / stock
  if (q.includes('stock') || q.includes('inventory') || q.includes('oos') || q.includes('restock') || q.includes('shelf')) {
    const critical = skus.filter((s) => s.oosRisk === 'critical')
    const high = skus.filter((s) => s.oosRisk === 'high')
    return `Inventory status as of now:\n\n- **${critical.length} SKUs** are at critical OOS risk (< 10% capacity)\n- **${high.length} SKUs** are at high risk (< 20%)\n\nMost urgent: **${critical[0]?.id ?? 'SKU 0482'}** (${critical[0]?.name ?? 'Whole Milk 1L'}) on ${critical[0]?.shelf ?? 'SHELF-B3'} — estimated stockout in ${Math.round((critical[0]?.currentStock ?? 1) / (critical[0]?.velocity ?? 1) * 60)}m at current velocity.\n\nI recommend triggering a restock for shelves A1 and B3 first. Velocity on dairy is running 40% above baseline today.`
  }

  // Payments
  if (q.includes('payment') || q.includes('stripe') || q.includes('psp') || q.includes('failover') || q.includes('transaction')) {
    return `Payment network is operating at **${metrics.paymentSuccessRate}% success rate** today.\n\nThere have been **${metrics.paymentFailovers} failovers** — all routed cleanly from Stripe to Prisma between 09:15–09:22 due to a brief Stripe degradation. No customer-facing failures.\n\nTop PSP by volume: **Stripe** (37%), **Mercado Pago** (25%), **Niubiz** (16%). EBANX and Prisma are handling the remainder.\n\nReconciliation for yesterday is complete. No discrepancies found.`
  }

  // Stores
  if (q.includes('store') || q.includes('location') || q.includes('site') || STORE_IDS.some(id => q.includes(id.toLowerCase()))) {
    const mentionedStore = stores.find(s => q.includes(s.id.toLowerCase())) ?? stores[0]
    return `You have **${stores.length} stores** active across the network:\n\n${stores.map(s => `- **${s.id}** — ${s.status} · ${s.eventsPerHour} events/h · shrink ${s.shrinkRate}%`).join('\n')}\n\n**${mentionedStore.id}** is managed by ${mentionedStore.manager}. Last sync: ${mentionedStore.lastSync.toLocaleTimeString()}. Camera uptime: ${mentionedStore.camerasOnline}/${mentionedStore.cameraCount}.`
  }

  // Cameras
  if (q.includes('camera') || q.includes('cam') || q.includes('offline') || q.includes('footage')) {
    return `**${metrics.activeCameras} of ${metrics.totalCameras} cameras** are online across all stores.\n\n**CAM-05** and **CAM-18** are currently offline — both in LIMA-03. CAM-05 has been down for 47 minutes (network issue, ticket open). CAM-18 went offline 3 minutes ago — possibly a power cycle.\n\nAll other cameras are streaming normally with < 1s latency. You can view the full camera list in **Settings → Cameras**.`
  }

  // Checkout / walk-outs
  if (q.includes('checkout') || q.includes('walk') || q.includes('kiosk') || q.includes('session')) {
    return `Checkout routing today:\n\n- **Walk-outs:** ${metrics.walkouts} (${metrics.walkoutPct}% of total)\n- **Kiosk self-service:** majority of transactions\n- **Assisted checkout:** ~15% of sessions\n\nThe walk-out confidence threshold is set at 0.85. Sessions below that get flagged for manual review. Average basket size for walk-outs is $47. Peak walk-out hours are 12:00–13:30 and 17:00–19:00.`
  }

  // Events / alerts
  if (q.includes('event') || q.includes('alert') || q.includes('anomal') || q.includes('incident')) {
    return `**${metrics.eventsProcessed.toLocaleString()} events** have been processed today — that's +${metrics.eventsProcessedDelta}% vs yesterday.\n\nBreakdown:\n- **60%** informational (pick-detected, checkout-init, payment-success)\n- **25%** warnings (low-stock, misplacement, payment-failover)\n- **12%** flagged (pick-without-pay, tailgating, cart-tampering)\n- **3%** resolved\n\nToday's top anomaly: a pick-without-pay spike at CAM-07 between 14:00–14:30, running 4× baseline. Recommend reviewing the LP queue.`
  }

  // WhatsApp / customer
  if (q.includes('whatsapp') || q.includes('customer') || q.includes('message') || q.includes('chat')) {
    return `The WhatsApp inbox currently has **4 unread conversations**.\n\nMost common customer issues today:\n1. Order status inquiries (40%)\n2. Return requests (25%)\n3. Stock availability questions (20%)\n4. Billing disputes (15%)\n\nResponse time SLA is 5 minutes during store hours. Average response time today: **3m 12s** — within target. I can draft suggested replies for any open conversation if you navigate to the WhatsApp inbox.`
  }

  // Revenue / performance
  if (q.includes('revenue') || q.includes('sales') || q.includes('performance') || q.includes('money')) {
    const totalRev = stores.reduce((s, st) => s + st.revenue, 0)
    const best = [...stores].sort((a, b) => b.revenue - a.revenue)[0]
    return `Total network revenue today: **$${totalRev.toLocaleString()}**.\n\nTop performing store: **${best.id}** at $${best.revenue.toLocaleString()}.\n\nShrink prevention has saved an estimated **$${metrics.shrinkPrevented.toLocaleString()}** today. Payment processing fees are running at 2.1% blended rate across PSPs.\n\nNote: these are intraday figures and will be finalized in the T+1 reconciliation report.`
  }

  // Settings / config
  if (q.includes('setting') || q.includes('rule') || q.includes('config') || q.includes('threshold')) {
    return `Current detection rules:\n\n- Pick-without-pay > $20 (enabled, 847 triggers today)\n- Tailgating after closing hours (enabled, 234 triggers)\n- Cart tampering > 2 items (enabled, 112 triggers)\n- OOS alert — velocity threshold (enabled, 1,203 triggers)\n- Low stock < 20% capacity (enabled, 3,401 triggers)\n- Walk-out confidence > 0.85 (enabled, 312 triggers)\n\nTwo rules are currently disabled: payment failover cascade and misplacement > 3/h. You can manage all rules in **Settings → Rules** or **Loss Prevention → Rules**.`
  }

  // Help / capabilities
  if (q.includes('help') || q.includes('what can') || q.includes('capabilities') || q.includes('know')) {
    return `I'm the Alwon AI assistant. I have full context on your store network and can help you with:\n\n- **Loss prevention** — shrink rates, incident queues, detection rules\n- **Inventory** — stock levels, OOS predictions, restock priorities\n- **Payments** — PSP health, failover logs, reconciliation\n- **Stores** — per-store metrics, camera status, manager info\n- **Checkout** — routing stats, session data, walk-out trends\n- **Events** — anomaly summaries, pattern analysis\n- **WhatsApp** — inbox status, customer issues\n\nAsk me anything about what's happening across your network right now.`
  }

  // Greeting
  if (q.includes('hello') || q.includes('hi ') || q === 'hi' || q.includes('hey') || q.includes('good morning') || q.includes('buenos')) {
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
    const worstStore = [...stores].sort((a, b) => b.shrinkRate - a.shrinkRate)[0]
    return `${greeting}. Here's a quick status:\n\n- **${metrics.eventsProcessed.toLocaleString()} events** processed today (+${metrics.eventsProcessedDelta}%)\n- **${metrics.activeCameras}/${metrics.totalCameras} cameras** online\n- **${incidents.filter(i => i.status === 'open').length} open LP incidents** in queue\n- **${metrics.paymentSuccessRate}% payment success rate**\n- Highest shrink: **${worstStore.id}** at ${worstStore.shrinkRate}%\n\nWhat would you like to dig into?`
  }

  // Default / fallback
  const topics = ['inventory', 'loss prevention', 'payments', 'camera status', 'checkout routing', 'WhatsApp inbox', 'store performance']
  return `I understand you're asking about: *${userMessage.slice(0, 80)}${userMessage.length > 80 ? '...' : ''}*\n\nI have real-time data across all ${stores.length} stores in the network. Here's what I can see right now:\n\n- ${metrics.eventsProcessed.toLocaleString()} events processed today\n- ${incidents.filter(i => i.status === 'open').length} open LP incidents\n- ${skus.filter(s => s.oosRisk === 'critical').length} SKUs at critical stock levels\n\nFor a more specific answer, try asking about **${pick(topics)}** — or rephrase your question and I'll do my best.`
}
