/**
 * Regenerates supabase/seed.sql from scripts/laptops.js.
 * Run with: npm run gen:sql
 * (A generated copy is already checked in, so this is only needed after
 * editing the dataset.)
 */
import { writeFileSync } from 'node:fs'
import { LAPTOPS } from './laptops.js'

const q = (s) => `'${String(s).replace(/'/g, "''")}'`

const values = LAPTOPS.map((l) =>
  `  (${q(l.brand)}, ${q(l.model)}, ${l.price}, ${q(l.category)}, ${q(l.cpu)}, ${q(l.gpu)}, ${q(
    l.gpu_type
  )}, ${l.ram_gb}, ${l.storage_gb}, ${q(l.display)}, ${q(l.battery)}, ${q(l.gradient_from)}, ${q(
    l.gradient_to
  )}, ${l.featured ? 'true' : 'false'})`
).join(',\n')

const sql = `-- ============================================================================
-- SPECTRA — catalog seed (${LAPTOPS.length} laptops)
-- Generated from scripts/laptops.js — run AFTER schema.sql in the SQL Editor.
-- Safe to re-run: upserts on (brand, model).
-- ============================================================================

insert into public.products
  (brand, model, price, category, cpu, gpu, gpu_type, ram_gb, storage_gb, display, battery, gradient_from, gradient_to, featured)
values
${values}
on conflict (brand, model) do update set
  price      = excluded.price,
  category   = excluded.category,
  cpu        = excluded.cpu,
  gpu        = excluded.gpu,
  gpu_type   = excluded.gpu_type,
  ram_gb     = excluded.ram_gb,
  storage_gb = excluded.storage_gb,
  display    = excluded.display,
  battery    = excluded.battery,
  gradient_from = excluded.gradient_from,
  gradient_to   = excluded.gradient_to,
  featured   = excluded.featured;
`

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), sql)
console.log(`Wrote supabase/seed.sql (${LAPTOPS.length} rows).`)
