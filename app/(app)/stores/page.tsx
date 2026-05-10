'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { generateStores } from '@/lib/mock-data'

const stores = generateStores()

export default function StoresPage() {
  const onlineCount = stores.filter((s) => s.status === 'online').length
  const degradedCount = stores.filter((s) => s.status === 'degraded').length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[18px] font-semibold tracking-tight">My stores</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {onlineCount} working normally · {degradedCount} need attention
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store) => (
          <Link key={store.id} href={`/stores/${store.id}`} className="block group">
            <Card className="p-0 gap-0 transition-colors group-hover:bg-muted/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-base">{store.id}</span>
                  <span
                    className={`size-2 rounded-full shrink-0 ${
                      store.status === 'online' ? 'bg-green-500' :
                      store.status === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Activity / hour</p>
                    <p className="font-medium mt-0.5 tabular-nums">{store.eventsPerHour}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Theft rate</p>
                    <p className={`font-medium mt-0.5 tabular-nums ${store.shrinkDelta > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {store.shrinkRate}%{' '}
                      <span className="text-xs text-muted-foreground font-normal">
                        {store.shrinkDelta > 0 ? '+' : ''}{store.shrinkDelta}%
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sales today</p>
                    <p className="font-medium mt-0.5 tabular-nums">
                      ${store.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cameras working</p>
                    <p className="font-medium mt-0.5 tabular-nums">
                      {store.camerasOnline} of {store.cameraCount}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">{store.manager}</span>
                  <span className="text-xs text-muted-foreground">
                    Updated {format(store.lastSync, 'HH:mm')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
