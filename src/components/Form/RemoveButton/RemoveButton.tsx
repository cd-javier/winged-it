import IconButton from '../../IconButton/IconButton';
import { XIcon } from '../../Icons/Icons';

interface RemoveButtonProps {
  /** Accessible name, for example "remove ingredient 2". */
  label: string;
  onClick: () => void;
  className?: string;
}

export default function RemoveButton({ label, onClick, className }: RemoveButtonProps) {
  return (
    <IconButton
      icon={<XIcon />}
      label={label}
      variant="error"
      size="compact"
      className={className}
      onClick={onClick}
    />
  );
}
