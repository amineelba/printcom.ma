import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { optionPresentation } from '@/lib/configurator/presentation'
import type { ConfiguratorGroupKey, ConfiguratorOption as OptionData, ConfiguratorSelectionMode } from '@/lib/configurator/types'

/** Generic outline of a sheet: a plain UI cue (not product photography) for orientation. */
function OrientationGlyph({ value }: { value: string }) {
  const size = value === 'portrait' ? 'h-6 w-4' : value === 'landscape' ? 'h-4 w-6' : value === 'square' ? 'h-5 w-5' : null
  if (!size) return null
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 self-center rounded-[var(--pc-radius-xs)] border border-border-strong bg-alternate ${size}`}
    />
  )
}

/**
 * One selectable choice, rendered as a card. Uses a real radio (single) or
 * checkbox (multiple) input — visually hidden but focusable — so keyboard
 * and assistive-tech behaviour is native. The selected state is carried by
 * the indicator (filled dot / check mark) plus border and background, never
 * by colour alone.
 *
 * Presentation is inferred from the data: no image → text card; image on a
 * format/material/finish → large image card; image on a compact group
 * (quantity, page count, …) → small inline thumbnail. The option's own
 * `previewImage` is not rendered here — it drives the main preview only.
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
  const presentation = optionPresentation(groupKey, Boolean(option.image))

  // The visible label already names the option: don't repeat it as alt text.
  const thumbnail = option.image
    ? {
        ...option.image,
        alt:
          option.image.alt && option.image.alt.trim().toLowerCase() !== option.label.trim().toLowerCase()
            ? option.image.alt
            : '',
      }
    : undefined

  return (
    <label htmlFor={inputId} className="relative block h-full cursor-pointer">
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
        {presentation === 'media' && thumbnail ? (
          <span className="relative block aspect-[4/3] w-full bg-alternate">
            <ResponsiveImage media={thumbnail} payloadSize="card" sizes="(min-width: 1069px) 200px, 45vw" fill />
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
          {presentation === 'inline' && thumbnail ? (
            <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-[var(--pc-radius-xs)] bg-alternate">
              <ResponsiveImage media={thumbnail} payloadSize="thumbnail" sizes="40px" fill />
            </span>
          ) : null}
          {groupKey === 'orientation' && presentation === 'text' ? <OrientationGlyph value={option.value} /> : null}
          <span className="flex min-w-0 flex-col gap-1">
            <span id={titleId} className={`text-[0.9375rem] text-primary ${checked ? 'font-semibold' : 'font-medium'}`}>
              {option.label}
            </span>
            {option.description ? (
              <span id={descId} className="pc-text-footnote text-secondary">
                {option.description}
              </span>
            ) : null}
          </span>
        </span>
      </span>
    </label>
  )
}
