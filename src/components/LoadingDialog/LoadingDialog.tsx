import Button from '../Button/Button';
import Dialog from '../Dialog/Dialog';
import Loader from '../Loader/Loader';
import styles from './LoadingDialog.module.css';

interface LoadingDialogProps {
  open: boolean;
  /** Called by the cancel button, Esc and a click on the backdrop. */
  onCancel: () => void;
  /** Accessible name, announced as the status. */
  label?: string;
}

export default function LoadingDialog({ open, onCancel, label = 'Calculating' }: LoadingDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} placement="center" label={label}>
      <div className={styles.body} role="status" aria-label={label}>
        <Loader className={styles.loader} />
        <Button variant="outline" fullWidth onClick={onCancel}>
          cancel
        </Button>
      </div>
    </Dialog>
  );
}
