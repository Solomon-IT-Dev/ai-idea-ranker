import { cn } from '@/shared/lib/utils'

import type * as React from 'react'

export function FullScreenSpinner({
  className,
  label = 'Loading…',
  ...props
}: React.ComponentProps<'div'> & { label?: string }) {
  return (
    <div className={cn('bg-background text-foreground min-h-dvh w-full', className)} {...props}>
      <div className="flex min-h-dvh w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            aria-hidden
            className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/25 border-t-foreground"
          />
          <div role="status" className="text-sm text-muted-foreground">
            {label}
          </div>
        </div>
      </div>
    </div>
  )
}
