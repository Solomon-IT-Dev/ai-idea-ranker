import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card'

type Props = {
  title: string
  message?: string
  onRetry?: () => void
  isRetrying?: boolean
  retryLabel?: string
}

export function ErrorState({
  title,
  message = 'Something went wrong.',
  onRetry,
  isRetrying,
  retryLabel = 'Retry',
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
      {onRetry ? (
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={onRetry} disabled={isRetrying}>
            {isRetrying ? 'Retrying…' : retryLabel}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  )
}

