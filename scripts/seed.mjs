/**
 * Seeds the 50-laptop catalog into Supabase.
 * Usage: npm run seed   (requires .env with VITE_SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY — the service key bypasses RLS and must only
 * ever live on your machine / CI, never in the client bundle.)
 *
 * Prefer zero setup? Paste supabase/seed.sql into the SQL Editor instead —
 * it inserts the identical data.
 */
import { readFileSync, existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { LAPTOPS } from './laptops.js'

// Minimal .env loader — no dependencies, works on any Node version.
function loadEnv(path = '.env') {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.]+)\s*=\s*(.*)\s*$/)
    if (!m || line.trim().startsWith('#')) continue
    const val = m[2].replace(/^["']|["']$/g, '')
    if (!(m[1] in process.env)) process.env[m[1]] = val
  }
}
loadEnv()

const url = process.env.VITE_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey || url.includes('YOUR-PROJECT-REF')) {
  console.error(
    'Missing credentials. Copy .env.example to .env and set VITE_SUPABASE_URL ' +
      'and SUPABASE_SERVICE_ROLE_KEY (Supabase dashboard → Project settings → API).'
  )
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const rows = LAPTOPS.map((l) => ({ ...l, featured: Boolean(l.featured), in_stock: true }))

console.log(`Seeding ${rows.length} laptops into ${url} ...`)

const { data, error } = await supabase
  .from('products')
  .upsert(rows, { onConflict: 'brand,model' })
  .select('id')

if (error) {
  console.error('Seed failed:', error.message)
  console.error('Did you run supabase/schema.sql in the SQL Editor first?')
  process.exit(1)
}

console.log(`Done — ${data.length} products upserted. Open the store and they will be live.`)
