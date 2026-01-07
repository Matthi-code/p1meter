# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 application using the App Router with TypeScript and Tailwind CSS v4.

### Project Structure

- `src/app/` - App Router pages and layouts (file-based routing)
- `src/app/layout.tsx` - Root layout wrapping all pages
- `src/app/page.tsx` - Home page (`/`)
- `src/app/globals.css` - Global styles with Tailwind imports

### Key Conventions

- **Path alias**: Use `@/*` to import from `src/*`
- **Components**: Create in `src/components/` (not yet created)
- **Server Components**: Default in App Router; add `'use client'` directive for client components
- **Styling**: Use Tailwind CSS utility classes
# Trigger redeploy Wed Jan  7 22:51:34 CET 2026
