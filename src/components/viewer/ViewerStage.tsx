import { Group, Layer, Rect, Stage, Text } from 'react-konva';
import type { CanvasElement } from '../../types';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../../lib/canvas-config';
import URLImage from '../canvas/URLImage';

interface ViewerStageProps {
  elements: CanvasElement[];
  backgroundColor: string;
  noButtonScale: number;
  yesButtonScale: number;
  onYes: () => void;
  onNo: (id: string) => void;
  onYesHover: (isHovering: boolean) => void;
}

export default function ViewerStage({
  elements,
  backgroundColor,
  noButtonScale,
  yesButtonScale,
  onYes,
  onNo,
  onYesHover,
}: ViewerStageProps) {
  return (
    <Stage width={STAGE_WIDTH} height={STAGE_HEIGHT} style={{ backgroundColor }}>
      <Layer>
        {elements.map((element) => {
          if (element.type === 'text') {
            return <Text key={element.id} {...element} draggable={false} />;
          }

          if (element.type === 'image') {
            return (
              <URLImage
                key={element.id}
                src={element.src}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                draggable={false}
              />
            );
          }

          if (element.type === 'shape' || element.type === 'character' || element.type === 'button') {
            const scale = element.buttonType === 'no' ? noButtonScale : element.buttonType === 'yes' ? yesButtonScale : 1;

            return (
              <Group
                key={element.id}
                x={element.x}
                y={element.y}
                onClick={() => {
                  if (element.buttonType === 'yes') onYes();
                  if (element.buttonType === 'no') onNo(element.id);
                }}
                onMouseEnter={() => {
                  if (element.buttonType === 'no') onNo(element.id);
                  if (element.buttonType === 'yes') onYesHover(true);
                }}
                onMouseLeave={() => {
                  if (element.buttonType === 'yes') onYesHover(false);
                }}
                scaleX={scale}
                scaleY={scale}
              >
                <Rect
                  width={element.width}
                  height={element.height}
                  fill={element.fill}
                  cornerRadius={element.type === 'character' ? 50 : 8}
                  shadowBlur={5}
                  shadowOpacity={0.1}
                />
                {element.type === 'button' && (
                  <Text
                    text={element.text}
                    width={element.width}
                    height={element.height}
                    fontSize={element.fontSize || 16}
                    align="center"
                    verticalAlign="middle"
                    fill="#ffffff"
                  />
                )}
              </Group>
            );
          }

          return null;
        })}
      </Layer>
    </Stage>
  );
}
