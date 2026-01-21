# UI / UX Guidelines

This doc captures UI conventions used across the client to keep the experience consistent.

## States (Required)

Every screen should handle:
- loading state (skeleton or spinner)
- empty state (helpful CTA)
- error state (toast + optional inline retry)

## Forms

- Use `react-hook-form` + `zod` schemas.
- Show field-level validation errors inline.
- Disable submit buttons while pending to prevent double submits.

## Toasts

Use `sonner` for:
- short confirmations (created/saved/copied/downloaded)
- errors that are not tied to a single inline retry area

## Markdown Rendering

Artifacts are rendered as Markdown:
- renderer: `react-markdown` + `remark-gfm`
- external links open in a new tab; internal app links use React Router `Link`

Sources deep-linking convention:
- artifact “Sources” section can link to playbook chunks via `chunkId` query param.

## Tables

Prefer simple tables by default; use React Table where sorting/selection/pagination improves the
UX (e.g. ideas list, score/version history).

## Accessibility Basics

- Inputs use associated labels (`Label` + `htmlFor`).
- Interactive controls are keyboard reachable.
- Prefer semantic elements (`button`, `a`) via shared UI components.
