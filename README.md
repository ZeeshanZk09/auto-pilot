# SEO PBN Autopilot

> Automated article spinning and bulk publishing system for WordPress networks.

SEO PBN Autopilot is a Next.js web application that streamlines content management across multiple WordPress sites. Upload articles in bulk via Excel, let the system spin (paraphrase) the content to produce unique variations, and publish them directly to your WordPress properties — all from a single dashboard.

## Features

- **Bulk Upload** — Import articles from `.xlsx` or `.csv` files (columns: Title, Content, Keywords, Website).
- **Article Spinning** — Automatically rewrites content using a synonym engine to generate unique variations.
- **WordPress Publishing** — Publishes spun articles to configured WordPress sites via the REST API.
- **Website Manager** — Add and manage multiple WordPress sites with credentials stored securely.
- **Dashboard** — Monitor published/pending article counts, recent activity, and live links at a glance.
- **Authentication** — Secure user accounts with NextAuth.js session management.

## Tech Stack

- [Next.js 15](https://nextjs.org) (App Router)
- [Drizzle ORM](https://orm.drizzle.team) + SQLite
- [shadcn/ui](https://ui.shadcn.com) component library
- [NextAuth.js](https://next-auth.js.org) for authentication

## Getting Started

### Prerequisites

- Node.js 18+
- npm / yarn / pnpm / bun

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
AUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Register / Login** — Create an account or sign in.
2. **Add Websites** — Go to *Websites* and add your WordPress sites with URL, username, and application password.
3. **Upload Articles** — Go to *Upload*, select an Excel file with the required columns (Title, Content, Keywords, Website), and submit.
4. **Publish** — Open the *Articles* queue, review pending articles, and click *Publish* to spin and post them to WordPress.

## Deploy on Vercel

The easiest way to deploy is via the [Vercel Platform](https://vercel.com/new).

See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for full details.
