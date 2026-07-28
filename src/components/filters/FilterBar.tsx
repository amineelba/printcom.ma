'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export interface FilterOption {
  label: string
  value: string
}

export interface FilterDefinition {
  key: string
  label: string
  options: FilterOption[]
}

/**
 * Renders one <select> per filter dimension. Each change updates the URL
 * search params (shareable, back/forward-friendly) and resets pagination.
 */
export function FilterBar({ filters }: { filters: FilterDefinition[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const hasActiveFilters = filters.some((filter) => searchParams.get(filter.key))

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  const reset = () => {
    router.push(pathname)
  }

  return (
    <div className="flex flex-wrap items-center gap-3" role="group" aria-label="Filtrer le catalogue">
      {filters.map((filter) => (
        <div key={filter.key} className="relative">
          <label className="sr-only" htmlFor={`filter-${filter.key}`}>
            {filter.label}
          </label>
          <select
            id={`filter-${filter.key}`}
            value={searchParams.get(filter.key) ?? ''}
            onChange={(event) => updateParam(filter.key, event.target.value)}
            className="h-[var(--pc-field-height)] rounded-control border border-border-default bg-canvas pl-4 pr-8 text-[0.9375rem] text-primary"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
      {hasActiveFilters ? (
        <button type="button" onClick={reset} className="text-[0.9375rem] font-medium text-link">
          Réinitialiser
        </button>
      ) : null}
    </div>
  )
}
