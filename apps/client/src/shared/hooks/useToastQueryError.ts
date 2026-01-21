import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

export function useToastQueryError(isError: boolean, error: unknown, fallbackMessage: string) {
  const lastMessageRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isError) return

    const message = error instanceof Error ? error.message : fallbackMessage

    if (!message) return
    if (message === lastMessageRef.current) return

    lastMessageRef.current = message
    toast.error(message)
  }, [error, fallbackMessage, isError])
}

