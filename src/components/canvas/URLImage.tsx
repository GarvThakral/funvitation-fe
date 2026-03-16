import { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';

interface URLImageProps {
  src?: string;
  [key: string]: unknown;
}

export default function URLImage({ src, ...props }: URLImageProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => setImage(img);
    img.onerror = () => setImage(null);
  }, [src]);

  return <KonvaImage image={image} {...props} />;
}
