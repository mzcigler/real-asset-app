# Supabase Local Development — Working Notes

Project: `real-asset-app` · Machine: Ubuntu · CLI installed via `.deb`

---

## 1. Installing the CLI on Ubuntu

Homebrew isn't available on Ubuntu (`brew: command not found`). Two working options:

### Option A — `.deb` package (what's installed here)

```bash
curl -s https://api.github.com/repos/supabase/cli/releases/latest \
  | grep "browser_download_url.*linux_amd64.deb" \
  | cut -d '"' -f 4 \
  | wget -qi -

sudo dpkg -i supabase_*_linux_amd64.deb
supabase --version
```

Upgrading means re-running this. There is **no official Supabase apt repo** — don't add a third-party one.

### Option B — per-project via npm

```bash
npm i supabase --save-dev
npx supabase --version
```

Pins the CLI version in `package.json` so local and CI stay in sync. `npm i -g supabase` is **not** supported; as a dev dependency it's fine.

### Docker (required either way)

On Ubuntu use Docker Engine, not Docker Desktop:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker          # or log out and back in
docker run hello-world
```

Skipping `usermod` causes `supabase start` to fail with permission denied on `/var/run/docker.sock`.

---

## 2. Linking to the hosted project

Run **everything from the project root** (`~/projects/real-asset-app`), never from inside `supabase/` — the CLI looks for `./supabase/config.toml` relative to the working directory and will otherwise create a nested `supabase/supabase/`.

```bash
supabase login
supabase link --project-ref <project-ref>
```

### Finding the project ref

A 20-char lowercase string. Any of:

- Dashboard URL: `https://supabase.com/dashboard/project/<project-ref>`
- API URL: `https://<project-ref>.supabase.co`
- Dashboard → Project Settings → General → "Reference ID"
- `head -5 supabase/config.toml` — the `project_id` field

Or skip the flag entirely for an interactive picker:

```bash
supabase link
```

It will prompt for the database password (resettable under Settings → Database).

---

## 3. Pulling the remote schema

```bash
supabase db pull                          # → supabase/migrations/<ts>_remote_schema.sql
supabase db pull --schema auth,storage    # if those schemas are customised
supabase db dump --data-only -f supabase/seed.sql   # data is NOT included by default
```

---

## 4. Running the local stack

```bash
supabase start
supabase db reset      # wipes LOCAL db, replays migrations + seed.sql
supabase status        # re-print creds if the start output scrolled away
```

`db reset` only touches the local container — safe, run it constantly.
`db push` goes the **other** direction, to production — that's the careful one.

### Local endpoints

| Service | URL |
|---|---|
| API / Project URL | `http://127.0.0.1:54321` |
| REST | `http://127.0.0.1:54321/rest/v1` |
| GraphQL | `http://127.0.0.1:54321/graphql/v1` |
| Postgres | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| Studio | `http://127.0.0.1:54323` |
| Mailpit (auth emails) | `http://127.0.0.1:54324` |
| MCP | `http://127.0.0.1:54321/mcp` |

Local keys are identical on every machine and are baked into the CLI binary, so they are
not secrets. They are still left out of this file: secret scanners match on their shape,
not their sensitivity, and a literal here blocks every push. Print them when needed:

```bash
supabase status            # publishable + secret key for the local stack
```

### Stopping

```bash
supabase stop              # shuts down, wipes local db
supabase stop --backup     # dumps db to supabase/.branches/, restored on next start
supabase stop --all        # every Supabase project on the machine
```

Fallback if the CLI loses track of containers:

```bash
docker ps -a --filter name=supabase_ -q | xargs docker rm -f
```

`supabase_edge_runtime_*` showing as stopped is normal — it only starts with `functions serve`.

---

## 5. Edge functions

### Pulling existing ones

```bash
supabase functions list
supabase functions download <function-name>

# all of them
supabase functions list --output json | jq -r '.[].slug' | xargs -n1 supabase functions download
```

Two caveats:

- **Download overwrites local files.** Commit or stash first.
- **Old deploys come back minified.** Functions deployed with older CLI versions were esbuild-bundled; the download is unreadable. Git history is the better recovery path there.

If `supabase/functions/` already has readable `index.ts` files, don't pull — just serve.

### Creating

```bash
supabase functions new my-function      # → supabase/functions/my-function/index.ts
```

Folder name = URL slug. Hyphens fine.

### Serving locally

```bash
supabase functions serve                # all, hot reload
supabase functions serve my-function    # one
supabase functions serve --no-verify-jwt
```

```bash
curl -i --request POST 'http://127.0.0.1:54321/functions/v1/my-function' \
  --header "Authorization: Bearer $(supabase status -o env | grep ANON_KEY | cut -d= -f2-)" \
  --header 'Content-Type: application/json' \
  --data '{"name":"Matjaz"}'
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` are injected automatically. Own secrets go in `supabase/functions/.env` (gitignore it), loaded by default or via `--env-file`.

