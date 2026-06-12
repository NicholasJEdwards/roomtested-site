# CI staging — `deploy.yml`

`ci/deploy.yml` is the GitHub Actions push-to-deploy workflow, **staged here** because
GitHub rejects pushes that create `.github/workflows/*` unless the pushing token has the
`workflow` scope (the current `gh` login has `gist, read:org, repo` — no `workflow`).

It is the robust alternative to Cloudflare's Workers Builds trigger (which isn't firing —
see `../../docs/PROGRESS.md` Phase 5). It builds (`pnpm build`) + deploys
(`wrangler deploy`) on every push to `main`, but only once two repo secrets exist —
until then it runs **green-and-skipped**.

## Activate (one-time)

```bash
# 1. grant the workflow scope to the gh login (interactive — device/browser flow)
gh auth refresh -h github.com -s workflow

# 2. move the workflow into place and push (from the site repo root)
mkdir -p .github/workflows && git mv ci/deploy.yml .github/workflows/deploy.yml
git commit -m "ci: enable GitHub Actions push-to-deploy" && git push

# 3. set the secrets (needs a Cloudflare token with Workers Scripts:Edit — see
#    ../../docs/runbooks/deploy.md)
gh secret set CLOUDFLARE_API_TOKEN  --repo NicholasJEdwards/roomtested-site --body "<token>"
gh secret set CLOUDFLARE_ACCOUNT_ID --repo NicholasJEdwards/roomtested-site --body "ea19fb59f38e072f84d12cd0940dc747"

# 4. trigger a deploy of current main
gh workflow run deploy.yml --repo NicholasJEdwards/roomtested-site
```

Manual fallback that needs none of the above (just a scoped token in the env):
`cd site && set -a && . ../.env && set +a && pnpm deploy`.
