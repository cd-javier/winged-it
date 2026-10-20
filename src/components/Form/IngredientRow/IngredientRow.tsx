import { INGREDIENT_UNITS } from '../../../lib/recipeForm';
import type { IngredientRowValue, RowErrors } from '../../../lib/recipeForm';
import type { IngredientUnit } from '../../../types/recipe';
import Field from '../Field/Field';
import RemoveButton from '../RemoveButton/RemoveButton';
import RowCard from '../RowCard/RowCard';
import Select from '../Select/Select';
import TextInput from '../TextInput/TextInput';
import styles from './IngredientRow.module.css';

const UNIT_OPTIONS = INGREDIENT_UNITS.map((unit) => ({ value: unit, label: unit }));

interface IngredientRowProps {
  /** Position in the list, starting at 1. Used for the accessible names. */
  number: number;
  value: IngredientRowValue;
  /** Which controls are invalid. Missing when the row is fine. */
  errors?: RowErrors;
  /** Id of the section error that describes this row. */
  describedBy?: string;
  onChange: (patch: Partial<Omit<IngredientRowValue, 'key'>>) => void;
  onRemove: () => void;
}

export default function IngredientRow({
  number,
  value,
  errors,
  describedBy,
  onChange,
  onRemove,
}: IngredientRowProps) {
  const invalid = Boolean(errors);

  return (
    <RowCard invalid={invalid}>
      <div className={styles.fields}>
        <Field
          label={`Ingredient ${number} name`}
          hideLabel
          invalid={errors?.item}
          describedBy={errors ? describedBy : undefined}
          className={styles.name}
        >
          {(controlProps) => (
            <TextInput
              {...controlProps}
              variant="underline"
              placeholder="Ingredient"
              autoComplete="off"
              value={value.item}
              onChange={(event) => onChange({ item: event.target.value })}
            />
          )}
        </Field>
        <Field
          label={`Ingredient ${number} quantity`}
          hideLabel
          invalid={errors?.quantity}
          describedBy={errors ? describedBy : undefined}
          className={styles.quantity}
        >
          {(controlProps) => (
            <TextInput
              {...controlProps}
              variant="underline"
              inputMode="decimal"
              placeholder="Qty"
              autoComplete="off"
              value={value.quantity}
              onChange={(event) => onChange({ quantity: event.target.value })}
            />
          )}
        </Field>
        <Field
          label={`Ingredient ${number} unit`}
          hideLabel
          invalid={errors?.unit}
          describedBy={errors ? describedBy : undefined}
          className={styles.unit}
        >
          {(controlProps) => (
            <Select
              {...controlProps}
              variant="underline"
              placeholder="Unit"
              options={UNIT_OPTIONS}
              value={value.unit}
              onChange={(event) => onChange({ unit: event.target.value as IngredientUnit })}
            />
          )}
        </Field>
        <RemoveButton
          label={`remove ingredient ${number}`}
          onClick={onRemove}
          className={styles.remove}
        />
      </div>
    </RowCard>
  );
}
