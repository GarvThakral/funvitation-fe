import { Path, Rect } from 'react-konva';
import type { CanvasElement } from '../../types';

interface CanvasShapeProps {
  element: CanvasElement;
  cornerRadius?: number;
  stroke?: string;
  strokeWidth?: number;
  shadowBlur?: number;
  shadowOpacity?: number;
}

const HEART_PATH =
  'M50 88 L44 82 C18 58 2 42 2 22 C2 8 12 0 24 0 C34 0 42 6 50 16 C58 6 66 0 76 0 C88 0 98 8 98 22 C98 42 82 58 56 82 Z';
const HEART_BASE_WIDTH = 100;
const HEART_BASE_HEIGHT = 88;

export default function CanvasShape({
  element,
  cornerRadius = 0,
  stroke,
  strokeWidth,
  shadowBlur,
  shadowOpacity,
}: CanvasShapeProps) {
  const width = Math.max(1, element.width ?? 100);
  const height = Math.max(1, element.height ?? 100);

  if (element.type === 'character' && element.characterPart === 'heart') {
    return (
      <Path
        data={HEART_PATH}
        fill={element.fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        shadowBlur={shadowBlur}
        shadowOpacity={shadowOpacity}
        scaleX={width / HEART_BASE_WIDTH}
        scaleY={height / HEART_BASE_HEIGHT}
      />
    );
  }

  return (
    <Rect
      width={width}
      height={height}
      fill={element.fill}
      cornerRadius={cornerRadius}
      stroke={stroke}
      strokeWidth={strokeWidth}
      shadowBlur={shadowBlur}
      shadowOpacity={shadowOpacity}
    />
  );
}
