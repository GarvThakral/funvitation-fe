import { useEffect, useRef, useState } from 'react';
import { Group, Layer, Stage, Text } from 'react-konva';
import type { CanvasElement, CanvasSize, Invitation } from '../../types';
import { getElementTextLayout } from '../../lib/element-text-layout';
import { DEFAULT_TEXT_FONT } from '../../lib/invitation';
import { useFontRenderTick } from '../../lib/use-font-render-tick';
import { startKonvaElementAnimation } from '../../lib/element-animation';
import URLImage from '../canvas/URLImage';
import CanvasShape from '../canvas/CanvasShape';
import EntranceAnimationWrapper from './EntranceAnimationWrapper';

interface ViewerStageProps {
  elements: CanvasElement[];
  backgroundColor: string;
  canvasSize: CanvasSize;
  entranceAnimation: NonNullable<Invitation['entranceAnimation']>;
  noButtonScale: number;
  yesButtonScale: number;
  onYes: () => void;
  onNoMove: (id: string) => void;
  onNoTap: (id: string) => void;
  onYesHover: (isHovering: boolean) => void;
  onEntranceComplete: () => void;
}

export default function ViewerStage({
  elements,
  backgroundColor,
  canvasSize,
  entranceAnimation,
  noButtonScale,
  yesButtonScale,
  onYes,
  onNoMove,
  onNoTap,
  onYesHover,
  onEntranceComplete,
}: ViewerStageProps) {
  const stageRef = useRef<any>(null);
  const lastActivationRef = useRef<{ id: string; at: number } | null>(null);
  const [entranceComplete, setEntranceComplete] = useState(entranceAnimation === 'none');
  useFontRenderTick(
    elements
      .filter((element) => element.type === 'text' || element.type === 'button')
      .map((element) => element.fontFamily || DEFAULT_TEXT_FONT)
  );

  useEffect(() => {
    if (!entranceComplete || !stageRef.current) {
      return;
    }

    const cleanups = elements
      .map((element) => {
        if (!element.elementAnimation || element.elementAnimation.type === 'none') {
          return null;
        }

        const node = stageRef.current.findOne('#' + element.id);
        return startKonvaElementAnimation(node, element.elementAnimation);
      })
      .filter((cleanup): cleanup is () => void => Boolean(cleanup));

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [elements, entranceComplete]);

  const handleButtonActivate = (element: CanvasElement) => {
    const now = Date.now();
    const lastActivation = lastActivationRef.current;

    if (lastActivation && lastActivation.id === element.id && now - lastActivation.at < 350) {
      return;
    }

    lastActivationRef.current = { id: element.id, at: now };

    if (element.buttonType === 'yes') onYes();
    if (element.buttonType === 'no') onNoTap(element.id);
  };

  return (
    <EntranceAnimationWrapper
      backgroundColor={backgroundColor}
      variant={entranceAnimation}
      onComplete={() => {
        setEntranceComplete(true);
        onEntranceComplete();
      }}
    >
      <Stage
        width={canvasSize.width}
        height={canvasSize.height}
        ref={stageRef}
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
                  rotation={element.rotation}
                  listening={false}
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
                  draggable={false}
                />
              );
            }

            if (element.type === 'shape' || element.type === 'character' || element.type === 'button') {
              const scale =
                element.buttonType === 'no' ? noButtonScale : element.buttonType === 'yes' ? yesButtonScale : 1;
              const textLayout = getElementTextLayout(element);

              return (
                <Group
                  key={element.id}
                  id={element.id}
                  x={element.x}
                  y={element.y}
                  rotation={element.rotation}
                  onClick={() => handleButtonActivate(element)}
                  onTap={() => handleButtonActivate(element)}
                  onMouseEnter={() => {
                    if (element.buttonType === 'no') onNoMove(element.id);
                    if (element.buttonType === 'yes') onYesHover(true);
                  }}
                  onMouseLeave={() => {
                    if (element.buttonType === 'yes') onYesHover(false);
                  }}
                  scaleX={scale}
                  scaleY={scale}
                >
                  <CanvasShape
                    element={element}
                    cornerRadius={element.type === 'button' ? textLayout.borderRadius : 0}
                    shadowBlur={5}
                    shadowOpacity={0.1}
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
        </Layer>
      </Stage>
    </EntranceAnimationWrapper>
  );
}
