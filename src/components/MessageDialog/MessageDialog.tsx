import type { ReactNode } from 'react';

import Dialog from '../Dialog/Dialog';
import { ErrorIcon, WarningIcon } from '../Icons/Icons';
import IconCircle from '../IconCircle/IconCircle';
import styles from './MessageDialog.module.css';

export type MessageDialogVariant = 'warning' | 'error';

interface MessageDialogProps {
  open: boolean;
  /** Called on Esc and backdrop click. */
  onClose: () => void;
  variant: MessageDialogVariant;
  title: string;
  /** One or more paragraphs. */
  children: ReactNode;
  /** The action buttons. */
  actions: ReactNode;
}

export default function MessageDialog({
  open,
  onClose,
  variant,
  title,
  children,
  actions,
}: MessageDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} placement="center" label={title}>
      <div className={styles.body}>
        <IconCircle
          variant={variant}
          icon={variant === 'warning' ? <WarningIcon /> : <ErrorIcon />}
        />
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.message}>{children}</div>
        <div className={styles.actions}>{actions}</div>
      </div>
    </Dialog>
  );
}
