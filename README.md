# roomtested.com

[RoomTested](https://roomtested.com) — home tech, tested in a real room. Independent
reviews, comparisons and setup guides for smart-home and desk gear, written by
Nicholas Edwards. Every product is tested in a real room before it's recommended.

Built with [Astro](https://astro.build), deployed on
[Cloudflare Workers](https://developers.cloudflare.com/workers/) (static assets + a
couple of tiny server endpoints).

```bash
pnpm install
pnpm dev        # local dev server
pnpm build      # static build + worker bundle
pnpm preview    # worker-exact preview via wrangler
```

Articles live in `src/content/{reviews,guides,comparisons}` (MDX). Product links route
through `/go/<id>` so they can be audited and updated in one place
(`src/data/products.json`).
