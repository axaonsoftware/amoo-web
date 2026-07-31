This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

This app ships as a Docker image (standalone Next.js build — see `Dockerfile`
and `next.config.ts`'s `output: "standalone"`). The full-stack deployment
(nginx reverse proxy + this frontend + the Express backend + PostgreSQL) lives
in the repository-root `docker-compose.yml` — that is the single supported
deployment environment, driven by the GitHub Actions `deploy.yml` workflow.

At build time the Docker image requires these build args (`NEXT_PUBLIC_*`
values are inlined into the client bundle and also feed the CSP
`connect-src` directive):

- `NEXT_PUBLIC_API_URL` — real production API origin (e.g. `https://your-domain/api`)
- `NEXT_PUBLIC_SITE_NAME`
- `NEXT_PUBLIC_CONTACT_EMAIL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
