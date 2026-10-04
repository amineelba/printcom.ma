'use client'

import { useEffect, useRef } from 'react'

/**
 * Runs `fire` once per mounted view. The ref survives React StrictMode's
 * simulated unmount/remount in development, so a view is counted once, not
 * twice. Never runs during server rendering.
 */
export function useTrackOnce(fire: () => void): void {
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    fire()
    // `fire` is intentionally read once, at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
