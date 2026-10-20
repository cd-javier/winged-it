import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** Goes back one entry, or to `fallback` when this is the first entry in the app's history (for example a page opened from a link). */
export function useGoBack(fallback: string) {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    // 'default' is the key of the first history entry, so there is nowhere to go back to.
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  }, [fallback, location.key, navigate]);
}
