# SoulSeer - Psychic Reading Platform

## Overview

SoulSeer is a premium spiritual guidance platform connecting psychic readers with clients seeking readings. The application features a celestial, mystical aesthetic with dark-mode default, offering real-time chat/voice/video sessions, a digital shop, and comprehensive dashboards for clients, readers, and administrators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Build Tool**: Vite with custom Replit plugins for development

**Design System**:
- Typography: Alex Brush (display/headings), Playfair Display (body)
- Colors: Mystical pink (#FF69B4) primary, black backgrounds, gold accents
- CSS variables defined in `client/src/index.css` for theming

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful endpoints under `/api/*`
- **Real-time**: WebSocket server for live session communication
- **Session Management**: Express-session with PostgreSQL store (connect-pg-simple)

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts`
- **Migrations**: `migrations/` directory managed by drizzle-kit

**Core Tables**:
- `users` - Authentication and user profiles (clients, readers, admins)
- `readers` - Reader-specific profiles with rates and availability
- `sessions` - Reading sessions (chat/voice/video)
- `messages` - Session and direct messaging
- `reviews` - Reader reviews and ratings
- `products` - Digital/physical shop items
- `orders` - Purchase records
- `transactions` - Financial transactions
- `favorites` - Client favorite readers

### Authentication
- Password hashing with scrypt
- Express-session for session management
- Role-based access: client, reader, admin
- Auth context provider in `client/src/lib/auth.tsx`

### Key Pages
- Home (`/`) - Hero, online readers, featured content
- Readers (`/readers`) - Browse and filter readers
- Reader Profile (`/reader/:id`) - Individual reader details
- Session (`/session/:readerId`) - Live reading interface
- Dashboard (`/dashboard`) - Client dashboard
- Reader Dashboard (`/reader-dashboard`) - Reader management
- Admin (`/admin`) - Platform administration
- Shop (`/shop`) - Digital products marketplace
- Messages (`/messages`) - Direct messaging

## External Dependencies

### Third-Party Services
- **PostgreSQL**: Primary database (requires `DATABASE_URL` environment variable)
- **WebSocket**: Built-in `ws` library for real-time features

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `express-session` / `connect-pg-simple` - Session management
- `@tanstack/react-query` - Server state management
- `react-hook-form` / `@hookform/resolvers` / `zod` - Form handling and validation
- `@radix-ui/*` - Accessible UI primitives for shadcn/ui
- `tailwindcss` - Utility-first CSS framework

### Build Configuration
- Vite handles client bundling to `dist/public`
- esbuild bundles server to `dist/index.cjs`
- TypeScript paths: `@/*` maps to `client/src/*`, `@shared/*` maps to `shared/*`

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Express session secret (optional, has default for development)