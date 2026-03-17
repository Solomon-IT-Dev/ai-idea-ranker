import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link } from 'react-router-dom'
import remarkGfm from 'remark-gfm'

import { linkifyArtifactSourcesMarkdown, nodeToText } from '@/entities/artifact/lib/artifactMarkdown'
import { Card } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'

type Props = {
  title: string
  markdown: string
  projectId: string
  variant?: 'default' | 'latest' | 'selected'
}

export function ArtifactMarkdownCard({
  title,
  markdown,
  projectId,
  variant = 'default',
}: Props) {
  const borderClass =
    variant === 'latest'
      ? 'border-primary/40'
      : variant === 'selected'
        ? 'border-ring'
        : 'border-border'

  const decoratedMarkdown = useMemo(
    () => linkifyArtifactSourcesMarkdown(markdown, projectId),
    [markdown, projectId]
  )

  return (
    <Card className={`p-4 border ${borderClass}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">{title}</div>
          {variant === 'latest' ? (
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">Latest</span>
          ) : null}
          {variant === 'selected' ? (
            <span className="rounded bg-muted px-2 py-0.5 text-xs">Selected</span>
          ) : null}
        </div>

        <Separator />

        <article className="prose prose-zinc max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="mt-0 scroll-m-20 text-xl font-semibold tracking-tight">{children}</h1>
              ),
              h2: ({ children }) => {
                const text = nodeToText(children).toLowerCase()
                const isSources = text === 'sources'

                return (
                  <div className="mt-6 mb-3">
                    <div
                      className={[
                        'flex items-center justify-between gap-2',
                        isSources
                          ? 'rounded-md border bg-muted/40 px-3 py-2'
                          : 'border-l-2 border-primary/40 pl-3',
                      ].join(' ')}
                    >
                      <h2 className="m-0 scroll-m-20 text-base font-semibold tracking-tight">
                        {children}
                      </h2>
                      {isSources ? (
                        <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          citations
                        </span>
                      ) : null}
                    </div>
                  </div>
                )
              },
              h3: ({ children }) => (
                <h3 className="mt-5 scroll-m-20 text-sm font-semibold tracking-tight">{children}</h3>
              ),
              a: ({ href, children }) => {
                const linkHref = href ?? ''
                if (linkHref.startsWith('/projects/')) {
                  return (
                    <Link to={linkHref} className="underline underline-offset-4">
                      {children}
                    </Link>
                  )
                }

                return (
                  <a
                    href={linkHref}
                    className="underline underline-offset-4"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {children}
                  </a>
                )
              },
            }}
          >
            {decoratedMarkdown}
          </ReactMarkdown>
        </article>
      </div>
    </Card>
  )
}
