# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start development server at port 3000 (auto-opens in browser)
- `npm run build` - Build for production (runs TypeScript check then Vite build)
- `npm run preview` - Preview production build

## Architecture & Key Technologies

This is a Bluesky client built with Preact and Vite:

- **Framework**: Preact with React compatibility layer
- **Build Tool**: Vite
- **Routing**: preact-router
- **State Management**: @tanstack/react-query and @preact/signals
- **Authentication**: Custom context using @atproto/api
- **Styling**: Tailwind CSS
- **TypeScript**: Strict mode enabled

## Code Structure

- **Authentication Flow**: Centralized in `src/context/AuthContext.tsx` using BskyAgent from @atproto/api
- **API Layer**: Located in `src/lib/api.ts`, wraps Bluesky API calls with session management
- **Route Structure**: 
  - `/login` - Login page (outside MainLayout)
  - `/` - Home page (wrapped in MainLayout)
  - All other routes wrapped in MainLayout component
- **Aliasing**: `@/` maps to `src/` directory
- **React Compatibility**: React imports are aliased to Preact equivalents in vite.config.ts

## Key Patterns

1. Session persistence in localStorage as 'bsky-session'
2. API calls use getAgent() to ensure session is resumed
3. React Query for data fetching with custom defaults (no refetch on focus, single retry)
4. Japanese comments in code for layout and authentication modules