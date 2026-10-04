import { FormField } from '@/components/forms/FormField'
import { Select, TextInput } from '@/components/forms/inputs'
import { BOOLEAN_YES_LABEL, MEASURE_HELPER } from '@/lib/configurator/labels'
import type { ConfiguratorGroup, CustomFormatUnit, MeasureValue } from '@/lib/configurator/types'

/**
 * Non-choice controls for product-specific dimensions. They exist only when
 * the product schema explicitly enables them with confirmed data (see
 * normalizeProductConfigurationSchema) — a dimension whose values are
 * unknown never gets a control. Each one is a native fieldset so it is
 * announced by name like the option groups.
 */

const idFor = (key: string, part: string) => `cfg-${key}-${part}`

function Shell({ group, children }: { group: ConfiguratorGroup; children: React.ReactNode }) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="text-[1.0625rem] font-semibold text-primary">{group.label}</legend>
      {group.hint ? <p className="pc-text-footnote -mt-1 text-tertiary">{group.hint}</p> : null}
      {children}
    </fieldset>
  )
}

export function MeasureControl({
  group,
  value,
  onChange,
}: {
  group: ConfiguratorGroup
  value: MeasureValue | undefined
  onChange: (patch: Partial<MeasureValue>) => void
}) {
  const current: MeasureValue = value ?? { width: '', height: '', depth: '', unit: 'mm' }
  const helperId = idFor(group.key, 'helper')
  const axes: { part: 'width' | 'height' | 'depth'; label: string }[] = [
    { part: 'width', label: 'Largeur' },
    { part: 'height', label: 'Hauteur' },
    { part: 'depth', label: 'Profondeur' },
  ]
  return (
    <Shell group={group}>
      <div className="rounded-card-small border border-border-subtle p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {axes.map(({ part, label }) => (
            <FormField key={part} label={label} htmlFor={idFor(group.key, part)}>
              <TextInput
                id={idFor(group.key, part)}
                inputMode="decimal"
                autoComplete="off"
                aria-label={`${group.label} : ${label.toLowerCase()}`}
                aria-describedby={helperId}
                value={current[part]}
                onChange={(event) => onChange({ [part]: event.target.value })}
              />
            </FormField>
          ))}
          <FormField label="Unité" htmlFor={idFor(group.key, 'unit')}>
            <Select
              id={idFor(group.key, 'unit')}
              aria-label={`${group.label} : unité`}
              value={current.unit}
              onChange={(event) => onChange({ unit: event.target.value as CustomFormatUnit })}
            >
              <option value="mm">mm</option>
              <option value="cm">cm</option>
            </Select>
          </FormField>
        </div>
        <p id={helperId} className="pc-text-footnote mt-3 text-tertiary">
          {MEASURE_HELPER}
        </p>
      </div>
    </Shell>
  )
}

export function NumberControl({
  group,
  value,
  onChange,
}: {
  group: ConfiguratorGroup
  value: string | undefined
  onChange: (value: string) => void
}) {
  const id = idFor(group.key, 'number')
  return (
    <Shell group={group}>
      <FormField label={group.unit ? `Valeur (${group.unit})` : 'Valeur'} htmlFor={id}>
        <TextInput
          id={id}
          inputMode="decimal"
          autoComplete="off"
          aria-label={group.label}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      </FormField>
    </Shell>
  )
}

export function TextControl({
  group,
  value,
  onChange,
}: {
  group: ConfiguratorGroup
  value: string | undefined
  onChange: (value: string) => void
}) {
  const id = idFor(group.key, 'text')
  return (
    <Shell group={group}>
      <FormField label="Précision" htmlFor={id} description="Texte court — sans donnée personnelle.">
        <TextInput
          id={id}
          maxLength={80}
          autoComplete="off"
          aria-label={group.label}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        />
      </FormField>
    </Shell>
  )
}

export function BooleanControl({
  group,
  checked,
  onChange,
}: {
  group: ConfiguratorGroup
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  const id = idFor(group.key, 'flag')
  return (
    <Shell group={group}>
      <label htmlFor={id} className="inline-flex min-h-(--pc-touch-target-min) cursor-pointer items-center gap-3 text-[0.9375rem] text-primary">
        <input
          id={id}
          type="checkbox"
          className="h-5 w-5 accent-(--pc-color-action)"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        {BOOLEAN_YES_LABEL}
      </label>
    </Shell>
  )
}
