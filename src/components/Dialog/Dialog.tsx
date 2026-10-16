import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

import styles from './Dialog.module.css';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  placement?: 'bottom' | 'center';
  /** Accessible name, since the dialog has no fixed heading. */
  label: string;
  children: ReactNode;
}

// React does not write the autofocus attribute on a <div> (its autoFocus prop only focuses buttons and inputs), so set it by hand.
// showModal() reads this attribute to decide what to focus.
function markAutofocus(element: HTMLDivElement | null) {
  element?.setAttribute('autofocus', '');
}

export default function Dialog({
  open,
  onClose,
  placement = 'bottom',
  label,
  children,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  // showModal() throws if the dialog is already open, and StrictMode runs effects twice in dev, so check first.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${styles[placement]}`}
      aria-label={label}
      // The native close event also fires on Esc, which keeps the parent's state in sync.
      onClose={onClose}
      // The dialog has no padding, so a click that lands on it directly is a click on the backdrop.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={markAutofocus}
        tabIndex={-1}
        className={`${styles.content} ${styles.card}`}
      >
        {children}
      </div>
    </dialog>
  );
}
