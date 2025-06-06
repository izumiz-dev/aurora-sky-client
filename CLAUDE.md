# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server at port 3000 (auto-opens in browser)
- `npm run build` - Build for production (runs TypeScript check then Vite build)
- `npm run preview` - Preview production build

### Code Quality & Verification
IMPORTANT: Always run these commands before committing changes:

1. **Format Check & Fix**:
   - `npm run format:check` - Check if files are formatted correctly
   - `npm run format` - Auto-format all source files

2. **Type Checking**:
   - `npm run type-check` - Run TypeScript compiler without emitting files

3. **Linting**:
   - `npm run lint` - Check for ESLint errors
   - `npm run lint:fix` - Auto-fix ESLint errors where possible

### Recommended Verification Flow
When making changes, follow this verification sequence:

```bash
# 1. Format the code
npm run format

# 2. Check types
npm run type-check

# 3. Run linter
npm run lint:fix

# 4. Check for redundant comments
npm run check-comments

# 5. Build to ensure everything works
npm run build
```

For quick verification before committing:
```bash
npm run format && npm run type-check && npm run lint && npm run check-comments
```

### Comment Quality Check
- `npm run check-comments` - Detect redundant comments that restate obvious code
- **IMPORTANT**: All detected redundant comments MUST be removed before committing

## Architecture & Key Technologies

This is AuroraSky, a beautiful Bluesky client built with Preact and Vite:

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

## Code Comments Guidelines

**IMPORTANT**: Do not write comments that simply restate what the code is already clearly doing. Focus on comments that add value by explaining:

- **Why** something is being done (business logic, design decisions)
- **Complex algorithms** or non-obvious implementation details
- **Important context** that isn't obvious from the code
- **Gotchas** or important considerations for future developers

**Avoid these types of redundant comments:**
- `// Set variable` before variable assignments
- `// Get element` before DOM queries
- `// Success` or `// Failed` after obvious operations
- Comments that just repeat function/variable names
- Comments describing what a single line of self-explanatory code does

**Examples:**
```typescript
// ❌ Bad - obvious from code
const user = getUser(); // Get user

// ✅ Good - explains why
const user = getUser(); // Required for auth context initialization

// ❌ Bad - restates what's happening
if (file.size > 1000000) {
  // Resize image
  processedFile = await resizeImage(file);
}

// ✅ Good - explains business rule
if (file.size > 1000000) {
  // Bluesky has a 1MB limit for image uploads
  processedFile = await resizeImage(file);
}
```