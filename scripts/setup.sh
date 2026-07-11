#!/usr/bin/env bash
#
# Bootstrap the project on a fresh clone.
# Installs all node dependencies and sanity-checks the environment.
#
# Usage:
#   npm run setup          # normal install (npm install)
#   npm run setup -- --ci  # clean, reproducible install (npm ci)
#
set -euo pipefail

# Move to the project root regardless of where the script is called from.
cd "$(dirname "$0")/.."

MIN_NODE_MAJOR=18

info()  { printf '\033[0;34m▸\033[0m %s\n' "$1"; }
ok()    { printf '\033[0;32m✓\033[0m %s\n' "$1"; }
warn()  { printf '\033[0;33m!\033[0m %s\n' "$1"; }
fail()  { printf '\033[0;31m✗\033[0m %s\n' "$1" >&2; exit 1; }

# 1. Check Node is installed and new enough.
command -v node >/dev/null 2>&1 || fail "Node.js is not installed. Install Node ${MIN_NODE_MAJOR}+ from https://nodejs.org"
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt "$MIN_NODE_MAJOR" ]; then
  fail "Node ${MIN_NODE_MAJOR}+ required, found $(node -v). Please upgrade."
fi
ok "Node $(node -v) detected"

# 2. Install dependencies. Use `npm ci` when asked (clean, lockfile-exact) or
#    when no node_modules exists yet; otherwise a plain `npm install`.
if [ "${1:-}" = "--ci" ]; then
  info "Installing dependencies with 'npm ci' (clean, lockfile-exact)…"
  npm ci
else
  info "Installing dependencies with 'npm install'…"
  npm install
fi
ok "Dependencies installed"

# 3. Warn if the .env file is missing the Supabase keys the app needs at runtime.
if [ ! -f .env ]; then
  warn "No .env file found. Create one with:"
  printf '    EXPO_PUBLIC_SUPABASE_URL=...\n    EXPO_PUBLIC_SUPABASE_ANON_KEY=...\n'
else
  ok ".env present"
fi

# 4. Run Expo's own dependency/version check (non-fatal — it only reports).
info "Running 'expo-doctor' to verify the install…"
if npx --yes expo-doctor; then
  ok "expo-doctor passed"
else
  warn "expo-doctor reported issues (see above) — usually safe to continue"
fi

ok "Setup complete. Start the app with: npm start"
