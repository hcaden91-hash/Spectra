import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-mist">404</p>
      <h1 className="font-display mt-3 text-3xl font-bold">Nothing on this shelf</h1>
      <p className="mt-3 text-sm text-mist">The page you're after doesn't exist.</p>
      <Link to="/" className="btn-primary mt-6 px-5 py-2.5 text-sm">
        Back to the store
      </Link>
    </div>
  )
}
