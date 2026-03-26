import { Play, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ButtonSize, CanvasElement, CanvasSize, Invitation, PlanCapabilities, PlanId } from '../../types';
import {
  CANVAS_SIZE_PRESETS,
  DEFAULT_ELEMENT_ANIMATION_DURATIONS,
  EDITOR_FONTS,
} from '../../lib/canvas-config';
import { getButtonPresetValues, inferButtonSizePreset } from '../../lib/element-text-layout';
import {
  DEFAULT_ELEMENT_ANIMATION,
  DEFAULT_ENTRANCE_ANIMATION,
} from '../../lib/invitation';

interface EditorSettingsPanelProps {
  selectedElement: CanvasElement | null;
  successMessage: string;
  rejectionMessage: string;
  onSuccessMessageChange: (value: string) => void;
  onRejectionMessageChange: (value: string) => void;
  animationType: Invitation['animationType'];
  onAnimationTypeChange: (value: Invitation['animationType']) => void;
  entranceAnimation: NonNullable<Invitation['entranceAnimation']>;
  onEntranceAnimationChange: (value: NonNullable<Invitation['entranceAnimation']>) => void;
  canvasSize: CanvasSize;
  onCanvasSizeChange: (value: CanvasSize) => void;
  musicUrl: string;
  onMusicUrlChange: (value: string) => void;
  onUpdateSelected: (props: Partial<CanvasElement>) => void;
  onDeleteSelected: () => void;
  onPreviewSelectedAnimation: () => void;
  planCapabilities?: PlanCapabilities;
  currentPlanLabel: string;
  onUpgradeRequest: (targetPlanId: PlanId) => void;
}

type CanvasPresetKey = keyof typeof CANVAS_SIZE_PRESETS;

const toNumber = (value: string, fallback: number) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const alignmentOptions: Array<{ label: string; value: NonNullable<CanvasElement['textAlign']> }> = [
  { label: 'Left', value: 'left' },
  { label: 'Center', value: 'center' },
  { label: 'Right', value: 'right' },
];

const weightOptions: Array<{ label: string; value: NonNullable<CanvasElement['fontWeight']> }> = [
  { label: 'Normal', value: 'normal' },
  { label: 'Bold', value: 'bold' },
];

const buttonSizeOptions: Array<{ label: string; value: ButtonSize }> = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
  { label: 'Custom', value: 'custom' },
];

const entranceAnimationOptions: Array<{
  label: string;
  value: NonNullable<Invitation['entranceAnimation']>;
}> = [
  { label: 'Envelope', value: 'envelope' },
  { label: 'Fade In', value: 'fadein' },
  { label: 'Slide Up', value: 'slideup' },
  { label: 'Card Flip', value: 'cardflip' },
  { label: 'None', value: 'none' },
];

const elementAnimationOptions: Array<{
  label: string;
  value: NonNullable<CanvasElement['elementAnimation']>['type'];
}> = [
  { label: 'None', value: 'none' },
  { label: 'Pulse', value: 'pulse' },
  { label: 'Bounce', value: 'bounce' },
  { label: 'Shake', value: 'shake' },
  { label: 'Fade Loop', value: 'fadeLoop' },
  { label: 'Spin', value: 'spin' },
];

const canvasPresetEntries = Object.entries(CANVAS_SIZE_PRESETS) as Array<
  [CanvasPresetKey, (typeof CANVAS_SIZE_PRESETS)[CanvasPresetKey]]
>;

const inferCanvasPreset = (canvasSize: CanvasSize): CanvasPresetKey => {
  const match = canvasPresetEntries.find(
    ([key, preset]) =>
      key !== 'custom' &&
      preset.width === Math.round(canvasSize.width) &&
      preset.height === Math.round(canvasSize.height)
  );

  return match?.[0] || 'custom';
};

