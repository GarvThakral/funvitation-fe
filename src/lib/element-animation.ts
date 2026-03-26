import Konva from 'konva';
import { DEFAULT_ELEMENT_ANIMATION_DURATIONS } from './canvas-config';
import { DEFAULT_ELEMENT_ANIMATION } from './invitation';
import type { CanvasElement } from '../types';

type AnimatableNode = Konva.Node & {
  x: (value?: number) => number | AnimatableNode;
  y: (value?: number) => number | AnimatableNode;
  scaleX: (value?: number) => number | AnimatableNode;
  scaleY: (value?: number) => number | AnimatableNode;
  rotation: (value?: number) => number | AnimatableNode;
  opacity: (value?: number) => number | AnimatableNode;
  getLayer: () => Konva.Layer | null;
};

const toSeconds = (value: number | undefined, fallback: number) => {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0.3, Math.min(5, value));
};

const toDelay = (value: number | undefined) => {
  if (value === undefined || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(5, value));
};

export const getElementAnimationConfig = (element: CanvasElement) => {
  return {
    ...DEFAULT_ELEMENT_ANIMATION,
    ...element.elementAnimation,
  };
};

export const startKonvaElementAnimation = (
  rawNode: Konva.Node | null,
  elementAnimation: CanvasElement['elementAnimation'],
  options?: { loopOverride?: boolean; onComplete?: () => void }
) => {
  const node = rawNode as AnimatableNode | null;
  const config = {
    ...DEFAULT_ELEMENT_ANIMATION,
    ...elementAnimation,
  };

  if (!node || config.type === 'none') {
    options?.onComplete?.();
    return () => undefined;
  }

  const layer = node.getLayer();
  if (!layer) {
    options?.onComplete?.();
    return () => undefined;
  }

  const durationSeconds = toSeconds(
    config.duration,
    DEFAULT_ELEMENT_ANIMATION_DURATIONS[config.type]
  );
  const delaySeconds = toDelay(config.delay);
  const shouldLoop = options?.loopOverride ?? config.loop ?? true;

  const baseState = {
    x: Number(node.x()),
    y: Number(node.y()),
    scaleX: Number(node.scaleX()),
    scaleY: Number(node.scaleY()),
    rotation: Number(node.rotation()),
    opacity: Number(node.opacity()),
  };

  let completed = false;
  const durationMs = durationSeconds * 1000;
  const delayMs = delaySeconds * 1000;

  const resetNode = () => {
    node.x(baseState.x);
    node.y(baseState.y);
    node.scaleX(baseState.scaleX);
    node.scaleY(baseState.scaleY);
    node.rotation(baseState.rotation);
    node.opacity(baseState.opacity);
    layer.batchDraw();
  };

  const animation = new Konva.Animation((frame) => {
    if (!frame) {
      return;
    }

    const elapsed = frame.time;
    if (elapsed < delayMs) {
      return;
    }

    const activeElapsed = elapsed - delayMs;
    const cycleProgress = shouldLoop
      ? (activeElapsed % durationMs) / durationMs
      : Math.min(activeElapsed / durationMs, 1);
    const ease = Math.sin(Math.PI * cycleProgress);

    node.x(baseState.x);
    node.y(baseState.y);
    node.scaleX(baseState.scaleX);
    node.scaleY(baseState.scaleY);
    node.rotation(baseState.rotation);
    node.opacity(baseState.opacity);

    switch (config.type) {
      case 'pulse':
        node.scaleX(baseState.scaleX * (1 + 0.08 * ease));
        node.scaleY(baseState.scaleY * (1 + 0.08 * ease));
        break;
      case 'bounce':
        node.y(baseState.y - 12 * ease);
        break;
      case 'shake':
        node.x(baseState.x + 6 * Math.sin(cycleProgress * Math.PI * 6));
        break;
      case 'fadeLoop':
        node.opacity(baseState.opacity - 0.7 * ease);
        break;
      case 'spin':
        node.rotation(baseState.rotation + 360 * cycleProgress);
        break;
      default:
        break;
    }

    if (!shouldLoop && activeElapsed >= durationMs && !completed) {
      completed = true;
      animation.stop();
      resetNode();
      options?.onComplete?.();
    }
  }, layer);

  animation.start();

  return () => {
    animation.stop();
    resetNode();
  };
};
