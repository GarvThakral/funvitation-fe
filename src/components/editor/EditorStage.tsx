import { Group, Layer, Rect, Stage, Text, Transformer } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { RefObject } from 'react';
import URLImage from '../canvas/URLImage';
import type { CanvasElement } from '../../types';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../../lib/canvas-config';

interface EditorStageProps {
  elements: CanvasElement[];
  selectedId: string | null;
  backgroundColor: string;
  stageRef: RefObject<any>;
  transformerRef: RefObject<any>;
  onSelect: (id: string | null) => void;
  onDragEnd: (id: string, event: KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (id: string, event: KonvaEventObject<Event>) => void;
}

export default function EditorStage({
  elements,
  selectedId,
  backgroundColor,
  stageRef,
  transformerRef,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: EditorStageProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-12 bg-[#fff7e7] overflow-auto">
      <div className="shadow-2xl rounded-lg overflow-hidden bg-white" style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}>
        <Stage
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          ref={stageRef}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) {
              onSelect(null);
            }
          }}
          style={{ backgroundColor }}
        >
          <Layer>
            {elements.map((element) => {
              if (element.type === 'text') {
                return (
                  <Text
                    key={element.id}
                    id={element.id}
                    {...element}
                    draggable
                    onDragEnd={(e) => onDragEnd(element.id, e)}
                    onClick={() => onSelect(element.id)}
                    onTransformEnd={(e) => onTransformEnd(element.id, e)}
                  />
                );
              }

              if (element.type === 'image') {
                return (
                  <URLImage
                    key={element.id}
                    id={element.id}
                    src={element.src}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    draggable
                    onDragEnd={(e: KonvaEventObject<DragEvent>) => onDragEnd(element.id, e)}
                    onClick={() => onSelect(element.id)}
                    onTransformEnd={(e: KonvaEventObject<Event>) => onTransformEnd(element.id, e)}
                  />
                );
              }

              if (element.type === 'shape' || element.type === 'character' || element.type === 'button') {
                return (
                  <Group
                    key={element.id}
                    id={element.id}
                    x={element.x}
                    y={element.y}
                    draggable
                    onDragEnd={(e) => onDragEnd(element.id, e)}
                    onClick={() => onSelect(element.id)}
                    onTransformEnd={(e) => onTransformEnd(element.id, e)}
                  >
                    <Rect
                      width={element.width}
                      height={element.height}
                      fill={element.fill}
                      cornerRadius={element.type === 'character' ? 50 : 8}
                      stroke={selectedId === element.id ? '#3b82f6' : 'transparent'}
                      strokeWidth={2}
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

            {selectedId && (
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
