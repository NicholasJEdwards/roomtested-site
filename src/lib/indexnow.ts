// IndexNow key for instant-recrawl pings (Bing / Yandex / Seznam / others via the shared
// IndexNow API). IndexNow auth is NOT an account: ownership is proven by hosting a key file
// at the site root whose contents equal the key. We host it as a static file in
// `public/<key>.txt`, so Astro copies it verbatim to `https://roomtested.com/<key>.txt`.
//
// This module is the single source of truth for the key + its locations. The ops repo's
// rt-index job (`scripts/rt_index.py`) submits URLs to the IndexNow API using exactly these
// values (it reads the same `public/<key>.txt`), so keep them in sync. To rotate the key:
// generate a new 32+ hex string, rename `public/<old>.txt` → `public/<new>.txt`, update the
// constant below, deploy, then re-ping.
//
// Generated with: python3 -c "import secrets; print(secrets.token_hex(32))"

import { SITE } from '../consts';

/** The IndexNow key (64 hex chars). Must equal the contents of `public/<key>.txt`. */
export const INDEXNOW_KEY = '167d7bc073168181af87d7a2d01fcf2b914149a5e64b7290394becbd3d1f2e17';

/** Public URL of the key file IndexNow fetches to verify ownership. */
export const INDEXNOW_KEY_LOCATION = `${SITE.url}/${INDEXNOW_KEY}.txt`;
