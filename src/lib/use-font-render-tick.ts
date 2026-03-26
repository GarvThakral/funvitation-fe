import { useEffect, useState } from 'react';

export const useFontRenderTick = (fontFamilies: Array<string | undefined>) => {
  const [, setTick] = useState(0);
  const familiesKey = Array.from(
    new Set(fontFamilies.filter((family): family is string => Boolean(family)))
  )
    .sort()
    .join('|');

  useEffect(() => {
    if (typeof document === 'undefined' || !document.fonts || !familiesKey) {
      return;
    }

    let cancelled = false;
    const families = familiesKey.split('|');
    const refresh = () => {
      if (!cancelled) {
        setTick((current) => current + 1);
      }
    };

    Promise.all(families.map((family) => document.fonts.load(`16px "${family}"`))).finally(refresh);
    document.fonts.addEventListener?.('loadingdone', refresh);

    return () => {
      cancelled = true;
      document.fonts.removeEventListener?.('loadingdone', refresh);
    };
  }, [familiesKey]);
};
