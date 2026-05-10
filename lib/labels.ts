import type { EventType, EventSeverity } from './types'

// Human-friendly names for technical event codes.
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  'pick-detected': 'Item picked up',
  'tailgating': 'Multiple people entered',
  'pick-without-pay': 'Possible theft',
  'low-stock': 'Running low',
  'oos': 'Out of stock',
  'misplacement': 'Item in wrong place',
  'checkout-init': 'Checkout started',
  'walk-out': 'Customer walked out',
  'payment-success': 'Payment successful',
  'payment-failover': 'Payment retried',
  'cart-tampering': 'Cart change',
}

export const SEVERITY_LABELS: Record<EventSeverity, string> = {
  info: 'Normal',
  warning: 'Heads up',
  flagged: 'Needs review',
  resolved: 'Resolved',
}

export const STATUS_LABELS: Record<string, string> = {
  open: 'Awaiting review',
  confirmed: 'Confirmed',
  'false-positive': 'Not an issue',
  'needs-context': 'Need more info',
  online: 'Online',
  degraded: 'Slow',
  offline: 'Offline',
  'in-progress': 'In progress',
  completed: 'Done',
  abandoned: 'Abandoned',
  success: 'Successful',
  failed: 'Failed',
  failover: 'Retried',
  pending: 'Pending',
  resolved: 'Resolved',
  flagged: 'Flagged',
  investigating: 'Looking into it',
  dismissed: 'Dismissed',
}

export function friendlyEvent(type: EventType): string {
  return EVENT_TYPE_LABELS[type] ?? type
}

export function friendlyStatus(status: string): string {
  return STATUS_LABELS[status] ?? status
}

export function friendlySeverity(sev: EventSeverity): string {
  return SEVERITY_LABELS[sev] ?? sev
}

// Action verbs for event row links — friendlier than "investigate →"
export const EVENT_ACTIONS: Record<EventType, string> = {
  'pick-detected': 'Open',
  'tailgating': 'Review',
  'pick-without-pay': 'Review',
  'low-stock': 'Restock',
  'oos': 'Restock',
  'misplacement': 'Open',
  'checkout-init': 'Open',
  'walk-out': 'Review',
  'payment-success': 'Open',
  'payment-failover': 'Review',
  'cart-tampering': 'Review',
}
