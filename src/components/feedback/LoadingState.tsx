export function LoadingState({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-secondary">
      <span
        aria-hidden="true"
        className="h-5 w-5 animate-spin rounded-full border-2 border-border-default border-t-action"
      />
      <span>{label}</span>
    </div>
  )
}
