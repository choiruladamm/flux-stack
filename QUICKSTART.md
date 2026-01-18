# Flux Stack Quickstart

## Prerequisites

- Bun 1.3.5+ installed
- PostgreSQL 16+ (via Docker or local installation)

## Setup

1. Clone and install dependencies:

   ```bash
   git clone https://github.com/choiruladamm/flux-stack
   cd flux-stack
   bun install
   ```

2. Configure environment:

   ```bash
   cp .env.example .env
   # Edit .env and set your DATABASE_URL and JWT_SECRET
   ```

3. Start PostgreSQL (choose one method):

   **Option A: Docker (Recommended)**

   ```bash
   docker-compose up -d
   ```

   **Option B: Local PostgreSQL**

   ```bash
   # Make sure PostgreSQL is running on localhost:5432
   # Create a database named 'flux_stack'
   createdb flux_stack
   ```

4. Run migrations:

   ```bash
   bun run db:migrate
   ```

5. Start development server:

   ```bash
   bun run dev
   ```

6. Visit http://localhost:3000

## Available Commands

- `bun run dev` - Start dev server with hot reload
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run test` - Run tests
- `bun run lint` - Run ESLint
- `bun run format` - Format code with Prettier
- `bun run db:generate` - Generate migrations
- `bun run db:migrate` - Apply migrations
- `bun run db:studio` - Open Drizzle Studio

## Health Check

The API will be available at http://localhost:3000/api/health
