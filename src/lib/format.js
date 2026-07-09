const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export const money = (n) => usd.format(Number(n) || 0)

export const storageLabel = (gb) => {
  const n = Number(gb) || 0
  return n >= 1024 ? `${n / 1024} TB` : `${n} GB`
}

/** Buckets used by the storage filter. */
export const STORAGE_BUCKETS = [
  { label: '256 GB', test: (gb) => gb <= 256 },
  { label: '512 GB', test: (gb) => gb === 512 },
  { label: '1 TB', test: (gb) => gb === 1024 },
  { label: '2 TB+', test: (gb) => gb >= 2048 },
]

/** Buckets used by the RAM filter. */
export const RAM_BUCKETS = [
  { label: '16 GB', test: (gb) => gb <= 16 },
  { label: '24 GB', test: (gb) => gb === 24 },
  { label: '32 GB', test: (gb) => gb === 32 },
  { label: '36–48 GB', test: (gb) => gb >= 36 && gb <= 48 },
  { label: '64 GB+', test: (gb) => gb >= 64 },
]

export const GPU_TYPES = ['NVIDIA', 'AMD', 'Apple', 'Integrated']
export const CATEGORIES = ['Gaming', 'Business', 'Creator', 'Everyday']
