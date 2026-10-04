import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import type { ConfiguratorGroupKey, ConfiguratorOption as OptionData, ConfiguratorSelectionMode } from '@/lib/configurator/types'

/**
 * One selectable choice, rendered as a card. Uses a real radio (single) or
 * checkbox (multiple) input — visually hidden but focusable — so keyboard
 * and assistive-tech behaviour is native. The selected state is carried by
 * the indicator (filled dot / check mark) plus border and background, never
 * by colour alone. A thumbnail is shown only when the CMS provides one.
 */
export function ConfiguratorOption({
  groupKey,
  option,
  mode,
  checked,
  onChange,
}: {
  groupKey: ConfiguratorGroupKey
  option: OptionData
  mode: ConfiguratorSelectionMode
  checked: boolean
  onChange: () => void
}) {
  const inputId = `cfg-${option.id}`
  const titleId = `${inputId}-title`
  const descId = option.description ? `${inputId}-desc` : undefined
  const isRadio = mode === 'single'

  return (
    <label htmlFor={inputId} className="relative block cursor-pointer">
      <input
        id={inputId}
        type={isRadio ? 'radio' : 'checkbox'}
        name={`cfg-${groupKey}`}
        value={option.value}
        checked={checked}
        onChange={onChange}
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="peer sr-only"
      />
      <span className="flex h-full min-h-[var(--pc-touch-target-min)] flex-col overflow-hidden rounded-card-small border border-border-default bg-canvas transition-colors duration-[var(--pc-duration-fast)] hover:border-border-strong peer-checked:border-action peer-checked:bg-selected peer-focus-visible:outline-solid peer-focus-visible:outline-(length:--pc-border-focus) peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--pc-color-focus) motion-reduce:transition-none">
        {option.image ? (
          <span className="relative block aspect-[4/3] w-full bg-alternate">
            <ResponsiveImage media={option.image} payloadSize="card" sizes="(min-width: 1069px) 200px, 45vw" fill />
          </span>
        ) : null}
        <span className="flex items-start gap-3 p-3">
          <span
            aria-hidden="true"
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border ${
              isRadio ? 'rounded-full' : 'rounded-[var(--pc-radius-xs)]'
            } ${checked ? 'border-action' : 'border-border-strong'}`}
          >
            {checked ? (
              isRadio ? (
                <span className="h-2.5 w-2.5 rounded-full bg-action" />
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-action">
                  <path d="M2.5 6.5L5 9L9.5 3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )
            ) : null}
          </span>
          <span className="flex min-w-0 flex-col gap-1">
            <span id={titleId} className={`text-[0.9375rem] text-primary ${checked ? 'font-semibold' : 'font-medium'}`}>
              {option.label}
            </span>
            {option.description ? (
              <span id={descId} className="pc-text-footnote line-clamp-2 text-secondary">
                {option.description}
              </span>
            ) : null}
          </span>
        </span>
      </span>
    </label>
  )
}
