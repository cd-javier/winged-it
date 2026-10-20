import StepBadge from '../../StepBadge/StepBadge';
import Field from '../Field/Field';
import RemoveButton from '../RemoveButton/RemoveButton';
import RowCard from '../RowCard/RowCard';
import TextArea from '../TextArea/TextArea';
import styles from './StepRow.module.css';

interface StepRowProps {
  /** Position in the list, starting at 1. Shown in the badge and used for the accessible names. */
  number: number;
  text: string;
  invalid?: boolean;
  /** Id of the section error that describes this row. */
  describedBy?: string;
  onChange: (text: string) => void;
  onRemove: () => void;
}

export default function StepRow({
  number,
  text,
  invalid,
  describedBy,
  onChange,
  onRemove,
}: StepRowProps) {
  return (
    <RowCard invalid={invalid}>
      <div className={styles.row}>
        <StepBadge number={number} />
        <Field
          label={`Step ${number}`}
          hideLabel
          invalid={invalid}
          describedBy={invalid ? describedBy : undefined}
          className={styles.text}
        >
          {(controlProps) => (
            <TextArea
              {...controlProps}
              variant="underline"
              autoGrow
              placeholder="Describe this step"
              value={text}
              onChange={(event) => onChange(event.target.value)}
            />
          )}
        </Field>
        <RemoveButton label={`remove step ${number}`} onClick={onRemove} />
      </div>
    </RowCard>
  );
}
