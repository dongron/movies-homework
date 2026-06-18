# Movies Homework

A movie browsing app built with Next.js 16, React 19 and Shadcn UI.

**[Live Demo](https://movies-homework.vercel.app)**

Based on the [Next.js 16 Starter (shadcn)](https://github.com/siddharthamaity/nextjs-16-starter-shadcn) starter template.

## Features

- Search movies using the OMDb API
- Filter results by release year and type (movie, series, episode)
- Paginated search results
- Detailed movie view (title, plot, genre, year, rating, poster, etc.)
- Favorites list persisted in localStorage
- Responsive layout
- WCAG-compliant accessibility (semantic HTML, landmarks, ARIA labels)
- SEO optimized (meta tags, Open Graph, sitemap, robots.txt)
- API error handling with user-friendly messages
- Type-safe throughout with TypeScript and Zod schema validation
- Unit tests with Vitest and Testing Library

## Getting Started

### Prerequisites

- **Node.js** 20.18.0 or higher
- **OMDb API key** - get one at [omdbapi.com](https://www.omdbapi.com/apikey.aspx)

### Environment variables

Copy the example env file and fill in your API key:

```bash
cp .env.example .env
```

`.env.example`:

```env
OMDB_API_KEY=your_api_key_here
BASE_API_URL=http://www.omdbapi.com/
BASE_IMG_API_URL=http://img.omdbapi.com/
```

### Install dependencies

```bash
bun install
```

### Run development server

```bash
bun dev
```

The app starts at [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
bun run build
bun start
```

### Run tests

```bash
bun run test
```

## Notes

The sitemap includes only the main page. The movies database is too large to generate a separate static page for each movie.

Images are not self-hosted (served from an external API), so Next.js image optimization is not available for them.

There is a known bug in the OMDb API where filtering by year combined with any type other than "series" returns incorrect or empty results.

## Key Dependencies

| Dependency | Purpose |
| --- | --- |
| [Next.js 16](https://nextjs.org) | React framework with App Router and Turbopack |
| [React 19](https://react.dev) | UI library |
| [TypeScript 6](https://typescriptlang.org) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com) | Utility-first CSS |
| [Shadcn UI](https://ui.shadcn.com) | Component library built on Radix UI |
| [Vitest](https://vitest.dev) | Unit testing framework |
| [Recharts](https://recharts.org) | Charting library |
| [Zod](https://zod.dev) | Schema validation |