export default function EditorSettingsPanel({
  selectedElement,
  successMessage,
  rejectionMessage,
  onSuccessMessageChange,
  onRejectionMessageChange,
  animationType,
  onAnimationTypeChange,
  entranceAnimation,
  onEntranceAnimationChange,
  canvasSize,
  onCanvasSizeChange,
  musicUrl,
  onMusicUrlChange,
  onUpdateSelected,
  onDeleteSelected,
  onPreviewSelectedAnimation,
  planCapabilities,
  currentPlanLabel,
  onUpgradeRequest,
}: EditorSettingsPanelProps) {
  const currentButtonSize =
    selectedElement?.type === 'button' ? inferButtonSizePreset(selectedElement) : 'medium';
  const currentCanvasPreset = useMemo(() => inferCanvasPreset(canvasSize), [canvasSize]);
  const [showCustomCanvasControls, setShowCustomCanvasControls] = useState(
    currentCanvasPreset === 'custom'
  );
  const currentElementAnimation = selectedElement?.elementAnimation || DEFAULT_ELEMENT_ANIMATION;
  const currentElementDuration =
    currentElementAnimation.duration ??
    DEFAULT_ELEMENT_ANIMATION_DURATIONS[currentElementAnimation.type];
  const capabilities: PlanCapabilities =
    planCapabilities || {
      templateAccess: 'core',
      allowCustomResponseMessages: false,
      allowMusic: false,
      allowPostLoadEffects: false,
      allowPremiumEntranceAnimations: false,
      allowCustomCanvasSize: false,
    };
  const visibleEntranceOptions = capabilities.allowPremiumEntranceAnimations
    ? entranceAnimationOptions
    : entranceAnimationOptions.filter((option) => option.value === 'fadein' || option.value === 'none');
  const selectedEntranceValue = visibleEntranceOptions.some((option) => option.value === entranceAnimation)
    ? entranceAnimation
    : DEFAULT_ENTRANCE_ANIMATION;
  const selectedAnimationValue = capabilities.allowPostLoadEffects ? animationType : 'none';

  useEffect(() => {
    if (currentCanvasPreset === 'custom') {
      setShowCustomCanvasControls(true);
    }
  }, [currentCanvasPreset]);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#c86d75]">Invitation</h2>
      <p className="text-xs text-[#6a645a]">Editing under the {currentPlanLabel} plan.</p>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#5f5a50]">Canvas Size</label>
        <div className="grid grid-cols-2 gap-2">
          {canvasPresetEntries.map(([key, preset]) => {
            const isActive =
              key === 'custom'
                ? showCustomCanvasControls
                : !showCustomCanvasControls && currentCanvasPreset === key;

            return (
              <button
                key={key}
                type="button"
                disabled={key === 'custom' && !capabilities.allowCustomCanvasSize}
                onClick={() => {
                  if (key === 'custom') {
                    setShowCustomCanvasControls(true);
                    return;
                  }

                  setShowCustomCanvasControls(false);
                  onCanvasSizeChange({ width: preset.width, height: preset.height });
                }}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                  isActive ? 'bg-[#e99497] text-white' : 'bg-[#fff4dd] text-[#6a645a]'
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {!capabilities.allowCustomCanvasSize && (
          <div className="rounded-2xl bg-[#fff4dd] px-3 py-2 text-xs text-[#6a645a]">
            Custom canvas sizes are available on Studio.
            <button
              type="button"
              onClick={() => onUpgradeRequest('studio')}
              className="ml-2 font-semibold text-[#c86d75]"
            >
              Upgrade
            </button>
          </div>
        )}

        {showCustomCanvasControls && (
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#fffaf0] p-3">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#5f5a50]">Width</label>
              <input
                type="number"
                min="1"
                max="1600"
                value={Math.round(canvasSize.width)}
                onChange={(e) =>
                  onCanvasSizeChange({
                    width: toNumber(e.target.value, canvasSize.width),
                    height: canvasSize.height,
                  })
                }
                className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#5f5a50]">Height</label>
              <input
                type="number"
                min="1"
                max="2000"
                value={Math.round(canvasSize.height)}
                onChange={(e) =>
                  onCanvasSizeChange({
                    width: canvasSize.width,
                    height: toNumber(e.target.value, canvasSize.height),
                  })
                }
                className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e]"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#5f5a50]">Entrance Animation</label>
        <select
          value={selectedEntranceValue}
          onChange={(e) =>
            onEntranceAnimationChange(
              e.target.value as NonNullable<Invitation['entranceAnimation']>
            )
          }
          className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none"
        >
          {visibleEntranceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {!capabilities.allowPremiumEntranceAnimations && (
          <div className="rounded-2xl bg-[#fff4dd] px-3 py-2 text-xs text-[#6a645a]">
            Envelope, slide, and card-flip entrances are available on Studio.
            <button
              type="button"
              onClick={() => onUpgradeRequest('studio')}
              className="ml-2 font-semibold text-[#c86d75]"
            >
              Upgrade
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#5f5a50]">Post-load Effect</label>
        <select
          value={selectedAnimationValue}
          onChange={(e) => onAnimationTypeChange(e.target.value as Invitation['animationType'])}
          className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none"
        >
          <option value="none">None</option>
          {capabilities.allowPostLoadEffects && <option value="confetti">Confetti</option>}
          {capabilities.allowPostLoadEffects && <option value="holi">Holi Colors</option>}
        </select>
        {!capabilities.allowPostLoadEffects && (
          <div className="rounded-2xl bg-[#fff4dd] px-3 py-2 text-xs text-[#6a645a]">
            Premium post-load effects are available on Studio.
            <button
              type="button"
              onClick={() => onUpgradeRequest('studio')}
              className="ml-2 font-semibold text-[#c86d75]"
            >
              Upgrade
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#5f5a50]">Accept Message</label>
        <textarea
          value={successMessage}
          onChange={(e) => onSuccessMessageChange(e.target.value)}
          disabled={!capabilities.allowCustomResponseMessages}
          className="min-h-20 w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e] disabled:cursor-not-allowed disabled:bg-[#fff8f1]"
          placeholder="Message shown after an accept..."
        />
        {!capabilities.allowCustomResponseMessages && (
          <div className="rounded-2xl bg-[#fff4dd] px-3 py-2 text-xs text-[#6a645a]">
            Custom response messages start on Creator.
            <button
              type="button"
              onClick={() => onUpgradeRequest('creator')}
              className="ml-2 font-semibold text-[#c86d75]"
            >
              Upgrade
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#5f5a50]">Reject Message</label>
        <textarea
          value={rejectionMessage}
          onChange={(e) => onRejectionMessageChange(e.target.value)}
          disabled={!capabilities.allowCustomResponseMessages}
          className="min-h-20 w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e] disabled:cursor-not-allowed disabled:bg-[#fff8f1]"
          placeholder="Message shown after a reject..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#5f5a50]">Music URL (MP3)</label>
        <input
          type="text"
          value={musicUrl}
          onChange={(e) => onMusicUrlChange(e.target.value)}
          disabled={!capabilities.allowMusic}
          className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e] disabled:cursor-not-allowed disabled:bg-[#fff8f1]"
          placeholder="https://example.com/music.mp3"
        />
        {!capabilities.allowMusic && (
          <div className="rounded-2xl bg-[#fff4dd] px-3 py-2 text-xs text-[#6a645a]">
            Music playback is available on Studio.
            <button
              type="button"
              onClick={() => onUpgradeRequest('studio')}
              className="ml-2 font-semibold text-[#c86d75]"
            >
              Upgrade
            </button>
          </div>
        )}
      </div>

      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#c86d75]">Element</h2>

      {!selectedElement && (
        <div className="rounded-2xl border border-dashed border-[#f3c583]/70 bg-[#fffaf0] p-4 text-xs text-[#6a645a]">
          Select an element on the canvas to edit its live properties.
        </div>
      )}

      {selectedElement && (
        <div className="flex flex-col gap-4">
          {(selectedElement.type === 'shape' || selectedElement.type === 'character') && (
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[#5f5a50]">Color</label>
              <input
                type="color"
                value={selectedElement.fill || '#3b82f6'}
                onChange={(e) => onUpdateSelected({ fill: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded-md border-0"
              />
            </div>
          )}

          {selectedElement.type === 'text' && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#5f5a50]">Text Content</label>
                <input
                  type="text"
                  value={selectedElement.text || ''}
                  onChange={(e) => onUpdateSelected({ text: e.target.value })}
                  className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[#5f5a50]">Width</label>
                  <input
                    type="number"
                    min="40"
                    value={Math.round(selectedElement.width || 240)}
                    onChange={(e) => onUpdateSelected({ width: toNumber(e.target.value, 240) })}
                    className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[#5f5a50]">Height</label>
                  <input
                    type="number"
                    min="20"
                    value={Math.round(selectedElement.height || 48)}
                    onChange={(e) => onUpdateSelected({ height: toNumber(e.target.value, 48) })}
                    className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#5f5a50]">Font Family</label>
                <select
                  value={selectedElement.fontFamily || 'Inter'}
                  onChange={(e) => onUpdateSelected({ fontFamily: e.target.value })}
                  className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none"
                >
                  {EDITOR_FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[#5f5a50]">Font Size</label>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    value={selectedElement.fontSize || 24}
                    onChange={(e) => onUpdateSelected({ fontSize: toNumber(e.target.value, 24) })}
                    className="w-full accent-[#e99497]"
                  />
                </div>

                <input
                  type="number"
                  min="10"
                  max="120"
                  value={Math.round(selectedElement.fontSize || 24)}
                  onChange={(e) => onUpdateSelected({ fontSize: toNumber(e.target.value, 24) })}
                  className="mt-6 w-20 rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e]"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#5f5a50]">Font Color</label>
                <input
                  type="color"
                  value={selectedElement.fill || '#2f2c28'}
                  onChange={(e) => onUpdateSelected({ fill: e.target.value })}
                  className="h-8 w-10 cursor-pointer rounded-md border-0"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#5f5a50]">Text Alignment</label>
                <div className="grid grid-cols-3 gap-2">
                  {alignmentOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onUpdateSelected({ textAlign: option.value })}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                        (selectedElement.textAlign || 'left') === option.value
                          ? 'bg-[#e99497] text-white'
                          : 'bg-[#fff4dd] text-[#6a645a]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#5f5a50]">Font Weight</label>
                <div className="grid grid-cols-2 gap-2">
                  {weightOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onUpdateSelected({ fontWeight: option.value })}
                      className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                        (selectedElement.fontWeight || 'normal') === option.value
                          ? 'bg-[#e99497] text-white'
                          : 'bg-[#fff4dd] text-[#6a645a]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[#5f5a50]">Line Height</label>
                  <input
                    type="range"
                    min="0.8"
                    max="2"
                    step="0.05"
                    value={selectedElement.lineHeight || 1.2}
                    onChange={(e) =>
                      onUpdateSelected({ lineHeight: toNumber(e.target.value, 1.2) })
                    }
                    className="w-full accent-[#e99497]"
                  />
                </div>

                <input
                  type="number"
                  min="0.8"
                  max="2"
                  step="0.05"
                  value={selectedElement.lineHeight || 1.2}
                  onChange={(e) =>
                    onUpdateSelected({ lineHeight: toNumber(e.target.value, 1.2) })
                  }
                  className="mt-6 w-20 rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e]"
                />
              </div>
            </>
          )}

          {selectedElement.type === 'button' && (
            <>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#5f5a50]">Button Label</label>
                <input
                  type="text"
                  value={selectedElement.text || ''}
                  onChange={(e) => onUpdateSelected({ text: e.target.value })}
                  className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#5f5a50]">Button Type</label>
                <select
                  value={selectedElement.buttonType || 'yes'}
                  onChange={(e) =>
                    onUpdateSelected({ buttonType: e.target.value as CanvasElement['buttonType'] })
                  }
                  className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none"
                >
                  <option value="yes">Accept</option>
                  <option value="no">Reject</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-2xl bg-[#fffaf0] px-3 py-2">
                  <label className="text-xs font-medium text-[#5f5a50]">Button Color</label>
                  <input
                    type="color"
                    value={selectedElement.fill || '#22c55e'}
                    onChange={(e) => onUpdateSelected({ fill: e.target.value })}
                    className="h-8 w-10 cursor-pointer rounded-md border-0"
                  />
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-[#fffaf0] px-3 py-2">
                  <label className="text-xs font-medium text-[#5f5a50]">Text Color</label>
                  <input
                    type="color"
                    value={selectedElement.textColor || '#ffffff'}
                    onChange={(e) => onUpdateSelected({ textColor: e.target.value })}
                    className="h-8 w-10 cursor-pointer rounded-md border-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[#5f5a50]">Border Radius</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={selectedElement.borderRadius ?? 18}
                    onChange={(e) =>
                      onUpdateSelected({ borderRadius: toNumber(e.target.value, 18) })
                    }
                    className="w-full accent-[#e99497]"
                  />
                </div>

                <input
                  type="number"
                  min="0"
                  max="50"
                  value={Math.round(selectedElement.borderRadius ?? 18)}
                  onChange={(e) =>
                    onUpdateSelected({ borderRadius: toNumber(e.target.value, 18) })
                  }
                  className="mt-6 w-20 rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e]"
                />
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[#5f5a50]">Button Font Size</label>
                  <input
                    type="range"
                    min="10"
                    max="42"
                    value={selectedElement.fontSize || 16}
                    onChange={(e) => onUpdateSelected({ fontSize: toNumber(e.target.value, 16) })}
                    className="w-full accent-[#e99497]"
                  />
                </div>

                <input
                  type="number"
                  min="10"
                  max="42"
                  value={Math.round(selectedElement.fontSize || 16)}
                  onChange={(e) => onUpdateSelected({ fontSize: toNumber(e.target.value, 16) })}
                  className="mt-6 w-20 rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#5f5a50]">Button Size</label>
                <select
                  value={currentButtonSize}
                  onChange={(e) => {
                    const nextSize = e.target.value as ButtonSize;
                    const preset = getButtonPresetValues(nextSize);
                    onUpdateSelected({
                      buttonSize: nextSize,
                      width: nextSize === 'custom' ? selectedElement.width : preset.width,
                      height: nextSize === 'custom' ? selectedElement.height : preset.height,
                      paddingX: nextSize === 'custom' ? selectedElement.paddingX : preset.paddingX,
                      paddingY: nextSize === 'custom' ? selectedElement.paddingY : preset.paddingY,
                    });
                  }}
                  className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none"
                >
                  {buttonSizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[#5f5a50]">Width</label>
                  <input
                    type="number"
                    min="48"
                    value={Math.round(selectedElement.width || 156)}
                    onChange={(e) =>
                      onUpdateSelected({
                        width: toNumber(e.target.value, 156),
                        buttonSize: 'custom',
                      })
                    }
                    className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[#5f5a50]">Height</label>
                  <input
                    type="number"
                    min="32"
                    value={Math.round(selectedElement.height || 50)}
                    onChange={(e) =>
                      onUpdateSelected({
                        height: toNumber(e.target.value, 50),
                        buttonSize: 'custom',
                      })
                    }
                    className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[#5f5a50]">Padding X</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={Math.round(selectedElement.paddingX ?? 18)}
                    onChange={(e) =>
                      onUpdateSelected({
                        paddingX: toNumber(e.target.value, 18),
                        buttonSize: 'custom',
                      })
                    }
                    className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[#5f5a50]">Padding Y</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={Math.round(selectedElement.paddingY ?? 10)}
                    onChange={(e) =>
                      onUpdateSelected({
                        paddingY: toNumber(e.target.value, 10),
                        buttonSize: 'custom',
                      })
                    }
                    className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e]"
                  />
                </div>
              </div>
            </>
          )}

          <div className="rounded-2xl border border-[#f3c583]/45 bg-[#fffaf0] p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#c86d75]">
                Animation
              </label>
              <button
                type="button"
                onClick={onPreviewSelectedAnimation}
                disabled={currentElementAnimation.type === 'none'}
                className="inline-flex items-center gap-1 rounded-full border border-[#e99497]/40 bg-white px-3 py-1 text-[10px] font-semibold text-[#c86d75] transition-colors hover:bg-[#fff0f0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play size={12} />
                Preview
              </button>
            </div>

            <div className="mt-3 flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-[#5f5a50]">Animation Type</label>
                <select
                  value={currentElementAnimation.type}
                  onChange={(e) =>
                    onUpdateSelected({
                      elementAnimation: {
                        ...currentElementAnimation,
                        type: e.target.value as NonNullable<CanvasElement['elementAnimation']>['type'],
                      },
                    })
                  }
                  className="w-full rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none"
                >
                  {elementAnimationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[#5f5a50]">Duration (s)</label>
                  <input
                    type="range"
                    min="0.3"
                    max="5"
                    step="0.1"
                    disabled={currentElementAnimation.type === 'none'}
                    value={currentElementDuration}
                    onChange={(e) =>
                      onUpdateSelected({
                        elementAnimation: {
                          ...currentElementAnimation,
                          duration: toNumber(e.target.value, 1.2),
                        },
                      })
                    }
                    className="w-full accent-[#e99497] disabled:opacity-50"
                  />
                </div>

                <input
                  type="number"
                  min="0.3"
                  max="5"
                  step="0.1"
                  disabled={currentElementAnimation.type === 'none'}
                  value={currentElementDuration}
                  onChange={(e) =>
                    onUpdateSelected({
                      elementAnimation: {
                        ...currentElementAnimation,
                        duration: toNumber(e.target.value, 1.2),
                      },
                    })
                  }
                  className="mt-6 w-20 rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e] disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-[#5f5a50]">Delay (s)</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    disabled={currentElementAnimation.type === 'none'}
                    value={currentElementAnimation.delay ?? 0}
                    onChange={(e) =>
                      onUpdateSelected({
                        elementAnimation: {
                          ...currentElementAnimation,
                          delay: toNumber(e.target.value, 0),
                        },
                      })
                    }
                    className="w-full accent-[#e99497] disabled:opacity-50"
                  />
                </div>

                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  disabled={currentElementAnimation.type === 'none'}
                  value={currentElementAnimation.delay ?? 0}
                  onChange={(e) =>
                    onUpdateSelected({
                      elementAnimation: {
                        ...currentElementAnimation,
                        delay: toNumber(e.target.value, 0),
                      },
                    })
                  }
                  className="mt-6 w-20 rounded-lg border border-[#f3c583]/50 p-2 text-sm outline-none focus:ring-2 focus:ring-[#e8e46e] disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2">
                <label className="text-xs font-medium text-[#5f5a50]">Loop</label>
                <button
                  type="button"
                  disabled={currentElementAnimation.type === 'none'}
                  onClick={() =>
                    onUpdateSelected({
                      elementAnimation: {
                        ...currentElementAnimation,
                        loop: !(currentElementAnimation.loop ?? true),
                      },
                    })
                  }
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold transition-colors ${
                    currentElementAnimation.type === 'none'
                      ? 'bg-[#f5f0e8] text-[#b5a79a]'
                      : currentElementAnimation.loop ?? true
                        ? 'bg-[#e99497] text-white'
                        : 'bg-[#fff4dd] text-[#6a645a]'
                  }`}
                >
                  {currentElementAnimation.loop ?? true ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onDeleteSelected}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-semibold text-[#c2484f] transition-colors hover:bg-[#fff0f0]"
          >
            <Trash2 size={16} />
            Delete Element
          </button>
        </div>
      )}
    </div>
  );
}
