import { useEffect, useState, type RefObject } from 'react';

export const useStageScale = (
  containerRef: RefObject<HTMLElement | null>,
  stageWidth: number,
  stageHeight: number
) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateScale = () => {
      const bounds = node.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      const nextScale = Math.min(bounds.width / stageWidth, bounds.height / stageHeight, 1);
      setScale(nextScale > 0 ? nextScale : 1);
    };

    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(node);
    window.addEventListener('resize', updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [containerRef, stageHeight, stageWidth]);

  return scale;
};
