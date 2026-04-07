import { Group, Layer, Stage, Text, Transformer } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useRef, type RefObject } from 'react';
import URLImage from '../canvas/URLImage';
import CanvasShape from '../canvas/CanvasShape';
import type { CanvasElement, CanvasSize } from '../../types';
import { getElementTextLayout } from '../../lib/element-text-layout';
import { DEFAULT_TEXT_FONT } from '../../lib/invitation';
import { useFontRenderTick } from '../../lib/use-font-render-tick';
import { useStageScale } from '../../lib/use-stage-scale';

interface EditorStageProps {
  elements: CanvasElement[];
  selectedId: string | null;
  canvasSize: CanvasSize;
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
  canvasSize,
  backgroundColor,
  stageRef,
  transformerRef,
  onSelect,
  onDragEnd,
  onTransformEnd,
}: EditorStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageScale = useStageScale(containerRef, canvasSize.width, canvasSize.height);
  useFontRenderTick(
    elements
      .filter((element) => element.type === 'text' || element.type === 'button')
      .map((element) => element.fontFamily || DEFAULT_TEXT_FONT)
  );

  const normalizeTextTransform = (event: KonvaEventObject<Event>) => {
    const node = event.target;
    node.width(Math.max(40, node.width() * node.scaleX()));
    node.height(Math.max(20, node.height() * node.scaleY()));
    node.scaleX(1);
    node.scaleY(1);
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-1 items-center justify-center overflow-auto bg-[#fff7e7] p-4 sm:p-8 lg:p-12"
    >
      <div
        className="relative shrink-0"
        style={{ width: canvasSize.width * stageScale, height: canvasSize.height * stageScale }}
      >
        <div
          className="overflow-hidden rounded-lg bg-white shadow-2xl"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            transform: `scale(${stageScale})`,
            transformOrigin: 'top left',
          }}
        >
          <Stage
            width={canvasSize.width}
            height={canvasSize.height}
            ref={stageRef}
            onMouseDown={(e) => {
              if (e.target === e.target.getStage()) {
                onSelect(null);
              }
            }}
            onTap={(e) => {
              if (e.target === e.target.getStage()) {
                onSelect(null);
              }
            }}
            style={{ backgroundColor }}
          >
            <Layer>
              {elements.map((element) => {
                if (element.type === 'text') {
                  const textLayout = getElementTextLayout(element);

                  return (
                    <Text
                      key={element.id}
                      id={element.id}
                      x={element.x}
                      y={element.y}
                      width={textLayout.width}
                      height={textLayout.height}
                      text={textLayout.text}
                      fontSize={textLayout.fontSize}
                      fontFamily={textLayout.fontFamily}
                      fontStyle={textLayout.fontStyle}
                      fill={textLayout.fill}
                      align={textLayout.textAlign}
                      verticalAlign="middle"
                      lineHeight={textLayout.lineHeight}
                      wrap="none"
                      ellipsis
                      padding={textLayout.paddingX}
                      draggable
                      rotation={element.rotation}
                      onDragEnd={(e) => onDragEnd(element.id, e)}
                      onClick={() => onSelect(element.id)}
                      onTap={() => onSelect(element.id)}
                      onTransform={normalizeTextTransform}
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
                      onTap={() => onSelect(element.id)}
                      onTransformEnd={(e: KonvaEventObject<Event>) => onTransformEnd(element.id, e)}
                    />
                  );
                }

                if (element.type === 'shape' || element.type === 'character' || element.type === 'button') {
                  const textLayout = getElementTextLayout(element);

                  return (
                    <Group
                      key={element.id}
                      id={element.id}
                      x={element.x}
                      y={element.y}
                      draggable
                      rotation={element.rotation}
                      onDragEnd={(e) => onDragEnd(element.id, e)}
                      onClick={() => onSelect(element.id)}
                      onTap={() => onSelect(element.id)}
                      onTransformEnd={(e) => onTransformEnd(element.id, e)}
                    >
                      <CanvasShape
                        element={element}
                        cornerRadius={element.type === 'button' ? textLayout.borderRadius : 0}
                        stroke={selectedId === element.id ? '#3b82f6' : 'transparent'}
                        strokeWidth={2}
                      />
                      {element.type === 'button' && (
                        <Text
                          text={textLayout.text}
                          width={textLayout.width}
                          height={textLayout.height}
                          fontSize={textLayout.fontSize}
                          fontFamily={textLayout.fontFamily}
                          fontStyle={textLayout.fontStyle}
                          align="center"
                          verticalAlign="middle"
                          fill={textLayout.fill}
                          lineHeight={textLayout.lineHeight}
                          wrap="none"
                          ellipsis
                          padding={textLayout.paddingX}
                          listening={false}
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
    </div>
  );
}
