export default function SetupNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="glass w-full max-w-xl rounded-2xl p-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">Setup required</p>
        <h1 className="font-display mt-3 text-2xl font-semibold">Connect Supabase to launch the store</h1>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          The app is running, but it has no database credentials yet. Copy{' '}
          <code className="rounded bg-void px-1.5 py-0.5 font-mono text-xs text-fog">.env.example</code> to{' '}
          <code className="rounded bg-void px-1.5 py-0.5 font-mono text-xs text-fog">.env</code>, paste your
          Supabase project URL and anon key, then restart <span className="font-mono">npm run dev</span>.
          The full walkthrough — schema, seeding the 50 laptops, the verification-email template, and the
          one-time admin claim — is in <span className="font-mono">README.md</span>.
        </p>
      </div>
    </div>
  )
}
