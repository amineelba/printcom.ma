'use client'

import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/forms/FormField'
import { Select, TextInput } from '@/components/forms/inputs'
import {
  buildConfigurationSummary,
  buildQuoteHref,
  createInitialConfigurationState,
  selectSingleOption,
  toggleMultipleOption,
  updateCustomFormat,
} from '@/lib/configurator/state'
import { trackEvent } from '@/lib/analytics/track'
import { CUSTOM_FORMAT_HELPER } from '@/lib/configurator/labels'
import { resolvePreviewMedia } from '@/lib/configurator/preview'
import {
  CUSTOM_FORMAT_VALUE,
  type ConfiguratorGroup as GroupData,
  type CustomFormatUnit,
  type ProductConfigurationState,
  type ProductConfiguratorData,
} from '@/lib/configurator/types'
import { ConfiguratorGroup } from './ConfiguratorGroup'
import { ConfiguratorSummary } from './ConfiguratorSummary'
import { ProductPreview } from './ProductPreview'

type SingleKey = keyof ProductConfigurationState['single']

/**
 * Reusable product configurator. Receives the normalized, serializable
 * `ProductConfiguratorData` (built server-side) and owns only the
 * interactive state: one `ProductConfigurationState` object. It starts from
 * `initialState` when the page was opened with a configuration restored from
 * the URL (the checkout's "Modifier" link), otherwise from the defaults. The
 * CTA serializes that same state into the checkout link (see
 * lib/configurator/transport) — nothing else is persisted client-side.
 *
 * `intro` is server-rendered content (category, H1, description) slotted
 * into the layout so the page's core copy stays in the server tree.
 */
export function ProductConfigurator({
  data,
  intro,
  initialState,
}: {
  data: ProductConfiguratorData
  intro: ReactNode
  /** Canonical state restored server-side from the URL; defaults when absent. */
  initialState?: ProductConfigurationState
}) {
  const [state, setState] = useState<ProductConfigurationState>(
    () => initialState ?? createInitialConfigurationState(data),
  )
  const startedRef = useRef(false)
  const summaryRows = useMemo(() => buildConfigurationSummary(data, state), [data, state])

  // Main preview. Base = the gallery image the visitor last picked (primary
  // image to start with). A selected option's `previewImage` overrides it.
  // Clicking a gallery thumbnail "pins" that image over any option override
  // until the next option change, which re-evaluates the override — so the
  // preview never hides state the visitor just chose.
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [galleryPinned, setGalleryPinned] = useState(false)
  const baseMedia = data.media[galleryIndex] ?? data.media[0]
  const preview = galleryPinned
    ? { media: baseMedia, source: 'base' as const }
    : resolvePreviewMedia({ baseMedia, groups: data.groups, selection: state })
  const customSelected = state.single.format === CUSTOM_FORMAT_VALUE

  const isSelected = (group: GroupData) => (value: string) =>
    group.selectionMode === 'multiple'
      ? (state.multiple.finish ?? []).includes(value)
      : state.single[group.key as SingleKey] === value

  const onToggle = (group: GroupData) => (value: string) => {
    setGalleryPinned(false)
    const wasSelected = isSelected(group)(value)
    const next =
      group.selectionMode === 'multiple'
        ? toggleMultipleOption(state, group, value)
        : selectSingleOption(state, group.key as SingleKey, value)
    setState(next)

    // Instrumentation. Only real visitor choices land here — restored and
    // auto-selected state never goes through onToggle.
    const slug = data.product.slug
    if (!startedRef.current) {
      startedRef.current = true
      trackEvent('configurator_started', { product_slug: slug, group_key: group.key })
    }
    trackEvent('configurator_option_selected', {
      product_slug: slug,
      group_key: group.key,
      option_value: value,
      action: wasSelected ? 'deselected' : 'selected',
      selected_group_count: buildConfigurationSummary(data, next).length,
    })
  }

  return (
    <div className="mt-8 grid gap-x-12 gap-y-8 lg:grid-cols-2">
      <div className="lg:col-start-2 lg:row-start-1">{intro}</div>

      <div className="lg:sticky lg:top-[calc(var(--pc-nav-height)_+_var(--pc-local-nav-height)_+_var(--pc-space-6))] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start">
        <ProductPreview
          media={data.media}
          shownMedia={preview.media}
          activeIndex={preview.source === 'option' ? -1 : galleryIndex}
          onSelect={(index) => {
            setGalleryIndex(index)
            setGalleryPinned(true)
          }}
          title={data.product.title}
        />
      </div>

      <div className="flex min-w-0 flex-col gap-8 lg:col-start-2 lg:row-start-2">
        {data.groups.map((group) => (
          <ConfiguratorGroup key={group.key} group={group} isSelected={isSelected(group)} onToggle={onToggle(group)}>
            {group.key === 'format' && customSelected ? (
              <CustomFormatFields
                value={state.customFormat}
                onChange={(patch) => setState((current) => updateCustomFormat(current, patch))}
              />
            ) : null}
          </ConfiguratorGroup>
        ))}

        {data.groups.length ? <ConfiguratorSummary productTitle={data.product.title} rows={summaryRows} /> : null}

        <div>
          <Button
            href={buildQuoteHref(data.product.slug, state)}
            size="large"
            className="w-full sm:w-auto"
            onClick={() =>
              trackEvent('configurator_completed', {
                product_slug: data.product.slug,
                selected_group_count: summaryRows.length,
                group_count: data.groups.length,
              })
            }
          >
            Obtenir mon devis
          </Button>
        </div>
      </div>
    </div>
  )
}

function CustomFormatFields({
  value,
  onChange,
}: {
  value: ProductConfigurationState['customFormat']
  onChange: (patch: Partial<ProductConfigurationState['customFormat']>) => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-card-small border border-border-subtle p-4">
      <div className="grid grid-cols-[1fr_1fr_6rem] gap-3">
        <FormField label="Largeur" htmlFor="cfg-custom-width">
          <TextInput
            id="cfg-custom-width"
            inputMode="decimal"
            autoComplete="off"
            aria-describedby="cfg-custom-helper"
            value={value.width}
            onChange={(event) => onChange({ width: event.target.value })}
          />
        </FormField>
        <FormField label="Hauteur" htmlFor="cfg-custom-height">
          <TextInput
            id="cfg-custom-height"
            inputMode="decimal"
            autoComplete="off"
            aria-describedby="cfg-custom-helper"
            value={value.height}
            onChange={(event) => onChange({ height: event.target.value })}
          />
        </FormField>
        <FormField label="Unité" htmlFor="cfg-custom-unit">
          <Select
            id="cfg-custom-unit"
            value={value.unit}
            onChange={(event) => onChange({ unit: event.target.value as CustomFormatUnit })}
          >
            <option value="mm">mm</option>
            <option value="cm">cm</option>
          </Select>
        </FormField>
      </div>
      <p id="cfg-custom-helper" className="pc-text-footnote text-tertiary">
        {CUSTOM_FORMAT_HELPER}
      </p>
    </div>
  )
}
