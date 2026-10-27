import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

// The keyboard counts as open when the visible area is clearly shorter than the layout viewport.
const KEYBOARD_RATIO = 0.8;
const SCALE_TOLERANCE = 0.01;
// Frames to wait for the visible height to stop changing before scrolling, and the most to wait.
const STABLE_FRAMES = 2;
const MAX_SETTLE_FRAMES = 30;
// Extra time after the transition's duration before giving up on its `transitionend` event.
const RELEASE_MARGIN_MS = 100;

/**
 * While a textarea has focus and the on-screen keyboard is open, sets `--app-height` on the root element to the visible height, so the screen shrinks to the space above the keyboard. Removes it when the keyboard closes and on unmount. While pinch-zoomed with a field focused, nothing changes.
 *
 * Also marks the screen with `data-keyboard` from the moment the variable is set until its height transition has finished, so the CSS only animates `min-height` for that variable and not for the `100dvh` changes Safari's toolbars cause.
 *
 * When the keyboard opens, scrolls the page once to a fixed position: the bottom of the screen at the bottom of the visible area. Passing a new `resyncKey` while the keyboard is open does that again (for example when the question changes).
 */
export function useVisualViewportHeight(screenRef: RefObject<HTMLElement | null>, resyncKey?: unknown) {
  const scrollOnKeyboardOpen = useRef<(() => void) | null>(null);
  const previousKey = useRef(resyncKey);

  useEffect(() => {
    const viewport = window.visualViewport;
    const screen = screenRef.current;
    if (!viewport || !screen) return;

    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let open = false;
    // Increases to cancel a pending scroll: a newer one started, the user scrolled, or the keyboard closed.
    let scrollRun = 0;
    let releaseTimer = 0;
    let releaseListener: ((event: TransitionEvent) => void) | null = null;

    // While pinch-zoomed, the visual viewport's height is the zoomed one and says nothing about the keyboard.
    const isZoomed = () => Math.abs(viewport.scale - 1) >= SCALE_TOLERANCE;
    const hasFocus = () => document.activeElement instanceof HTMLTextAreaElement;

    const isKeyboardOpen = () =>
      hasFocus() && viewport.height < KEYBOARD_RATIO * window.innerHeight;

    // The screen's height when the textarea is at its minimum height. Added up from the parts, because while the height transition runs, offsetHeight and scrollHeight are in-between values.
    const naturalHeight = () => {
      const style = getComputedStyle(screen);
      const textarea = screen.querySelector('textarea');
      const children = Array.from(screen.children) as HTMLElement[];
      const grower = children.find((child) => child.contains(textarea));
      const others = children.reduce((sum, child) => (child === grower ? sum : sum + child.offsetHeight), 0);
      const textareaMin = textarea
        ? parseFloat(getComputedStyle(textarea).minHeight) || textarea.offsetHeight
        : 0;
      return (
        parseFloat(style.paddingTop) +
        parseFloat(style.paddingBottom) +
        others +
        textareaMin +
        (parseFloat(style.rowGap) || 0) * (children.length - 1)
      );
    };

    const scrollToTarget = () => {
      const screenTop = screen.getBoundingClientRect().top + window.scrollY;
      const target = Math.max(0, Math.round(screenTop + naturalHeight() - viewport.height));
      if (Math.abs(window.scrollY - target) < 1) return;
      window.scrollTo({ top: target, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    };

    // Waits until the visible height stops changing (the keyboard animation is over), then scrolls once.
    const scrollWhenSettled = () => {
      const run = ++scrollRun;
      let last = viewport.height;
      let stable = 0;
      let frames = 0;

      const tick = () => {
        if (run !== scrollRun || !open) return;
        // Zoomed: wait without counting, and start over from the real height once the zoom is gone.
        if (isZoomed()) {
          last = -1;
          stable = 0;
          requestAnimationFrame(tick);
          return;
        }
        frames++;
        stable = viewport.height === last ? stable + 1 : 0;
        last = viewport.height;
        if (stable >= STABLE_FRAMES || frames >= MAX_SETTLE_FRAMES) {
          scrollToTarget();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const cancelRelease = () => {
      window.clearTimeout(releaseTimer);
      if (releaseListener) screen.removeEventListener('transitionend', releaseListener);
      releaseListener = null;
    };

    // Keeps the transition on until the screen has grown back to its normal height.
    const releaseTransition = () => {
      cancelRelease();
      const seconds = parseFloat(getComputedStyle(screen).transitionDuration) || 0;
      const done = () => {
        cancelRelease();
        screen.removeAttribute('data-keyboard');
      };
      if (seconds === 0) {
        done();
        return;
      }
      releaseListener = (event) => {
        if (event.target === screen && event.propertyName === 'min-height') done();
      };
      screen.addEventListener('transitionend', releaseListener);
      releaseTimer = window.setTimeout(done, seconds * 1000 + RELEASE_MARGIN_MS);
    };

    const update = () => {
      frame = 0;

      // Zoomed with a field focused: leave everything as it is until the zoom ends. Without focus the keyboard is closed, so that case falls through and clears the variable.
      if (isZoomed() && hasFocus()) return;

      if (isKeyboardOpen()) {
        cancelRelease();
        screen.setAttribute('data-keyboard', '');
        root.style.setProperty('--app-height', `${viewport.height}px`);
        if (!open) {
          open = true;
          scrollWhenSettled();
        }
        return;
      }

      root.style.removeProperty('--app-height');
      if (open) {
        open = false;
        scrollRun++;
        releaseTransition();
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // The user took over: do not scroll for them any more.
    const onUserScroll = (event: Event) => {
      if (event.target instanceof HTMLTextAreaElement || isZoomed()) return;
      scrollRun++;
    };

    scrollOnKeyboardOpen.current = () => {
      if (open) scrollWhenSettled();
    };

    viewport.addEventListener('resize', schedule);
    window.addEventListener('resize', schedule);
    document.addEventListener('focusin', schedule);
    document.addEventListener('focusout', schedule);
    document.addEventListener('touchstart', onUserScroll, { passive: true });
    document.addEventListener('wheel', onUserScroll, { passive: true });
    schedule();

    return () => {
      viewport.removeEventListener('resize', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('focusin', schedule);
      document.removeEventListener('focusout', schedule);
      document.removeEventListener('touchstart', onUserScroll);
      document.removeEventListener('wheel', onUserScroll);
      if (frame) cancelAnimationFrame(frame);
      scrollRun++;
      cancelRelease();
      screen.removeAttribute('data-keyboard');
      root.style.removeProperty('--app-height');
      scrollOnKeyboardOpen.current = null;
    };
  }, [screenRef]);

  // Scrolls again when the key changes while the keyboard is open. Does nothing on the first render.
  useEffect(() => {
    if (previousKey.current === resyncKey) return;
    previousKey.current = resyncKey;
    scrollOnKeyboardOpen.current?.();
  }, [resyncKey]);
}
