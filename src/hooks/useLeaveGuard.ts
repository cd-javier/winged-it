import { useCallback, useEffect, useRef, useState } from 'react';
import { useBlocker } from 'react-router-dom';

/**
 * Asks before leaving while `dirty`: links and browser back (through the router's blocker) and closing or reloading the tab (beforeunload). Cancel buttons call `requestLeave` themselves.
 */
export function useLeaveGuard(dirty: boolean) {
  const [leaveRequested, setLeaveRequested] = useState(false);
  // A ref, not state: it must be set synchronously right before our own navigation.
  const allowLeaveRef = useRef(false);

  const blocker = useBlocker(() => dirty && !allowLeaveRef.current);
  const leaveOpen = leaveRequested || blocker.state === 'blocked';

  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      if (allowLeaveRef.current) return;
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  const requestLeave = useCallback(() => setLeaveRequested(true), []);

  const closeLeave = useCallback(() => {
    setLeaveRequested(false);
    if (blocker.state === 'blocked') blocker.reset();
  }, [blocker]);

  /** Leaves for good. Finishes the blocked navigation if there was one, otherwise calls `leave`. */
  const discard = useCallback(
    (leave: () => void) => {
      allowLeaveRef.current = true;
      setLeaveRequested(false);
      if (blocker.state === 'blocked') blocker.proceed();
      else leave();
    },
    [blocker],
  );

  /** Call right before our own navigation after a successful save, so the guard doesn't ask. */
  const allowLeave = useCallback(() => {
    allowLeaveRef.current = true;
  }, []);

  return { leaveOpen, requestLeave, closeLeave, discard, allowLeave };
}
