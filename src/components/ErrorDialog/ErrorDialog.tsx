import Button from '../Button/Button';
import MessageDialog from '../MessageDialog/MessageDialog';

interface ErrorDialogProps {
  open: boolean;
  /** Friendly, user-safe text. Never raw API text. */
  message: string;
  onRetry: () => void;
  /** Called on Esc and backdrop click. */
  onClose: () => void;
}

export default function ErrorDialog({ open, message, onRetry, onClose }: ErrorDialogProps) {
  return (
    <MessageDialog
      open={open}
      onClose={onClose}
      variant="error"
      title="Oops"
      actions={
        <Button variant="primary" onClick={onRetry}>
          try again
        </Button>
      }
    >
      <p>That didn't quite work.</p>
      <p>{message}</p>
    </MessageDialog>
  );
}
