import type { ReactNode } from 'react'
import type { ConfiguratorGroup as GroupData } from '@/lib/configurator/types'
import { optionPresentation } from '@/lib/configurator/presentation'
import { ConfiguratorOption } from './ConfiguratorOption'

/**
 * One product decision (format, support, …). A native fieldset/legend, so
 * the group is announced with its name. Options without thumbnails wrap as
 * compact cards; as soon as one option has an image the group becomes a
 * small grid so image cards line up — same card either way.
 */
export function ConfiguratorGroup({
  group,
  isSelected,
  onToggle,
  children,
}: {
  group: GroupData
  isSelected: (value: string) => boolean
  onToggle: (value: string) => void
  /** Extra controls tied to the group (the custom-format inputs). */
  children?: ReactNode
}) {
  const hasImages = group.options.some((option) => optionPresentation(group.key, Boolean(option.image)) === 'media')

  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="text-[1.0625rem] font-semibold text-primary">{group.label}</legend>
      {group.hint ? <p className="pc-text-footnote -mt-1 text-tertiary">{group.hint}</p> : null}
      <div className={hasImages ? 'grid grid-cols-2 items-start gap-3 sm:grid-cols-3' : 'flex flex-wrap gap-3'}>
        {group.options.map((option) => (
          <div key={option.id} className={hasImages ? undefined : 'min-w-[8rem] flex-1 sm:flex-none'}>
            <ConfiguratorOption
              groupKey={group.key}
              option={option}
              mode={group.selectionMode}
              checked={isSelected(option.value)}
              onChange={() => onToggle(option.value)}
            />
          </div>
        ))}
      </div>
      {children}
    </fieldset>
  )
}