**Gotcha:** local `serve` runs one shared Deno instance; production isolates per invocation. Module-level state that persists locally may not persist in production — don't rely on it for caching.

---

## 6. Pushing a function to production

The verb is `deploy`, not `push` (`db push` is for migrations only).

```bash
cd ~/projects/real-asset-app

supabase functions deploy my-function     # one function
supabase functions deploy                 # all functions
```

Flags:

```bash
--no-verify-jwt          # public webhooks (Stripe etc.) with no Supabase token
--project-ref <ref>      # if not linked, or targeting a different project
--use-api                # bundle server-side, skips Docker, faster
```

### Order of operations

1. `supabase db push` — migrations first. Deploying a function does **not** create tables it queries.
2. `supabase secrets set --env-file ./supabase/functions/.env` — the local `.env` is **not** uploaded with the function; a deploy without this crashes on missing env vars.
3. `supabase functions deploy <name>`

```bash
supabase secrets list      # verify
```

Never set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, or `SUPABASE_SERVICE_ROLE_KEY` as secrets — they're injected automatically.

### Verifying the deploy

```bash
curl -i --request POST 'https://<project-ref>.supabase.co/functions/v1/my-function' \
  --header 'Authorization: Bearer <REMOTE-anon-key>' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Matjaz"}'
```

Use the **remote** anon key from the dashboard, not the local `sb_publishable_...`.

- 401 → wrong key (probably the local one)
- 500 → check `supabase functions logs my-function`, or Dashboard → Edge Functions → Logs

---

## 7. Function template

```ts
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
      },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: req.headers.get("Authorization")! } } },
  );

  const { data, error } = await supabase.from("assets").select("*").limit(10);
  if (error) return new Response(error.message, { status: 400 });

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
});
```

Passing the caller's `Authorization` header through is what makes RLS apply **as that user**. Without it you get the anon role. Use `SUPABASE_SERVICE_ROLE_KEY` only when deliberately bypassing RLS — never return its results unfiltered to a browser.

The `OPTIONS` block matters more than it looks: without it, browser calls fail at preflight. This is the usual cause of "works in curl, breaks in my app".

---

## 8. Deploy checklist for the PDF task-extraction function

This one (`resolvePDFJS` + OpenAI) has specifics worth checking before deploy:

- [ ] `OPENAI_API_KEY` pushed via `supabase secrets set` — it's the only non-injected env var, and a missing one fails silently as an empty `Bearer ` header → 401 from OpenAI, surfacing as an empty task list rather than an error.
- [ ] `user_files` storage bucket exists remotely, with matching policies.
- [ ] It uses `SUPABASE_SERVICE_ROLE_KEY`, so **RLS is bypassed** — any caller can read any path passed as `file_path`. Validate that the path belongs to the authenticated user, or keep JWT verification on and check the caller.
- [ ] Mixed import styles (`https://esm.sh/...` and `npm:...`) both work, but pinning versions on both avoids surprise breakage. `npm:@supabase/supabase-js` is unpinned.
- [ ] `MODEL_CONFIG.model` is `gpt-4` with an 8192 token limit. Worth revisiting — newer models have far larger context windows, which would cut the number of batches significantly.
- [ ] `llmResponse.ok` is never checked before reading `choices[0]`. An OpenAI error response parses fine, yields `""`, hits the fallback parser, and returns an empty array with a 200. Add a status check.

---

## 9. Editor setup (Deno)

Edge functions are Deno; the app is Node. Scope the Deno extension so they don't fight:

```json
// .vscode/settings.json
{
  "deno.enable": true,
  "deno.enablePaths": ["./supabase/functions"],
  "deno.lint": true,
  "deno.unstable": ["bare-node-builtins", "byonm"]
}
```

Add `supabase/functions/deno.json` for the import map.

---

## 10. Quick reference

| Task | Command |
|---|---|
| Start stack | `supabase start` |
| Stop stack | `supabase stop` / `--backup` |
| Show creds | `supabase status` |
| Pull schema | `supabase db pull` |
| New migration | `supabase migration new <name>` |
| Capture Studio changes | `supabase db diff -f <name>` |
| Apply locally | `supabase db reset` |
| Ship schema | `supabase db push` |
| New function | `supabase functions new <name>` |
| Serve functions | `supabase functions serve` |
| Download function | `supabase functions download <name>` |
| **Ship function** | `supabase functions deploy <name>` |
| Push secrets | `supabase secrets set --env-file ./supabase/functions/.env` |
| Function logs | `supabase functions logs <name>` |

**CLI is outdated:** v2.78.1 installed, v2.111.0 available. Re-run the `.deb` install from section 1 to update.